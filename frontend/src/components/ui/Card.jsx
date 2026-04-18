/**
 * Card.jsx — Conteneur visuel standardisé
 * Responsable : Dev Frontend
 */
export default function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
