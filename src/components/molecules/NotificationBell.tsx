import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { subscribeToUnreadCount } from '../../services/notifications';

function getAuthUser() {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as { uid: string };
  } catch {
    return null;
  }
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [uid, setUid] = useState<string | null>(null);

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
    const unsubscribe = subscribeToUnreadCount(uid, setUnreadCount);
    return unsubscribe;
  }, [uid]);

  return (
    <button
      onClick={() => navigate('/notificacoes')}
      className="relative inline-flex items-center justify-center rounded-full p-2 text-[var(--color-navy)] transition hover:bg-black/5"
      aria-label="Notificações"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h6s3-2 3-9z" />
        <path d="M12 18a3 3 0 0 0 3-3" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-navy)] shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
