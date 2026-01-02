import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import pool from '../database';

interface TravelerData {
  userId: string;
  busRoute: string;
  currentPrice: number;
  timestamp: Date;
  location: { latitude: number; longitude: number };
  bookingStatus: 'searching' | 'booked' | 'cancelled';
  operatorName: string;
  departureTime: string;
  arrivalTime: string;
}

interface AggregatedPriceData {
  route: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  travelerCount: number;
  priceHistory: Array<{ price: number; timestamp: Date; count: number }>;
  commonOperators: Array<{ name: string; count: number }>;
}

class TravelerDataCollector {
  private io: SocketIOServer | null = null;
  private activeTravelers = new Map<string, TravelerData>();
  private aggregatedData = new Map<string, AggregatedPriceData>();
  private priceHistory = new Map<string, TravelerData[]>();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {}

  /**
   * Initialize Socket.IO for real-time data collection
   */
  public initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupSocketListeners();
    this.startDataAggregation();

    console.log('Traveler data collector initialized');
    return this.io;
  }

  /**
   * Setup socket event listeners for real-time data
   */
  private setupSocketListeners(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Traveler connected: ${socket.id}`);

      // Handle traveler joining with search data
      socket.on('traveler:search', (data: TravelerData) => {
        this.handleTravelerSearch(socket.id, data);
      });

      // Handle price update from traveler app
      socket.on('traveler:price-update', (data: TravelerData) => {
        this.handlePriceUpdate(socket.id, data);
      });

      // Handle location tracking
      socket.on('traveler:location', (location: { latitude: number; longitude: number }) => {
        this.handleLocationUpdate(socket.id, location);
      });

      // Handle booking confirmation
      socket.on('traveler:booking', (data: { userId: string; busRoute: string; operatorName: string; price: number }) => {
        this.handleBookingConfirmation(socket.id, data);
      });

      // Handle connection drop
      socket.on('disconnect', () => {
        this.handleTravelerDisconnect(socket.id);
      });

      // Heartbeat/keep-alive
      socket.on('traveler:heartbeat', (userId: string) => {
        this.updateTravelerHeartbeat(socket.id, userId);
      });
    });
  }

  /**
   * Handle when a traveler starts searching for buses
   */
  private handleTravelerSearch(socketId: string, data: TravelerData): void {
    this.activeTravelers.set(socketId, {
      ...data,
      timestamp: new Date(),
    });

    console.log(`Traveler ${data.userId} searching for route: ${data.busRoute}`);

    // Notify subscribers about new active traveler
    if (this.io) {
      this.io.emit('traveler:active', {
        route: data.busRoute,
        count: this.getActiveTravelersForRoute(data.busRoute),
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle real-time price updates from travelers
   */
  private handlePriceUpdate(socketId: string, data: TravelerData): void {
    const travelerData = this.activeTravelers.get(socketId);
    if (!travelerData) return;

    // Update traveler's current data
    this.activeTravelers.set(socketId, {
      ...travelerData,
      ...data,
      timestamp: new Date(),
    });

    // Store in price history
    if (!this.priceHistory.has(data.busRoute)) {
      this.priceHistory.set(data.busRoute, []);
    }
    this.priceHistory.get(data.busRoute)?.push(data);

    // Update aggregated data
    this.updateAggregatedData(data.busRoute);

    // Broadcast to all connected clients
    if (this.io) {
      this.io.emit('price:update', {
        route: data.busRoute,
        price: data.currentPrice,
        operator: data.operatorName,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle location updates from travelers
   */
  private handleLocationUpdate(socketId: string, location: { latitude: number; longitude: number }): void {
    const travelerData = this.activeTravelers.get(socketId);
    if (!travelerData) return;

    this.activeTravelers.set(socketId, {
      ...travelerData,
      location,
      timestamp: new Date(),
    });

    // Optional: Emit location data for map visualization
    if (this.io) {
      this.io.emit('traveler:location-update', {
        route: travelerData.busRoute,
        location,
        userId: travelerData.userId,
      });
    }
  }

  /**
   * Handle booking confirmation and store in database
   */
  private async handleBookingConfirmation(
    socketId: string,
    data: { userId: string; busRoute: string; operatorName: string; price: number }
  ): Promise<void> {
    try {
      // Store booking event in database
      await pool.query(
        `INSERT INTO traveler_events (user_id, bus_route, operator_name, price, event_type, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [data.userId, data.busRoute, data.operatorName, data.price, 'booking']
      );

      const travelerData = this.activeTravelers.get(socketId);
      if (travelerData) {
        travelerData.bookingStatus = 'booked';
      }

      // Broadcast booking event
      if (this.io) {
        this.io.emit('booking:confirmed', {
          route: data.busRoute,
          operator: data.operatorName,
          price: data.price,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error storing booking confirmation:', error);
    }
  }

  /**
   * Handle traveler disconnect
   */
  private async handleTravelerDisconnect(socketId: string): Promise<void> {
    const travelerData = this.activeTravelers.get(socketId);
    if (travelerData) {
      try {
        // Log disconnect event
        await pool.query(
          `INSERT INTO traveler_events (user_id, bus_route, event_type, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [travelerData.userId, travelerData.busRoute, 'disconnect']
        );
      } catch (error) {
        console.error('Error logging disconnect event:', error);
      }
    }
    this.activeTravelers.delete(socketId);
    console.log(`Traveler disconnected: ${socketId}`);
  }

  /**
   * Update traveler heartbeat to keep connection alive
   */
  private updateTravelerHeartbeat(socketId: string, userId: string): void {
    const travelerData = this.activeTravelers.get(socketId);
    if (travelerData) {
      travelerData.timestamp = new Date();
    }
  }

  /**
   * Update aggregated price data for a route
   */
  private updateAggregatedData(route: string): void {
    const routeTravelers = Array.from(this.activeTravelers.values()).filter(
      (t) => t.busRoute === route
    );

    if (routeTravelers.length === 0) return;

    const prices = routeTravelers.map((t) => t.currentPrice);
    const operators = routeTravelers.map((t) => t.operatorName);

    // Count operators
    const operatorCount = new Map<string, number>();
    operators.forEach((op) => {
      operatorCount.set(op, (operatorCount.get(op) || 0) + 1);
    });

    const commonOperators = Array.from(operatorCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const aggregatedData: AggregatedPriceData = {
      route,
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      travelerCount: routeTravelers.length,
      priceHistory: this.getPriceHistoryForRoute(route),
      commonOperators,
    };

    this.aggregatedData.set(route, aggregatedData);

    // Broadcast aggregated data
    if (this.io) {
      this.io.emit('aggregated:price-data', aggregatedData);
    }
  }

  /**
   * Get price history for a specific route
   */
  private getPriceHistoryForRoute(route: string): Array<{ price: number; timestamp: Date; count: number }> {
    const history = this.priceHistory.get(route) || [];
    const grouped = new Map<string, { prices: number[]; timestamp: Date }>();

    history.forEach((h) => {
      const timeKey = new Date(h.timestamp).getTime().toString();
      if (!grouped.has(timeKey)) {
        grouped.set(timeKey, { prices: [], timestamp: h.timestamp });
      }
      grouped.get(timeKey)?.prices.push(h.currentPrice);
    });

    return Array.from(grouped.values())
      .map(({ prices, timestamp }) => ({
        price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        timestamp,
        count: prices.length,
      }))
      .slice(-10); // Return last 10 entries
  }

  /**
   * Get count of active travelers for a route
   */
  private getActiveTravelersForRoute(route: string): number {
    return Array.from(this.activeTravelers.values()).filter((t) => t.busRoute === route).length;
  }

  /**
   * Start automatic data aggregation process
   */
  private startDataAggregation(): void {
    this.updateInterval = setInterval(async () => {
      const routes = new Set(Array.from(this.activeTravelers.values()).map((t) => t.busRoute));

      for (const route of routes) {
        this.updateAggregatedData(route);
        await this.savePriceDataToDatabase(route);
      }
    }, 30000); // Update every 30 seconds
  }

  /**
   * Save aggregated price data to database for analytics
   */
  private async savePriceDataToDatabase(route: string): Promise<void> {
    const aggregatedData = this.aggregatedData.get(route);
    if (!aggregatedData) return;

    try {
      await pool.query(
        `INSERT INTO price_aggregation (bus_route, average_price, min_price, max_price, traveler_count, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          route,
          aggregatedData.averagePrice,
          aggregatedData.minPrice,
          aggregatedData.maxPrice,
          aggregatedData.travelerCount,
        ]
      );
    } catch (error) {
      console.error('Error saving price data to database:', error);
    }
  }

  /**
   * Get real-time data for a specific route
   */
  public getRouteData(route: string): AggregatedPriceData | undefined {
    return this.aggregatedData.get(route);
  }

  /**
   * Get all active routes and their data
   */
  public getAllRouteData(): Map<string, AggregatedPriceData> {
    return this.aggregatedData;
  }

  /**
   * Get active travelers count
   */
  public getActiveTravelersCount(): number {
    return this.activeTravelers.size;
  }

  /**
   * Stop the collector
   */
  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.io) {
      this.io.close();
    }
  }
}

export default new TravelerDataCollector();
