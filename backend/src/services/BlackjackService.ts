import { GameService } from './GameService.js';
import { Game, GameType } from '../entities/Game.js';

interface GameConfig {
    minBet: number;
    maxBet: number;
    [key: string]: any;
}

interface Card {
    suit: string;
    value: string;
}

export class BlackjackService {
    private gameService: GameService;
    private deck: Card[];

    constructor() {
        this.gameService = new GameService();
        this.deck = this.initializeDeck();
    }

    private initializeDeck(): Card[] {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }

        return this.shuffleDeck(deck);
    }

    private shuffleDeck(deck: Card[]): Card[] {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    async getGame(): Promise<Game> {
        const game = await this.gameService.getBlackjackGame();
        if (!game) {
            throw new Error('Blackjack game not found');
        }
        return game;
    }

    calculateHandValue(hand: Card[]): number {
        let value = 0;
        let aces = 0;

        for (const card of hand) {
            if (card.value === 'A') {
                aces += 1;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }

        // Handle aces
        for (let i = 0; i < aces; i++) {
            if (value + 11 <= 21) {
                value += 11;
            } else {
                value += 1;
            }
        }

        return value;
    }

    dealInitialCards(): { playerHand: Card[]; dealerHand: Card[] } {
        if (this.deck.length < 4) {
            this.deck = this.initializeDeck();
        }

        const playerHand = [this.deck.pop()!, this.deck.pop()!];
        const dealerHand = [this.deck.pop()!, this.deck.pop()!];

        return { playerHand, dealerHand };
    }

    hit(): Card {
        if (this.deck.length === 0) {
            this.deck = this.initializeDeck();
        }
        return this.deck.pop()!;
    }

    isValidBet(betAmount: number, game: Game): boolean {
        if (!game.config) return false;
        
        const config = game.config as GameConfig;
        return betAmount >= config.minBet && betAmount <= config.maxBet;
    }

    determineWinner(playerHand: Card[], dealerHand: Card[]): 'player' | 'dealer' | 'push' {
        const playerValue = this.calculateHandValue(playerHand);
        const dealerValue = this.calculateHandValue(dealerHand);

        if (playerValue > 21) return 'dealer';
        if (dealerValue > 21) return 'player';
        if (playerValue > dealerValue) return 'player';
        if (dealerValue > playerValue) return 'dealer';
        return 'push';
    }
} 