import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product, locationsById, onQuickAdjust }) {
  const navigate = useNavigate();
  const totalQuantity = product.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const singleLocation = product.inventory.length === 1 ? product.inventory[0] : null;

  const isOut = totalQuantity === 0;
  const isLow = !isOut && product.minQuantity != null && totalQuantity <= product.minQuantity;

  const locationLabel = getLocationLabel(product, locationsById);

  return (
    <div className="product-card">
      <button
        type="button"
        className="product-card-main"
        onClick={() => navigate(`/prodotti/${product._id}`)}
      >
        <div className="product-card-thumb" aria-hidden="true">
          {product.mainImageUrl ? (
            <img src={product.mainImageUrl} alt="" />
          ) : (
            <BoxIcon />
          )}
        </div>

        <div className="product-card-text">
          <span className="product-card-title">{product.title}</span>
          <span className="product-card-meta">
            {product.category && <span>{product.category}</span>}
            {product.category && locationLabel && <span className="dot">·</span>}
            {locationLabel && <span>{locationLabel}</span>}
          </span>
        </div>

        <div className="product-card-qty">
          <div className="product-card-qty-number">
            <strong>{formatQty(totalQuantity)}</strong>
            <span>{product.unit}</span>
          </div>
          {(isOut || isLow) && (
            <span className={`product-card-status ${isOut ? 'is-out' : 'is-low'}`}>
              {isOut ? 'Esaurito' : 'Scorta bassa'}
            </span>
          )}
        </div>
      </button>

      {singleLocation && onQuickAdjust && (
        <div className="product-card-quick">
          <button
            type="button"
            aria-label="Togli 1"
            onClick={() => onQuickAdjust(product, singleLocation.locationId, -1)}
          >
            − 1
          </button>
          <button
            type="button"
            aria-label="Aggiungi 1"
            onClick={() => onQuickAdjust(product, singleLocation.locationId, 1)}
          >
            + 1
          </button>
        </div>
      )}
    </div>
  );
}

function getLocationLabel(product, locationsById) {
  if (!locationsById || product.inventory.length === 0) return null;
  if (product.inventory.length === 1) {
    const loc = locationsById[product.inventory[0].locationId];
    return loc?.name || null;
  }
  return `In ${product.inventory.length} ubicazioni`;
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 8.5 12 13l8-4.5M12 13v7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
