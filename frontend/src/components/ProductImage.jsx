import { useRef, useState } from 'react';
import { compressImage } from '../utils/compressImage';
import { uploadProductImage, deleteProductImage } from '../api/images';
import './ProductImage.css';

export default function ProductImage({ product, onChange }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permette di riselezionare lo stesso file in seguito
    if (!file) return;

    setError('');
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      const updated = await uploadProductImage(product._id, compressed);
      onChange(updated);
    } catch (err) {
      setError(err.message || 'Impossibile caricare la foto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setError('');
    setBusy(true);
    try {
      const updated = await deleteProductImage(product._id);
      onChange(updated);
    } catch (err) {
      setError(err.message || 'Impossibile eliminare la foto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="product-image">
      <div className="product-image-preview">
        {product.mainImageUrl ? <img src={product.mainImageUrl} alt={product.title} /> : <BoxIcon />}
        {busy && <div className="product-image-busy">Attendi…</div>}
      </div>

      <div className="product-image-actions">
        <button
          type="button"
          className="product-image-button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          {product.mainImageUrl ? 'Cambia foto' : 'Aggiungi foto'}
        </button>
        {product.mainImageUrl && (
          <button
            type="button"
            className="product-image-button product-image-remove"
            disabled={busy}
            onClick={handleDelete}
          >
            Rimuovi
          </button>
        )}
      </div>

      {/* capture="environment" apre direttamente la fotocamera posteriore
          su mobile, ma viene ignorato su desktop, dove si apre
          normalmente la selezione file: nessun fallback da gestire a mano. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        hidden
      />

      {error && (
        <p className="product-image-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function BoxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M4 8.5 12 13l8-4.5M12 13v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
