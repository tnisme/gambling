import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getCurrentUser, logout, checkSession } from '../services/authService';

export interface User {
  id: string;
  username: string;
  email: string;
  status?: string;
  verificationStatus?: string;
  createdAt?: string;
  balance?: number;
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
    console.log('AuthProvider initializing...');
    const currentUser = getCurrentUser();
    console.log('Retrieved user from storage:', currentUser);
    
    if (currentUser) {
      console.log('Setting authenticated user:', currentUser.username);
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      console.log('No user found in storage');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const checkSessionInterval = setInterval(async () => {
        const isValid = await checkSession();
        if (!isValid) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }, 60000);

      return () => clearInterval(checkSessionInterval);
    }
  }, [isAuthenticated]);

  const handleSetUser = (user: User) => {
    console.log('Setting new user:', user.username);
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('Logging out user');
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