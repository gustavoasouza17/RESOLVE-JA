import { useNavigate } from 'react-router-dom';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/auth';

const HOME_BY_ROLE: Record<string, string> = {
  cliente: '/home',
  prestador: '/prestador/home',
  admin: '/admin',
};

const AdminUnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const homePath = (role && HOME_BY_ROLE[role]) || '/';

  const handleSwitchAccount = async () => {
    try {
      await logout();
    } catch {
      // ignora erro de signOut caso seja sessão local
    }
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)] px-4 py-12 text-[var(--color-navy)]">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-8 text-center shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="mt-5 flex justify-center">
          <Badge variant="danger" label="Acesso restrito · 403" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-navy)] sm:text-3xl">
          Acesso não autorizado
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Credenciais inválidas ou permissão insuficiente para acessar o painel administrativo do{' '}
          <strong className="text-[var(--color-navy)]">Resolve-Já</strong>.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-[var(--color-bg-light)] p-4 text-left text-xs text-slate-600">
          <p className="font-semibold uppercase tracking-wider text-slate-500">Diagnóstico de acesso</p>
          {user ? (
            <p className="mt-1.5">
              Sessão atual identificada como{' '}
              <strong className="text-[var(--color-navy)]">{user.email ?? 'usuário autenticado'}</strong>{' '}
              (perfil: <strong className="text-[var(--color-navy)]">{role ?? 'não definido'}</strong>). Esta área
              exige perfil <strong className="text-rose-700">admin</strong>.
            </p>
          ) : (
            <p className="mt-1.5">
              Nenhuma credencial de administrador foi informada ou a sessão expirou. Faça login com uma conta
              administrativa válida para continuar.
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {user ? (
            <>
              <Button variant="primary" fullWidth onClick={handleSwitchAccount}>
                Trocar de conta
              </Button>
              <Button variant="secondary" fullWidth onClick={() => navigate(homePath)}>
                Voltar para minha área
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
                Ir para o login
              </Button>
              <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
                Voltar ao início
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUnauthorizedPage;

