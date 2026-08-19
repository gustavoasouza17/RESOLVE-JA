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

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/buscar/:categoria" element={<SearchPage />} />
        <Route path="/profissional/:id" element={<ProfessionalProfilePage />} />
        <Route path="/proposta/:profissionalId" element={<RequestPage />} />
        <Route path="/avaliar/:proposalId" element={<ReviewPage />} />
        <Route path="/solicitacoes" element={<ClientRequestsPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/perfil" element={<ClientProfilePage />} />
        <Route path="/prestador/home" element={<ProfessionalHomePage />} />
        <Route path="/prestador/solicitacoes" element={<ProfessionalRequestsPage />} />
        <Route path="/prestador/perfil" element={<ProfessionalProfilePage />} />
        <Route path="/prestador/perfil/editar" element={<ProfessionalProfileEditPage />} />
        <Route path="/prestador/proposta/:proposalId" element={<ProposalPage />} />
        <Route path="/prestador/avaliar/:proposalId" element={<ProfessionalReviewPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
