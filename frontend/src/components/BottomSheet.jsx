import { useEffect } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ open, onClose, title, children }) {
  // Chiudibile con Esc da tastiera (accessibilità, Sezione 43).
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-header">
          <h2>{title}</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Chiudi">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
