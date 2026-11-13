import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingPage from '../pages/public/OnboardingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import HomePage from '../pages/client/HomePage';
import SearchPage from '../pages/client/SearchPage';
import ProfessionalProfilePage from '../pages/client/ProfessionalProfilePage';
import RequestPage from '../pages/client/RequestPage';
import ReviewPage from '../pages/client/ReviewPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';
import ClientRequestsPage from '../pages/client/ClientRequestsPage';
import NotificationsPage from '../pages/client/NotificationsPage';
import ProfessionalHomePage from '../pages/professional/ProfessionalHomePage';
import ProfessionalProfileEditPage from '../pages/professional/ProfessionalProfileEditPage';
import ProfessionalRequestsPage from '../pages/professional/ProfessionalRequestsPage';
import ProposalPage from '../pages/professional/ProposalPage';
import ProfessionalReviewPage from '../pages/professional/ProfessionalReviewPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ProtectedRoute from './ProtectedRoute';

const C = (el: any) => <ProtectedRoute allowedRoles={['cliente']}>{el}</ProtectedRoute>;
const P = (el: any) => <ProtectedRoute allowedRoles={['prestador']}>{el}</ProtectedRoute>;
const A = (el: any) => <ProtectedRoute allowedRoles={['admin']}>{el}</ProtectedRoute>;

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/home" element={C(<HomePage />)} />
        <Route path="/buscar" element={C(<SearchPage />)} />
        <Route path="/buscar/:categoria" element={C(<SearchPage />)} />
        <Route path="/profissional/:id" element={C(<ProfessionalProfilePage />)} />
        <Route path="/proposta/:profissionalId" element={C(<RequestPage />)} />
        <Route path="/avaliar/:proposalId" element={C(<ReviewPage />)} />
        <Route path="/solicitacoes" element={C(<ClientRequestsPage />)} />
        <Route path="/notificacoes" element={C(<NotificationsPage />)} />
        <Route path="/perfil" element={C(<ClientProfilePage />)} />
        <Route path="/prestador/home" element={P(<ProfessionalHomePage />)} />
        <Route path="/prestador/solicitacoes" element={P(<ProfessionalRequestsPage />)} />
        <Route path="/prestador/perfil" element={P(<ProfessionalProfilePage />)} />
        <Route path="/prestador/perfil/editar" element={P(<ProfessionalProfileEditPage />)} />
        <Route path="/prestador/proposta/:proposalId" element={P(<ProposalPage />)} />
        <Route path="/prestador/avaliar/:proposalId" element={P(<ProfessionalReviewPage />)} />
        <Route path="/admin" element={A(<AdminDashboardPage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
