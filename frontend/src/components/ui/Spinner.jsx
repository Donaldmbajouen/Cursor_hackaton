/**
 * Spinner.jsx — Indicateur de chargement
 * Responsable : Dev Frontend
 */
const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export default function Spinner({ size = 'md', label = 'Chargement…', className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 text-slate-500 ${className}`} role="status">
      <span
        className={`animate-spin rounded-full border-brand-500 border-t-transparent ${SIZES[size] || SIZES.md}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
