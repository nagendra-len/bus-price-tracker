// API Service for Bus Price Tracker
const API_BASE_URL = 'http://localhost:3000';

interface AuthResponse {
  message: string;
  user: {
    id: number;
    email?: string;
    phone?: string;
    name: string;
  };
  token: string;
}

interface Alert {
  id: number;
  user_id: number;
  source_city: string;
  destination_city: string;
  target_price: number;
  current_price?: number;
  alert_threshold?: number;
  is_active: boolean;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: any = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async register(email: string, phone: string, password: string, name: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/register', 'POST', {
      email,
      phone,
      password,
      name,
    });
  }

  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    const isEmail = emailOrPhone.includes('@');
    return this.makeRequest('/auth/login', 'POST', {
      email: isEmail ? emailOrPhone : undefined,
      phone: !isEmail ? emailOrPhone : undefined,
      password,
    });
  }

  // Alert APIs
  async getAlerts(): Promise<Alert[]> {
    return this.makeRequest('/alerts', 'GET');
  }

  async createAlert(
    source_city: string,
    destination_city: string,
    target_price: number
  ): Promise<Alert> {
    return this.makeRequest('/alerts', 'POST', {
      source_city,
      destination_city,
      target_price,
    });
  }

  async updateAlert(
    id: number,
    target_price?: number,
    is_active?: boolean
  ): Promise<Alert> {
    return this.makeRequest(`/alerts/${id}`, 'PUT', {
      target_price,
      is_active,
    });
  }

  async deleteAlert(id: number): Promise<{ message: string }> {
    return this.makeRequest(`/alerts/${id}`, 'DELETE');
  }
}

export default new ApiService();
