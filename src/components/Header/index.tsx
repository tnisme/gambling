import styled from 'styled-components';
import { FaCrown } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <HeaderContent>
      <LogoSection>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCrown size={42} color="#FFD700" />
            <LogoText>Vegas Royal</LogoText>
          </Link>
      </LogoSection>
      
      <Navigation>
          <NavLink to="#">Games</NavLink>
          <NavLink to="#">Banking</NavLink>
          <NavLink to="#">Support</NavLink>
      </Navigation>
      
      <AuthSection>
          <LoginButton onClick={() => navigate('/login')}>Log In</LoginButton>
          <SignUpButton onClick={() => navigate('/signup')}>Sign Up</SignUpButton>
      </AuthSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  width: 100%;
  background: rgba(0, 0, 0, 0.9);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
`;

const LogoText = styled.h1`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.white};
  font-weight: 700;
  line-height: 1;
  margin: 0;
  white-space: nowrap;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 3rem;
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.colors.secondary};
  }
`;

const AuthSection = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
`;

const LoginButton = styled(Button)`
  background: transparent;
  border: 2px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const SignUpButton = styled(Button)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  
  &:hover {
    background: ${props => props.theme.colors.darkRed};
  }
`;

export default Header;