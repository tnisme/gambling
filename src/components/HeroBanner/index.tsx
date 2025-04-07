import styled, { keyframes } from 'styled-components';
import { FaCoins, FaDice } from 'react-icons/fa';
import { GiPokerHand, GiCardRandom } from 'react-icons/gi';

const HeroBanner = () => {
  return (
    <BannerContainer>
      <BannerOverlay />
      
      <FloatingElement1><GiCardRandom size={60} color="#FFD700" /></FloatingElement1>
      <FloatingElement2><FaCoins size={50} color="#FFD700" /></FloatingElement2>
      <FloatingElement3><GiPokerHand size={70} color="#FFD700" /></FloatingElement3>
      <FloatingElement4><FaDice size={45} color="#FFD700" /></FloatingElement4>
      <BannerContent>
        <WelcomeText>
          GET 150% BONUS UP TO $500
          <BonusSpins>+ 100 FREE SPINS!</BonusSpins>
        </WelcomeText>
        <PlayNowButton>PLAY NOW!</PlayNowButton>
      </BannerContent>

      <LeftImage src="/casino-chips.png" alt="Casino Chips" />
      <RightImage src="/slot-machine.png" alt="Slot Machine" />
      
      <SpotLight1 />
      <SpotLight2 />
    </BannerContainer>
  );
};

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const shine = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
`;

const BannerContainer = styled.section`
  height: calc(100vh - 80px);
  max-height: 800px;
  min-height: 600px;
  width: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url('/banner-bg.jpg') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.7),
    rgba(139, 0, 0, 0.3)
  );
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 3rem;
  max-width: 900px;
  width: 90%;
`;

const WelcomeText = styled.h2`
  font-size: 4.5rem;
  line-height: 1.2;
  color: ${props => props.theme.colors.white};
  margin-bottom: 3rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  font-weight: 800;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const BonusSpins = styled.div`
  color: ${props => props.theme.colors.secondary};
  font-size: 4rem;
  margin-top: 1.5rem;
  font-weight: 800;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 3px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const PlayNowButton = styled.button`
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.background};
  padding: 1.5rem 4rem;
  font-size: 2rem;
  font-weight: 800;
  border-radius: 50px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 
      0 0 40px rgba(255, 215, 0, 0.6),
      0 6px 12px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem 3rem;
    font-size: 1.5rem;
  }
`;

const FloatingElement = styled.div`
  position: absolute;
  z-index: 2;
  animation: ${float} 3s ease-in-out infinite;
  opacity: 0.8;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
`;

const FloatingElement1 = styled(FloatingElement)`
  top: 20%;
  left: 15%;
  animation-delay: 0s;
`;

const FloatingElement2 = styled(FloatingElement)`
  top: 30%;
  right: 20%;
  animation-delay: 1s;
`;

const FloatingElement3 = styled(FloatingElement)`
  bottom: 25%;
  left: 20%;
  animation-delay: 1.5s;
`;

const FloatingElement4 = styled(FloatingElement)`
  bottom: 35%;
  right: 15%;
  animation-delay: 0.5s;
`;

const CasinoImage = styled.img`
  position: absolute;
  z-index: 1;
  height: 80%;
  max-height: 600px;
  opacity: 0.8;
  pointer-events: none;
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5));
`;

const LeftImage = styled(CasinoImage)`
  left: -5%;
  bottom: -10%;
  transform: rotate(-15deg);
`;

const RightImage = styled(CasinoImage)`
  right: -5%;
  bottom: -10%;
  transform: rotate(15deg);
`;

const SpotLight = styled.div`
  position: absolute;
  width: 300px;
  height: 800px;
  background: linear-gradient(
    to bottom,
    rgba(255, 215, 0, 0),
    rgba(255, 215, 0, 0.1),
    rgba(255, 215, 0, 0)
  );
  animation: ${shine} 4s ease-in-out infinite;
  transform: rotate(45deg);
`;

const SpotLight1 = styled(SpotLight)`
  top: -200px;
  left: 20%;
  animation-delay: 0s;
`;

const SpotLight2 = styled(SpotLight)`
  top: -200px;
  right: 20%;
  animation-delay: 2s;
`;

export default HeroBanner;