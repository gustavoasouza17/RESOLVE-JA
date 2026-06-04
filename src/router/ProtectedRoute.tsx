import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  isAuthenticated: boolean;
  redirectTo?: string;
  children: ReactNode;
};

const ProtectedRoute = ({
  isAuthenticated,
  redirectTo = '/login',
  children,
}: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
