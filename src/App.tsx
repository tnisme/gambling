import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { GamesProvider } from './contexts/GamesContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AccountPage from './pages/AccountPage';
import GamesPage from './pages/GamesPage';
import GamePlayPage from './pages/GamePlayPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <GamesProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/game/:gameId" element={<GamePlayPage />} />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </GamesProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
