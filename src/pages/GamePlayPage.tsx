import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { MdArrowBack } from "react-icons/md";
import Header from "../components/Header";
import { gameService, Game } from "../services/gameService";
import Roulette from "../components/games/Roulette";
import Blackjack from "../components/games/Blackjack";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const GameContent = styled.div`
  flex: 1;
  width: 100%;
  height: calc(100vh - 60px); // Adjust for header height
  position: relative;
  overflow: hidden;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(45, 45, 45, 0.8);
  color: #ffffff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 100;
  padding: 0;

  &:hover {
    background-color: rgba(61, 61, 61, 0.9);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

const GameFrame = styled.div`
  width: 100%;
  height: 100%;
  background-color: #2d2d2d;
  display: flex;
  align-items: flex-start; // Changed from center to allow scrolling
  justify-content: center;
  position: relative;
  overflow: hidden;
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
        setError("Failed to load game");
        console.error("Error fetching game:", err);
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
            <LoadingText>{error || "Game not found"}</LoadingText>
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
          <BackButton
            onClick={() => navigate("/games")}
            aria-label="Back to games"
          >
            <MdArrowBack size={24} />
          </BackButton>
          <GameFrame>
            {game.type === "roulette" ? (
              <Roulette />
            ) : game.type === "blackjack" ? (
              <Blackjack />
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
