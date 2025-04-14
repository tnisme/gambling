import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import { gameService, Game } from '../services/gameService';
import Roulette from '../components/games/Roulette';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const GameContent = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const GameTitle = styled.h1`
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
`;

const BackButton = styled.button`
  background-color: #2d2d2d;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3d3d3d;
  }
`;

const GameFrame = styled.div`
  width: 100%;
  height: 600px;
  background-color: #2d2d2d;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  color: #ffffff;
`;

const GamePlayPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        if (!gameId) return;
        const gameData = await gameService.getGameById(parseInt(gameId));
        setGame(gameData);
      } catch (err) {
        setError('Failed to load game');
        console.error('Error fetching game:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  if (loading) {
    return (
      <>
        <Header />
        <GameContainer>
          <GameContent>
            <LoadingText>Loading game...</LoadingText>
          </GameContent>
        </GameContainer>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <Header />
        <GameContainer>
          <GameContent>
            <LoadingText>{error || 'Game not found'}</LoadingText>
          </GameContent>
        </GameContainer>
      </>
    );
  }

  return (
    <>
      <Header />
      <GameContainer>
        <GameContent>
          <GameHeader>
            <GameTitle>{game.name}</GameTitle>
            <BackButton onClick={() => navigate('/games')}>Back to Games</BackButton>
          </GameHeader>
          <GameFrame>
            {game.type === 'roulette' ? (
              <Roulette />
            ) : (
              <LoadingText>Game type not supported: {game.type}</LoadingText>
            )}
          </GameFrame>
        </GameContent>
      </GameContainer>
    </>
  );
};

export default GamePlayPage; 