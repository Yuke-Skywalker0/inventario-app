import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listProducts, createProduct } from '../api/products';
import { offlineAwareAdjust } from '../offline/offlineActions';
import { listLocations } from '../api/locations';
import BottomSheet from '../components/BottomSheet';
import ProductForm from '../components/ProductForm';
import ProductCard from '../components/ProductCard';
import FiltersForm from '../components/FiltersForm';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import './Home.css';

// Caricato solo quando serve davvero (l'utente tocca "scansiona"): la
// libreria di decodifica barcode è pesante, non ha senso scaricarla ad
// ogni apertura dell'app se non viene mai usata (Sezione 39).
const BarcodeScanner = lazy(() => import('../components/BarcodeScanner'));

const STATUS_CHIPS = [
  { value: '', label: 'Tutti' },
  { value: 'low', label: 'Scorta bassa' },
  { value: 'out', label: 'Esauriti' }
];

export default function Home() {
  const { setFab } = useOutletContext();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({ locationId: '', category: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState(null); // null = primo caricamento
  const [locationsById, setLocationsById] = useState({});
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const load = useCallback(async (params) => {
    setError('');
    try {
      const data = await listProducts(params);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Impossibile caricare i prodotti');
    }
  }, []);

  // Ricerca sempre "a fuoco" e reattiva, ma con un piccolo debounce per
  // non mandare una richiesta ad ogni singolo tasto premuto (Sezione 39).
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => load({ q: query, status, ...advancedFilters }),
      250
    );
    return () => clearTimeout(debounceRef.current);
  }, [query, status, advancedFilters, load]);

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

  function handleBarcodeDetected(code) {
    setScannerOpen(false);
    setQuery(code);
  }

  const handleVoiceResult = useCallback((transcript) => {
    setQuery(transcript);
  }, []);

  const speech = useSpeechRecognition({ onResult: handleVoiceResult });

  function handleCreateComplete(product) {
    setProducts((prev) => [product, ...(prev || [])]);
    setSheetOpen(false);
  }

  async function handleQuickAdjust(product, locationId, delta) {
    try {
      const updated = await offlineAwareAdjust(product, { locationId, delta });
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) {
      // Un errore qui (es. quantità insufficiente) non deve rompere la
      // lista: lo segnaliamo e basta, i dati restano quelli validi.
      alert(err.message || 'Impossibile aggiornare la quantità');
    }
  }

  const hasQuery = query.trim().length > 0;
  const activeAdvancedCount = Object.values(advancedFilters).filter(Boolean).length;

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
        <button
          type="button"
          className="search-scan-button"
          onClick={() => setScannerOpen(true)}
          aria-label="Scansiona codice a barre o QR"
        >
          <ScanGlyph />
        </button>
        {speech.supported && (
          <button
            type="button"
            className={`search-mic-button${speech.listening ? ' is-listening' : ''}`}
            onClick={speech.listening ? speech.stop : speech.start}
            aria-label="Cerca con la voce"
          >
            <MicGlyph />
          </button>
        )}
      </div>

      <div className="filter-chips">
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={`filter-chip${status === chip.value ? ' is-selected' : ''}`}
            onClick={() => setStatus(chip.value)}
          >
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          className={`filter-chip filter-chip-more${activeAdvancedCount ? ' is-selected' : ''}`}
          onClick={() => setFiltersOpen(true)}
        >
          Filtri{activeAdvancedCount ? ` (${activeAdvancedCount})` : ''}
        </button>
      </div>

      {error && (
        <div className="home-state home-state-error">
          <p>{error}</p>
          <button type="button" onClick={() => load({ q: query, status, ...advancedFilters })}>
            Riprova
          </button>
        </div>
      )}

      {!error && products === null && <div className="home-state">Caricamento…</div>}

      {!error && products !== null && products.length === 0 && (
        <div className="home-empty">
          <p className="home-empty-title">
            {hasQuery || status || activeAdvancedCount ? 'Nessun risultato' : 'Non hai ancora prodotti'}
          </p>
          <p className="home-empty-body">
            {hasQuery || status || activeAdvancedCount
              ? 'Prova a cambiare termine o filtri.'
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

      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtri">
        <FiltersForm
          value={advancedFilters}
          onApply={(values) => {
            setAdvancedFilters(values);
            setFiltersOpen(false);
          }}
        />
      </BottomSheet>

      {scannerOpen && (
        <Suspense fallback={null}>
          <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScannerOpen(false)} />
        </Suspense>
      )}
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

function MicGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScanGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
