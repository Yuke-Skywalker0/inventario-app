import { useState } from 'react';
import './LocationForm.css';

const TYPES = [
  { value: 'magazzino', label: 'Magazzino' },
  { value: 'furgone', label: 'Furgone' },
  { value: 'deposito', label: 'Deposito' },
  { value: 'garage', label: 'Garage' },
  { value: 'altro', label: 'Altro' }
];

export default function LocationForm({ initialValue, onSubmit, submitLabel }) {
  const [name, setName] = useState(initialValue?.name || '');
  const [type, setType] = useState(initialValue?.type || 'magazzino');
  const [description, setDescription] = useState(initialValue?.description || '');
  const [address, setAddress] = useState(initialValue?.address || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Il nome è obbligatorio');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ name, type, description, address });
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <label className="location-field">
        <span>Nome</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Magazzino principale"
          autoFocus
          required
        />
      </label>

      <label className="location-field">
        <span>Tipo</span>
        <div className="type-chips">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`type-chip${type === t.value ? ' is-selected' : ''}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </label>

      <label className="location-field">
        <span>Descrizione (opzionale)</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Es. scaffalatura sul retro"
        />
      </label>

      <label className="location-field">
        <span>Indirizzo (opzionale)</span>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Solo se serve per raggiungerlo"
        />
      </label>

      {error && (
        <p className="location-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="location-submit" disabled={busy}>
        {busy ? 'Attendi…' : submitLabel}
      </button>
    </form>
  );
}
