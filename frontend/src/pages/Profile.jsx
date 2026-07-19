import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { downloadJsonBackup, downloadCsvExport } from '../api/export';
import './Profile.css';

export default function Profile() {
  const { user, workspace, logout } = useAuth();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

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
      </div>

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
      </section>

      <button type="button" className="profile-logout" onClick={logout}>
        Esci
      </button>
    </div>
  );
}
