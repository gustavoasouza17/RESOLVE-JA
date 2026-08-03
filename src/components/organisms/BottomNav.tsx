import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

type BottomNavVariant = 'client' | 'professional';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  isCenter?: boolean;
  comingSoon?: boolean;
  matchPaths?: string[];
};

// ── SVG Icons ──────────────────────────────────────────────────────────────
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
    <path d="M9 21V12h6v9" stroke={active ? '#1A2B4C' : 'currentColor'} strokeWidth={active ? 2 : 1.8} />
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="3" fill={active ? 'currentColor' : 'none'} />
    <line x1="8" y1="9" x2="16" y2="9" stroke={active ? '#1A2B4C' : 'currentColor'} strokeWidth={1.8} />
    <line x1="8" y1="13" x2="13" y2="13" stroke={active ? '#1A2B4C' : 'currentColor'} strokeWidth={1.8} />
    <line x1="8" y1="17" x2="11" y2="17" stroke={active ? '#1A2B4C' : 'currentColor'} strokeWidth={1.8} />
  </svg>
);

const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14l4 4V4a2 2 0 0 0-2-2z" fill={active ? 'currentColor' : 'none'} />
    <line x1="8" y1="9" x2="16" y2="9" stroke={active ? '#1A2B4C' : 'currentColor'} strokeWidth={1.8} />
    <line x1="8" y1="13" x2="13" y2="13" stroke={active ? '#1A2B4C' : 'currentColor'} strokeWidth={1.8} />
  </svg>
);

const PersonIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

// ── Nav items ──────────────────────────────────────────────────────────────
const clientItems: NavItem[] = [
  {
    label: 'Início',
    icon: (active: boolean) => <HomeIcon active={active} />,
    path: '/home',
    matchPaths: ['/home'],
  },
  {
    label: 'Solicitações',
    icon: (active: boolean) => <ListIcon active={active} />,
    path: '/solicitacoes',
    matchPaths: ['/solicitacoes'],
  },
  {
    label: 'Novo',
    icon: () => <PlusIcon />,
    path: '/proposta/prof001',
    isCenter: true,
    matchPaths: ['/proposta'],
  },
  {
    label: 'Mensagens',
    icon: (active: boolean) => <ChatIcon active={active} />,
    path: '/mensagens',
    comingSoon: true,
    matchPaths: ['/mensagens'],
  },
  {
    label: 'Perfil',
    icon: (active: boolean) => <PersonIcon active={active} />,
    path: '/perfil',
    matchPaths: [],
  },
];

const professionalItems: NavItem[] = [
  {
    label: 'Início',
    icon: (active: boolean) => <HomeIcon active={active} />,
    path: '/prestador/home',
    matchPaths: ['/prestador/home'],
  },
  {
    label: 'Solicitações',
    icon: (active: boolean) => <ListIcon active={active} />,
    path: '/prestador/home',
    matchPaths: [],
  },
  {
    label: 'Novo',
    icon: () => <PlusIcon />,
    path: '/prestador/perfil/editar',
    isCenter: true,
    matchPaths: ['/prestador/perfil/editar'],
  },
  {
    label: 'Mensagens',
    icon: (active: boolean) => <ChatIcon active={active} />,
    path: '/mensagens',
    comingSoon: true,
    matchPaths: ['/mensagens'],
  },
  {
    label: 'Perfil',
    icon: (active: boolean) => <PersonIcon active={active} />,
    path: '/prestador/perfil',
    matchPaths: ['/prestador/perfil'],
  },
];

