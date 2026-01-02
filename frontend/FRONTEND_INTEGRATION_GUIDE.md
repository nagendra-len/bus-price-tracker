# Frontend-Backend Integration Guide

## Overview

This guide provides complete instructions for integrating the React Native frontend with the Bus Price Tracker backend deployed on Render.com.

## 1. Backend API Configuration

### Get Your Backend URL

1. Go to Render Dashboard: https://dashboard.render.com
2. Select your Web Service (bus-price-tracker-api)
3. Copy the service URL from the dashboard
4. It will look like: `https://bus-price-tracker-api.onrender.com`

### Update Frontend .env File

Create or update `.env` in frontend directory:

```env
API_BASE_URL=https://bus-price-tracker-api.onrender.com
API_TIMEOUT=30000
ENV=production
```

## 2. API Service Configuration

Update `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken(); // from AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
```

## 3. Authentication Integration

### Login Endpoint

```typescript
// src/services/auth.ts
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data; // { token, user }
  } catch (error) {
    throw error;
  }
};
```

### Registration Endpoint

```typescript
export const registerUser = async (userData: {
  email?: string;
  phone?: string;
  password: string;
  name: string;
}) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data; // { token, user }
  } catch (error) {
    throw error;
  }
};
```

### Token Management

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'auth_token';

export const saveAuthToken = async (token: string) => {
  await AsyncStorage.setItem(STORAGE_KEY, token);
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem(STORAGE_KEY);
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
```

## 4. Bus Search Integration

```typescript
// src/services/bus.ts
export const searchBuses = async (
  from: string,
  to: string,
  departureDate: string
) => {
  try {
    const response = await apiClient.get('/buses', {
      params: {
        from,
        to,
        departureDate,
      },
    });
    return response.data; // Array of buses
  } catch (error) {
    throw error;
  }
};

export const getBusDetails = async (busId: string) => {
  try {
    const response = await apiClient.get(`/buses/${busId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## 5. Booking Flow Integration

```typescript
// src/services/booking.ts
export const createBooking = async (bookingData: {
  busId: string;
  passengers: PassengerInfo[];
  totalPrice: number;
  paymentMethod: string;
}) => {
  try {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data; // { bookingId, status, confirmationLink }
  } catch (error) {
    throw error;
  }
};

export const getBookingDetails = async (bookingId: string) => {
  try {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## 6. Price Alerts Integration

```typescript
// src/services/alerts.ts
export const createPriceAlert = async (alertData: {
  from: string;
  to: string;
  maxPrice: number;
  notificationType: 'email' | 'sms' | 'push';
}) => {
  try {
    const response = await apiClient.post('/alerts', alertData);
    return response.data; // { alertId, status }
  } catch (error) {
    throw error;
  }
};

export const getPriceAlerts = async () => {
  try {
    const response = await apiClient.get('/alerts');
    return response.data; // Array of alerts
  } catch (error) {
    throw error;
  }
};
```

## 7. Error Handling

Add global error handling:

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        removeAuthToken();
        // Navigate to login screen
        break;
      case 403:
        // Forbidden
        return 'Access denied';
      case 404:
        // Not found
        return 'Resource not found';
      case 500:
        // Server error
        return 'Server error. Please try again later';
      default:
        return error.response.data?.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Check your internet connection';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred';
  }
};
```

## 8. Testing the Integration

### Test Endpoints

1. **Health Check**
   ```bash
   curl https://bus-price-tracker-api.onrender.com/api/health
   ```

2. **Register Test User**
   ```bash
   curl -X POST https://bus-price-tracker-api.onrender.com/api/auth/register \\
     -H "Content-Type: application/json" \\
     -d '{"email": "test@example.com", "password": "test123", "name": "Test"}'
   ```

3. **Search Buses**
   ```bash
   curl "https://bus-price-tracker-api.onrender.com/api/buses?from=Hyderabad&to=Bangalore&departureDate=2026-01-15"
   ```

### Frontend Testing

1. Create a test user via registration screen
2. Login with test credentials
3. Search for buses between two cities
4. Create a price alert
5. Verify booking flow

## 9. Common Issues & Solutions

### CORS Errors

**Problem**: "Access to XMLHttpRequest from 'http://localhost:8081' blocked"

**Solution**: Update backend CORS configuration:

```typescript
// backend/src/app.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081', // Expo
    'http://localhost:19000', // React Native
  ],
  credentials: true,
}));
```

### 401 Unauthorized

**Problem**: Token not being sent with requests

**Solution**: Ensure token is saved and retrieved correctly:

```typescript
await saveAuthToken(response.data.token);
const token = await getAuthToken();
console.log('Token:', token);
```

### Connection Timeout

**Problem**: Requests timing out

**Solution**: 
- Verify backend is running
- Check internet connectivity
- Increase timeout in .env: `API_TIMEOUT=60000`
- Check Render service status

### Missing Environment Variables

**Problem**: API_BASE_URL undefined

**Solution**:
```bash
cp .env.example .env
# Edit .env with correct values
npm start -- --reset-cache
```

## 10. Deployment Checklist

Before deploying to production:

- [ ] Update API_BASE_URL to production backend
- [ ] Test all authentication flows
- [ ] Verify JWT token refresh works
- [ ] Test bus search with real data
- [ ] Test booking creation flow
- [ ] Verify error handling
- [ ] Test on both Android and iOS
- [ ] Check network requests in Flipper
- [ ] Verify AsyncStorage persistence
- [ ] Test offline handling (if implemented)
- [ ] Configure push notifications
- [ ] Set up crash reporting (Firebase, Sentry)
- [ ] Performance testing
- [ ] Security audit

## 11. API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Buses
- `GET /api/buses` - Search buses
- `GET /api/buses/:id` - Get bus details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings` - Get user bookings

### Alerts
- `POST /api/alerts` - Create price alert
- `GET /api/alerts` - Get user alerts
- `DELETE /api/alerts/:id` - Delete alert

### Traveler
- `GET /api/travelers/profile` - Get user profile
- `PUT /api/travelers/profile` - Update profile

## 12. Performance Optimization

1. **API Request Caching**
   - Cache bus search results for 5 minutes
   - Cache user profile for session

2. **Image Optimization**
   - Use optimized image sizes
   - Implement lazy loading

3. **Network Optimization**
   - Bundle requests where possible
   - Implement request debouncing

4. **State Management**
   - Use efficient redux selectors
   - Implement memoization

## Support

For integration issues:
1. Check backend logs in Render dashboard
2. Verify API_BASE_URL is correct
3. Check network requests in React Native debugger
4. Review error messages in console
5. Test with Postman/Thunder Client
