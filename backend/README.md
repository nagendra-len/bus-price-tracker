# Bus Price Tracker - Backend API

A Node.js/Express.js backend API for the Bus Price Tracker application that helps users track bus prices and receive notifications when prices drop.

## Features

- User authentication with email/phone
- Price tracking for bus routes
- Alerts for price drops
- Booking management
- Notifications via SMS, Email, and WhatsApp
- Filter bus routes by type, departure and arrival times
- Real-time price monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **SMS/WhatsApp**: Twilio API
- **Email**: SendGrid API

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Twilio Account (for SMS/WhatsApp)
- SendGrid Account (for Email)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nagendra-len/bus-price-tracker.git
cd bus-price-tracker/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- Database credentials
- JWT secret
- Twilio credentials
- SendGrid API key

5. Initialize the database:
```bash
psql -U postgres -f src/schema.sql
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Alerts
- `GET /alerts` - Get user alerts
- `POST /alerts` - Create new alert
- `PUT /alerts/:id` - Update alert
- `DELETE /alerts/:id` - Delete alert

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Notifications
- `POST /notifications/send` - Send notification
- `PUT /notifications/preferences` - Update notification preferences
- `GET /notifications/preferences` - Get notification preferences

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

- **users** - User account information
- **bus_routes** - Available bus routes
- **price_history** - Historical price data
- **alerts** - User price drop alerts
- **bookings** - User bookings

## Project Structure

```
src/
├── routes/          # API route handlers
├── services/        # Business logic and external API integrations
├── middleware/      # Express middleware
├── types/           # TypeScript type definitions
├── database.ts      # Database connection
├── app.ts          # Express app configuration
└── schema.sql      # Database schema
```

## Contributing

Contributions are welcome! Please create a pull request with your changes.

## License

MIT License
