# Bus Price Tracker - Frontend

React Native mobile application for tracking bus price fluctuations and receiving alerts for last-minute price drops.

## Features

- **User Authentication**: Register and login with email or phone number
- **Price Alerts**: Create custom price alerts for bus routes
- **Real-time Notifications**: Get notified when prices drop below your target
- **Alert Management**: View, edit, and delete your alerts
- **Local Authentication**: Secure token-based authentication with AsyncStorage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- React Native development environment

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nagendra-len/bus-price-tracker.git
cd bus-price-tracker/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL.

## Running the App

### Start the Expo server:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS:
```bash
npm run ios
```

### Run on Web:
```bash
npm run web
```

## Project Structure

```
src/
├── screens/           # UI Screens
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── AlertsListScreen.tsx
│   └── CreateAlertScreen.tsx
├── api.ts            # API service layer
├── store.ts          # Redux store configuration
├── App.tsx           # Main app component with navigation
└── index.tsx         # App entry point
```

## Technologies Used

- **React Native** - Cross-platform mobile development
- **React Navigation** - Navigation and routing
- **Redux/Toolkit** - State management
- **Axios** - HTTP client
- **AsyncStorage** - Local storage for authentication
- **TypeScript** - Type safety
- **Expo** - Development and deployment

## Authentication Flow

1. User starts the app
2. App checks for stored auth token in AsyncStorage
3. If token exists, navigate to AlertsList screen
4. Otherwise, show Login/Register screens
5. After successful login/registration, token is stored and user navigates to AlertsList

## Environment Variables

Create a `.env` file in the frontend directory:

```
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=10000
ENVIRONMENT=development
DEBUG_MODE=true
```

## Development

### Running Tests:
```bash
npm test
```

### Code Quality:
```bash
npm run lint
```

## Contributing

Please follow the coding standards and create feature branches for new developments.

## License

MIT
