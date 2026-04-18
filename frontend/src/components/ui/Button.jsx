/**
 * Button.jsx — Bouton stylé Tailwind avec variantes
 * Responsable : Dev Frontend
 */
const VARIANTS = {
  primary:
    'bg-brand-500 text-white shadow-sm hover:bg-brand-600 focus-visible:outline-brand-600',
  secondary:
    'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-surface-muted',
  ghost:
    'bg-transparent text-slate-600 hover:bg-surface-muted hover:text-slate-900',
  danger:
    'bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:outline-red-600',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
