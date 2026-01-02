import axios, { AxiosInstance } from 'axios';

interface APSRTCBus {
  busId: string;
  busName: string;
  busType: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  seatsAvailable: number;
  totalSeats: number;
  amenities: string[];
  ratings?: number;
  lastUpdated: Date;
}

interface APSRTCRoute {
  routeId: string;
  source: string;
  destination: string;
  distance: number;
  duration: string;
  buses: APSRTCBus[];
}

export class APSRTCIntegration {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private baseUrl: string = 'https://api.apsrtc.gov.in/v1';
  private cache: Map<string, any> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.APSRTC_API_KEY || '';
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Search buses for a given route and date
   */
  async searchBuses(
    source: string,
    destination: string,
    date: string
  ): Promise<APSRTCBus[]> {
    const cacheKey = `search_${source}_${destination}_${date}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached APSRTC search results');
      return cachedData;
    }

    try {
      const response = await this.apiClient.get('/buses/search', {
        params: {
          source,
          destination,
          date
        }
      });

      const buses: APSRTCBus[] = response.data.buses.map((bus: any) => ({
        busId: bus.id,
        busName: bus.name,
        busType: bus.type,
        source: bus.source,
        destination: bus.destination,
        departureTime: bus.departure,
        arrivalTime: bus.arrival,
        duration: bus.duration,
        fare: bus.fare,
        seatsAvailable: bus.available_seats,
        totalSeats: bus.total_seats,
        amenities: bus.amenities || [],
        ratings: bus.ratings,
        lastUpdated: new Date()
      }));

      this.setInCache(cacheKey, buses);
      return buses;
    } catch (error) {
      console.error('Error searching APSRTC buses:', error);
      throw error;
    }
  }

  /**
   * Get fare details and pricing for a route
   */
  async getFareDetails(
    source: string,
    destination: string
  ): Promise<any> {
    const cacheKey = `fare_${source}_${destination}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.apiClient.get('/fares', {
        params: { source, destination }
      });

      const fareData = {
        source,
        destination,
        baseFare: response.data.base_fare,
        minFare: response.data.min_fare,
        maxFare: response.data.max_fare,
        peakHours: response.data.peak_hours,
        offPeakDiscount: response.data.off_peak_discount,
        lastUpdated: new Date()
      };

      this.setInCache(cacheKey, fareData);
      return fareData;
    } catch (error) {
      console.error('Error fetching APSRTC fare details:', error);
      throw error;
    }
  }

  /**
   * Get available routes from APSRTC
   */
  async getAvailableRoutes(): Promise<APSRTCRoute[]> {
    const cacheKey = 'apsrtc_routes';
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.apiClient.get('/routes');
      
      const routes: APSRTCRoute[] = response.data.routes.map((route: any) => ({
        routeId: route.id,
        source: route.source,
        destination: route.destination,
        distance: route.distance,
        duration: route.duration,
        buses: []
      }));

      this.setInCache(cacheKey, routes);
      return routes;
    } catch (error) {
      console.error('Error fetching APSRTC routes:', error);
      throw error;
    }
  }

  /**
   * Book a seat on APSRTC bus
   */
  async bookBus(
    busId: string,
    passengerId: string,
    seatNumber: string,
    email: string,
    phone: string
  ): Promise<any> {
    try {
      const response = await this.apiClient.post('/bookings', {
        bus_id: busId,
        passenger_id: passengerId,
        seat_number: seatNumber,
        email,
        phone
      });

      return {
        bookingId: response.data.booking_id,
        status: response.data.status,
        bookingReference: response.data.reference,
        totalFare: response.data.total_fare,
        bookingTime: new Date()
      };
    } catch (error) {
      console.error('Error booking APSRTC bus:', error);
      throw error;
    }
  }

  /**
   * Get booking details by reference
   */
  async getBookingDetails(bookingReference: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/bookings/${bookingReference}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching APSRTC booking details:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingReference: string, reason: string): Promise<any> {
    try {
      const response = await this.apiClient.post(
        `/bookings/${bookingReference}/cancel`,
        { reason }
      );

      return {
        bookingId: response.data.booking_id,
        status: response.data.status,
        refundAmount: response.data.refund_amount,
        cancellationTime: new Date()
      };
    } catch (error) {
      console.error('Error cancelling APSRTC booking:', error);
      throw error;
    }
  }

  /**
   * Get real-time live tracking for a bus journey
   */
  async getBusTracking(busId: string, journeyDate: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/tracking/${busId}`, {
        params: { date: journeyDate }
      });

      return {
        busId,
        currentLocation: {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          updatedAt: new Date(response.data.timestamp)
        },
        nextStopName: response.data.next_stop,
        nextStopETA: response.data.next_stop_eta,
        status: response.data.status,
        speed: response.data.speed
      };
    } catch (error) {
      console.error('Error fetching APSRTC bus tracking:', error);
      throw error;
    }
  }

  /**
   * Sync all APSRTC data
   */
  async syncAllData(): Promise<any> {
    try {
      const [routes, routeBuses] = await Promise.all([
        this.getAvailableRoutes(),
        this.fetchAllRouteBuses()
      ]);

      return {
        operator: 'APSRTC',
        totalRoutes: routes.length,
        totalBuses: routeBuses.length,
        syncTime: new Date(),
        status: 'success'
      };
    } catch (error) {
      console.error('Error syncing APSRTC data:', error);
      return {
        operator: 'APSRTC',
        status: 'error',
        error: (error as Error).message
      };
    }
  }

  /**
   * Helper method to fetch buses for all routes
   */
  private async fetchAllRouteBuses(): Promise<APSRTCBus[]> {
    const routes = await this.getAvailableRoutes();
    const allBuses: APSRTCBus[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const route of routes) {
      try {
        const buses = await this.searchBuses(
          route.source,
          route.destination,
          today
        );
        allBuses.push(...buses);
      } catch (error) {
        console.warn(`Could not fetch buses for route ${route.routeId}`);
      }
    }

    return allBuses;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private setInCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('APSRTC cache cleared');
  }
}

export default new APSRTCIntegration();
