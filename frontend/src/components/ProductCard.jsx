import { memo } from 'react';
import QuantityControl from './QuantityControl';
import { formatMoney } from '../format';

function ProductCard({ product, quantity, onAdd, onDecrease }) {
  const available = product.stock - quantity;

  return (
    <div className="card">
      <span className="badge">{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="card-info">
        <strong className="price">{formatMoney(product.price)}</strong>
        <small className={available < 5 ? 'low-stock' : ''}>
          {available === 0 ? 'Sin stock' : `Stock: ${available}`}
        </small>
      </div>
      <div className="card-action">
        {quantity > 0 ? (
          <QuantityControl
            quantity={quantity}
            max={product.stock}
            onDecrease={() => onDecrease(product._id, -1)}
            onIncrease={() => onAdd(product)}
          />
        ) : (
          <button className="add-btn" onClick={() => onAdd(product)} disabled={product.stock === 0}>
            Agregar
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);
