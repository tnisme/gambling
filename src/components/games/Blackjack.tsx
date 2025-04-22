import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BlackjackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
`;

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Card = styled.div<{ isHidden?: boolean }>`
  width: 100px;
  height: 140px;
  background: ${({ isHidden }) => isHidden ? '#2d2d2d' : '#ffffff'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${({ isHidden }) => isHidden ? '#2d2d2d' : '#000000'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const BetInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100px;
`;

const Blackjack: React.FC = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();

  const ws = useWebSocket('ws://localhost:3003');

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'gameState') {
          setGameState(data.data);
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.message);
          // You could show an error toast notification here
        }
      };
    }
  }, [ws]);

  const placeBet = useCallback(() => {
    if (!ws) return;

    ws.send(JSON.stringify({
      type: 'placeBet',
      data: {
        userId: user?.id || 1,
        gameId: parseInt(gameId || '8'),
        amount: betAmount
      }
    }));
  }, [betAmount, ws, user, gameId]);

  const hit = useCallback(() => {
    if (!ws) return;

    ws.send(JSON.stringify({
      type: 'hit'
    }));
  }, [ws]);

  const stand = useCallback(() => {
    if (!ws) return;

    ws.send(JSON.stringify({
      type: 'stand'
    }));
  }, [ws]);

  const renderCard = (card: any, index: number, isDealer: boolean = false) => {
    if (isDealer && index === 1 && gameState.status === 'playing') {
      return <Card key={index} isHidden />;
    }
    return (
      <Card key={index}>
        {card.value} {card.suit}
      </Card>
    );
  };

  return (
    <BlackjackContainer>
      <h2>Blackjack</h2>
      
      <GameBoard>
        <HandContainer>
          <h3>Dealer's Hand</h3>
          <CardsContainer>
            {gameState?.dealerHand?.map((card: any, index: number) => 
              renderCard(card, index, true)
            )}
          </CardsContainer>
          {gameState?.dealerValue && (
            <p>Value: {gameState.status === 'playing' ? '?' : gameState.dealerValue}</p>
          )}
        </HandContainer>

        <HandContainer>
          <h3>Your Hand</h3>
          <CardsContainer>
            {gameState?.playerHand?.map((card: any, index: number) => 
              renderCard(card, index)
            )}
          </CardsContainer>
          {gameState?.playerValue && (
            <p>Value: {gameState.playerValue}</p>
          )}
        </HandContainer>

        {gameState?.status === 'waiting' && (
          <div>
            <BetInput
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
            />
            <Button onClick={placeBet}>Place Bet</Button>
          </div>
        )}

        {gameState?.status === 'playing' && (
          <Controls>
            <Button onClick={hit}>Hit</Button>
            <Button onClick={stand}>Stand</Button>
          </Controls>
        )}

        {gameState?.status === 'complete' && (
          <div>
            <h3>Result: {gameState.winner === 'player' ? 'You Win!' : 
                         gameState.winner === 'dealer' ? 'Dealer Wins!' : 'Push!'}</h3>
          </div>
        )}
      </GameBoard>
    </BlackjackContainer>
  );
};

export default Blackjack; 