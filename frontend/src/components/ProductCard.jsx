import { memo } from 'react';
import QuantityControl from './QuantityControl';

function ProductCard({ product, quantity, onAdd, onDecrease, style }) {
  return (
    <div className="card" style={style}>
      <h3>{product.name}</h3>
      <span className="badge">{product.category}</span>
      <p>{product.description}</p>
      <div className="card-footer">
        <strong>${product.price}</strong>
        <small>Stock: {product.stock - quantity}</small>
        {quantity > 0 ? (
          <QuantityControl
            quantity={quantity}
            max={product.stock}
            onDecrease={() => onDecrease(product._id, -1)}
            onIncrease={() => onAdd(product)}
          />
        ) : (
          <button onClick={() => onAdd(product)} disabled={product.stock === 0}>
            Agregar
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);
