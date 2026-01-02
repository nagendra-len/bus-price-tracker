import axios from 'axios';
import pool from '../database';

interface BusOperator {
  id: string;
  name: string;
  type: 'state' | 'private';
  apiEndpoint?: string;
  apiKey?: string;
  active: boolean;
}

interface BusDetails {
  operatorId: string;
  busId: string;
  operator: string;
  busType: string;
  capacity: number;
  amenities: string[];
  route: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  rating: number;
  ratingCount: number;
}

interface AggregatedBusData {
  route: string;
  totalBuses: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  operators: Array<{ name: string; count: number; avgPrice: number }>;
  buses: BusDetails[];
  lastUpdated: Date;
}

class BusOperatorAggregator {
  private operators: Map<string, BusOperator> = new Map();
  private busCache: Map<string, BusDetails[]> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeOperators();
  }

  /**
   * Initialize supported bus operators (State & Private)
   */
  private initializeOperators(): void {
    // State Transport Corporations
    const stateOperators: BusOperator[] = [
      { id: 'tsrtc', name: 'TSRTC', type: 'state', apiEndpoint: process.env.TSRTC_API_URL, active: true },
      { id: 'apsrtc', name: 'APSRTC', type: 'state', apiEndpoint: process.env.APSRTC_API_URL, active: true },
      { id: 'bmtc', name: 'BMTC', type: 'state', apiEndpoint: process.env.BMTC_API_URL, active: true },
      { id: 'ksrtc', name: 'KSRTC', type: 'state', apiEndpoint: process.env.KSRTC_API_URL, active: true },
      { id: 'msrtc', name: 'MSRTC', type: 'state', apiEndpoint: process.env.MSRTC_API_URL, active: true },
      { id: 'ktc', name: 'KTC', type: 'state', apiEndpoint: process.env.KTC_API_URL, active: true },
      { id: 'setc', name: 'SETC', type: 'state', apiEndpoint: process.env.SETC_API_URL, active: true },
      { id: 'wbtc', name: 'WBTC', type: 'state', apiEndpoint: process.env.WBTC_API_URL, active: true },
    ];

    // Private Bus Operators
    const privateOperators: BusOperator[] = [
      { id: 'redbus', name: 'RedBus', type: 'private', apiEndpoint: process.env.REDBUS_API_URL, apiKey: process.env.REDBUS_API_KEY, active: true },
      { id: 'goibibo', name: 'GoIbibo', type: 'private', apiEndpoint: process.env.GOIBIBO_API_URL, apiKey: process.env.GOIBIBO_API_KEY, active: true },
      { id: 'makemytrip', name: 'MakeMyTrip', type: 'private', apiEndpoint: process.env.MKT_API_URL, apiKey: process.env.MKT_API_KEY, active: true },
      { id: 'abhibus', name: 'AbhiBus', type: 'private', apiEndpoint: process.env.ABHIBUS_API_URL, apiKey: process.env.ABHIBUS_API_KEY, active: true },
      { id: 'shreenath', name: 'Shreenath Travels', type: 'private', apiEndpoint: process.env.SHREENATH_API_URL, active: true },
      { id: 'vrl', name: 'VRL', type: 'private', apiEndpoint: process.env.VRL_API_URL, active: true },
      { id: 'srs', name: 'SRS', type: 'private', apiEndpoint: process.env.SRS_API_URL, active: true },
      { id: 'luxury', name: 'Luxury Travels', type: 'private', apiEndpoint: process.env.LUXURY_API_URL, active: true },
    ];

    [...stateOperators, ...privateOperators].forEach(op => {
      this.operators.set(op.id, op);
    });

    console.log(`Initialized ${this.operators.size} bus operators`);
  }

  /**
   * Fetch bus data from all operators for a specific route
   */
  public async fetchBusesForRoute(fromCity: string, toCity: string, date: string): Promise<AggregatedBusData> {
    const route = `${fromCity}-${toCity}`;
    const buses: BusDetails[] = [];

    const operatorPromises = Array.from(this.operators.values())
      .filter(op => op.active)
      .map(op => this.fetchFromOperator(op, fromCity, toCity, date));

    const results = await Promise.allSettled(operatorPromises);

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        buses.push(...result.value);
      }
    });

    // Cache the results
    this.busCache.set(route, buses);

    // Store in database
    await this.storeBusDataToDatabase(buses, route);

    // Calculate aggregated data
    return this.aggregateBusData(buses, route);
  }

  /**
   * Fetch buses from a specific operator
   */
  private async fetchFromOperator(operator: BusOperator, fromCity: string, toCity: string, date: string): Promise<BusDetails[] | null> {
    try {
      if (!operator.apiEndpoint) {
        console.warn(`No API endpoint configured for ${operator.name}`);
        return null;
      }

      const response = await axios.get(`${operator.apiEndpoint}/buses`, {
        params: { from: fromCity, to: toCity, date },
        headers: operator.apiKey ? { Authorization: `Bearer ${operator.apiKey}` } : {},
        timeout: 10000,
      });

      if (!response.data || !Array.isArray(response.data.buses)) {
        return null;
      }

      return response.data.buses.map((bus: any) => ({
        operatorId: operator.id,
        busId: bus.id,
        operator: operator.name,
        busType: bus.busType || 'Standard',
        capacity: bus.capacity || 50,
        amenities: bus.amenities || [],
        route: `${fromCity}-${toCity}`,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        duration: bus.duration,
        price: bus.price,
        seatsAvailable: bus.seatsAvailable,
        rating: bus.rating || 0,
        ratingCount: bus.ratingCount || 0,
      }));
    } catch (error) {
      console.error(`Error fetching from ${operator.name}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Store bus data to database for historical tracking
   */
  private async storeBusDataToDatabase(buses: BusDetails[], route: string): Promise<void> {
    if (buses.length === 0) return;

    try {
      for (const bus of buses) {
        await pool.query(
          `INSERT INTO bus_listings (route, operator_id, operator_name, bus_type, price, seats_available, rating, departure_time, arrival_time, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            route,
            bus.operatorId,
            bus.operator,
            bus.busType,
            bus.price,
            bus.seatsAvailable,
            bus.rating,
            bus.departureTime,
            bus.arrivalTime,
          ]
        );
      }
    } catch (error) {
      console.error('Error storing bus data to database:', error);
    }
  }

  /**
   * Aggregate and compare bus data across operators
   */
  private aggregateBusData(buses: BusDetails[], route: string): AggregatedBusData {
    if (buses.length === 0) {
      return {
        route,
        totalBuses: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        operators: [],
        buses: [],
        lastUpdated: new Date(),
      };
    }

    const prices = buses.map(b => b.price);
    const operatorMap = new Map<string, { buses: BusDetails[]; totalPrice: number }>();

    buses.forEach(bus => {
      if (!operatorMap.has(bus.operator)) {
        operatorMap.set(bus.operator, { buses: [], totalPrice: 0 });
      }
      const data = operatorMap.get(bus.operator)!;
      data.buses.push(bus);
      data.totalPrice += bus.price;
    });

    const operatorSummary = Array.from(operatorMap.entries()).map(([name, data]) => ({
      name,
      count: data.buses.length,
      avgPrice: Math.round(data.totalPrice / data.buses.length),
    }));

    // Sort by cheapest average price
    operatorSummary.sort((a, b) => a.avgPrice - b.avgPrice);

    return {
      route,
      totalBuses: buses.length,
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      operators: operatorSummary,
      buses: buses.sort((a, b) => a.price - b.price),
      lastUpdated: new Date(),
    };
  }

  /**
   * Get list of all bus operators
   */
  public getOperators(type?: 'state' | 'private'): BusOperator[] {
    return Array.from(this.operators.values()).filter(op => !type || op.type === type);
  }

  /**
   * Get operator details by ID
   */
  public getOperator(operatorId: string): BusOperator | undefined {
    return this.operators.get(operatorId);
  }

  /**
   * Compare prices across operators for same route
   */
  public compareOperators(route: string): Array<{ operator: string; type: string; avgPrice: number; busCount: number }> {
    const buses = this.busCache.get(route) || [];
    const operatorMap = new Map<string, { prices: number[]; type: string }>();

    buses.forEach(bus => {
      if (!operatorMap.has(bus.operator)) {
        const op = this.operators.get(bus.operatorId);
        operatorMap.set(bus.operator, { prices: [], type: op?.type || 'unknown' });
      }
      operatorMap.get(bus.operator)!.prices.push(bus.price);
    });

    return Array.from(operatorMap.entries())
      .map(([operator, data]) => ({
        operator,
        type: data.type,
        avgPrice: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length),
        busCount: data.prices.length,
      }))
      .sort((a, b) => a.avgPrice - b.avgPrice);
  }

  /**
   * Get buses by operator type (state or private)
   */
  public getBusesByType(route: string, type: 'state' | 'private'): BusDetails[] {
    const buses = this.busCache.get(route) || [];
    return buses.filter(bus => {
      const op = this.operators.get(bus.operatorId);
      return op?.type === type;
    });
  }

  /**
   * Get cheapest buses across all operators
   */
  public getCheapestBuses(route: string, limit: number = 10): BusDetails[] {
    const buses = this.busCache.get(route) || [];
    return buses.sort((a, b) => a.price - b.price).slice(0, limit);
  }

  /**
   * Get highest rated buses
   */
  public getTopRatedBuses(route: string, limit: number = 10): BusDetails[] {
    const buses = this.busCache.get(route) || [];
    return buses.sort((a, b) => b.rating - a.rating).slice(0, limit);
  }
}

export default new BusOperatorAggregator();
