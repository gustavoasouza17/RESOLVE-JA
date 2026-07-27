import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import mockProfessionals from '../../constants/mockProfessionals';

const RequestPage = () => {
  const { profissionalId } = useParams();
  const navigate = useNavigate();
  const professional = mockProfessionals.find((p) => p.uid === profissionalId) ?? mockProfessionals[0];

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10npm lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Enviar proposta</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">Descreva o serviço desejado</h1>
              <p className="mt-2 text-sm text-slate-600">Adicione detalhes para que o prestador entenda o trabalho e envie um orçamento preciso.</p>
            </div>

            <form className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900">Descrição do serviço</label>
                <textarea
                  id="description"
                  rows={5}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="Explique o que precisa ser feito, o local e o prazo desejado"
                />
              </div>

              <Input label="Endereço" name="address" placeholder="Rua das Flores, 123 - São Paulo, SP" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-slate-900">Data desejada</label>
                  <input
                    id="date"
                    type="date"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <Input label="Orçamento estimado" name="budget" type="number" placeholder="R$ 800,00" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Todas as propostas são enviadas diretamente ao prestador.</p>
                <Button type="submit" variant="primary">Enviar proposta</Button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dados do prestador</p>
              <div className="mt-5 space-y-3">
                <p className="text-lg font-semibold text-[var(--color-navy)]">{professional.nome}</p>
                <p className="text-sm text-slate-600">{professional.bio}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avaliação</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">{professional.avaliacaoMedia} ★</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Serviços</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">{professional.totalServicos}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dica</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">Descreva o máximo possível. Detalhes sobre local, prazo e materiais ajudam o prestador a entregar um orçamento mais preciso.</p>
            </div>

            <button
              onClick={() => navigate('/home')}
              className="block w-full rounded-3xl bg-[var(--color-primary)]/10 px-5 py-4 text-sm font-semibold text-[var(--color-navy)] hover:bg-[var(--color-primary)]/15"
            >
              Voltar ao perfil do profissional
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
