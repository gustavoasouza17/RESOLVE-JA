import { Link } from 'react-router-dom';
import Button from '../atoms/Button';

type NavbarVariant = 'public' | 'client' | 'professional';

type NavbarProps = {
  variant?: NavbarVariant;
  userName?: string;
  profileLink?: string;
  onLogout?: () => void;
};

const Navbar = ({
  variant = 'public',
  userName = 'Usuário',
  profileLink = '/perfil',
  onLogout,
}: NavbarProps) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-[var(--color-navy)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-[var(--color-primary)] text-lg font-bold text-[var(--color-navy)]">
            RJ
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">ResolvaJá</p>
            <p className="text-xs text-slate-500">Conecta serviços locais</p>
          </div>
        </Link>

        {variant === 'public' ? (
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:inline-flex"
            >
              Acesso Admin
            </Link>
            <Link to="/login">
              <Button variant="primary">Entrar / Cadastrar</Button>
            </Link>
          </div>
        ) : variant === 'client' ? (
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-[var(--color-bg-light)] px-4 py-2 text-sm text-slate-700">Olá, {userName}</div>
            <Link to={profileLink} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              Meu perfil
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[#fce967]"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-[var(--color-bg-light)] px-4 py-2 text-sm text-slate-700">Olá, {userName}</div>
            <Link to={profileLink} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              Meu perfil
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[#fce967]"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
