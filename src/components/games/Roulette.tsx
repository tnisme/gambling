import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWebSocket } from '../../hooks/useWebSocket';
interface BetOption {
  type: 'number' | 'color' | 'range';
  value: string | number;
  odds: number;
}

const RouletteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const BettingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 4px;
  margin: 2rem 0;
  width: 100%;
  max-width: 800px;
`;

const BetCell = styled.button<{ color?: string }>`
  padding: 1rem;
  background: ${({ color }) => color || '#333'};
    color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: scale(1.05);
  }
`;

const Roulette: React.FC = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);

  const ws = useWebSocket('ws://localhost:8080');

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'gameState') {
          setGameState(data.data);
        }
      };
    }
  }, [ws]);

  const placeBet = useCallback(() => {
    if (!selectedBet || !ws) return;

    ws.send(JSON.stringify({
      type: 'placeBet',
      data: {
        type: selectedBet.type,
        value: selectedBet.value,
        amount: betAmount
      }
    }));
  }, [selectedBet, betAmount, ws]);

  const renderBettingGrid = () => {
    const numbers = Array.from({ length: 37 }, (_, i) => i);
    
    return (
      <BettingGrid>
        {numbers.map(number => (
          <BetCell
            key={number}
            color={number === 0 ? 'green' : number % 2 === 0 ? 'red' : 'black'}
            onClick={() => setSelectedBet({
              type: 'number',
              value: number,
              odds: number === 0 ? 35 : 35
            })}
          >
            {number}
          </BetCell>
        ))}
      </BettingGrid>
    );
  };

  return (
    <RouletteContainer>
      <h2>Roulette</h2>
      
      {gameState && (
        <div>
          <p>Status: {gameState.status}</p>
          {gameState.timeRemaining && (
            <p>Time Remaining: {gameState.timeRemaining}s</p>
          )}
          {gameState.lastNumber !== undefined && (
            <p>Last Number: {gameState.lastNumber}</p>
          )}
        </div>
      )}

      {renderBettingGrid()}

      <div>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          min={1}
        />
        <button onClick={placeBet} disabled={!selectedBet || gameState?.status !== 'waiting'}>
          Place Bet
        </button>
      </div>
    </RouletteContainer>
  );
};

export default Roulette; 