import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HOME_BY_ROLE: Record<string, string> = {
  cliente: '/home',
  prestador: '/prestador/home',
  admin: '/admin',
};

type ProtectedRouteProps = {
  allowedRoles?: string[];
  unauthorizedFallback?: ReactNode;
  children: ReactNode;
};

const ProtectedRoute = ({ allowedRoles, unauthorizedFallback, children }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    if (unauthorizedFallback) {
      return <>{unauthorizedFallback}</>;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    if (unauthorizedFallback) {
      return <>{unauthorizedFallback}</>;
    }
    const home = HOME_BY_ROLE[role ?? ''] ?? '/';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
