import axios from 'axios';
import { User } from '../contexts/AuthContext'; // Assuming User type is defined here

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'coupon';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface UserProfile {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  preferredLanguage?: string;
}

// Helper to add auth header
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const updateProfile = async (profileData: Partial<UserProfile>): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/api/account/profile`, profileData, { headers: authHeader() });
    return response.data.user; // Assuming backend returns updated user object
  } catch (error: any) {
     console.error('Update profile error:', error.response?.data || error.message);
     throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await axios.put(`${API_URL}/api/account/password`, {
      currentPassword,
      newPassword
    }, { headers: authHeader() });
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const getTransactionHistory = async (): Promise<Transaction[]> => {
  try {
    console.log('Fetching transaction history...');
    const token = localStorage.getItem('token');
    console.log('Current auth token:', token ? 'Present' : 'Missing');
    
    const response = await axios.get(`${API_URL}/api/account/transactions`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Transaction history response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get transactions error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch transaction history');
  }
};

export const updateSettings = async (settings: {
  emailNotifications: boolean;
  marketingCommunications: boolean;
}): Promise<{ message: string }> => {
  try {
    const response = await axios.put(`${API_URL}/api/account/settings`, settings, { headers: authHeader() });
    return response.data;
  } catch (error: any) {
     console.error('Update settings error:', error.response?.data || error.message);
     throw new Error(error.response?.data?.message || 'Failed to update settings');
  }
};

export const enableTwoFactorAuth = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/api/account/2fa/enable`, {}, { headers: authHeader() });
    return response.data;
  } catch (error: any) {
     console.error('Enable 2FA error:', error.response?.data || error.message);
     throw new Error(error.response?.data?.message || 'Failed to enable two-factor authentication');
  }
};

export const disableTwoFactorAuth = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/api/account/2fa/disable`, {}, { headers: authHeader() });
    return response.data;
  } catch (error: any) {
     console.error('Disable 2FA error:', error.response?.data || error.message);
     throw new Error(error.response?.data?.message || 'Failed to disable two-factor authentication');
  }
};

// Add the new function to apply coupon code
export const applyCouponCode = async (couponCode: string): Promise<User> => {
    try {
        console.log('Attempting to apply coupon with code:', couponCode);
        const token = localStorage.getItem('token');
        console.log('Current auth token:', token ? 'Present' : 'Missing');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await axios.post<{ message: string, user: User }>(
            `${API_URL}/api/account/apply-coupon`, 
            { couponCode: couponCode }, 
            { headers }
        );
        console.log('Coupon application response:', response.data);
        return response.data.user;
    } catch (error: any) {
        console.error('Apply coupon error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Invalid coupon code or failed to apply.');
    }
}; 