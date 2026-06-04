type PortfolioGridProps = {
  images: string[];
  onImageClick?: (image: string) => void;
  className?: string;
};

const PortfolioGrid = ({ images, onImageClick, className = '' }: PortfolioGridProps) => {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {images.map((image) => (
        <button
          key={image}
          type="button"
          onClick={() => onImageClick?.(image)}
          className="group overflow-hidden rounded-[28px] bg-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <img
            src={image}
            alt="Portfólio do profissional"
            className="h-48 w-full object-cover transition duration-200 group-hover:scale-105"
          />
        </button>
      ))}
    </div>
  );
};

export default PortfolioGrid;
