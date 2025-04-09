import axios from 'axios';
import { User } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
}) as any; // Temporary fix to bypass type checking

// Add request interceptor to include token in all requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  preferredLanguage?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user: {
    id: string;
    username: string;
    email: string;
    status: string;
    verificationStatus: string;
    createdAt: string;
  };
}

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Sending registration request to:', `${API_URL}/api/register`);
    console.log('Registration data:', userData);
    
    const response = await api.post('/api/register', userData) as { data: AuthResponse };
    
    console.log('Registration response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    console.log('Starting login process...');
    
    const response = await api.post('/api/login', credentials) as { data: AuthResponse };
    console.log('Login response received:', response.data);

    if (response.data.token) {
      console.log('Storing token in localStorage');
      localStorage.setItem('token', response.data.token);
      console.log('Token stored successfully');
    } else {
      console.warn('No token received in login response');
    }

    if (response.data.user) {
      console.log('Storing user data in localStorage');
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User data stored successfully:', response.data.user.username);
    } else {
      console.warn('No user data received in login response');
    }

    // Verify storage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('Verifying storage - Token exists:', !!storedToken, 'User exists:', !!storedUser);

    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Login failed. Please check your credentials and try again.');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  console.log('Checking authentication state:');
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!userStr);
  
  if (!token) {
    console.log('No token found, redirecting to login');
    return null;
  }

  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      if (userData && typeof userData === 'object' && 'id' in userData && 'username' in userData) {
        console.log('Valid user data found:', userData.username);
        return userData as User;
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  
  console.log('No valid user data found');
  return null;
}; 