// ── Component ──────────────────────────────────────────────────────────────
const BottomNav = ({
  variant = 'client',
  onCenterAction,
}: {
  variant?: BottomNavVariant;
  onCenterAction?: () => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [pressed, setPressed] = useState<string | null>(null);

  const items = variant === 'client' ? clientItems : professionalItems;

  const isActive = (item: NavItem): boolean => {
    if (item.matchPaths && item.matchPaths.length > 0) {
      return item.matchPaths.some((p) => location.pathname.startsWith(p));
    }
    return location.pathname === item.path;
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const handleClick = (item: NavItem) => {
    if (item.comingSoon) {
      showToast('Em breve! 🚀');
      return;
    }
    if (item.isCenter && onCenterAction) {
      onCenterAction();
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 96,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(26,43,76,0.96)',
          color: '#fff',
          padding: '9px 20px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          whiteSpace: 'nowrap',
          animation: 'bnFadeUp 0.22s cubic-bezier(.32,1,.23,1)',
          letterSpacing: '0.01em',
        }}>
          {toast}
        </div>
      )}

      {/* Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // subtle gradient so it feels grounded
        background: 'linear-gradient(180deg, rgba(15,25,50,0.94) 0%, rgba(20,32,62,0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        // top border glow
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -2px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 6px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '6px 4px 8px',
          maxWidth: 520,
          margin: '0 auto',
          position: 'relative',
        }}>
          {items.map((item) => {
            const active = isActive(item);
            const isPress = pressed === item.label;
            const iconNode = typeof item.icon === 'function'
              ? (item.icon as (a: boolean) => React.ReactNode)(active)
              : item.icon;

            // ── Center floating button ──────────────────────────────────
            if (item.isCenter) {
              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  onPointerDown={() => setPressed(item.label)}
                  onPointerUp={() => setPressed(null)}
                  onPointerLeave={() => setPressed(null)}
                  aria-label={item.label}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 12px',
                    marginTop: -22, // float above bar
                    transition: 'transform 0.15s cubic-bezier(.32,1,.23,1)',
                    transform: isPress ? 'scale(0.92) translateY(2px)' : 'scale(1) translateY(0)',
                  }}
                >
                  {/* Circle */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: isPress
                      ? 'linear-gradient(135deg, #e6c200 0%, #FFD900 100%)'
                      : 'linear-gradient(135deg, #FFE033 0%, #FFD900 60%, #F5C800 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1A2B4C',
                    boxShadow: isPress
                      ? '0 2px 10px rgba(255,217,0,0.4)'
                      : '0 6px 24px rgba(255,217,0,0.55), 0 2px 8px rgba(255,200,0,0.3)',
                    // ring
                    border: '3px solid rgba(20,32,60,0.85)',
                    transition: 'box-shadow 0.15s ease, background 0.12s ease',
                  }}>
                    {iconNode}
                  </div>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#FFD900',
                    lineHeight: 1,
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            }

            // ── Regular tab ────────────────────────────────────────────
            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                onPointerDown={() => setPressed(item.label)}
                onPointerUp={() => setPressed(null)}
                onPointerLeave={() => setPressed(null)}
                aria-label={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 10px 4px',
                  borderRadius: 18,
                  minWidth: 58,
                  transition: 'transform 0.14s cubic-bezier(.32,1,.23,1)',
                  transform: isPress ? 'scale(0.88)' : 'scale(1)',
                  outline: 'none',
                }}
              >
                {/* Icon container */}
                <div style={{
                  position: 'relative',
                  width: 42,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  // active pill bg
                  background: active
                    ? 'rgba(255,217,0,0.15)'
                    : 'transparent',
                  transition: 'background 0.2s ease',
                }}>
                  {/* Active indicator dot */}
                  {active && (
                    <span style={{
                      position: 'absolute',
                      top: -2,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#FFD900',
                      boxShadow: '0 0 6px rgba(255,217,0,0.8)',
                    }} />
                  )}
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? '#FFD900' : 'rgba(255,255,255,0.45)',
                    transition: 'color 0.18s ease, transform 0.18s ease',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    {iconNode}
                  </span>
                </div>

                {/* Label */}
                <span style={{
                  fontSize: 9.5,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: active ? '#FFD900' : 'rgba(255,255,255,0.38)',
                  lineHeight: 1,
                  transition: 'color 0.18s ease, font-weight 0.18s ease',
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes bnFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default BottomNav;
