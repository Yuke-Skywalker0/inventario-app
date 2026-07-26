import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { previewInvitation, acceptInvitation } from '../api/invitations';
import './AcceptInvite.css';

const ROLE_LABELS = {
  admin: 'Admin',
  technician: 'Tecnico',
  viewer: 'Solo lettura'
};

// Sezione 36: gestisce sia chi deve ancora registrarsi sia chi è già
// loggato. Se non autenticato, salva il token e rimanda al login/
// registrazione; una volta autenticato, App.jsx (vedi PendingInviteHandler)
// riprende da qui automaticamente.
export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { status, refreshWorkspace } = useAuth();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    previewInvitation(token)
      .then(setPreview)
      .catch((err) => setError(err.message || 'Invito non valido o scaduto'));
  }, [token]);

  useEffect(() => {
    if (status === 'signed-out' && preview) {
      sessionStorage.setItem('pendingInviteToken', token);
    }
  }, [status, preview, token]);

  async function handleAccept() {
    setBusy(true);
    setError('');
    try {
      await acceptInvitation(token);
      sessionStorage.removeItem('pendingInviteToken');
      await refreshWorkspace();
      setDone(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.message || 'Impossibile accettare l\'invito');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="accept-invite-page">
        <p className="accept-invite-error">{error}</p>
        <button type="button" onClick={() => navigate('/')}>
          Vai all'app
        </button>
      </div>
    );
  }

  if (!preview) {
    return <div className="accept-invite-page">Caricamento…</div>;
  }

  if (done) {
    return (
      <div className="accept-invite-page">
        <p className="accept-invite-done">Fatto! Sei entrato in {preview.workspaceName} ✓</p>
      </div>
    );
  }

  return (
    <div className="accept-invite-page">
      <h1>Sei stato invitato</h1>
      <p className="accept-invite-text">
        <strong>{preview.workspaceName}</strong> ti ha invitato come{' '}
        <strong>{ROLE_LABELS[preview.role] || preview.role}</strong>.
      </p>

      {status === 'signed-out' && (
        <>
          <p className="accept-invite-hint">
            Accedi o registrati con l'email <strong>{preview.email}</strong> per continuare —
            tornerai qui automaticamente dopo.
          </p>
          <button type="button" className="accept-invite-button" onClick={() => navigate('/')}>
            Accedi o registrati
          </button>
        </>
      )}

      {status === 'signed-in' && (
        <button type="button" className="accept-invite-button" onClick={handleAccept} disabled={busy}>
          {busy ? 'Attendi…' : 'Accetta invito'}
        </button>
      )}
    </div>
  );
}
