import { Link } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';

const ProposalPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Proposta</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight">Detalhes da proposta do cliente</h1>
              </div>

              <div className="rounded-[32px] bg-[var(--color-bg-light)] p-6">
                <div className="flex items-center gap-4">
                  <Avatar name="Mariana Costa" size="md" />
                  <div>
                    <p className="font-semibold text-[var(--color-navy)]">Mariana Costa</p>
                    <p className="text-sm text-slate-600">Cliente em São Paulo, solicita reforma de banheiro</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <StarRating value={4.7} readOnly size="sm" />
                  <span className="text-sm text-slate-600">4.7 avaliação média</span>
                </div>
              </div>

              <div className="space-y-4 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Descrição</p>
                  <p className="mt-3 text-slate-700">Reforma completa do banheiro, incluindo troca de revestimento, instalação de novo vaso sanitário e revisão do encanamento.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Endereço</p>
                    <p className="mt-2 text-slate-700">Rua das Flores, 123 - Vila Mariana</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Data desejada</p>
                    <p className="mt-2 text-slate-700">10 de junho de 2026</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Orçamento sugerido</p>
                  <p className="mt-2 text-slate-700">R$ 1.100,00</p>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[32px] bg-[var(--color-bg-light)] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Ações</p>
                <div className="mt-6 space-y-3">
                  <Button fullWidth variant="primary">Aceitar e chamar no WhatsApp</Button>
                  <Button fullWidth variant="secondary">Recusar proposta</Button>
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Notas</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">Confirme disponibilidade de agenda antes de aceitar e mantenha o cliente informado sobre prazos e materiais necessários.</p>
              </div>

              <Link to="/prestador/home" className="block rounded-3xl bg-white px-5 py-4 text-center text-sm font-semibold text-[var(--color-primary)] ring-1 ring-slate-200 hover:bg-slate-50">
                Voltar à lista de propostas
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
