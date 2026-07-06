import { useNavigate } from 'react-router-dom';
import Button from './Button';

type BackButtonProps = {
  className?: string;
};

const BackButton = ({ className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="secondary"
      className={`inline-flex items-center gap-2 px-4 py-3 ${className}`}
      onClick={() => navigate(-1)}
    >
      ← Voltar
    </Button>
  );
};

export default BackButton;
