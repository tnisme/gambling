import { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Game } from '../entities/Game.js';

export class GameController {
    async getGames(req: Request, res: Response) {
        try {
            const gameRepository = AppDataSource.getRepository(Game);
            const games = await gameRepository.find();
            
            // Format games for frontend
            const formattedGames = games.map((game: Game) => ({
                id: game.id,
                name: game.name,
                type: game.type,
                image: `/images/games/${game.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                config: game.config
            }));

            res.json(formattedGames);
        } catch (error) {
            console.error('Error fetching games:', error);
            res.status(500).json({ message: 'Failed to fetch games' });
        }
    }

    async getGameById(req: Request, res: Response) {
        try {
            const gameId = parseInt(req.params.id);
            const gameRepository = AppDataSource.getRepository(Game);
            const game = await gameRepository.findOne({ where: { id: gameId } });
            
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }

            // Format game for frontend
            const formattedGame = {
                id: game.id,
                name: game.name,
                type: game.type,
                image: `/images/games/${game.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                config: game.config
            };

            res.json(formattedGame);
        } catch (error) {
            console.error('Error fetching game:', error);
            res.status(500).json({ message: 'Failed to fetch game' });
        }
    }
} 