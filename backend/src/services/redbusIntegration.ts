import axios, { AxiosInstance } from 'axios';

interface RedbusTrip {
  tripId: string;
  operatorName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: number;
  price: number;
  basePrice: number;
  discount: number;
  seatsAvailable: number;
  totalSeats: number;
  busType: string;
  amenities: string[];
  ratings: number;
  seatLayout: string;
  boardingPoints: string[];
  droppingPoints: string[];
  cancellationPolicy: string;
  lastUpdated: Date;
}

interface RedbusSearchParams {
  source: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
}

export class RedbusIntegration {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private affiliateId: string;
  private baseUrl: string = 'https://api.redbus.com/v1';
  private cache: Map<string, any> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.REDBUS_API_KEY || '';
    this.affiliateId = process.env.REDBUS_AFFILIATE_ID || '';
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Affiliate-Id': this.affiliateId,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
  }

  /**
   * Search buses with advanced filters
   */
  async searchBuses(params: RedbusSearchParams): Promise<RedbusTrip[]> {
    const cacheKey = `redbus_search_${params.source}_${params.destination}_${params.departureDate}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached Redbus search results');
      return cachedData;
    }

    try {
      const response = await this.apiClient.get('/search', {
        params: {
          source: params.source,
          destination: params.destination,
          departure_date: params.departureDate,
          return_date: params.returnDate,
          passengers: params.passengers,
          sort_by: 'price'
        }
      });

      const trips: RedbusTrip[] = response.data.trips.map((trip: any) => ({
        tripId: trip.trip_id,
        operatorName: trip.operator_name,
        source: trip.source,
        destination: trip.destination,
        departureTime: trip.departure_time,
        arrivalTime: trip.arrival_time,
        duration: trip.duration,
        distance: trip.distance,
        price: trip.price,
        basePrice: trip.base_price,
        discount: trip.discount || 0,
        seatsAvailable: trip.seats_available,
        totalSeats: trip.total_seats,
        busType: trip.bus_type,
        amenities: trip.amenities || [],
        ratings: trip.ratings || 0,
        seatLayout: trip.seat_layout,
        boardingPoints: trip.boarding_points || [],
        droppingPoints: trip.dropping_points || [],
        cancellationPolicy: trip.cancellation_policy,
        lastUpdated: new Date()
      }));

      this.setInCache(cacheKey, trips);
      return trips;
    } catch (error) {
      console.error('Error searching Redbus buses:', error);
      throw error;
    }
  }

  /**
   * Get trip details
   */
  async getTripDetails(tripId: string): Promise<any> {
    const cacheKey = `redbus_trip_${tripId}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.apiClient.get(`/trips/${tripId}`);
      this.setInCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching Redbus trip details:', error);
      throw error;
    }
  }

  /**
   * Get seat availability
   */
  async getSeatAvailability(tripId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/trips/${tripId}/seats`);
      return {
        tripId,
        availableSeats: response.data.available_seats,
        seatLayout: response.data.layout,
        bookedSeats: response.data.booked_seats,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      throw error;
    }
  }

  /**
   * Get price trends for a route
   */
  async getPriceTrends(
    source: string,
    destination: string,
    dateRange: { start: string; end: string }
  ): Promise<any> {
    try {
      const response = await this.apiClient.get('/price-trends', {
        params: {
          source,
          destination,
          start_date: dateRange.start,
          end_date: dateRange.end
        }
      });

      return {
        source,
        destination,
        minPrice: response.data.min_price,
        maxPrice: response.data.max_price,
        averagePrice: response.data.avg_price,
        priceHistory: response.data.price_history,
        bestTimeToBook: response.data.best_time,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching price trends:', error);
      throw error;
    }
  }

  /**
   * Book a trip
   */
  async bookTrip(
    tripId: string,
    passengers: Array<{
      name: string;
      email: string;
      phone: string;
      age: number;
    }>,
    seats: string[],
    contactEmail: string,
    contactPhone: string
  ): Promise<any> {
    try {
      const response = await this.apiClient.post('/bookings', {
        trip_id: tripId,
        passengers,
        seats,
        contact_email: contactEmail,
        contact_phone: contactPhone
      });

      return {
        bookingId: response.data.booking_id,
        bookingReference: response.data.reference_code,
        status: response.data.status,
        totalPrice: response.data.total_price,
        gst: response.data.gst,
        convenienceFee: response.data.convenience_fee,
        cancellationPolicy: response.data.cancellation_policy,
        passengers: response.data.passengers,
        bookingTime: new Date()
      };
    } catch (error) {
      console.error('Error booking Redbus trip:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    bookingId: string,
    reason: string
  ): Promise<any> {
    try {
      const response = await this.apiClient.post(
        `/bookings/${bookingId}/cancel`,
        { reason }
      );

      return {
        bookingId,
        status: response.data.status,
        refundAmount: response.data.refund_amount,
        cancellationCharge: response.data.cancellation_charge,
        cancellationTime: new Date()
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Get popular routes
   */
  async getPopularRoutes(): Promise<any> {
    const cacheKey = 'redbus_popular_routes';
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.apiClient.get('/routes/popular');
      this.setInCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      throw error;
    }
  }

  /**
   * Sync all Redbus data
   */
  async syncAllData(): Promise<any> {
    try {
      const popularRoutes = await this.getPopularRoutes();
      const today = new Date().toISOString().split('T')[0];
      
      let totalTrips = 0;
      for (const route of popularRoutes.routes.slice(0, 10)) {
        try {
          const trips = await this.searchBuses({
            source: route.source,
            destination: route.destination,
            departureDate: today,
            passengers: 1
          });
          totalTrips += trips.length;
        } catch (error) {
          console.warn(`Could not sync route: ${route.source} -> ${route.destination}`);
        }
      }

      return {
        operator: 'Redbus',
        totalRoutesProcessed: Math.min(popularRoutes.routes.length, 10),
        totalTripsFound: totalTrips,
        syncTime: new Date(),
        status: 'success'
      };
    } catch (error) {
      console.error('Error syncing Redbus data:', error);
      return {
        operator: 'Redbus',
        status: 'error',
        error: (error as Error).message
      };
    }
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

  clearCache(): void {
    this.cache.clear();
    console.log('Redbus cache cleared');
  }
}

export default new RedbusIntegration();
