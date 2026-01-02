-- Users table for authentication and profile management
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on phone for faster lookups
CREATE INDEX idx_users_phone ON users(phone);

-- Price alerts table to track user price monitoring
CREATE TABLE price_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_city VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  target_price DECIMAL(10, 2),
  current_price DECIMAL(10, 2),
  alert_threshold DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_alerts_user_id ON price_alerts(user_id);

-- Create index on route for faster lookups
CREATE INDEX idx_alerts_route ON price_alerts(source_city, destination_city);

-- Bus prices table to store historical price data
CREATE TABLE bus_prices (
  id SERIAL PRIMARY KEY,
  source_city VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  bus_name VARCHAR(100),
  price DECIMAL(10, 2),
  travel_date DATE,
  seat_available INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on route and date for faster lookups
CREATE INDEX idx_prices_route_date ON bus_prices(source_city, destination_city, travel_date);
