import { GameService } from './GameService.js';
import { Game, GameType } from '../entities/Game.js';

interface GameConfig {
    minBet: number;
    maxBet: number;
    [key: string]: any;
}

export class RouletteService {
    private gameService: GameService;

    constructor() {
        this.gameService = new GameService();
    }

    async getGame(): Promise<Game> {
        const game = await this.gameService.getGameByType(GameType.ROULETTE);
        if (!game) {
            throw new Error('Roulette game not found');
        }
        return game;
    }

    async spin(): Promise<number> {
        // Standard roulette has numbers 0-36
        return Math.floor(Math.random() * 37);
    }

    calculatePayout(betAmount: number, multiplier: number): number {
        return betAmount * multiplier;
    }

    isValidBet(betAmount: number, game: Game): boolean {
        const config = game.config as GameConfig;
        return betAmount >= config.minBet && betAmount <= config.maxBet;
    }
} 