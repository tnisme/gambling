import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGames } from '../../contexts/GamesContext';

const GameSection = () => {
  const navigate = useNavigate();
  const { games, loading, error } = useGames();

  const handlePlayClick = (gameId: number) => {
    navigate(`/game/${gameId}`);
  };

  if (loading) {
    return <LoadingMessage>Loading games...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <SectionContainer>
      <BackgroundOverlay />
      <SectionContent>
        <SectionHeader>
          <SectionTitle>Popular Games</SectionTitle>
          <SectionSubtitle>Play the best casino games</SectionSubtitle>
        </SectionHeader>
        <GamesGrid>
          {games.map(game => (
            <GameCard key={game.id}>
              <GameImageContainer>
                <GameImage src={game.image} alt={game.name} />
                <GameOverlay>
                  <PlayButton onClick={() => handlePlayClick(game.id)}>Play Now</PlayButton>
                </GameOverlay>
              </GameImageContainer>
              <GameInfo>
                <GameName>{game.name}</GameName>
              </GameInfo>
            </GameCard>
          ))}
        </GamesGrid>
      </SectionContent>
    </SectionContainer>
  );
};

const SectionContainer = styled.section`
  position: relative;
  padding: 5rem 2rem;
  background: url('/images/casino-bg.jpg') center/cover fixed;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(26, 26, 26, 0.97) 0%,
    rgba(139, 0, 0, 0.90) 100%
  );
  z-index: 1;
`;

const SectionContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 3.5rem;
  color: ${props => props.theme.colors.white};
  margin-bottom: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:after {
    content: '';
    display: block;
    width: 100px;
    height: 4px;
    background: ${props => props.theme.colors.primary};
    margin: 1rem auto;
    border-radius: 2px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.secondary};
  margin-top: 1rem;
  font-weight: 500;
  opacity: 0.9;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const GameImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const GameCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    
    ${GameOverlay} {
      opacity: 1;
    }
  }
`;

const GameImageContainer = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
`;

const PlayButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: scale(1.05);
  }
`;

const GameInfo = styled.div`
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-top: 2px solid ${props => props.theme.colors.primary};
`;

const GameName = styled.h3`
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.primary};
  font-size: 1.2rem;
`;

export default GameSection;