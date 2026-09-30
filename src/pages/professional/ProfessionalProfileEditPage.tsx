import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import BottomNav from '../../components/organisms/BottomNav';
import categories from '../../constants/categories';

type DayKey = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
type Shift = 'manha' | 'tarde' | 'noite';

const days: Array<{ key: DayKey; label: string }> = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const shifts: Array<{ key: Shift; label: string }> = [
  { key: 'manha', label: 'Manhã' },
  { key: 'tarde', label: 'Tarde' },
  { key: 'noite', label: 'Noite' },
];



const normalizeNeighborhood = (value: string) => value.trim().replace(/\s{2,}/g, ' ');

const getAuthUser = () => {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as {
      profile: 'cliente' | 'prestador';
      fullName: string;
      uid?: string;
      category?: string;
      city?: string;
      state?: string;
      phone?: string;
      email?: string;
      fotoUrl?: string;
    };
  } catch {
    return null;
  }
};

const initialAvailability: Record<DayKey, Shift[]> = {
  segunda: [],
  terca: [],
  quarta: [],
  quinta: [],
  sexta: [],
  sabado: [],
  domingo: [],
};

const ProfessionalProfileEditPage = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const maxPortfolioSize = 10;

  const [uid, setUid] = useState<string | null>(authUser?.uid ?? auth.currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState(authUser?.fullName ?? '');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    authUser?.category ? [authUser.category] : []
  );
  const [whatsapp, setWhatsapp] = useState(authUser?.phone ?? '');
  const [rate, setRate] = useState('');
  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<DayKey, Shift[]>>(initialAvailability);

  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>(authUser?.fotoUrl ?? '');
  const [existingPortfolio, setExistingPortfolio] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Identifica o usuário autenticado
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

  // Carrega os dados reais do Firestore
  useEffect(() => {
    if (!uid) return;

    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const profSnap = await getDoc(doc(db, 'professionals', uid));
        const userSnap = await getDoc(doc(db, 'users', uid));

        if (cancelled) return;

        const profData = profSnap.exists() ? (profSnap.data() as Record<string, unknown>) : null;
        const userData = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : null;
        const stored = getAuthUser();

        const initialName =
          (profData?.nome as string) ||
          (userData?.nome as string) ||
          stored?.fullName ||
          '';
        const initialBio = (profData?.bio as string) ?? (userData?.bio as string) ?? '';
        const initialCategories =
          (profData?.categorias as string[]) ||
          (userData?.categorias as string[]) ||
          (stored?.category ? [stored.category] : []);
        const initialWhatsapp =
          (profData?.whatsapp as string) ||
          (userData?.telefone as string) ||
          stored?.phone ||
          '';
        const initialRate = (profData?.valorDiaria as string) || '';
        const initialNeighborhoods =
          (profData?.bairrosAtendimento as string[]) ||
          (userData?.cidade ? [userData.cidade as string] : []);
        const loadedAvailability =
          (profData?.disponibilidade as Record<DayKey, Shift[]>) || initialAvailability;
        const initialPhoto =
          (profData?.fotoUrl as string) || (userData?.fotoUrl as string) || stored?.fotoUrl || '';
        const initialPortfolio = (profData?.portfolio as string[]) || [];

        setFullName(initialName);
        setBio(initialBio);
        setSelectedCategories(initialCategories);
        setWhatsapp(initialWhatsapp);
        setRate(initialRate);
        setNeighborhoods(initialNeighborhoods);
        setAvailability({
          segunda: loadedAvailability.segunda || [],
          terca: loadedAvailability.terca || [],
          quarta: loadedAvailability.quarta || [],
          quinta: loadedAvailability.quinta || [],
          sexta: loadedAvailability.sexta || [],
          sabado: loadedAvailability.sabado || [],
          domingo: loadedAvailability.domingo || [],
        });
        setExistingPhotoUrl(initialPhoto);
        setExistingPortfolio(initialPortfolio);
      } catch (err) {
        console.error('Erro ao carregar perfil do Firestore:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Timeout de segurança para não travar na tela de loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const totalSelected = useMemo(() => selectedCategories.length, [selectedCategories.length]);
  const selectedAvailabilityCount = useMemo(
    () => Object.values(availability).reduce((sum, shifts) => sum + shifts.length, 0),
    [availability]
  );

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
    setErrors((prev) => ({ ...prev, categories: '' }));
  };

  const handleAddNeighborhood = () => {
    const nextValue = normalizeNeighborhood(neighborhoodInput);
    if (!nextValue) {
      return;
    }

    if (neighborhoods.includes(nextValue)) {
      setNeighborhoodInput('');
      return;
    }

    setNeighborhoods((current) => [...current, nextValue]);
    setNeighborhoodInput('');
    setErrors((prev) => ({ ...prev, neighborhoods: '' }));
  };

  const handleRemoveNeighborhood = (item: string) => {
    setNeighborhoods((current) => current.filter((value) => value !== item));
  };

  const handleToggleAvailability = (day: DayKey, shift: Shift) => {
    setAvailability((current) => {
      const dayShifts = current[day] || [];
      const hasShift = dayShifts.includes(shift);
      const nextShifts = hasShift
        ? dayShifts.filter((item) => item !== shift)
        : [...dayShifts, shift];

      return { ...current, [day]: nextShifts };
    });
  };



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    // Foto de perfil é OPCIONAL (Storage do Firebase ainda não habilitado)

    if (!selectedCategories.length) {
      nextErrors.categories = 'Ao menos 1 categoria obrigatória.';
    }

    if (!whatsapp.trim()) {
      nextErrors.whatsapp = 'WhatsApp obrigatório para habilitar o botão de contato.';
    }

    if (bio.length > 300) {
      nextErrors.bio = 'Máximo de 300 caracteres.';
    }



    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSubmitStatus('error');
      setSubmitMessage('Corrija os campos destacados antes de salvar.');
      return;
    }

    const targetUid = uid || auth.currentUser?.uid || authUser?.uid;
    if (!targetUid) {
      setSubmitStatus('error');
      setSubmitMessage('Usuário não autenticado. Faça login novamente.');
      return;
    }

    setErrors({});
    setSubmitStatus('saving');
    setSubmitMessage('');

    try {
      let finalPhotoUrl = existingPhotoUrl;
      let finalPortfolio = existingPortfolio;

      const professionalData = {
        uid: targetUid,
        userId: targetUid,
        nome: fullName.trim() || 'Profissional',
        bio: bio.trim(),
        whatsapp: whatsapp.trim(),
        categorias: selectedCategories,
        bairrosAtendimento: neighborhoods,
        valorDiaria: rate.trim(),
        disponibilidade: availability,
        fotoUrl: finalPhotoUrl,
        portfolio: finalPortfolio,
        atualizadoEm: new Date().toISOString(),
      };

      // 1. Salva na coleção `professionals`
      await setDoc(doc(db, 'professionals', targetUid), professionalData, { merge: true });

      // 2. Atualiza na coleção `users`
      await setDoc(
        doc(db, 'users', targetUid),
        {
          uid: targetUid,
          nome: fullName.trim() || 'Profissional',
          telefone: whatsapp.trim(),
          fotoUrl: finalPhotoUrl,
          categorias: selectedCategories,
          cidade: neighborhoods[0] || '',
        },
        { merge: true }
      );

      // 3. Atualiza cache local
      const raw = window.localStorage.getItem('resolveJaAuth');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          parsed.fullName = fullName.trim() || 'Profissional';
          parsed.phone = whatsapp.trim();
          parsed.category = selectedCategories[0] || '';
          parsed.fotoUrl = finalPhotoUrl;
          if (neighborhoods[0]) parsed.city = neighborhoods[0];
          window.localStorage.setItem('resolveJaAuth', JSON.stringify(parsed));
        } catch {
          // ignora
        }
      }

      setExistingPhotoUrl(finalPhotoUrl);
      setExistingPortfolio(finalPortfolio);
      setSubmitStatus('success');
      setSubmitMessage('Perfil atualizado com sucesso no Firebase!');

      setTimeout(() => {
        navigate('/prestador/perfil');
      }, 1200);
    } catch (err) {
      console.error('Erro ao salvar perfil no Firebase:', err);
      setSubmitStatus('error');
      setSubmitMessage('Erro ao salvar perfil no Firebase. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="professional" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Editar perfil</p>
            <h1 className="text-3xl font-bold tracking-tight">Complete suas informações profissionais</h1>
            <p className="text-sm text-slate-600">Atualize seu perfil para atrair mais clientes e publicar serviços com confiança.</p>
          </div>

          <form className="mt-10 space-y-8" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6 lg:grid-cols-2">
              <Input
                label="Nome completo"
                name="fullName"
                placeholder="Ex.: Carlos Mendes"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              <Input
                label="WhatsApp"
                name="whatsapp"
                type="tel"
                placeholder="(11) 98888-0000"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                error={errors.whatsapp}
                helperText="Ex.: 11 98888-0000"
              />
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-slate-900">
                  Bio / descrição
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={300}
                  rows={5}
                  className={`mt-3 w-full rounded-3xl border px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${
                    errors.bio ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200'
                  }`}
                  placeholder="Fale sobre sua experiência, especialidades e tipo de serviço oferecido."
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby={errors.bio ? 'bio-error' : 'bio-helptext'}
                />
                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  {errors.bio ? (
                    <p id="bio-error" className="text-xs text-rose-600">
                      {errors.bio}
                    </p>
                  ) : (
                    <p id="bio-helptext" className="text-xs text-slate-500">
                      Máximo de 300 caracteres.
                    </p>
                  )}
                  <p className="text-xs text-slate-400">{bio.length}/300</p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <label className="text-sm font-semibold text-slate-900">Seleção de categorias</label>
                  <span className="text-xs text-slate-500">Selecione ao menos 1</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories
                    .filter((category) => category.ativa)
                    .map((category) => {
                      const active = selectedCategories.includes(category.nome);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleToggleCategory(category.nome)}
                          className={`rounded-3xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${
                            active
                              ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)] text-[var(--color-navy)]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                          aria-pressed={active}
                        >
                          <div className="font-semibold">{category.nome}</div>
                          <div className="mt-1 text-xs text-slate-500">Profissionais verificados</div>
                        </button>
                      );
                    })}
                </div>
                {errors.categories ? <p className="mt-2 text-xs text-rose-600">{errors.categories}</p> : null}
                <p className="mt-3 text-xs text-slate-500">Categorias selecionadas: {totalSelected}</p>
              </div>
            </div>



            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-900">Bairros de atendimento</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="neighborhood-input"
                    name="neighborhoodInput"
                    placeholder="Digite um bairro e pressione Enter"
                    value={neighborhoodInput}
                    onChange={(event) => setNeighborhoodInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddNeighborhood();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddNeighborhood} className="min-w-[160px]">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {neighborhoods.map((item) => (
                    <span key={item} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveNeighborhood(item)}
                        className="ml-2 rounded-full bg-slate-200 px-1 text-xs text-slate-600 transition hover:bg-slate-300"
                        aria-label={`Remover bairro ${item}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {errors.neighborhoods ? <p className="text-xs text-rose-600">{errors.neighborhoods}</p> : null}
              </div>

              <div className="space-y-4">
                <Input
                  label="Valor por dia / hora"
                  name="rate"
                  type="text"
                  placeholder="Ex.: R$ 240 / diária"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                  helperText="Opcional; exibido no seu perfil público"
                />
              </div>
            </div>

            <div className="space-y-5 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Disponibilidade semanal</p>
                  <p className="mt-1 text-sm text-slate-500">Marque os turnos em que você atende.</p>
                </div>
                <p className="text-xs text-slate-500">{selectedAvailabilityCount} turnos selecionados</p>
              </div>
              <div className="grid gap-3">
                {days.map((day) => (
                  <div key={day.key} className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-[160px_1fr]">
                    <div className="text-sm font-semibold text-slate-900">{day.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {shifts.map((shift) => {
                        const active = (availability[day.key] || []).includes(shift.key);
                        return (
                          <button
                            key={shift.key}
                            type="button"
                            onClick={() => handleToggleAvailability(day.key, shift.key)}
                            className={`rounded-2xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${
                              active
                                ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)] text-[var(--color-navy)]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                            aria-pressed={active}
                          >
                            {shift.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {submitMessage ? (
              <div
                className={`rounded-3xl px-5 py-4 text-sm font-medium ${
                  submitStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300'
                    : 'bg-rose-100 text-rose-900 ring-1 ring-rose-300'
                }`}
              >
                {submitMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={submitStatus === 'saving'}>
                {submitStatus === 'saving' ? 'Salvando no Firebase...' : 'Salvar perfil'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileEditPage;
