import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaStar, FaFire, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { GiPokerHand } from 'react-icons/gi';
import Header from '../components/Header';
import { useGames } from '../contexts/GamesContext';

// Only keep 'All' as the base category
const baseCategories = [
  { id: 'all', name: 'All Games', icon: GiPokerHand }
];

const GamesPage = () => {
  const navigate = useNavigate();
  const { games, loading, error } = useGames();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique game types from the database
  const gameTypes = useMemo(() => {
    const types = new Set(games.map(game => game.type));
    return Array.from(types);
  }, [games]);

  // Combine base categories with dynamic categories from the database
  const categories = useMemo(() => {
    const dynamicCategories = gameTypes.map(type => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      icon: GiPokerHand // Default icon for all categories
    }));

    return [...baseCategories, ...dynamicCategories];
  }, [gameTypes]);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = games.filter(game => {
      const matchesCategory = selectedCategory === 'all' || game.type === selectedCategory;
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort games
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'type') {
        return sortDirection === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });

    return result;
  }, [games, selectedCategory, searchQuery, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleGameClick = (gameId: number) => {
    navigate(`/game/${gameId}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingMessage>Loading games...</LoadingMessage>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <ErrorMessage>{error}</ErrorMessage>
      </>
    );
  }

  return (
    <>
      <Header />
      <PageContainer>
        <BackgroundOverlay />
        <ContentWrapper>
          <SearchSection>
            <SearchBar>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
            <SortButtons>
              <SortButton onClick={() => handleSort('name')}>
                Name {getSortIcon('name')}
              </SortButton>
              <SortButton onClick={() => handleSort('type')}>
                Type {getSortIcon('type')}
              </SortButton>
            </SortButtons>
          </SearchSection>

          <CategoriesSection>
            {categories.map(category => (
              <CategoryTab
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon />
                {category.name}
              </CategoryTab>
            ))}
          </CategoriesSection>

          <GamesGrid>
            {filteredGames.map(game => (
              <GameCard key={game.id}>
                <GameImage src={game.image} alt={game.name} />
                <GameOverlay>
                  <PlayButton onClick={() => handleGameClick(game.id)}>Play Now</PlayButton>
                </GameOverlay>
                <GameInfo>
                  <GameName>{game.name}</GameName>
                  <GameType>{game.type}</GameType>
                </GameInfo>
              </GameCard>
            ))}
          </GamesGrid>
        </ContentWrapper>
      </PageContainer>
    </>
  );
};

export default GamesPage;

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  padding: 2rem;
  position: relative;
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(139, 0, 0, 0.85) 100%
  );
  z-index: -1;
`;

const ContentWrapper = styled.div`
  max-width: 1440px;
  margin: 0 auto;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchBar = styled.div`
  flex: 1;
  position: relative;
  max-width: 600px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.secondary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 30px;
  color: ${props => props.theme.colors.white};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SortButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 30px;
  color: ${props => props.theme.colors.white};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    font-size: 0.9rem;
  }
`;

const CategoriesSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.secondary};
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: ${props => props.active ? props.theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 25px;
  color: ${props => props.theme.colors.white};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    font-size: 1.2rem;
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
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
  transition: transform 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);

    ${GameOverlay} {
      opacity: 1;
    }
  }
`;

const GameImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const PlayButton = styled.button`
  padding: 0.8rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: scale(1.05);
  }
`;

const GameInfo = styled.div`
  padding: 1rem;
`;

const GameName = styled.h3`
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const GameType = styled.p`
  color: ${props => props.theme.colors.secondary};
  font-size: 0.9rem;
  text-transform: capitalize;
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
