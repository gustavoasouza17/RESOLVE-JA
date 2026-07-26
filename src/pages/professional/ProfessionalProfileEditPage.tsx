import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const validateImageFile = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return 'A imagem deve ser JPEG ou PNG.';
  }

  if (file.size > 5 * 1024 * 1024) {
    return 'A imagem deve ter no máximo 5MB.';
  }

  return null;
};

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
    };
  } catch {
    return null;
  }
};

const ProfessionalProfileEditPage = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const maxPortfolioSize = 10;

  const [fullName, setFullName] = useState(authUser?.fullName ?? 'Carlos Mendes');
  const [bio, setBio] = useState('Pedreiro com 12 anos de experiência em reformas residenciais.');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(authUser?.category ? [authUser.category] : []);
  const [whatsapp, setWhatsapp] = useState(authUser?.phone ?? '');
  const [rate, setRate] = useState('');
  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<DayKey, Shift[]>>({
    segunda: [],
    terca: [],
    quarta: [],
    quinta: [],
    sexta: [],
    sabado: [],
    domingo: [],
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

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
      const hasShift = current[day].includes(shift);
      const nextShifts = hasShift
        ? current[day].filter((item) => item !== shift)
        : [...current[day], shift];

      return { ...current, [day]: nextShifts };
    });
  };

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, profilePhoto: validationError }));
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      setSubmitMessage('Erro ao enviar imagem. Tente novamente.');
      setSubmitStatus('error');
      return;
    }

    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }

    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, profilePhoto: '' }));
    setSubmitMessage('');
  };

  const handlePortfolioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles: File[] = [];
    const invalidFile = files.find((file) => validateImageFile(file) !== null);

    if (invalidFile) {
      setErrors((prev) => ({ ...prev, portfolio: 'Erro ao enviar imagem. Tente novamente.' }));
      setSubmitMessage('Erro ao enviar imagem. Tente novamente.');
      setSubmitStatus('error');
      return;
    }

    if (files.length + portfolioFiles.length > maxPortfolioSize) {
      setErrors((prev) => ({ ...prev, portfolio: `Máximo de ${maxPortfolioSize} fotos de portfólio.` }));
      return;
    }

    files.forEach((file) => validFiles.push(file));
    setPortfolioFiles((current) => [...current, ...validFiles]);
    setPortfolioPreviews((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]);
    setErrors((prev) => ({ ...prev, portfolio: '' }));
    setSubmitMessage('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!profilePhoto) {
      nextErrors.profilePhoto = 'Foto de perfil obrigatória para publicar o perfil.';
    }

    if (!selectedCategories.length) {
      nextErrors.categories = 'Ao menos 1 categoria obrigatória.';
    }

    if (!neighborhoods.length) {
      nextErrors.neighborhoods = 'Ao menos 1 bairro obrigatório.';
    }

    if (!whatsapp.trim()) {
      nextErrors.whatsapp = 'WhatsApp obrigatório para habilitar o botão de contato.';
    }

    if (bio.length > 300) {
      nextErrors.bio = 'Máximo de 300 caracteres.';
    }

    if (portfolioFiles.length > maxPortfolioSize) {
      nextErrors.portfolio = `Máximo de ${maxPortfolioSize} fotos de portfólio.`;
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSubmitStatus('error');
      setSubmitMessage('Corrija os campos destacados antes de salvar.');
      return;
    }

    setErrors({});
    setSubmitStatus('saving');
    setSubmitMessage('');

    setTimeout(() => {
      setSubmitStatus('success');
      setSubmitMessage('Perfil atualizado com sucesso.');
    }, 400);
  };

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
                placeholder="Carlos Mendes"
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
                  className={`mt-3 w-full rounded-3xl border px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${errors.bio ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200'
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
                          className={`rounded-3xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${active
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
                <label className="block text-sm font-semibold text-slate-900">Foto de perfil</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex min-h-[108px] min-w-[108px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-100">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Prévia da foto de perfil" className="h-full w-full rounded-3xl object-cover" />
                    ) : (
                      'Selecionar foto'
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleProfilePhotoChange}
                      className="sr-only"
                    />
                  </label>
                  <div className="space-y-2 text-sm text-slate-500">
                    <p>JPEG/PNG até 5MB.</p>
                    <p className="text-slate-400">Obrigatório para publicar o perfil.</p>
                  </div>
                </div>
                {errors.profilePhoto ? <p className="text-xs text-rose-600">{errors.profilePhoto}</p> : null}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-900">Portfólio</label>
                <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-[var(--color-navy)] shadow-sm transition hover:bg-slate-100">
                    Selecionar imagens
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      multiple
                      onChange={handlePortfolioChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-slate-500">Até {maxPortfolioSize} fotos. JPEG/PNG, 5MB cada.</p>
                </div>
                {errors.portfolio ? <p className="text-xs text-rose-600">{errors.portfolio}</p> : null}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolioPreviews.map((preview, index) => (
                    <div key={`${preview}-${index}`} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
                      <img src={preview} alt={`Portfólio ${index + 1}`} className="h-28 w-full object-cover" />
                    </div>
                  ))}
                </div>
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
                  type="number"
                  placeholder="R$ 240"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                  helperText="Opcional; exibido no perfil"
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
                        const active = availability[day.key].includes(shift.key);
                        return (
                          <button
                            key={shift.key}
                            type="button"
                            onClick={() => handleToggleAvailability(day.key, shift.key)}
                            className={`rounded-2xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${active
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
              <div className={`rounded-3xl px-5 py-4 text-sm ${submitStatus === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {submitMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={submitStatus === 'saving'}>
                {submitStatus === 'saving' ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileEditPage;
