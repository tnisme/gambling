import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaUser, FaLock } from 'react-icons/fa';
import { login } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        username: formData.username,
        password: formData.password
      });

      // Update auth context with user data
      setUser(response.user);

      // Save remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', formData.username);
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <BackgroundOverlay />
      <ContentWrapper>
        <LoginContainer>
          <LogoSection>
            <FaCrown size={50} color="#FFD700" />
            <BrandName>Vegas Royal</BrandName>
          </LogoSection>

          <LoginForm onSubmit={handleSubmit}>
            <SubText>Please login to your account</SubText>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                disabled={loading}
                required
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
                disabled={loading}
                required
              />
            </InputGroup>

            <FormOptions>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  disabled={loading}
                />
                <CheckboxLabel htmlFor="rememberMe">Remember me</CheckboxLabel>
              </CheckboxGroup>
              <ForgotPassword onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </ForgotPassword>
            </FormOptions>

            <LoginButton type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </LoginButton>

            <SignUpPrompt>
              Don't have an account? <SignUpLink onClick={() => navigate('/signup')}>Sign Up</SignUpLink>
            </SignUpPrompt>
          </LoginForm>
        </LoginContainer>
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

const LoginContainer = styled.div`
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

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  accent-color: ${props => props.theme.colors.secondary};
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: ${props => props.theme.colors.white};
  font-size: 0.9rem;
  cursor: pointer;
`;

const ForgotPassword = styled.span`
  color: ${props => props.theme.colors.secondary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const LoginButton = styled.button`
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

const SignUpPrompt = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.white};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SignUpLink = styled.a`
  color: ${props => props.theme.colors.secondary};
  text-decoration: none;
  font-weight: 600;
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

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

export default LoginPage;