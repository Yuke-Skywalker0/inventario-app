import { useState } from 'react';
import './QuantityStepper.css';

export default function QuantityStepper({ quantity, unit, onAdjust, busy }) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  function handleCustomSubmit(e) {
    e.preventDefault();
    const n = Number(customValue.replace(',', '.'));
    if (!Number.isNaN(n) && n !== 0) {
      onAdjust(n);
    }
    setCustomValue('');
    setCustomOpen(false);
  }

  return (
    <div className="qty-stepper">
      <div className="qty-stepper-value">
        <strong>{formatQty(quantity)}</strong>
        <span>{unit}</span>
      </div>

      <div className="qty-stepper-buttons">
        <button type="button" disabled={busy} onClick={() => onAdjust(-5)}>
          −5
        </button>
        <button type="button" disabled={busy} onClick={() => onAdjust(-1)}>
          −1
        </button>
        <button type="button" disabled={busy} onClick={() => onAdjust(1)}>
          +1
        </button>
        <button type="button" disabled={busy} onClick={() => onAdjust(5)}>
          +5
        </button>
      </div>

      {!customOpen ? (
        <button type="button" className="qty-stepper-custom-toggle" onClick={() => setCustomOpen(true)}>
          Quantità personalizzata
        </button>
      ) : (
        <form className="qty-stepper-custom-form" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Es. -3 o 12"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            autoFocus
          />
          <button type="submit">OK</button>
        </form>
      )}
    </div>
  );
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}
