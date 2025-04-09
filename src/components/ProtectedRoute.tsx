import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('ProtectedRoute auth check:', { user, isAuthenticated });

  if (!user || !isAuthenticated) {
    console.log('Redirecting to login - User:', !!user, 'Authenticated:', isAuthenticated);
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;