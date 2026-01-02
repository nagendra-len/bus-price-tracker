# Bus Price Tracker Backend - Quick Start Guide

## 5-Minute Setup for Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Step 1: Clone and Install
```bash
git clone https://github.com/nagendra-len/bus-price-tracker.git
cd bus-price-tracker/backend
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### Step 3: Database Setup
```bash
# Create PostgreSQL database
createdir bus_tracker
creatuser tracker_user

# Run migrations
npm run migrate
```

### Step 4: Start Development
```bash
# Start the server with auto-reload
npm run dev

# Server runs at http://localhost:3000
```

### Step 5: Test the API
```bash
# Health check
curl http://localhost:3000/api/health

# Register user (email or phone)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get live bus prices with filters
curl http://localhost:3000/api/buses/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -G --data-urlencode "from=Hyderabad" \
  --data-urlencode "to=Bangalore" \
  --data-urlencode "date=2024-02-15" \
  --data-urlencode "busType=AC"
```

## Available npm Commands

```bash
npm run dev         # Start with hot-reload (development)
npm start           # Start production server
npm run build       # Build TypeScript
npm test            # Run test suite
npm run migrate     # Run database migrations
npm run seed        # Seed sample data
```

## Project Structure
```
src/
  routes/           # API endpoints
  controllers/      # Business logic
  services/         # External API calls, bus operators
  models/           # Database models
  middleware/       # Auth, validation, error handling
  utils/            # Helper functions
  config/           # Configuration files
  __tests__/        # Test suites
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register with email or phone
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh-token` - Refresh JWT token

### Bus Search & Prices
- `GET /api/buses/search` - Search buses with filters (type, departure, arrival)
- `GET /api/buses/:id` - Get specific bus details
- `GET /api/prices` - Get live price tracking

### Booking
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/confirm` - Send SMS/email/WhatsApp confirmation

### Price Alerts
- `POST /api/alerts/create` - Create price drop alert
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts/:id/toggle` - Enable/disable alert

## Docker Support

```bash
# Start with Docker Compose
docker-compose up

# Database will be at: localhost:5432
# API will be at: localhost:3000
```

## Troubleshooting

**Database Connection Error**
```bash
# Verify PostgreSQL is running
psql -U tracker_user -d bus_tracker

# Reset database
npm run migrate:reset
```

**Port Already in Use**
```bash
# Change PORT in .env
PORT=3001
```

**JWT Errors**
- Regenerate JWT_SECRET in .env
- Clear stored tokens in client

## Next Steps
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
2. Check [README.md](./README.md) for API documentation
3. Review test coverage: `npm test`
4. See [render.yaml](./render.yaml) for Render.com deployment config

## Support
- GitHub Issues: Report bugs
- Documentation: See README.md
- Deployment: See DEPLOYMENT.md
