import { useEffect, useState } from 'react';
import { listLocations } from '../api/locations';
import './PurchaseForm.css';

export default function PurchaseForm({ item, onSubmit }) {
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState(String(item.suggestedQuantity || 1));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listLocations().then((locs) => {
      setLocations(locs);
      // Se il prodotto è già presente in una sola ubicazione, la
      // preseleziono: è il caso più comune (ricompro lo stesso materiale
      // che tengo sempre nello stesso posto).
      if (item.product.inventory?.length === 1) {
        setLocationId(item.product.inventory[0].locationId);
      } else if (locs.length === 1) {
        setLocationId(locs[0]._id);
      }
    });
  }, [item]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const qty = Number(quantity.replace(',', '.'));
    if (!locationId) {
      setError("Scegli dove mettere la merce");
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setError('Inserisci una quantità valida');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ locationId, quantity: qty });
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="purchase-form">
      <p className="purchase-form-product">{item.product.title}</p>

      <label className="purchase-field">
        <span>Ubicazione</span>
        <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
          <option value="">— Scegli —</option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="purchase-field">
        <span>Quantità acquistata</span>
        <input
          type="text"
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>

      {error && (
        <p className="purchase-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="purchase-submit" disabled={busy}>
        {busy ? 'Attendi…' : 'Aggiungi al magazzino'}
      </button>
    </form>
  );
}
