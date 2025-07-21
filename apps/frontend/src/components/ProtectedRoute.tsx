import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/transactions" replace />;
  }

  return <>{children}</>;
}
