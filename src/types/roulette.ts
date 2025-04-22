export type WheelNumbers = number[];

export interface BetOption {
  type: 'straight' | 'split' | 'corner' | 'street' | 'sixline' | 'dozen' | 'column' | 'even' | 'odd' | 'red' | 'black' | '1-18' | '19-36';
  numbers: number[];
  payout: number;
}

export interface GameState {
  status: 'waiting' | 'spinning' | 'result';
  timeRemaining: number;
  lastNumber: number | null;
}
