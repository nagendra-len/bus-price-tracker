-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus routes table
CREATE TABLE IF NOT EXISTS bus_routes (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  operator VARCHAR(255),
  bus_type VARCHAR(100),
  departure_time TIME,
  arrival_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES bus_routes(id),
  price DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  route_id INTEGER NOT NULL REFERENCES bus_routes(id),
  target_price DECIMAL(10, 2) NOT NULL,
  bus_type VARCHAR(100),
  departure_time_from TIME,
  departure_time_to TIME,
  arrival_time_from TIME,
  arrival_time_to TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_route_id ON alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_price_history_route_id ON price_history(route_id);
CREATE INDEX IF NOT EXISTS idx_bus_routes_source_dest ON bus_routes(source, destination);
