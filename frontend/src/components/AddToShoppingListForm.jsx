import { useEffect, useRef, useState } from 'react';
import { listProducts } from '../api/products';
import './AddToShoppingListForm.css';

export default function AddToShoppingListForm({ onSubmit }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantityToBuy, setQuantityToBuy] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (selected) return; // niente ricerca live dopo aver scelto un prodotto
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const products = await listProducts({ q: query });
        setResults(products);
      } catch {
        /* la ricerca è un aiuto, non blocchiamo il form per un suo errore */
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!selected) {
      setError('Cerca e scegli un prodotto');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ productId: selected._id, quantityToBuy: quantityToBuy || undefined });
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto, riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-shopping-form">
      {!selected ? (
        <label className="add-shopping-field">
          <span>Prodotto</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome…"
            autoFocus
          />
          {results.length > 0 && (
            <div className="add-shopping-results">
              {results.map((p) => (
                <button
                  type="button"
                  key={p._id}
                  className="add-shopping-result"
                  onClick={() => {
                    setSelected(p);
                    setResults([]);
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </label>
      ) : (
        <div className="add-shopping-selected">
          <span>{selected.title}</span>
          <button type="button" onClick={() => setSelected(null)}>
            Cambia
          </button>
        </div>
      )}

      <label className="add-shopping-field">
        <span>Quantità da comprare (opzionale)</span>
        <input
          type="text"
          inputMode="decimal"
          value={quantityToBuy}
          onChange={(e) => setQuantityToBuy(e.target.value)}
          placeholder="Es. 10"
        />
      </label>

      {error && (
        <p className="add-shopping-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="add-shopping-submit" disabled={busy}>
        {busy ? 'Attendi…' : 'Aggiungi alla lista'}
      </button>
    </form>
  );
}
