import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';
import BottomNav from '../../components/organisms/BottomNav';
import mockProposals from '../../constants/mockProposals';
import mockReviews from '../../constants/mockReviews';
import { auth, db } from '../../firebase';
import app from '../../firebase';

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

const ClientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(getUserName());
  const [editCity, setEditCity] = useState('São Paulo, SP');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, []);

  const userName = isEditing ? editName : getUserName();
  const userCity = 'São Paulo, SP';
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const storage = getStorage(app);
      const user = auth.currentUser;
      if (!user) return;

      const storageRef = ref(storage, `fotos/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setEditPhotoUrl(downloadUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Always update localStorage first (works even without Firestore)
      const raw = window.localStorage.getItem('resolveJaAuth');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.fullName = editName;
        window.localStorage.setItem('resolveJaAuth', JSON.stringify(parsed));
      }

      // Try to save to Firestore if user is authenticated
      if (firebaseUser) {
        await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
          fullName: editName,
          cidade: editCity,
          fotoUrl: editPhotoUrl,
        });
      }

      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(getUserName());
    setEditCity('São Paulo, SP');
    setEditPhotoUrl('');
    setIsEditing(false);
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

  const reviewItems = mockReviews.slice(0, 2).map((review) => ({
    id: review.id,
    name: `Cliente ${review.autorId.replace('client', '')}`,
    rating: review.estrelas,
    text: review.comentario,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="client" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar name={userName} size="lg" src={editPhotoUrl || undefined} />
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
                        <label htmlFor="editPhoto" className="block text-xs font-semibold text-slate-500 mb-1">Foto de perfil</label>
                        <input
                          ref={fileInputRef}
                          id="editPhoto"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--color-navy)] hover:file:bg-[var(--color-primary)]/20 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        />
                        {uploadingPhoto && <p className="mt-1 text-xs text-slate-500">Enviando foto...</p>}
                        {editPhotoUrl && !uploadingPhoto && <p className="mt-1 text-xs text-green-600">✓ Foto carregada</p>}
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
                      <h1 className="text-3xl font-bold tracking-tight">{userName}</h1>
                      <p className="text-sm text-slate-600">{userCity}</p>
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

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Histórico de serviços</p>
                  <p className="mt-2 text-sm text-slate-600">Acompanhe suas solicitações recentes e o status de cada uma.</p>
                </div>
                <Button variant="secondary">Ver mais</Button>
              </div>

              <div className="mt-6 space-y-4">
                {historyItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <p className="font-semibold text-[var(--color-navy)]">{item.service}</p>
                        <p className="text-sm text-slate-600">{item.date}</p>
                      </div>
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">{item.status}</span>
                    </div>
                  </div>
                ))}
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
                {reviewItems.map((review) => (
                  <div key={review.id} className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-[var(--color-navy)]">{review.name}</p>
                      <StarRating value={review.rating} readOnly size="sm" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{review.text}</p>
                  </div>
                ))}
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
              <Button fullWidth variant="primary" onClick={() => setIsEditing(true)}>Editar perfil</Button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
