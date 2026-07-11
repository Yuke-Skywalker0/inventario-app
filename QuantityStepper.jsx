import { useEffect, useState } from 'react';
import { listLocations } from '../api/locations';
import './ProductForm.css';

export default function ProductForm({ initialValue, onSubmit, submitLabel }) {
  const isEdit = !!initialValue;

  const [title, setTitle] = useState(initialValue?.title || '');
  const [unit, setUnit] = useState(initialValue?.unit || 'pezzi');
  const [quantity, setQuantity] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationsError, setLocationsError] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [category, setCategory] = useState(initialValue?.category || '');
  const [brand, setBrand] = useState(initialValue?.brand || '');
  const [color, setColor] = useState(initialValue?.color || '');
  const [size, setSize] = useState(initialValue?.size || '');
  const [minQuantity, setMinQuantity] = useState(initialValue?.minQuantity ?? '');
  const [notes, setNotes] = useState(initialValue?.notes || '');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // La lista ubicazioni serve solo in creazione (per assegnare la
    // quantità iniziale): in modifica la quantità si cambia dalla scheda
    // prodotto, non da qui (vedi Sezione "PUT non tocca mai la quantità").
    if (isEdit) return;
    listLocations()
      .then(setLocations)
      .catch(() => setLocationsError('Impossibile caricare le ubicazioni'));
  }, [isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title,
        unit,
        category,
        brand,
        color,
        size,
        notes,
        minQuantity: minQuantity === '' ? undefined : minQuantity
      };
      if (!isEdit) {
        payload.quantity = quantity === '' ? 0 : quantity;
        payload.locationId = locationId;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <label className="product-field">
        <span>Titolo</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Es. Raccordo multistrato 20mm"
          autoFocus
          required
        />
      </label>

      {!isEdit && (
        <>
          <div className="product-field-row">
            <label className="product-field">
              <span>Quantità iniziale</span>
              <input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="product-field">
              <span>Unità</span>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
          </div>

          <label className="product-field">
            <span>Ubicazione {Number(quantity) > 0 && '(obbligatoria con una quantità)'}</span>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">— Nessuna per ora —</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
            {locationsError && <p className="product-field-hint">{locationsError}</p>}
          </label>
        </>
      )}

      <button
        type="button"
        className="product-details-toggle"
        onClick={() => setDetailsOpen((v) => !v)}
      >
        {detailsOpen ? 'Nascondi altri dettagli' : 'Altri dettagli (opzionali)'}
      </button>

      {detailsOpen && (
        <div className="product-details">
          <div className="product-field-row">
            <label className="product-field">
              <span>Categoria</span>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
            </label>
            <label className="product-field">
              <span>Marca</span>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </label>
          </div>
          <div className="product-field-row">
            <label className="product-field">
              <span>Colore</span>
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            <label className="product-field">
              <span>Misura</span>
              <input type="text" value={size} onChange={(e) => setSize(e.target.value)} />
            </label>
          </div>
          <label className="product-field">
            <span>Quantità minima (per scorte basse)</span>
            <input
              type="text"
              inputMode="decimal"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="Es. 5"
            />
          </label>
          <label className="product-field">
            <span>Note</span>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
      )}

      {error && (
        <p className="product-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="product-submit" disabled={busy}>
        {busy ? 'Attendi…' : submitLabel}
      </button>
    </form>
  );
}
