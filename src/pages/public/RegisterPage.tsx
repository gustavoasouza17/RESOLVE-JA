import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import categories from '../../constants/categories';
import { registerWithEmail, translateError } from '../../services/auth';
import type { AuthError } from 'firebase/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{11}$/;

const cleanNumeric = (value: string) => value.replace(/\D/g, '');

const isValidCPF = (cpf: string): boolean => {
  const cleaned = cleanNumeric(cpf);
  if (!PHONE_REGEX.test(cleaned)) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcDigit = (digits: string) => {
    const nums = digits.split('').map(Number);
    const factor = nums.length + 1;
    const sum = nums.reduce((acc, num, index) => acc + num * (factor - index), 0);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  const firstNine = cleaned.slice(0, 9);
  const firstVerifier = calcDigit(firstNine);
  const secondVerifier = calcDigit(firstNine + firstVerifier);
  return cleaned.endsWith(`${firstVerifier}${secondVerifier}`);
};

type ProfileType = 'cliente' | 'prestador';

type FormFields = {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
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
    iconClass: 'bg-[var(--color-primary)]/20',
  },
  {
    key: 'prestador' as ProfileType,
    title: 'Sou Prestador de Serviço',
    description: 'Quero oferecer meus serviços',
    emoji: '🧰',
    iconClass: 'bg-gradient-to-br from-violet-700/15 to-pink-500/15',
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();

  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [fields, setFields] = useState<FormFields>({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
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

    if (!fields.phone.trim()) {
      next.phone = 'Telefone é obrigatório.';
    } else if (!PHONE_REGEX.test(cleanNumeric(fields.phone))) {
      next.phone = 'Telefone deve ter 11 dígitos.';
    }

    if (!fields.cpf.trim()) {
      next.cpf = 'CPF é obrigatório.';
    } else if (!isValidCPF(fields.cpf)) {
      next.cpf = 'CPF inválido.';
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
      await registerWithEmail(fields.email.trim(), fields.password, {
        fullName: fields.fullName.trim(),
        phone: cleanNumeric(fields.phone),
        cpf: cleanNumeric(fields.cpf),
        profile: selectedProfile,
        city: fields.city.trim() || undefined,
        state: fields.state.trim() || undefined,
        category: fields.category || undefined,
      });
      navigate(selectedProfile === 'prestador' ? '/prestador/home' : '/home');
    } catch (err) {
      const msg = err instanceof Error
        ? (err as unknown as { code?: string }).code
          ? translateError(err as unknown as AuthError)
          : err.message
        : 'Erro ao cadastrar. Verifique sua conexão.';
      setServerError(msg);
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Conecta Serviços</p>
              <h1 className="text-5xl font-bold tracking-tight">Bem-vindo!</h1>
              <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                Como você deseja acessar a plataforma?
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
                    className={`flex min-h-[220px] flex-col gap-4 rounded-[28px] border p-6 text-left transition ${
                      active
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl text-3xl ${profile.iconClass}`}>
                      {profile.emoji}
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--color-navy)]">{profile.title}</h2>
                      <p className="mt-2 text-sm text-slate-600">{profile.description}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      <span>{active ? 'Selecionado' : 'Selecionar'}</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="rounded-[32px] bg-[var(--color-bg-light)] p-4 text-sm text-slate-700">
              <p className="font-semibold">💡 Você sabia?</p>
              <p className="mt-2 text-slate-600">
                Você pode ter ambos os perfis! Prestadores também podem contratar outros profissionais.
              </p>
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
                    label="Telefone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 91234-5678"
                    value={fields.phone}
                    onChange={(e) => handleField('phone', e.target.value)}
                    error={errors.phone}
                  />
                  <Input
                    label="CPF"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={fields.cpf}
                    onChange={(e) => handleField('cpf', e.target.value)}
                    error={errors.cpf}
                  />
                </div>

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
