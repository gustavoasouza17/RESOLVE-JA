import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';
import BottomNav from '../../components/organisms/BottomNav';
import mockProposals from '../../constants/mockProposals';
import { auth, db } from '../../firebase';
import { logout } from '../../services/auth';
import { getReviewsForUser, type ReviewWithAuthor } from '../../services/reviews';

const getUserName = () => {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return 'Usuário';
    const parsed = JSON.parse(raw);
    return parsed.fullName || 'Usuário';
  } catch {
    return 'Usuário';
  }
};

interface ProfileData {
  name: string;
  city: string;
  photoUrl: string;
}

const ClientProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Fonte única de verdade para o que é exibido na tela (fora do modo edição)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: getUserName(),
    city: 'São Paulo, SP',
    photoUrl: '',
  });

  // Campos do formulário de edição (só usados enquanto isEditing = true)
  const [editName, setEditName] = useState(profileData.name);
  const [editCity, setEditCity] = useState(profileData.city);
  const [editPhotoUrl, setEditPhotoUrl] = useState(profileData.photoUrl);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);

  // Carrega os dados do Firestore ao montar / quando o auth muda
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data() as Record<string, string | undefined>;
            const loaded: ProfileData = {
              name: data.nome ?? getUserName(),
              city: data.cidade ?? 'São Paulo, SP',
              photoUrl: data.fotoUrl ?? '',
            };
            setProfileData(loaded);
            setEditName(loaded.name);
            setEditCity(loaded.city);
            setEditPhotoUrl(loaded.photoUrl);
          }
        } catch (err) {
          console.error('Erro ao carregar perfil do Firestore:', err);
        }

        // Carrega avaliações recebidas pelo cliente (prestador → cliente)
        try {
          const data = await getReviewsForUser(user.uid);
          setReviews(data.filter((r) => r.tipo === 'prestador_para_cliente'));
        } catch (err) {
          console.error('Erro ao carregar avaliações do Firestore:', err);
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleStartEditing = () => {
    setEditName(profileData.name);
    setEditCity(profileData.city);
    setEditPhotoUrl(profileData.photoUrl);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      // Sempre atualiza o localStorage primeiro (funciona mesmo sem Firestore)
      const raw = window.localStorage.getItem('resolveJaAuth');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.fullName = editName;
        if (editPhotoUrl) parsed.fotoUrl = editPhotoUrl;
        window.localStorage.setItem('resolveJaAuth', JSON.stringify(parsed));
      }

      // Salva no Firestore se o usuário estiver autenticado
      if (firebaseUser) {
        const updateData: Record<string, string> = {
          nome: editName,
          cidade: editCity,
          fotoUrl: editPhotoUrl,
        };
        await updateDoc(doc(db, 'users', firebaseUser.uid), updateData);
      }

      // Atualiza a fonte de verdade exibida — a tela de perfil já mostra os novos dados
      setProfileData({ name: editName, city: editCity, photoUrl: editPhotoUrl });
      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setErrorMessage('Erro ao salvar perfil. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(profileData.name);
    setEditCity(profileData.city);
    setEditPhotoUrl(profileData.photoUrl);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
    window.localStorage.removeItem('resolveJaAuth');
    navigate('/');
  };

  const historyItems = mockProposals
    .filter((proposal) => proposal.clienteId === 'client001')
    .slice(0, 3)
    .map((proposal) => ({
      id: proposal.id,
      service: proposal.descricao,
      status: proposal.status === 'pendente' ? 'Em andamento' : proposal.status === 'aceita' ? 'Concluído' : 'Cancelado',
      date: new Date(proposal.dataDesejada).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }));

  const reviewItems = reviews.slice(0, 3).map((review) => ({
    id: review.id,
    name: review.autorNome,
    avatarUrl: review.autorFotoUrl,
    rating: review.nota,
    text: review.comentario,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="client" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              {successMessage && (
                <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                  {errorMessage}
                </div>
              )}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar name={isEditing ? editName : profileData.name} size="lg" src={(isEditing ? editPhotoUrl : profileData.photoUrl) || undefined} />
                <div className="space-y-3 flex-1">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Perfil do cliente</p>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="editName" className="block text-xs font-semibold text-slate-500 mb-1">Nome</label>
                        <input
                          id="editName"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base font-bold text-[var(--color-navy)] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="editPhoto" className="block text-xs font-semibold text-slate-500 mb-1">Foto de perfil (URL — opcional)</label>
                        <input
                          id="editPhoto"
                          type="text"
                          value={editPhotoUrl}
                          onChange={(e) => setEditPhotoUrl(e.target.value)}
                          placeholder="Cole a URL da sua foto"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="editCity" className="block text-xs font-semibold text-slate-500 mb-1">Cidade</label>
                        <input
                          id="editCity"
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold tracking-tight">{profileData.name}</h1>
                      <p className="text-sm text-slate-600">{profileData.city}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Serviços concluídos</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">{historyItems.length}</p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Avaliação média</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={4.8} readOnly size="sm" />
                    <span className="text-sm text-slate-600">4.8</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Último serviço</p>
                  <p className="mt-2 text-base font-semibold text-[var(--color-navy)]">{historyItems[0]?.service ?? 'Nenhum serviço'}</p>
                </div>
              </div>
            </div>

          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Avaliações recentes</p>
                <span className="text-sm text-slate-500">{reviewItems.length} recentes</span>
              </div>
              <div className="mt-6 space-y-4">
                {reviewItems.length > 0 ? (
                  reviewItems.map((review) => (
                    <div key={review.id} className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={review.name} size="sm" src={review.avatarUrl || undefined} />
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--color-navy)]">{review.name}</p>
                          <StarRating value={review.rating} readOnly size="sm" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-[var(--color-bg-light)] p-10 text-center text-sm text-slate-600">
                    Ainda sem avaliações.
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <Button fullWidth variant="secondary" onClick={handleCancel}>Cancelar</Button>
                <Button fullWidth variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button fullWidth variant="primary" onClick={handleStartEditing}>Editar perfil</Button>
                <Button fullWidth variant="outline-danger" onClick={handleLogout} className="gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sair da conta
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;