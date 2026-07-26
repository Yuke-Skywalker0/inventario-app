import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { downloadJsonBackup, downloadCsvExport } from '../api/export';
import { importJsonBackup } from '../api/import';
import { listMyWorkspaces, switchWorkspace } from '../api/workspaces';
import './Profile.css';

const ROLE_LABELS = {
  owner: 'Proprietario',
  admin: 'Admin',
  technician: 'Tecnico',
  viewer: 'Solo lettura'
};

export default function Profile() {
  const { user, workspace, role, logout, refreshWorkspace } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [workspaces, setWorkspaces] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const canManage = role === 'owner' || role === 'admin';

  useEffect(() => {
    listMyWorkspaces()
      .then(setWorkspaces)
      .catch(() => setWorkspaces([]));
  }, []);

  async function handleExport(kind, fn) {
    setError('');
    setBusy(kind);
    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Esportazione non riuscita. Controlla la connessione e riprova.');
    } finally {
      setBusy('');
    }
  }

  async function handleSwitchWorkspace(workspaceId) {
    if (workspaceId === workspace?.id) return;
    setBusy('switch');
    try {
      await switchWorkspace(workspaceId);
      await refreshWorkspace();
    } catch (err) {
      setError(err.message || 'Impossibile cambiare spazio');
    } finally {
      setBusy('');
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const confirmed = window.confirm(
      "Importa SEMPRE come dati nuovi: se hai già prodotti/ubicazioni in questo spazio, " +
        "otterrai dei duplicati. Usalo solo per ripristinare uno spazio vuoto (es. dopo un " +
        "problema). Continuare?"
    );
    if (!confirmed) return;

    setError('');
    setBusy('import');
    try {
      const result = await importJsonBackup(file);
      setImportResult(result);
    } catch (err) {
      setError(err.message || 'Import non riuscito');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="profile">
      <h1>Profilo</h1>

      <div className="profile-card">
        <div className="profile-row">
          <span>Nome</span>
          <strong>{user?.name || '—'}</strong>
        </div>
        <div className="profile-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="profile-row">
          <span>Spazio</span>
          <strong>{workspace?.name}</strong>
        </div>
        <div className="profile-row">
          <span>Il tuo ruolo</span>
          <strong>{ROLE_LABELS[role] || '—'}</strong>
        </div>
      </div>

      {workspaces && workspaces.length > 1 && (
        <section className="profile-section">
          <h2>Cambia spazio</h2>
          <div className="profile-workspace-list">
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`profile-workspace-button${w.id === workspace?.id ? ' is-active' : ''}`}
                onClick={() => handleSwitchWorkspace(w.id)}
                disabled={busy === 'switch'}
              >
                {w.name} <span>({ROLE_LABELS[w.role]})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <button type="button" className="profile-team-button" onClick={() => navigate('/team')}>
        Gestisci team
      </button>

      <section className="profile-export">
        <h2>I tuoi dati</h2>
        <p className="profile-export-hint">
          Scarica una copia dei tuoi dati in qualsiasi momento — non resti mai bloccato
          su questo servizio.
        </p>

        <button
          type="button"
          className="profile-export-button"
          disabled={!!busy}
          onClick={() => handleExport('json', downloadJsonBackup)}
        >
          {busy === 'json' ? 'Preparazione…' : 'Backup completo (JSON)'}
        </button>

        <button
          type="button"
          className="profile-export-button"
          disabled={!!busy}
          onClick={() => handleExport('csv', downloadCsvExport)}
        >
          {busy === 'csv' ? 'Preparazione…' : 'Prodotti per foglio di calcolo (CSV)'}
        </button>

        {error && (
          <p className="profile-export-error" role="alert">
            {error}
          </p>
        )}

        {canManage && (
          <>
            <p className="profile-import-hint">
              Oppure ripristina da un backup JSON precedente:
            </p>
            <button
              type="button"
              className="profile-export-button"
              disabled={!!busy}
              onClick={() => fileInputRef.current?.click()}
            >
              {busy === 'import' ? 'Importazione…' : 'Importa backup (JSON)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              hidden
            />
            {importResult && (
              <p className="profile-import-result">
                Importati: {importResult.locations} ubicazioni, {importResult.products} prodotti,{' '}
                {importResult.movements} movimenti.
              </p>
            )}
          </>
        )}
      </section>

      <button type="button" className="profile-logout" onClick={logout}>
        Esci
      </button>
    </div>
  );
}
