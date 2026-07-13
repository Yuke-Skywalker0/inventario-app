import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import './BarcodeScanner.css';

// Fallback manuale sempre presente (Sezione 21: "prevedi fallback"): non
// tutti i telefoni hanno una fotocamera funzionante/autorizzata, e la
// scansione può semplicemente non riuscire con luce scarsa o codici rovinati.
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [status, setStatus] = useState('starting'); // starting | scanning | error

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result) => {
          if (result && !cancelled) {
            onDetected(result.getText());
          }
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus('scanning');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[scanner] fotocamera non disponibile:', err.message);
        setCameraError(
          'Fotocamera non disponibile (permesso negato o non presente). Puoi comunque inserire il codice a mano qui sotto.'
        );
        setStatus('error');
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  function handleManualSubmit(e) {
    e.preventDefault();
    if (manualCode.trim()) {
      onDetected(manualCode.trim());
    }
  }

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span>Scansiona codice</span>
        <button type="button" onClick={onClose} aria-label="Chiudi">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="scanner-video-wrap">
        {status !== 'error' && <video ref={videoRef} className="scanner-video" muted playsInline />}
        {status === 'starting' && <p className="scanner-hint">Avvio fotocamera…</p>}
        {status === 'scanning' && <div className="scanner-frame" aria-hidden="true" />}
        {cameraError && <p className="scanner-error">{cameraError}</p>}
      </div>

      <form onSubmit={handleManualSubmit} className="scanner-manual">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Oppure inserisci il codice a mano"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <button type="submit">OK</button>
      </form>
    </div>
  );
}
