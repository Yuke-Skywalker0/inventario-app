import { useEffect, useRef, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listProducts, createProduct, adjustQuantity } from '../api/products';
import { listLocations } from '../api/locations';
import BottomSheet from '../components/BottomSheet';
import ProductForm from '../components/ProductForm';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const { setFab } = useOutletContext();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(null); // null = primo caricamento
  const [locationsById, setLocationsById] = useState({});
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const load = useCallback(async (q) => {
    setError('');
    try {
      const data = await listProducts({ q });
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Impossibile caricare i prodotti');
    }
  }, []);

  // Ricerca sempre "a fuoco" e reattiva, ma con un piccolo debounce per
  // non mandare una richiesta ad ogni singolo tasto premuto (Sezione 39).
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(query), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, load]);

  useEffect(() => {
    setFab({ label: 'Nuovo prodotto', onClick: () => setSheetOpen(true) });
    return () => setFab(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listLocations({ includeInactive: true })
      .then((locations) => setLocationsById(Object.fromEntries(locations.map((l) => [l._id, l]))))
      .catch(() => {
        /* non blocca la ricerca: le card mostreranno solo il conteggio ubicazioni */
      });
  }, []);

  async function handleCreate(payload) {
    return createProduct(payload);
  }

  function handleCreateComplete(product) {
    setProducts((prev) => [product, ...(prev || [])]);
    setSheetOpen(false);
  }

  async function handleQuickAdjust(product, locationId, delta) {
    try {
      const updated = await adjustQuantity(product._id, { locationId, delta });
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) {
      // Un errore qui (es. quantità insufficiente) non deve rompere la
      // lista: lo segnaliamo e basta, i dati restano quelli validi.
      alert(err.message || 'Impossibile aggiornare la quantità');
    }
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="home">
      <div className="search-bar">
        <SearchGlyph />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          placeholder="Cerca un prodotto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {error && (
        <div className="home-state home-state-error">
          <p>{error}</p>
          <button type="button" onClick={() => load(query)}>
            Riprova
          </button>
        </div>
      )}

      {!error && products === null && <div className="home-state">Caricamento…</div>}

      {!error && products !== null && products.length === 0 && (
        <div className="home-empty">
          <p className="home-empty-title">
            {hasQuery ? 'Nessun risultato' : 'Non hai ancora prodotti'}
          </p>
          <p className="home-empty-body">
            {hasQuery
              ? 'Prova con un altro termine, oppure aggiungilo ora.'
              : 'Aggiungili con il pulsante + qui sotto.'}
          </p>
        </div>
      )}

      {!error && products !== null && products.length > 0 && (
        <div className="product-list">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              locationsById={locationsById}
              onQuickAdjust={handleQuickAdjust}
            />
          ))}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Nuovo prodotto">
        <ProductForm onSubmit={handleCreate} onComplete={handleCreateComplete} submitLabel="Crea prodotto" />
      </BottomSheet>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
