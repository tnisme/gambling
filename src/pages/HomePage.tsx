import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import GameSection from '../components/GameSection';

const HomePage = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <HeroBanner />
        <GameSection />
      </main>
    </div>
  );
};

export default HomePage;