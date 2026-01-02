# Bus Price Tracker - Operator Integrations Guide

## Overview

This document details the integration of bus operators' APIs with the Bus Price Tracker platform. The system currently supports APSRTC (state transport) and Redbus (private operator) integrations with plans to expand to additional operators.

## Integrated Operators

### 1. APSRTC (Andhra Pradesh State Road Transport Corporation)

**Type:** State Transport Corporation  
**Service File:** `src/services/apsrtcIntegration.ts`  
**Region:** Andhra Pradesh  
**Status:** ✅ Implemented & Ready

#### Features Implemented
- Real-time bus search across all APSRTC routes
- Dynamic fare pricing with peak/off-peak rates
- Seat availability tracking
- Bus journey tracking and live locations
- Booking and cancellation management
- 5-minute caching for performance

#### API Endpoints Used
```
GET /buses/search - Search buses by route and date
GET /fares - Get fare details and pricing
GET /routes - List all available routes
GET /tracking/{busId} - Real-time bus location tracking
POST /bookings - Create new booking
GET /bookings/{ref} - Get booking status
POST /bookings/{ref}/cancel - Cancel booking
```

#### Configuration Required
```env
APSRTC_API_KEY=your_api_key_here
APSRTC_API_SECRET=your_api_secret_here
```

#### Sample Usage
```typescript
import apsrtc from './services/apsrtcIntegration';

// Search buses
const buses = await apsrtc.searchBuses(
  'Hyderabad',
  'Vijayawada',
  '2026-01-15'
);

// Get price trends
const fares = await apsrtc.getFareDetails('Hyderabad', 'Vijayawada');

// Book a ticket
const booking = await apsrtc.bookBus(
  'bus123',
  'user456',
  'A1',
  'user@email.com',
  '+919876543210'
);
```

---

### 2. Redbus

**Type:** Private Bus Aggregator  
**Service File:** `src/services/redbusIntegration.ts`  
**Region:** Pan-India  
**Status:** ✅ Implemented & Ready

#### Features Implemented
- Advanced multi-operator search
- Price trend analysis and prediction
- Comprehensive seat layout information
- Multiple boarding/dropping points
- Detailed amenities and ratings
- Cancellation policy tracking
- Dynamic pricing with discounts
- 5-minute caching

#### API Endpoints Used
```
GET /search - Search trips with filters
GET /trips/{tripId} - Get detailed trip info
GET /trips/{tripId}/seats - Get seat availability
GET /price-trends - Historical price analysis
POST /bookings - Book trip
GET /bookings/{id} - Get booking details
POST /bookings/{id}/cancel - Cancel booking
GET /routes/popular - Popular routes listing
```

#### Configuration Required
```env
REDBUS_API_KEY=your_affiliate_api_key
REDBUS_AFFILIATE_ID=your_affiliate_id
```

#### Sample Usage
```typescript
import redbus from './services/redbusIntegration';

// Search with filters
const trips = await redbus.searchBuses({
  source: 'Hyderabad',
  destination: 'Bangalore',
  departureDate: '2026-01-15',
  passengers: 2
});

// Get price trends
const trends = await redbus.getPriceTrends(
  'Hyderabad',
  'Bangalore',
  {
    start: '2026-01-01',
    end: '2026-01-31'
  }
);

// Book trip
const booking = await redbus.bookTrip(
  'trip123',
  [
    { name: 'John', email: 'john@email.com', phone: '+919876543210', age: 25 },
    { name: 'Jane', email: 'jane@email.com', phone: '+919876543211', age: 23 }
  ],
  ['A1', 'A2'],
  'contact@email.com',
  '+919876543210'
);
```

---

## Data Aggregation Flow

```
┌─────────────────┐
│ User Search     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ busOperatorAgg  │ (Aggregates data)
│ regator.ts      │
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌────────┐  ┌────────┐
│ APSRTC │  │ Redbus │
│  API   │  │  API   │
└────────┘  └────────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│ Database Cache  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ API Response    │
│ (Normalized)    │
└─────────────────┘
```

## Environment Configuration

Add these to your `.env` file:

```env
# APSRTC Configuration
APSRTC_API_KEY=xxxxxxxxxxxx
APSRTC_API_SECRET=xxxxxxxxxxxx

# Redbus Configuration
REDBUS_API_KEY=xxxxxxxxxxxx
REDBUS_AFFILIATE_ID=xxxxxxxxxxxx

# Data Sync Settings
OPERATOR_SYNC_INTERVAL=300000  # 5 minutes
PRICE_UPDATE_INTERVAL=600000   # 10 minutes

# Caching
CACHE_ENABLED=true
CACHE_TTL_MINUTES=5
```

## Planned Integrations

### Tier 1 (Next Priority)
- **TSRTC** (Telangana State RTC) - State transport
- **GoIbibo/MakemyTrip Buses** - Major private operator

### Tier 2
- **BMTC** (Bangalore Metropolitan Transport Corp)
- **Ixigo Bus** - Private operator
- **Yatra.com** - Travel aggregator

### Tier 3
- Regional private operators
- City bus services
- Luxury bus operators

## Performance Optimization

### Caching Strategy
- **Route Data:** 24-hour cache
- **Price Data:** 5-minute cache  
- **Seat Availability:** 2-minute cache
- **Booking Status:** 10-minute cache

### Rate Limiting
- APSRTC: 100 requests/minute
- Redbus: 500 requests/minute

### Load Distribution
- Stagger API calls during peak hours
- Use webhook notifications where available
- Implement circuit breaker pattern for failures

## Error Handling

All integrations include:
- Automatic retry with exponential backoff
- Fallback to cached data
- Comprehensive error logging
- Graceful degradation

## Testing

### Local Testing
```bash
npm test -- src/services/*.test.ts
```

### Sample Test Cases
```typescript
describe('APSRTC Integration', () => {
  it('should search buses successfully', async () => {
    const buses = await apsrtc.searchBuses('HYD', 'BNG', '2026-01-15');
    expect(buses.length).toBeGreaterThan(0);
  });

  it('should cache results', async () => {
    const first = await apsrtc.searchBuses('HYD', 'BNG', '2026-01-15');
    const second = await apsrtc.searchBuses('HYD', 'BNG', '2026-01-15');
    expect(first).toEqual(second);
  });
});
```

## Monitoring & Analytics

- Track API response times
- Monitor cache hit rates
- Log operator data sync status
- Alert on integration failures
- Daily data quality reports

## Support & Maintenance

### Common Issues

**Issue: API Key expired**
- Solution: Regenerate API keys from operator portals

**Issue: Slow response times**
- Solution: Check cache settings and API rate limits

**Issue: Missing seat data**
- Solution: Verify API endpoint changes with operator

## Next Steps

1. ✅ Integrate APSRTC
2. ✅ Integrate Redbus
3. 🔄 Add TSRTC integration
4. 🔄 Implement price prediction ML
5. 🔄 Add more STC operators
6. 🔄 Build operator admin dashboard

---

**Last Updated:** January 2, 2026  
**Maintained By:** Bus Price Tracker Team  
**Status:** Active Development
