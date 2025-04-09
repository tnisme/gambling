import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaEnvelope } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add password reset logic here
    setIsSubmitted(true);
  };

  return (
    <PageContainer>
      <BackgroundOverlay />
      <ContentWrapper>
        <ForgotPasswordContainer>
          <LogoSection>
            <FaCrown size={50} color="#FFD700" />
            <BrandName>Vegas Royal</BrandName>
          </LogoSection>

          {!isSubmitted ? (
            <ForgotPasswordForm onSubmit={handleSubmit}>
              <SubText>
                Enter your email address and we'll send you instructions to reset your password.
              </SubText>

              <InputGroup>
                <InputIcon>
                  <FaEnvelope />
                </InputIcon>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>

              <ResetButton type="submit">Send Reset Link</ResetButton>

              <BackToLoginPrompt>
                Remember your password? <LoginLink onClick={() => navigate('/login')}>Log In</LoginLink>
              </BackToLoginPrompt>
            </ForgotPasswordForm>
          ) : (
            <SuccessMessage>
              <WelcomeText>Check Your Email</WelcomeText>
              <SubText>
                We've sent password reset instructions to your email address. Please check your inbox.
              </SubText>
              <ResendButton onClick={() => setIsSubmitted(false)}>
                Didn't receive the email? Resend
              </ResendButton>
            </SuccessMessage>
          )}
        </ForgotPasswordContainer>
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

const ForgotPasswordContainer = styled.div`
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

const ForgotPasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SubText = styled.p`
  color: ${props => props.theme.colors.white};
  opacity: 0.8;
  text-align: center;
  margin-bottom: 1rem;
  line-height: 1.6;
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

const ResetButton = styled.button`
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
  margin-top: 1rem;

  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const BackToLoginPrompt = styled.p`
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

const SuccessMessage = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
`;

const ResendButton = styled.button`
  background: transparent;
  color: ${props => props.theme.colors.secondary};
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  padding: 0.5rem 1rem;
  margin-top: 1rem;

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

export default ForgotPasswordPage;