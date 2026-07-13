import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { listLocations } from '../api/locations';
import { compressImage } from '../utils/compressImage';
import { uploadProductImage } from '../api/images';
import './ProductForm.css';

const BarcodeScanner = lazy(() => import('./BarcodeScanner'));

// onSubmit(payload) deve ritornare il prodotto creato/aggiornato.
// onComplete(product) viene chiamato alla fine di tutto il flusso,
// incluso l'eventuale upload della foto scelta in creazione — così chi
// usa il form riceve sempre il prodotto nel suo stato finale, con o
// senza foto.
export default function ProductForm({ initialValue, onSubmit, onComplete, submitLabel }) {
  const isEdit = !!initialValue;

  const [title, setTitle] = useState(initialValue?.title || '');
  const [unit, setUnit] = useState(initialValue?.unit || 'pezzi');
  const [quantity, setQuantity] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationsError, setLocationsError] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [category, setCategory] = useState(initialValue?.category || '');
  const [brand, setBrand] = useState(initialValue?.brand || '');
  const [color, setColor] = useState(initialValue?.color || '');
  const [size, setSize] = useState(initialValue?.size || '');
  const [minQuantity, setMinQuantity] = useState(initialValue?.minQuantity ?? '');
  const [notes, setNotes] = useState(initialValue?.notes || '');
  const [barcode, setBarcode] = useState(initialValue?.barcode || '');
  const [scannerOpen, setScannerOpen] = useState(false);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Attendi…');

  useEffect(() => {
    // La lista ubicazioni serve solo in creazione (per assegnare la
    // quantità iniziale): in modifica la quantità si cambia dalla scheda
    // prodotto, non da qui (vedi Sezione "PUT non tocca mai la quantità").
    if (isEdit) return;
    listLocations()
      .then(setLocations)
      .catch(() => setLocationsError('Impossibile caricare le ubicazioni'));
  }, [isEdit]);

  useEffect(() => {
    // Ripulisce l'URL temporaneo dell'anteprima quando cambia o si esce
    // dal form, per non lasciare oggetti in memoria.
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handlePhotoSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    setBusy(true);
    setBusyLabel('Attendi…');
    try {
      const payload = {
        title,
        unit,
        category,
        brand,
        color,
        size,
        notes,
        barcode,
        minQuantity: minQuantity === '' ? undefined : minQuantity
      };
      if (!isEdit) {
        payload.quantity = quantity === '' ? 0 : quantity;
        payload.locationId = locationId;
      }

      let product = await onSubmit(payload);

      // La foto si carica DOPO che il prodotto esiste (serve il suo id).
      // Se l'upload fallisce, il prodotto resta comunque creato — meglio
      // un prodotto senza foto che nessun prodotto (Sezione 54: modifica
      // minima, non far fallire tutto per un problema secondario).
      if (photoFile) {
        setBusyLabel('Carico la foto…');
        try {
          const compressed = await compressImage(photoFile);
          product = await uploadProductImage(product._id, compressed);
        } catch (photoErr) {
          setError(
            'Prodotto creato, ma la foto non è stata caricata (' +
              (photoErr.message || 'errore sconosciuto') +
              '). Puoi riprovare dalla scheda prodotto.'
          );
        }
      }

      onComplete(product);
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      {!isEdit && (
        <div className="product-photo-picker">
          <button
            type="button"
            className="product-photo-preview"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? <img src={photoPreview} alt="" /> : <CameraIcon />}
          </button>
          <div className="product-photo-actions">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? 'Cambia foto' : 'Aggiungi foto (opzionale)'}
            </button>
            {photoPreview && (
              <button type="button" className="product-photo-remove" onClick={removePhoto}>
                Rimuovi
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
            hidden
          />
        </div>
      )}

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
            <span>Barcode</span>
            <div className="product-barcode-row">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scansiona o inserisci a mano"
              />
              <button type="button" className="product-scan-button" onClick={() => setScannerOpen(true)}>
                Scansiona
              </button>
            </div>
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
        {busy ? busyLabel : submitLabel}
      </button>

      {scannerOpen && (
        <Suspense fallback={null}>
          <BarcodeScanner
            onDetected={(code) => {
              setBarcode(code);
              setScannerOpen(false);
            }}
            onClose={() => setScannerOpen(false)}
          />
        </Suspense>
      )}
    </form>
  );
}

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
