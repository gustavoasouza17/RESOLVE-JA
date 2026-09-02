import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import BottomNav from '../../components/organisms/BottomNav';
import { auth } from '../../firebase';
import {
  markNotificationAsRead,
  subscribeToNotificationsForUser,
  type Notification,
} from '../../services/notifications';

function getAuthUser() {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as { uid: string; fullName: string; email: string; profile: string };
  } catch {
    return null;
  }
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays === 1 ? '' : 's'}`;
  return date.toLocaleDateString('pt-BR');
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        const stored = getAuthUser();
        setUid(stored?.uid ?? null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;

    // Timeout de segurança: encerra loading se a busca não retornar em 8s
    const safetyTimeout = window.setTimeout(() => {
      setLoading((prev) => (prev ? false : prev));
    }, 3000);

    const unsubscribe = subscribeToNotificationsForUser(uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });

    return () => {
      window.clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, [uid]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.lida) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.warn('Erro ao marcar notificação como lida:', error);
      }
    }

    if (notification.tipo === 'nova_solicitacao') {
      const profile = getAuthUser()?.profile;
      if (profile === 'prestador') {
        navigate(`/prestador/proposta/${notification.referenciaId}`);
      } else {
        navigate(`/proposta/${notification.referenciaId}`);
      }
    } else if (notification.tipo === 'nova_avaliacao' || notification.tipo === 'proposta_recusada') {
      const profile = getAuthUser()?.profile;
      if (profile === 'prestador') {
        navigate('/prestador/solicitacoes');
      } else {
        navigate('/solicitacoes');
      }
    } else {
      navigate(-1);
    }
  };

  if (!uid) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
        <BottomNav variant="client" />
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-white p-8 text-center text-sm text-slate-600 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            Você precisa estar autenticado para ver as notificações.
          </div>
        </div>
      </div>
    );
  }

  const profile = getAuthUser()?.profile;
  const variant = profile === 'prestador' ? 'professional' : 'client';

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant={variant} />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acompanhe suas solicitações e avaliações.
        </p>

        <div className="mt-8 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white p-10 text-center shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
              <p className="text-sm text-slate-600">Carregando notificações…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[28px] bg-white p-10 text-center text-sm text-slate-600 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              Nenhuma notificação por enquanto.
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full rounded-[24px] p-5 text-left shadow-sm ring-1 transition hover:shadow-md ${
                  notification.lida
                    ? 'bg-white ring-slate-200'
                    : 'bg-[var(--color-primary)]/8 ring-[var(--color-primary)]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--color-navy)]">
                      {notification.titulo}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {notification.mensagem}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {relativeTime(notification.criadoEm)}
                    </p>
                  </div>
                  {!notification.lida && (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
