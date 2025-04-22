import { WebSocket, WebSocketServer } from 'ws';
import { GameService } from '../services/GameService.js';
import { BlackjackService } from '../services/BlackjackService.js';
import { BetOutcome } from '../entities/Bet.js';

interface BlackjackGameState {
    status: 'waiting' | 'playing' | 'complete';
    playerHand?: any[];
    dealerHand?: any[];
    playerValue?: number;
    dealerValue?: number;
    winner?: 'player' | 'dealer' | 'push';
    timeRemaining?: number;
}

export class BlackjackServer {
    private wss: WebSocketServer;
    private gameState: BlackjackGameState;
    private gameService: GameService;
    private blackjackService: BlackjackService;
    private clients: Set<WebSocket>;
    private readonly ROUND_TIME = 30000; // 30 seconds

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.gameService = new GameService();
        this.blackjackService = new BlackjackService();
        this.clients = new Set();
        this.gameState = {
            status: 'waiting',
            timeRemaining: 30
        };

        this.initialize();
    }

    private initialize() {
        this.wss.on('connection', (ws: WebSocket) => {
            this.clients.add(ws);
            
            // Send current game state to new client
            ws.send(JSON.stringify({
                type: 'gameState',
                data: this.gameState
            }));

            ws.on('message', async (message: string) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Error handling message:', error);
                    if (error instanceof Error) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: error.message
                        }));
                    }
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });

        this.startGameLoop();
    }

    private async handleMessage(ws: WebSocket, message: any) {
        switch (message.type) {
            case 'placeBet':
                await this.handleBetPlacement(ws, message.data);
                break;
            case 'hit':
                await this.handleHit(ws);
                break;
            case 'stand':
                await this.handleStand(ws);
                break;
        }
    }

    private async handleBetPlacement(ws: WebSocket, betData: any) {
        try {
            if (this.gameState.status !== 'waiting') {
                throw new Error('Cannot place bet while game is in progress');
            }

            // Get the game by ID since that's what we have available
            const game = await this.gameService.getGameById(betData.gameId || 8); // Default to game ID 8 if not provided
            if (!game) {
                throw new Error('Game not found');
            }

            if (!this.blackjackService.isValidBet(betData.amount, game)) {
                throw new Error(`Invalid bet amount. Min: ${game.config?.minBet}, Max: ${game.config?.maxBet}`);
            }

            // Create the bet with required fields
            const bet = await this.gameService.placeBet({
                userId: betData.userId || 1, // Default to user 1 if not provided
                gameId: game.id,
                amount: betData.amount,
                betType: 'blackjack', 
                betValue: 'bet'
            });

            const { playerHand, dealerHand } = this.blackjackService.dealInitialCards();
            
            this.gameState = {
                status: 'playing',
                playerHand,
                dealerHand,
                playerValue: this.blackjackService.calculateHandValue(playerHand),
                dealerValue: this.blackjackService.calculateHandValue([dealerHand[0]]), // Only show first dealer card
                timeRemaining: 30
            };

            this.broadcastGameState();
        } catch (error) {
            console.error('Error placing bet:', error);
            if (error instanceof Error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        }
    }

    private async handleHit(ws: WebSocket) {
        try {
            if (this.gameState.status !== 'playing') {
                throw new Error('Cannot hit when game is not in progress');
            }

            const newCard = this.blackjackService.hit();
            this.gameState.playerHand?.push(newCard);
            this.gameState.playerValue = this.blackjackService.calculateHandValue(this.gameState.playerHand!);

            if (this.gameState.playerValue! > 21) {
                await this.completeRound('dealer');
            }

            this.broadcastGameState();
        } catch (error) {
            console.error('Error handling hit:', error);
            if (error instanceof Error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        }
    }

    private async handleStand(ws: WebSocket) {
        try {
            if (this.gameState.status !== 'playing') {
                throw new Error('Cannot stand when game is not in progress');
            }

            // Dealer draws until 17 or higher
            while (this.gameState.dealerValue! < 17) {
                const newCard = this.blackjackService.hit();
                this.gameState.dealerHand?.push(newCard);
                this.gameState.dealerValue = this.blackjackService.calculateHandValue(this.gameState.dealerHand!);
            }

            const winner = this.blackjackService.determineWinner(
                this.gameState.playerHand!,
                this.gameState.dealerHand!
            );

            await this.completeRound(winner);
        } catch (error) {
            console.error('Error handling stand:', error);
            if (error instanceof Error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        }
    }

    private async completeRound(winner: 'player' | 'dealer' | 'push') {
        this.gameState.status = 'complete';
        this.gameState.winner = winner;
        this.gameState.dealerValue = this.blackjackService.calculateHandValue(this.gameState.dealerHand!);
        this.broadcastGameState();

        // Reset for next round
        setTimeout(() => {
            this.gameState = {
                status: 'waiting',
                timeRemaining: 30
            };
            this.broadcastGameState();
        }, 5000);
    }

    private startGameLoop() {
        setInterval(() => {
            if (this.gameState.status === 'waiting') {
                this.gameState.timeRemaining = 30;
                this.broadcastGameState();
            }
        }, 1000);
    }

    private broadcastGameState() {
        const message = JSON.stringify({
            type: 'gameState',
            data: this.gameState
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
} 