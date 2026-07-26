import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

type NavbarVariant = 'public' | 'client' | 'professional';

type NavbarProps = {
  variant?: NavbarVariant;
  userName?: string;
  profileLink?: string;
  onLogout?: () => void;
};

const getFirstName = (fullName: string): string => {
  if (!fullName) return 'Usuário';
  return fullName.split(' ')[0];
};

const getUserFromStorage = () => {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return { fullName: 'Usuário', firstName: 'Usuário', profile: null };
    const parsed = JSON.parse(raw);
    const fullName = parsed.fullName || 'Usuário';
    return { fullName, firstName: getFirstName(fullName), profile: parsed.profile || null };
  } catch {
    return { fullName: 'Usuário', firstName: 'Usuário', profile: null };
  }
};

const Navbar = ({
  variant = 'public',
  userName,
  profileLink = '/perfil',
  onLogout,
}: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const stored = getUserFromStorage();
  const displayName = userName || stored.firstName;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-[var(--color-navy)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white overflow-hidden border border-slate-100">
            <img src="/logo.jpg" alt="ResolveJá Logo" className="h-full w-full object-cover" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">ResolvaJá</p>
            <p className="text-xs text-slate-500">Conecta serviços locais</p>
          </div>
        </Link>

        {variant === 'public' ? (
          <div className="flex items-center gap-3" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[#fce967]"
              >
                Entrar / Cadastrar
                <svg
                  className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    to="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-base">🔑</span>
                    Entrar / Cadastrar
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-base">🛡️</span>
                    Acesso Admin
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : variant === 'client' ? (
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-[var(--color-bg-light)] px-4 py-2 text-sm text-slate-700">Olá, {displayName}</div>
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
            <div className="rounded-3xl bg-[var(--color-bg-light)] px-4 py-2 text-sm text-slate-700">Olá, {displayName}</div>
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
