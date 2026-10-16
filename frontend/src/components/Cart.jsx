import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    get('/customers').then(setCustomers);
  }, []);

  useEffect(() => {
    let sum = 0;
    cart.forEach((item) => {
      sum += item.price * item.quantity;
    });
    setTotal(sum);
  }, [cart]);

  const checkout = async () => {
    if (!customerId) {
      alert('Selecciona un cliente');
      return;
    }
    const order = await post('/orders', {
      customerId,
      items: cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    });
    alert(`Pedido creado ✔ Total: $${order.total}`);
    clearCart();
  };

  return (
    <div className="cart">
      <h2>Carrito ({cart.length})</h2>

      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        <option value="">-- Cliente --</option>
        {customers.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} ({c.email})
          </option>
        ))}
      </select>

      {cart.length === 0 && <p className="muted">El carrito está vacío</p>}

      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            <span>{item.name}</span>
            <input type="number" min="1" defaultValue={item.quantity} />
            <span>${item.price * item.quantity}</span>
            <button onClick={() => removeFromCart(item._id)}>✕</button>
          </li>
        ))}
      </ul>

      <p className="total">Total: ${total}</p>
      <button className="primary" onClick={checkout} disabled={cart.length === 0}>
        Finalizar compra
      </button>
    </div>
  );
}
