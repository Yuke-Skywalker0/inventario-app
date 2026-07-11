import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct, toggleProductArchived, adjustQuantity, transferProduct } from '../api/products';
import { listLocations } from '../api/locations';
import QuantityStepper from '../components/QuantityStepper';
import BottomSheet from '../components/BottomSheet';
import ProductForm from '../components/ProductForm';
import TransferForm from '../components/TransferForm';
import ProductImage from '../components/ProductImage';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [locationsById, setLocationsById] = useState({});
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustingLocationId, setAdjustingLocationId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [p, locations] = await Promise.all([getProduct(id), listLocations({ includeInactive: true })]);
      setProduct(p);
      setLocationsById(Object.fromEntries(locations.map((l) => [l._id, l])));
    } catch (err) {
      setError(err.message || 'Impossibile caricare il prodotto');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdjust(locationId, delta) {
    setAdjustingLocationId(locationId);
    try {
      const updated = await adjustQuantity(id, { locationId, delta });
      setProduct(updated);
    } catch (err) {
      alert(err.message || 'Impossibile aggiornare la quantità');
    } finally {
      setAdjustingLocationId(null);
    }
  }

  async function handleEditSubmit(payload) {
    return updateProduct(id, payload);
  }

  function handleEditComplete(updated) {
    setProduct(updated);
    setEditOpen(false);
  }

  async function handleTransfer(values) {
    const updated = await transferProduct(id, values);
    setProduct(updated);
    setTransferOpen(false);
  }

  async function handleToggleArchived() {
    const updated = await toggleProductArchived(id);
    setProduct(updated);
  }

  if (error) {
    return (
      <div className="product-detail-state">
        <p>{error}</p>
        <button type="button" onClick={load}>
          Riprova
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="product-detail-state">Caricamento…</div>;
  }

  const totalQuantity = product.inventory.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="product-detail">
      <button type="button" className="product-detail-back" onClick={() => navigate(-1)}>
        ← Indietro
      </button>

      <div className="product-detail-header">
        <ProductImage product={product} onChange={setProduct} />
        <h1>{product.title}</h1>
        {product.category && <p className="product-detail-category">{product.category}</p>}
        <p className="product-detail-total">
          Totale: <strong>{formatQty(totalQuantity)}</strong> {product.unit}
        </p>
      </div>

      {product.archived && (
        <div className="product-detail-archived-banner">Prodotto archiviato</div>
      )}

      <section className="product-detail-section">
        <h2>Quantità per ubicazione</h2>
        {product.inventory.length === 0 && (
          <p className="product-detail-empty">
            Nessuna quantità assegnata. Aggiungine una scegliendo un'ubicazione qui sotto.
          </p>
        )}
        <div className="product-detail-locations">
          {product.inventory.map((entry) => {
            const loc = locationsById[entry.locationId];
            return (
              <div key={entry.locationId} className="product-detail-location">
                <p className="product-detail-location-name">{loc?.name || 'Ubicazione'}</p>
                <QuantityStepper
                  quantity={entry.quantity}
                  unit={product.unit}
                  busy={adjustingLocationId === entry.locationId}
                  onAdjust={(delta) => handleAdjust(entry.locationId, delta)}
                />
              </div>
            );
          })}
        </div>

        <AddLocationPicker
          locations={Object.values(locationsById).filter(
            (l) => l.active && !product.inventory.some((i) => i.locationId === l._id)
          )}
          onAdd={(locationId) => handleAdjust(locationId, 1)}
        />
      </section>

      {(product.brand || product.color || product.size || product.notes) && (
        <section className="product-detail-section">
          <h2>Dettagli</h2>
          <dl className="product-detail-facts">
            {product.brand && (
              <>
                <dt>Marca</dt>
                <dd>{product.brand}</dd>
              </>
            )}
            {product.color && (
              <>
                <dt>Colore</dt>
                <dd>{product.color}</dd>
              </>
            )}
            {product.size && (
              <>
                <dt>Misura</dt>
                <dd>{product.size}</dd>
              </>
            )}
            {product.notes && (
              <>
                <dt>Note</dt>
                <dd>{product.notes}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      <div className="product-detail-actions">
        <button type="button" className="product-detail-edit" onClick={() => setEditOpen(true)}>
          Modifica
        </button>
        {totalQuantity > 0 && (
          <button type="button" className="product-detail-transfer" onClick={() => setTransferOpen(true)}>
            Trasferisci
          </button>
        )}
        <button type="button" className="product-detail-archive" onClick={handleToggleArchived}>
          {product.archived ? 'Riattiva' : 'Archivia'}
        </button>
      </div>

      <BottomSheet open={transferOpen} onClose={() => setTransferOpen(false)} title="Trasferisci">
        <TransferForm product={product} locationsById={locationsById} onSubmit={handleTransfer} />
      </BottomSheet>

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Modifica prodotto">
        <ProductForm initialValue={product} onSubmit={handleEditSubmit} onComplete={handleEditComplete} submitLabel="Salva modifiche" />
      </BottomSheet>
    </div>
  );
}

function AddLocationPicker({ locations, onAdd }) {
  const [open, setOpen] = useState(false);
  if (locations.length === 0) return null;

  return (
    <div className="add-location-picker">
      {!open ? (
        <button type="button" className="add-location-toggle" onClick={() => setOpen(true)}>
          + Aggiungi a un'altra ubicazione
        </button>
      ) : (
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) onAdd(e.target.value);
            setOpen(false);
          }}
        >
          <option value="" disabled>
            Scegli un'ubicazione…
          </option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}
