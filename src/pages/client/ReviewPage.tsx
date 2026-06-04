import { useState } from 'react';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';

const ReviewPage = () => {
  const [rating] = useState(5);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Avaliação</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Avaliar Profissional</h1>
          <p className="mt-2 text-sm text-slate-600">Conte como foi o serviço e ajude outros clientes a escolherem com confiança.</p>

          <div className="mt-10 space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Como foi o serviço prestado?</p>
              <StarRating value={rating} readOnly size="lg" />
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="block text-sm font-semibold text-slate-900">Comentário (opcional)</label>
              <textarea
                id="comment"
                rows={6}
                placeholder="Escreva sua experiência..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary">Pular</Button>
              <Button variant="primary">Enviar avaliação</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
