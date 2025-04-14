import { WebSocket, WebSocketServer } from 'ws';
import { GameService } from '../services/GameService.js';

interface RouletteGameState {
  status: 'waiting' | 'spinning' | 'complete';
  lastNumber?: number;
  lastColor?: string;
  timeRemaining?: number;
  winningBets?: any[];
}

export class RouletteServer {
  private wss: WebSocketServer;
  private gameState: RouletteGameState;
  private gameService: GameService;
  private clients: Set<WebSocket>;
  private readonly ROUND_TIME = 30000; // 30 seconds
  private readonly SPIN_TIME = 5000; // 5 seconds

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.gameService = new GameService();
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
      // Add other message handlers as needed
    }
  }

  private async handleBetPlacement(ws: WebSocket, betData: any) {
    try {
      // Validate bet and update database
      const bet = await this.gameService.placeBet(betData);
      ws.send(JSON.stringify({
        type: 'betConfirmed',
        data: bet
      }));
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

  private startGameLoop() {
    setInterval(() => {
      if (this.gameState.status === 'waiting') {
        this.startSpin();
      }
    }, this.ROUND_TIME);
  }

  private startSpin() {
    this.gameState.status = 'spinning';
    this.broadcastGameState();

    setTimeout(() => {
      this.completeRound();
    }, this.SPIN_TIME);
  }

  private completeRound() {
    const result = this.generateResult();
    this.gameState = {
      status: 'complete',
      lastNumber: result.number,
      lastColor: result.color,
      winningBets: []
    };

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

  private generateResult() {
    const number = Math.floor(Math.random() * 37); // 0-36
    const color = number === 0 ? 'green' : (number % 2 === 0 ? 'red' : 'black');
    return { number, color };
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