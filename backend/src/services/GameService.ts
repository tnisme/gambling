import { Game } from '../entities/Game.js';
import { GameType } from '../entities/Game.js';
import { AppDataSource } from '../config/database.js';
import { Bet, BetOutcome } from '../entities/Bet.js';

export class GameService {
    private gameRepository = AppDataSource.getRepository(Game);
    private betRepository = AppDataSource.getRepository(Bet);

    async getGameByType(type: GameType): Promise<Game | null> {
        return this.gameRepository.findOne({ where: { type } });
    }

    async getRouletteGame(): Promise<Game | null> {
        return this.getGameByType(GameType.ROULETTE);
    }

    async createGame(name: string, type: GameType, minBet: number, maxBet: number): Promise<Game> {
        const game = new Game();
        game.name = name;
        game.type = type;
        game.minBet = minBet;
        game.maxBet = maxBet;
        game.isActive = true;
        return this.gameRepository.save(game);
    }

    async placeBet(betData: { userId: number; gameId: number; amount: number; betType: string; betValue: string }): Promise<Bet> {
        const bet = new Bet();
        bet.userId = betData.userId;
        bet.gameId = betData.gameId;
        bet.amount = betData.amount;
        bet.betType = betData.betType;
        bet.betValue = betData.betValue;
        bet.outcome = BetOutcome.PENDING;
        return this.betRepository.save(bet);
    }
} 