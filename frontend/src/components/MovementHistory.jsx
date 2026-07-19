import { useEffect, useState } from 'react';
import { listMovements } from '../api/movements';
import './MovementHistory.css';

const TYPE_LABELS = {
  entrata: 'entrata',
  uscita: 'uscita',
  rettifica: 'rettifica',
  trasferimento: 'trasferimento',
  utilizzo: 'utilizzo',
  danneggiato: 'danneggiato',
  perso: 'perso',
  restituzione: 'restituzione'
};

export default function MovementHistory({ productId, locationsById, unit }) {
  const [movements, setMovements] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || movements !== null) return;
    listMovements(productId)
      .then(setMovements)
      .catch((err) => setError(err.message || 'Impossibile caricare la cronologia'));
  }, [open, movements, productId]);

  return (
    <section className="product-detail-section">
      <button type="button" className="movement-history-toggle" onClick={() => setOpen((v) => !v)}>
        <h2>Cronologia</h2>
        <span>{open ? 'Nascondi' : 'Mostra'}</span>
      </button>

      {open && (
        <div className="movement-history">
          {error && <p className="movement-history-error">{error}</p>}
          {!error && movements === null && <p className="movement-history-empty">Caricamento…</p>}
          {!error && movements !== null && movements.length === 0 && (
            <p className="movement-history-empty">Nessun movimento registrato ancora.</p>
          )}
          {!error &&
            movements !== null &&
            movements.map((m) => (
              <MovementRow key={m._id} movement={m} locationsById={locationsById} unit={unit} />
            ))}
        </div>
      )}
    </section>
  );
}

function MovementRow({ movement, locationsById, unit }) {
  const who = movement.userId?.name || movement.userId?.email || 'Qualcuno';
  const qty = formatQty(Math.abs(movement.delta));
  const locName = locationsById[movement.locationId]?.name || 'ubicazione';

  let text;
  if (movement.type === 'trasferimento') {
    const toName = locationsById[movement.toLocationId]?.name || 'altra ubicazione';
    text = `${who} ha trasferito ${qty} ${unit} da ${locName} a ${toName}`;
  } else if (movement.delta > 0) {
    text = `${who} ha aggiunto ${qty} ${unit} a ${locName}`;
  } else {
    text = `${who} ha rimosso ${qty} ${unit} da ${locName}`;
  }

  return (
    <div className="movement-row">
      <div className="movement-row-dot" data-type={movement.delta > 0 ? 'in' : 'out'} aria-hidden="true" />
      <div className="movement-row-body">
        <p className="movement-row-text">{text}</p>
        <p className="movement-row-meta">
          {formatDate(movement.createdAt)}
          {movement.reason && ` · ${movement.reason}`}
          {movement.note && ` · ${movement.note}`}
          {movement.type !== 'trasferimento' && movement.type !== 'entrata' && movement.type !== 'uscita' && (
            <> · {TYPE_LABELS[movement.type] || movement.type}</>
          )}
        </p>
      </div>
    </div>
  );
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}

function formatDate(iso) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  const timePart = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${datePart}, ${timePart}`;
}
