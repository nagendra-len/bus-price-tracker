# Session 7: Frontend React Native Development Plan

**Status:** In Progress  
**Frontend Ready:** React Native + Expo scaffolded  
**Backend Ready:** 98% complete with deployment infrastructure  

---

## Project Overview

This session focuses on implementing comprehensive React Native screens and features for the Bus Price Tracker application. The frontend will integrate with the backend API to provide real-time bus price tracking and last-minute deal notifications.

## Frontend Architecture (Current State)

### Directory Structure
```
frontend/src/
├── screens/          # Screen components
│   ├── HomeScreen.tsx         ✅ (Scaffolded)
│   ├── LoginScreen.tsx        (To implement)
│   ├── RegisterScreen.tsx     (To implement)
│   ├── PriceListScreen.tsx    (To implement)
│   ├── AlertsScreen.tsx       (To implement)
│   ├── BookingScreen.tsx      (To implement)
│   └── ProfileScreen.tsx      (To implement)
├── components/       # Reusable components
│   ├── BusCard.tsx
│   ├── PriceAlert.tsx
│   ├── BookingForm.tsx
│   └── ...
├── types/           # TypeScript definitions
├── utils/           # Utility functions
├── api.ts           # API service layer
├── store.ts         # Redux store
└── App.tsx          # Main app component
```

## Key Components to Implement

### 1. Authentication Screens
- **LoginScreen**
  - Email/Phone input
  - Password input
  - Forgot password link
  - Sign up navigation
  - API integration for login

- **RegisterScreen**
  - Email/Phone selection
  - Name input
  - Password setup
  - Terms & conditions checkbox
  - OTP verification flow

### 2. Main Navigation
- Bottom tab navigator with:
  - Home (Price listings)
  - Alerts (Price alerts management)
  - Bookings (View bookings)
  - Profile (User settings)

### 3. Home Screen
- Bus search/filter form:
  - From/To locations
  - Date picker
  - Bus type filter
  - Departure time filter
- Bus listings with:
  - Real-time prices
  - Price change indicators (up/down)
  - Rating and reviews
  - Quick book button
  - Set price alert button

### 4. Price Alerts Screen
- List of active price alerts
- Alert details:
  - Bus route
  - Target price
  - Current price
  - Time until departure
  - Edit/Delete actions
- Create new alert button
- Alert notifications display

### 5. Booking Screen
- Booking history listing
- Booking details:
  - Bus details
  - Passenger list
  - Seat numbers
  - Total price paid
  - Booking status
  - Live tracker button
- Upcoming trips vs past trips tabs

### 6. Profile Screen
- User information
- Notification preferences
- Payment methods
- Refund history
- Logout button

## API Integration Points

### 1. Authentication APIs
```typescript
POST /auth/register
POST /auth/login
GET /auth/profile
POST /auth/logout
```

### 2. Bus Search APIs
```typescript
GET /buses/search?from=&to=&date=&filters=
GET /buses/:id
GET /price/history/:busId
```

### 3. Alerts APIs
```typescript
POST /alerts
GET /alerts
DELETE /alerts/:id
PUT /alerts/:id
```

### 4. Booking APIs
```typescript
POST /booking
GET /booking/history
GET /booking/:id
GET /price/latest/:busId
```

## State Management (Redux)

### Auth Slice
- User data
- Authentication token
- Login/Register states

### Alerts Slice
- Active alerts list
- Alert creation form state
- Notification center

### Bus Slice
- Bus search results
- Selected bus details
- Search filters state

### Booking Slice
- Current booking
- Booking history
- Payment state

## Implementation Priority

### Phase 1 (Week 1)
1. LoginScreen & RegisterScreen
2. Auth Redux slice
3. API service integration
4. Navigation setup

### Phase 2 (Week 2)
5. HomeScreen with bus search
6. BusCard component
7. PriceListScreen
8. Real-time price updates

### Phase 3 (Week 3)
9. AlertsScreen
10. Alert creation form
11. Alert management
12. Notification integration

### Phase 4 (Week 4)
13. BookingScreen
14. BookingForm component
15. ProfileScreen
16. Settings & preferences

## UI/UX Components to Use

- React Native Paper (Material Design)
- React Navigation (Stack, Tab, Drawer)
- Redux Toolkit (State management)
- Axios (HTTP client)
- Formik + Yup (Form validation)
- Lottie (Animations)
- React Native Maps (Live tracker)

## Testing Strategy

### Unit Tests
- Redux reducers
- API service calls
- Utility functions
- Form validation

### Integration Tests
- Screen navigation
- API integration
- State management flow

### E2E Tests
- User registration flow
- Price alert creation
- Booking flow
- Complete user journey

## Performance Considerations

- Lazy load screens
- Image caching
- API response caching with Redux
- Minimize re-renders
- Optimize list rendering (FlatList)
- Code splitting

## Accessibility

- Proper contrast ratios
- Text size scalability
- Screen reader support
- Keyboard navigation
- WCAG 2.1 AA compliance

## Security

- Secure token storage (SecureStore)
- HTTPS only API calls
- Input validation
- XSS prevention
- CSRF protection
- Sensitive data encryption

## Development Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
i

# Run on Android
a

# Run tests
npm test

# Build for production
eas build
```

## Backend Integration Checklist

- [ ] Connect to backend API (localhost:5000 for dev)
- [ ] Implement JWT token management
- [ ] Set up error handling
- [ ] Configure API timeout and retry logic
- [ ] Implement refresh token flow
- [ ] Add request/response logging
- [ ] Handle network errors gracefully

## Milestones

**Week 1:**
- ✅ Session 7: Authentication screens + navigation
- API integration tested

**Week 2:**
- ✅ Session 8: Bus search & price listings
- Real-time price updates working

**Week 3:**
- ✅ Session 9: Price alerts & booking flow
- Notifications implemented

**Week 4:**
- ✅ Session 10: Testing, optimization & deployment
- App ready for production

## Success Criteria

- ✅ All screens implemented
- ✅ 90%+ code coverage
- ✅ <2 second initial load time
- ✅ <100ms screen navigation time
- ✅ Works on iOS 12+ and Android 8+
- ✅ < 50MB app size
- ✅ 4.5+ star rating (UX quality)

---

**Next Action:** Begin Session 7 by implementing LoginScreen and RegisterScreen components
