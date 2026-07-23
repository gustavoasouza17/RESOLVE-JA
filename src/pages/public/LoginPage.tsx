import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import StatsBanner from '../../components/molecules/StatsBanner';
import mockProfessionals from '../../constants/mockProfessionals';
import mockProposals from '../../constants/mockProposals';
import { loginWithEmail, resetPassword, translateError } from '../../services/auth';
import type { AuthError } from 'firebase/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  email?: string;
  password?: string;
};

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!email.trim()) {
      next.email = 'E-mail é obrigatório.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'E-mail inválido.';
    }

    if (!password) {
      next.password = 'Senha é obrigatória.';
    } else if (password.length < 6) {
      next.password = 'Mínimo de 6 caracteres.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const { user, profile } = await loginWithEmail(email.trim(), password);
      const perfil = profile?.perfil as 'cliente' | 'prestador' | undefined;

      // Salva dados do usuário no localStorage
      if (profile) {
        window.localStorage.setItem(
          'resolveJaAuth',
          JSON.stringify({
            uid: profile.uid || user.uid,
            fullName: profile.nome || user.displayName || '',
            email: profile.email || email.trim(),
            phone: profile.telefone || '',
            profile: profile.perfil || '',
            category: profile.categoria || '',
            city: profile.cidade || '',
          }),
        );
      }

      if (perfil === 'prestador') {
        navigate('/prestador/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      const msg = err instanceof Error
        ? (err as unknown as { code?: string }).code
          ? translateError(err as unknown as AuthError)
          : err.message
        : 'Erro desconhecido. Tente novamente.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Informe seu e-mail para recuperar a senha.' }));
      return;
    }
    try {
      await resetPassword(email.trim());
      setServerError('');
      alert('Link de redefinição enviado para o seu e-mail.');
    } catch (err) {
      const msg = err instanceof Error
        ? (err as unknown as { code?: string }).code
          ? translateError(err as unknown as AuthError)
          : err.message
        : 'Erro ao enviar e-mail de redefinição.';
      setServerError(msg);
    }
  };

  const averageRating = (
    mockProfessionals.reduce((sum, p) => sum + p.avaliacaoMedia, 0) /
    mockProfessionals.length
  ).toFixed(1);

  const stats = [
    { value: `${mockProfessionals.length}+`, label: 'Profissionais' },
    { value: averageRating, label: 'Avaliação média' },
    { value: `${mockProposals.length * 3}+`, label: 'Atendimentos' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Bem-vindo ao Resolve Já</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Buscando qual <span className="text-[var(--color-primary)]">serviço?</span>
            </h1>
            <p className="max-w-xl text-base text-slate-700 sm:text-lg">
              Entre com suas credenciais e conecte-se aos profissionais mais próximos da sua região. Login rápido, sem complicação.
            </p>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Entrar</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">Entre com suas credenciais</p>
              </div>

              {serverError ? (
                <div className="rounded-3xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                  {serverError}
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Senha"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Entrando…' : 'Entrar'}
                  </Button>
                </div>
              </form>

              <p className="text-sm text-slate-500">
                Ainda não tem uma conta?{' '}
                <Link to="/cadastro" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Criar Conta
                </Link>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 block lg:hidden">
          <StatsBanner metrics={stats} />
        </div>

        <section className="mt-12 hidden grid-cols-3 gap-4 lg:grid">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl bg-[var(--color-navy)]/90 p-5 text-white shadow-lg shadow-slate-900/10">
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="mt-2 text-sm text-slate-200">{item.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
