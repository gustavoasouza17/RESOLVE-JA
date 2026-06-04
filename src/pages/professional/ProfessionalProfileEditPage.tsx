import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';

const ProfessionalProfileEditPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Editar perfil</p>
            <h1 className="text-3xl font-bold tracking-tight">Complete suas informações profissionais</h1>
            <p className="text-sm text-slate-600">Atualize seu perfil para atrair mais clientes e publicar serviços com confiança.</p>
          </div>

          <form className="mt-10 space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <Input label="Nome completo" name="fullName" placeholder="Carlos Mendes" />
              <Input label="WhatsApp" name="whatsapp" type="tel" placeholder="(11) 98888-0000" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Input label="Categoria principal" name="category" placeholder="Pedreiro" />
              <Input label="Bairros de atendimento" name="neighborhoods" placeholder="Vila Mariana, Moema" />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">Foto de perfil</label>
              <input type="file" accept="image/*" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">Portfólio</label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">Arraste ou selecione imagens</div>
                <div className="rounded-[28px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=80" alt="Portfólio" className="h-36 w-full object-cover" />
                </div>
                <div className="rounded-[28px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80" alt="Portfólio" className="h-36 w-full object-cover" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                <p className="font-semibold text-[var(--color-navy)]">Disponibilidade</p>
                <p className="mt-3 text-sm text-slate-600">Marque os turnos em que você atende: manhã, tarde ou noite.</p>
              </div>
              <div className="space-y-2 rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <span key={day} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">{day}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Exemplo de disponibilidade exibida apenas como layout.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary">Cancelar</Button>
              <Button variant="primary">Salvar alterações</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileEditPage;
