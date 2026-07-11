import { useState } from 'react';
import './TransferForm.css';

export default function TransferForm({ product, locationsById, onSubmit }) {
  const sourceOptions = product.inventory
    .filter((i) => i.quantity > 0)
    .map((i) => ({ id: i.locationId, name: locationsById[i.locationId]?.name || 'Ubicazione', quantity: i.quantity }));

  const [fromLocationId, setFromLocationId] = useState(sourceOptions[0]?.id || '');
  const [toLocationId, setToLocationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const destinationOptions = Object.values(locationsById).filter(
    (l) => l.active && l._id !== fromLocationId
  );

  const availableAtSource = sourceOptions.find((s) => s.id === fromLocationId)?.quantity ?? 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const qty = Number(quantity.replace(',', '.'));
    if (!fromLocationId || !toLocationId) {
      setError('Scegli origine e destinazione');
      return;
    }
    if (fromLocationId === toLocationId) {
      setError('Origine e destinazione devono essere diverse');
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setError('Inserisci una quantità valida');
      return;
    }
    if (qty > availableAtSource) {
      setError(`Disponibili solo ${availableAtSource} nell'ubicazione scelta`);
      return;
    }

    setBusy(true);
    try {
      await onSubmit({ fromLocationId, toLocationId, quantity: qty, note });
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  if (sourceOptions.length === 0) {
    return <p className="transfer-empty">Non hai quantità disponibili da trasferire.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="transfer-form">
      <label className="transfer-field">
        <span>Da</span>
        <select value={fromLocationId} onChange={(e) => setFromLocationId(e.target.value)}>
          {sourceOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — disponibili {formatQty(s.quantity)}
            </option>
          ))}
        </select>
      </label>

      <label className="transfer-field">
        <span>A</span>
        <select value={toLocationId} onChange={(e) => setToLocationId(e.target.value)} required>
          <option value="">— Scegli destinazione —</option>
          {destinationOptions.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="transfer-field">
        <span>Quantità (disponibili {formatQty(availableAtSource)})</span>
        <div className="transfer-quantity-row">
          <input
            type="text"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Es. 5"
          />
          <button
            type="button"
            className="transfer-all-button"
            onClick={() => setQuantity(String(availableAtSource))}
          >
            Sposta tutto
          </button>
        </div>
      </label>

      <label className="transfer-field">
        <span>Nota (opzionale)</span>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {error && (
        <p className="transfer-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="transfer-submit" disabled={busy}>
        {busy ? 'Attendi…' : 'Trasferisci'}
      </button>
    </form>
  );
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}
