export default function QuantityControl({ quantity, max, onDecrease, onIncrease }) {
  return (
    <div className="qty">
      <button onClick={onDecrease} aria-label="Restar una unidad">−</button>
      <span>{quantity}</span>
      <button onClick={onIncrease} disabled={quantity >= max} aria-label="Sumar una unidad">
        +
      </button>
    </div>
  );
}
