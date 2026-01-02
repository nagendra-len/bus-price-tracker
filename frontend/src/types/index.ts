// Authentication Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  name: string;
  password: string;
}

// Price Alert Types
export interface PriceAlert {
  id: string;
  userId: string;
  source: string;
  destination: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
   busType?: string;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  arrivalTimeFrom?: string;
  arrivalTimeTo?: string;
}

export interface CreateAlertRequest {
  source: string;
  destination: string;
  targetPrice: number;
   busType?: string;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  arrivalTimeFrom?: string;
  arrivalTimeTo?: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  message: string;
  currentPrice: number;
  previousPrice: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AlertsList: undefined;
  CreateAlert: undefined;
};

export interface NavigationProps<T extends keyof RootStackParamList> {
  navigation: any;
  route: any;
}
