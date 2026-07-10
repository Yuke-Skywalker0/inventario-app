import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product, onQuickAdjust }) {
  const navigate = useNavigate();
  const totalQuantity = product.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const singleLocation = product.inventory.length === 1 ? product.inventory[0] : null;

  const isLow = product.minQuantity != null && totalQuantity <= product.minQuantity && totalQuantity > 0;
  const isOut = totalQuantity === 0;

  return (
    <div className="product-card">
      <button
        type="button"
        className="product-card-main"
        onClick={() => navigate(`/prodotti/${product._id}`)}
      >
        <div className="product-card-text">
          <span className="product-card-title">{product.title}</span>
          {product.category && <span className="product-card-meta">{product.category}</span>}
        </div>
        <div className="product-card-qty">
          <strong className={isOut ? 'is-out' : isLow ? 'is-low' : ''}>
            {formatQty(totalQuantity)}
          </strong>
          <span>{product.unit}</span>
        </div>
      </button>

      {singleLocation && onQuickAdjust && (
        <div className="product-card-quick">
          <button type="button" onClick={() => onQuickAdjust(product, singleLocation.locationId, -1)}>
            −1
          </button>
          <button type="button" onClick={() => onQuickAdjust(product, singleLocation.locationId, 1)}>
            +1
          </button>
        </div>
      )}
    </div>
  );
}

function formatQty(n) {
  return Number.isInteger(n) ? n : n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}
