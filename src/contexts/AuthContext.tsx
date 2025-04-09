import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getCurrentUser, logout } from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  status?: string;
  verificationStatus?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Try to get user data from localStorage on initial load
    const userData = getCurrentUser();
    if (userData?.user) {
      setUser(userData.user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleSetUser = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        logout: handleLogout,
        setUser: handleSetUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 