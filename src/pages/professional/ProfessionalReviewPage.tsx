import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import BottomNav from '../../components/organisms/BottomNav';
import ReviewForm from '../../components/molecules/ReviewForm';
import { auth } from '../../firebase';

const ProfessionalReviewPage = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [avaliadorId, setAvaliadorId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAvaliadorId(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  if (!proposalId) return null;

  if (!avaliadorId) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
        <BottomNav variant="professional" />
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-white p-8 text-center text-sm text-slate-600 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            Você precisa estar autenticado para avaliar.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="professional" />
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <ReviewForm
          proposalId={proposalId}
          avaliadorId={avaliadorId}
          tipo="prestador_para_cliente"
          titulo="Avaliar Cliente"
          descricao="Conte como foi a experiência de trabalhar com este cliente."
          backPath="/prestador/solicitacoes"
        />
      </div>
    </div>
  );
};

export default ProfessionalReviewPage;