/**
 * ShareButton.jsx — Lien + QR + partage
 */
import { useCallback, useMemo, useState } from 'react';

export default function ShareButton({ pollId, label = 'Partager le vote' }) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/vote/${pollId}`;
  }, [pollId]);

  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`,
    [shareUrl],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('[VoteChain] clipboard', e);
    }
  }, [shareUrl]);

  const primaryAction = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'VoteChain', text: 'Rejoignez le vote', url: shareUrl });
        return;
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('[VoteChain] share', e);
      }
    }
    await copyLink();
  }, [shareUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input
          type="text"
          readOnly
          className="input input-readonly"
          value={shareUrl}
          aria-label="Lien du vote"
        />
        <button
          type="button"
          className="btn btn-outline"
          style={{ flexShrink: 0 }}
          onClick={copyLink}
          title="Copier"
        >
          📋
        </button>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        style={{
          width: '100%',
          transition: 'background-color 0.25s ease, transform 0.15s ease',
          ...(copied
            ? { background: 'var(--color-success)', borderColor: 'transparent' }
            : {}),
        }}
        onClick={primaryAction}
      >
        {copied ? '✓ Lien copié !' : label}
      </button>
      <button type="button" className="btn btn-outline" onClick={() => setQrOpen(true)}>
        Nouveau QR Code
      </button>

      {qrOpen && (
        <div
          className="animate-fadeIn"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 16,
          }}
          onClick={() => setQrOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setQrOpen(false)}
          role="presentation"
        >
          <div
            className="card animate-slideUp"
            style={{ maxWidth: 360, width: '100%', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-lg fw-600" style={{ marginBottom: 16 }}>
              QR Code
            </h3>
            <div style={{ textAlign: 'center' }}>
              <img src={qrSrc} alt="QR code du vote" width={200} height={200} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <a
                className="btn btn-primary"
                style={{ flex: 1, textAlign: 'center' }}
                href={qrSrc}
                download={`votechain-${pollId}.png`}
              >
                Télécharger
              </a>
              <button type="button" className="btn btn-outline" onClick={() => setQrOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
