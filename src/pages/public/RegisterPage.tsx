import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import categories from '../../constants/categories';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileType = 'cliente' | 'prestador';

type FormFields = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
  category: string;
  terms: boolean;
};

type FormErrors = {
  [K in keyof FormFields]?: string;
};

const profileCards = [
  {
    key: 'cliente' as ProfileType,
    title: 'Sou Cliente',
    description: 'Preciso contratar um profissional',
    emoji: '🧑‍💼',
  },
  {
    key: 'prestador' as ProfileType,
    title: 'Sou Prestador',
    description: 'Quero oferecer meus serviços',
    emoji: '🧰',
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();

  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [fields, setFields] = useState<FormFields>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    category: '',
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const categoryOptions = categories.filter((category) => category.ativa);

  const handleField = (name: keyof FormFields, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!fields.fullName.trim()) {
      next.fullName = 'Nome completo é obrigatório.';
    } else if (fields.fullName.trim().length < 3) {
      next.fullName = 'Mínimo de 3 caracteres.';
    }

    if (!fields.email.trim()) {
      next.email = 'E-mail é obrigatório.';
    } else if (!EMAIL_REGEX.test(fields.email.trim())) {
      next.email = 'E-mail inválido.';
    }

    if (!fields.password) {
      next.password = 'Senha é obrigatória.';
    } else if (fields.password.length < 6) {
      next.password = 'Mínimo de 6 caracteres.';
    }

    if (!fields.confirmPassword) {
      next.confirmPassword = 'Confirme a senha.';
    } else if (fields.confirmPassword !== fields.password) {
      next.confirmPassword = 'Senhas não coincidem.';
    }

    if (selectedProfile === 'prestador') {
      if (!fields.city.trim()) {
        next.city = 'Cidade é obrigatória.';
      }
      if (!fields.state.trim()) {
        next.state = 'Estado é obrigatório.';
      }
      if (!fields.category.trim()) {
        next.category = 'Selecione sua especialidade.';
      }
    }

    if (!fields.terms) {
      next.terms = 'Você precisa aceitar os termos.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!selectedProfile) {
      setServerError('Selecione um perfil antes de continuar.');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate('/', {
        state: {
          userName: fields.fullName,
          profile: selectedProfile,
        },
      });
    } catch {
      setServerError('Erro ao cadastrar. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-10 rounded-[40px] bg-white p-10 shadow-[var(--shadow-soft)] ring-1 ring-slate-200">
            <div className="inline-flex items-center gap-3 rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-navy)] shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
              ResolveJá
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">Comece agora</h1>
              <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                Escolha seu perfil para continuar e complete o cadastro para acessar a plataforma.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {profileCards.map((profile) => {
                const active = selectedProfile === profile.key;
                return (
                  <button
                    key={profile.key}
                    type="button"
                    onClick={() => {
                      setSelectedProfile(profile.key);
                      setServerError('');
                    }}
                    className={`flex flex-col gap-4 rounded-[28px] border p-6 text-left transition ${
                      active
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-primary)]/20 text-3xl">
                      {profile.emoji}
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--color-navy)]">{profile.title}</h2>
                      <p className="mt-2 text-sm text-slate-600">{profile.description}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {active ? 'Selecionado' : 'Selecionar'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 rounded-[32px] bg-[var(--color-bg-light)] p-6">
              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Informações</p>
                <p className="mt-3 text-sm text-slate-600">
                  A tela de cadastro foi atualizada para ser mais clara, com elementos modernos e mantendo a paleta amarela e azul do app.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-[var(--color-primary)]/10 p-4 text-sm text-[var(--color-navy)]">
                  <p className="font-semibold">Layout limpo</p>
                  <p className="mt-2 text-slate-600">Formulário organizado em um painel leve e moderno.</p>
                </div>
                <div className="rounded-[24px] bg-white p-4 text-sm text-slate-700 shadow-sm">
                  <p className="font-semibold">Cores consistentes</p>
                  <p className="mt-2 text-slate-600">Mantém o amarelo e o azul usados em todo o produto.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[40px] bg-white p-10 shadow-[var(--shadow-soft)] ring-1 ring-slate-200">
            <div className="absolute -right-10 top-10 h-44 w-44 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
            <div className="absolute left-0 top-20 h-32 w-32 rounded-full bg-[var(--color-navy)]/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Cadastro</p>
                <h2 className="text-3xl font-bold text-[var(--color-navy)]">Crie sua conta</h2>
                <p className="text-sm text-slate-600">Preencha suas informações e escolha o perfil para começar.</p>
              </div>

              {serverError ? (
                <div className="rounded-3xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                  {serverError}
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Nome completo"
                  name="fullName"
                  placeholder="Seu nome completo"
                  value={fields.fullName}
                  onChange={(e) => handleField('fullName', e.target.value)}
                  error={errors.fullName}
                />

                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={fields.email}
                  onChange={(e) => handleField('email', e.target.value)}
                  error={errors.email}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Senha"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={fields.password}
                    onChange={(e) => handleField('password', e.target.value)}
                    error={errors.password}
                  />
                  <Input
                    label="Confirmar senha"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={fields.confirmPassword}
                    onChange={(e) => handleField('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>

                {selectedProfile === 'prestador' ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Cidade"
                        name="city"
                        placeholder="Sua cidade"
                        value={fields.city}
                        onChange={(e) => handleField('city', e.target.value)}
                        error={errors.city}
                      />
                      <div className="space-y-2">
                        <label htmlFor="state" className="block text-sm font-semibold text-slate-900">Estado</label>
                        <select
                          id="state"
                          name="state"
                          value={fields.state}
                          onChange={(e) => handleField('state', e.target.value)}
                          className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${
                            errors.state ? 'border-rose-500' : 'border-slate-200'
                          }`}
                        >
                          <option value="">UF</option>
                          <option value="SP">SP</option>
                          <option value="RJ">RJ</option>
                          <option value="MG">MG</option>
                          <option value="PR">PR</option>
                          <option value="BA">BA</option>
                        </select>
                        {errors.state ? <p className="text-xs text-rose-600">{errors.state}</p> : null}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category" className="block text-sm font-semibold text-slate-900">Categoria de serviço principal</label>
                      <select
                        id="category"
                        name="category"
                        value={fields.category}
                        onChange={(e) => handleField('category', e.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${
                          errors.category ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      >
                        <option value="">Selecione sua especialidade</option>
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.nome}>
                            {category.nome}
                          </option>
                        ))}
                      </select>
                      {errors.category ? <p className="text-xs text-rose-600">{errors.category}</p> : null}
                    </div>
                  </>
                ) : null}

                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={fields.terms}
                    onChange={(e) => handleField('terms', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    aria-invalid={Boolean(errors.terms)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="terms" className="text-sm text-slate-600">
                      Aceito os termos e a política de privacidade.
                    </label>
                    {errors.terms ? <p className="text-xs text-rose-600">{errors.terms}</p> : null}
                  </div>
                </div>

                <Button type="submit" className="w-full py-4 text-base" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Cadastrando…' : 'Criar minha conta'}
                </Button>
              </form>

              <p className="text-sm text-slate-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Fazer Login
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
