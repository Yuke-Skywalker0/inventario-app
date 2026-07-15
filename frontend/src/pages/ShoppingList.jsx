import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listShoppingList, addManualItem, removeManualItem, purchaseItem } from '../api/shoppingList';
import BottomSheet from '../components/BottomSheet';
import PurchaseForm from '../components/PurchaseForm';
import AddToShoppingListForm from '../components/AddToShoppingListForm';
import './ShoppingList.css';

export default function ShoppingList() {
  const { setFab } = useOutletContext();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [purchaseTarget, setPurchaseTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await listShoppingList();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Impossibile caricare la lista');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setFab({ label: 'Aggiungi alla lista', onClick: () => setAddOpen(true) });
    return () => setFab(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddManual(values) {
    await addManualItem(values);
    setAddOpen(false);
    load();
  }

  async function handleRemoveManual(itemId) {
    await removeManualItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function handlePurchase(values) {
    await purchaseItem({
      productId: purchaseTarget.product._id,
      itemId: purchaseTarget.id,
      ...values
    });
    setPurchaseTarget(null);
    load();
  }

  return (
    <div className="shopping-page">
      <h1>Da comprare</h1>

      {error && (
        <div className="shopping-state shopping-state-error">
          <p>{error}</p>
          <button type="button" onClick={load}>
            Riprova
          </button>
        </div>
      )}

      {!error && items === null && <div className="shopping-state">Caricamento…</div>}

      {!error && items !== null && items.length === 0 && (
        <div className="shopping-state">
          <p className="shopping-empty-title">Nessun prodotto da comprare</p>
          <p>
            Compaiono qui i prodotti sotto la scorta minima, oppure puoi aggiungerne uno
            manualmente con il pulsante in basso.
          </p>
        </div>
      )}

      {!error && items !== null && items.length > 0 && (
        <div className="shopping-list">
          {items.map((item) => (
            <ShoppingRow
              key={item.type === 'manual' ? `manual-${item.id}` : `auto-${item.product._id}`}
              item={item}
              onBuy={() => setPurchaseTarget(item)}
              onRemove={item.type === 'manual' ? () => handleRemoveManual(item.id) : null}
            />
          ))}
        </div>
      )}

      <BottomSheet
        open={!!purchaseTarget}
        onClose={() => setPurchaseTarget(null)}
        title="Aggiungi al magazzino"
      >
        {purchaseTarget && <PurchaseForm item={purchaseTarget} onSubmit={handlePurchase} />}
      </BottomSheet>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Aggiungi alla lista">
        <AddToShoppingListForm onSubmit={handleAddManual} />
      </BottomSheet>
    </div>
  );
}

function ShoppingRow({ item, onBuy, onRemove }) {
  const totalQuantity = item.product.inventory?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const isOut = totalQuantity === 0;

  return (
    <div className="shopping-row">
      <div className="shopping-row-main">
        <span className="shopping-row-title">{item.product.title}</span>
        <span className="shopping-row-meta">
          {item.type === 'auto' ? (
            <span className={isOut ? 'is-out' : 'is-low'}>
              {isOut ? 'Esaurito' : `Scorta bassa — ${totalQuantity} ${item.product.unit}`}
            </span>
          ) : (
            <span>Aggiunto manualmente</span>
          )}
          {' · '}
          suggeriti {formatQty(item.suggestedQuantity)} {item.product.unit}
        </span>
      </div>
      <div className="shopping-row-actions">
        {onRemove && (
          <button type="button" className="shopping-row-remove" onClick={onRemove} aria-label="Rimuovi">
            ✕
          </button>
        )}
        <button type="button" className="shopping-row-buy" onClick={onBuy}>
          Aggiungi al magazzino
        </button>
      </div>
    </div>
  );
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}
