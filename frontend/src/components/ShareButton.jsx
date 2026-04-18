/**
 * ShareButton.jsx — Partage du lien (Web Share API + fallback clipboard)
 * Responsable : Dev Frontend
 */
import { useState } from 'react';
import Button from './ui/Button.jsx';

export default function ShareButton({
  url,
  title = 'VoteChain — Sondage',
  text = "Donnez votre avis sur ce sondage VoteChain",
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  async function handleShare() {
    setError(null);
    const target = url || (typeof window !== 'undefined' ? window.location.href : '');
    if (!target) return;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url: target });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Impossible de copier le lien.');
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Button variant="secondary" size="sm" onClick={handleShare}>
        {copied ? 'Lien copié !' : 'Partager'}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
