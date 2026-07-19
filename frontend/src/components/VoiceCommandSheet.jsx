import { useEffect, useState } from 'react';
import { listProducts } from '../api/products';
import { offlineAwareAdjust } from '../offline/offlineActions';
import BottomSheet from './BottomSheet';
import './VoiceCommandSheet.css';

// Sezione 20: "Se esistono più prodotti compatibili, chiedi di
// selezionare quello corretto... Per operazioni distruttive o ambigue,
// MOSTRA CONFERMA." Questo componente copre l'intero flusso: cerca →
// disambigua se serve → scegli ubicazione se serve → conferma → esegui
// (offline-aware, come ogni altra modifica quantità).
export default function VoiceCommandSheet({ command, locationsById, onClose, onApplied }) {
  const [step, setStep] = useState('loading'); // loading | pick-product | pick-location | confirm | error | done
  const [matches, setMatches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listProducts({ q: command.query })
      .then((products) => {
        if (cancelled) return;
        if (products.length === 0) {
          setError(`Nessun prodotto trovato per "${command.query}"`);
          setStep('error');
        } else if (products.length === 1) {
          chooseProduct(products[0]);
        } else {
          setMatches(products);
          setStep('pick-product');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Ricerca non riuscita');
        setStep('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command.query]);

  function chooseProduct(product) {
    setSelectedProduct(product);
    if (command.action === 'remove') {
      const withStock = product.inventory.filter((i) => i.quantity > 0);
      if (withStock.length === 1) {
        setSelectedLocationId(withStock[0].locationId);
        setStep('confirm');
      } else if (withStock.length === 0) {
        setError(`"${product.title}" risulta già esaurito ovunque`);
        setStep('error');
      } else {
        setStep('pick-location');
      }
    } else {
      if (product.inventory.length === 1) {
        setSelectedLocationId(product.inventory[0].locationId);
        setStep('confirm');
      } else {
        setStep('pick-location');
      }
    }
  }

  function chooseLocation(locationId) {
    setSelectedLocationId(locationId);
    setStep('confirm');
  }

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      const delta = command.action === 'remove' ? -command.quantity : command.quantity;
      const updated = await offlineAwareAdjust(selectedProduct, { locationId: selectedLocationId, delta });
      onApplied(updated);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Operazione non riuscita');
      setStep('error');
    } finally {
      setBusy(false);
    }
  }

  const availableLocations =
    command.action === 'remove'
      ? selectedProduct?.inventory.filter((i) => i.quantity > 0) || []
      : Object.values(locationsById).filter((l) => l.active);

  return (
    <BottomSheet open onClose={onClose} title={command.action === 'remove' ? 'Rimuovi' : 'Aggiungi'}>
      <div className="voice-command">
        {step === 'loading' && <p className="voice-command-hint">Cerco &quot;{command.query}&quot;…</p>}

        {step === 'pick-product' && (
          <>
            <p className="voice-command-hint">Quale prodotto intendevi?</p>
            <div className="voice-command-list">
              {matches.map((p) => (
                <button key={p._id} type="button" onClick={() => chooseProduct(p)}>
                  {p.title}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'pick-location' && (
          <>
            <p className="voice-command-hint">In quale ubicazione?</p>
            <div className="voice-command-list">
              {command.action === 'remove'
                ? availableLocations.map((entry) => (
                    <button key={entry.locationId} type="button" onClick={() => chooseLocation(entry.locationId)}>
                      {locationsById[entry.locationId]?.name || 'Ubicazione'} — disponibili {entry.quantity}
                    </button>
                  ))
                : availableLocations.map((loc) => (
                    <button key={loc._id} type="button" onClick={() => chooseLocation(loc._id)}>
                      {loc.name}
                    </button>
                  ))}
            </div>
          </>
        )}

        {step === 'confirm' && selectedProduct && (
          <>
            <p className="voice-command-confirm-text">
              {command.action === 'remove' ? 'Rimuovere' : 'Aggiungere'}{' '}
              <strong>
                {command.quantity} {selectedProduct.unit}
              </strong>{' '}
              {command.action === 'remove' ? 'da' : 'a'}:
              <br />
              <strong>{selectedProduct.title}</strong>
              <br />
              {locationsById[selectedLocationId]?.name || 'Ubicazione'}?
            </p>
            <div className="voice-command-confirm-buttons">
              <button type="button" className="voice-command-cancel" onClick={onClose} disabled={busy}>
                Annulla
              </button>
              <button type="button" className="voice-command-confirm" onClick={handleConfirm} disabled={busy}>
                {busy ? 'Attendi…' : 'Conferma'}
              </button>
            </div>
          </>
        )}

        {step === 'error' && (
          <>
            <p className="voice-command-error">{error}</p>
            <button type="button" className="voice-command-cancel" onClick={onClose}>
              Chiudi
            </button>
          </>
        )}

        {step === 'done' && <p className="voice-command-hint">Fatto ✓</p>}
      </div>
    </BottomSheet>
  );
}
