/**
 * Alert.jsx — Bandeau d'information / succès / erreur
 * Responsable : Dev Frontend
 */
const VARIANTS = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export default function Alert({ variant = 'info', title, children, className = '' }) {
  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm ${VARIANTS[variant] || VARIANTS.info} ${className}`}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
    </div>
  );
}
