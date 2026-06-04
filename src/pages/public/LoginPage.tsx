import { Link } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import mockProfessionals from '../../constants/mockProfessionals';
import mockProposals from '../../constants/mockProposals';

const LoginPage = () => {
  const averageRating = (
    mockProfessionals.reduce((sum, professional) => sum + professional.avaliacaoMedia, 0) /
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Bem-vindo ao nosso serviço</p>
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

              <form className="space-y-4">
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                />
                <Input
                  label="Senha"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                    Esqueceu a senha?
                  </button>
                  <Button type="submit" className="w-full sm:w-auto" variant="primary">
                    Entrar
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

        <section className="mt-12 grid gap-4 rounded-[32px] bg-[var(--color-navy)] p-6 text-white shadow-lg shadow-slate-900/10 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white/10 p-5">
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-slate-200">{item.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
