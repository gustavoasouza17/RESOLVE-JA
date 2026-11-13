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
  children: ReactNode;
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    const home = HOME_BY_ROLE[role ?? ''] ?? '/';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
