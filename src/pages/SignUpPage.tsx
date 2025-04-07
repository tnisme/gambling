import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up attempt:', formData);
  };

  return (
    <PageContainer>
      <BackgroundOverlay />
      <ContentWrapper>
        <SignUpContainer>
          <LogoSection>
            <FaCrown size={50} color="#FFD700" />
            <BrandName>Vegas Royal</BrandName>
          </LogoSection>

          <SignUpForm onSubmit={handleSubmit}>
            <SubText>Join Vegas Royal and start winning!</SubText>

            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </InputGroup>

            <TermsGroup>
              <Checkbox
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
              />
              <TermsLabel htmlFor="agreeToTerms">
                I agree to the <TermsLink href="#">Terms & Conditions</TermsLink>
              </TermsLabel>
            </TermsGroup>

            <SignUpButton type="submit">Create Account</SignUpButton>

            <LoginPrompt>
              Already have an account? <LoginLink onClick={() => navigate('/login')}>Log In</LoginLink>
            </LoginPrompt>
          </SignUpForm>
        </SignUpContainer>
        <BackButton onClick={() => navigate('/')}>Back to Home</BackButton>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('/images/casino-bg.jpg') center/cover fixed;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 20px;
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
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  z-index: 1;
`;

const SignUpContainer = styled.div`
  width: 100%;
  padding: 3rem;
  background: rgba(26, 26, 26, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(8px);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BrandName = styled.h1`
  color: ${props => props.theme.colors.white};
  font-size: 2.5rem;
  font-weight: 700;
`;

const SignUpForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const WelcomeText = styled.h2`
  color: ${props => props.theme.colors.white};
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const SubText = styled.p`
  color: ${props => props.theme.colors.white};
  opacity: 0.8;
  text-align: center;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.secondary};
  font-size: 1.2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 30px;
  color: ${props => props.theme.colors.white};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TermsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const Checkbox = styled.input`
  accent-color: ${props => props.theme.colors.secondary};
  cursor: pointer;
`;

const TermsLabel = styled.label`
  color: ${props => props.theme.colors.white};
  font-size: 0.9rem;
  cursor: pointer;
`;

const TermsLink = styled.a`
  color: ${props => props.theme.colors.secondary};
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SignUpButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const LoginPrompt = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.white};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const LoginLink = styled.span`
  color: ${props => props.theme.colors.secondary};
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const BackButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 2px solid ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.background};
  }
`;

export default SignUpPage;