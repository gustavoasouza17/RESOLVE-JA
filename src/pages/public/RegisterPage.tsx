import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';

const profileCards = [
  {
    key: 'cliente',
    title: 'Sou Cliente',
    description: 'Preciso contratar um profissional',
    emoji: '🧑‍💼',
  },
  {
    key: 'prestador',
    title: 'Sou Prestador de Serviço',
    description: 'Quero oferecer meus serviços',
    emoji: '🧰',
  },
];

const RegisterPage = () => {
  const [selectedProfile, setSelectedProfile] = useState<'cliente' | 'prestador' | null>(null);

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

              <div className="grid gap-4 sm:grid-cols-2">
                {profileCards.map((profile) => {
                  const active = selectedProfile === profile.key;
                  return (
                    <button
                      key={profile.key}
                      type="button"
                      onClick={() => setSelectedProfile(profile.key as 'cliente' | 'prestador')}
                      className={`group flex flex-col gap-4 rounded-[28px] border p-5 text-left transition ${
                        active ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--color-primary)]/15 text-2xl">
                        {profile.emoji}
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--color-navy)]">{profile.title}</h2>
                        <p className="mt-2 text-sm text-slate-600">{profile.description}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Selecionar</span>
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

              <form className="space-y-4">
                <Input label="Nome completo" name="fullName" placeholder="Seu nome" />
                <Input label="E-mail" name="email" type="email" placeholder="seu@email.com" />
                <Input label="Telefone" name="phone" type="tel" placeholder="(11) 9 9999-9999" />
                <Input label="CPF" name="cpf" placeholder="000.000.000-00" />
                <Input label="Senha" name="password" type="password" placeholder="••••••••" />
                <Input label="Confirmar senha" name="confirmPassword" type="password" placeholder="••••••••" />
                <div className="flex items-center gap-3">
                  <input id="terms" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <label htmlFor="terms" className="text-sm text-slate-600">
                    Aceito os termos e a política de privacidade.
                  </label>
                </div>
                <Button type="submit" className="w-full" variant="primary">
                  Cadastrar
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
