import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const PHONE_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

type ProfileType = 'cliente' | 'prestador';

type FormFields = {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  confirmPassword: string;
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
    title: 'Sou Prestador de Serviço',
    description: 'Quero oferecer meus serviços',
    emoji: '🧰',
  },
];

// Validação simples de dígitos verificadores do CPF
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calc = (mul: number) => {
    let sum = 0;
    for (let i = 0; i < mul - 1; i++) sum += Number(digits[i]) * (mul - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calc(10) === Number(digits[9]) && calc(11) === Number(digits[10]);
}

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
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleField = (name: keyof FormFields, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    // limpa erro do campo ao digitar
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
    } else if (!PHONE_REGEX.test(fields.phone.trim())) {
      next.phone = 'Formato inválido. Ex: (11) 99999-9999';
    }

    if (!fields.cpf.trim()) {
      next.cpf = 'CPF é obrigatório.';
    } else if (!CPF_REGEX.test(fields.cpf.trim())) {
      next.cpf = 'Formato inválido. Use 000.000.000-00';
    } else if (!isValidCPF(fields.cpf.trim())) {
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
      // TODO: substituir por Firebase Auth + Firestore
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Redireciona conforme perfil
      if (selectedProfile === 'prestador') {
        navigate('/prestador/home');
      } else {
        navigate('/home');
      }
    } catch {
      setServerError('Erro ao cadastrar. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Conecta Serviços</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Bem-vindo!
            </h1>
            <p className="max-w-xl text-base text-slate-700 sm:text-lg">
              Como você deseja acessar a plataforma? Escolha seu perfil e preencha os dados para começar a encontrar oportunidades ou clientes.
            </p>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Cadastro</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">Selecione seu perfil</p>
              </div>

              {serverError ? (
                <div className="rounded-3xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                  {serverError}
                </div>
              ) : null}

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
                      className={`group flex flex-col gap-4 rounded-[28px] border p-5 text-left transition ${
                        active
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--color-primary)]/15 text-2xl">
                        {profile.emoji}
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--color-navy)]">{profile.title}</h2>
                        <p className="mt-2 text-sm text-slate-600">{profile.description}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {active ? '✓ Selecionado' : 'Selecionar'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">💡 Você sabia?</p>
                <p className="mt-2 text-sm text-slate-700">
                  Prestadores também podem contratar outros profissionais. Use a plataforma do jeito que fizer mais sentido para você.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Nome completo"
                  name="fullName"
                  placeholder="Seu nome"
                  value={fields.fullName}
                  onChange={(e) => handleField('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={fields.email}
                  onChange={(e) => handleField('email', e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Telefone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
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
                    {errors.terms ? (
                      <p className="text-xs text-rose-600">{errors.terms}</p>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Cadastrando…' : 'Cadastrar'}
                </Button>
              </form>

              <p className="text-sm text-slate-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Entrar
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
