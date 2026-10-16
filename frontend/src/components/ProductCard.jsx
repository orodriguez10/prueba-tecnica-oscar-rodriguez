import { memo } from 'react';

function ProductCard({ product, onAdd, style }) {
  return (
    <div className="card" style={style}>
      <h3>{product.name}</h3>
      <span className="badge">{product.category}</span>
      <p>{product.description}</p>
      <div className="card-footer">
        <strong>${product.price}</strong>
        <small>Stock: {product.stock}</small>
        <button onClick={() => onAdd(product)} disabled={product.stock === 0}>
          Agregar
        </button>
      </div>
    </div>
  );
}

export default memo(ProductCard);
