import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Game {
  id: number;
  name: string;
  type: string;
  image: string;
  config?: Record<string, any>;
}

export const gameService = {
  async getGames(): Promise<Game[]> {
    try {
      const response = await axios.get(`${API_URL}/api/games`);
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  async getGameById(id: number): Promise<Game> {
    try {
      const response = await axios.get(`${API_URL}/api/games/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  }
}; 