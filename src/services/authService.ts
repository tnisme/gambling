import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    
    const response = await axios.post<AuthResponse>(
      `${API_URL}/api/register`, 
      userData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Registration response:', response.data);
    
    // Store the user data in localStorage for persistence
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Type assertion for error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    console.log('Sending login request to:', `${API_URL}/api/login`);
    
    const response = await axios.post<AuthResponse>(
      `${API_URL}/api/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Store the user data in localStorage for persistence
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

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
  localStorage.removeItem('user');
};

export const getCurrentUser = (): AuthResponse | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
}; 