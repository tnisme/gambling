import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface DepositResponse {
    id: number;
    userId: number;
    transactionId: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export const createDeposit = async (amount: number, paymentMethod: string): Promise<DepositResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/deposits`, {
        amount,
        paymentMethod
    }, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getDeposits = async (): Promise<DepositResponse[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/deposits`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
}; 