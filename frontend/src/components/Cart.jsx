import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { useCart } from '../context/CartContext';
import { formatMoney, toCents } from '../format';
import CustomerSelect from './CustomerSelect';
import QuantityControl from './QuantityControl';

export default function Cart() {
  const { cart, removeFromCart, changeQuantity, completeOrder } = useCart();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }

  useEffect(() => {
    get('/customers')
      .then(setCustomers)
      .catch((err) => setMessage({ type: 'error', text: `No se pudieron cargar los clientes: ${err.message}` }));
  }, []);

  // Al empezar un nuevo pedido se oculta el aviso del anterior.
  useEffect(() => {
    if (cart.length > 0) setMessage(null);
  }, [cart]);

  const totalCents = cart.reduce((sum, item) => sum + toCents(item.price) * item.quantity, 0);

  const checkout = async () => {
    if (!customerId) {
      setMessage({ type: 'error', text: 'Selecciona un cliente' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const order = await post('/orders', {
        customerId,
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });
      setMessage({ type: 'ok', text: `Pedido creado. Total: ${formatMoney(order.total)}` });
      completeOrder();
      setCustomerId('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart">
      <h2>Carrito ({cart.length})</h2>

      <CustomerSelect customers={customers} value={customerId} onChange={setCustomerId} />

      {cart.length === 0 && <p className="muted">El carrito está vacío</p>}

      <ul>
        {cart.map((item) => (
          <li key={item._id}>
            <span className="cart-name">{item.name}</span>
            <QuantityControl
              quantity={item.quantity}
              max={item.stock}
              onDecrease={() => changeQuantity(item._id, -1)}
              onIncrease={() => changeQuantity(item._id, 1)}
            />
            <span className="cart-price">{formatMoney((toCents(item.price) * item.quantity) / 100)}</span>
            <button className="icon-btn" onClick={() => removeFromCart(item._id)} aria-label="Quitar del carrito">
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p className="total">Total: {formatMoney(totalCents / 100)}</p>
      {message && <p className={message.type === 'ok' ? 'success' : 'error'}>{message.text}</p>}
      <button className="primary" onClick={checkout} disabled={cart.length === 0 || submitting}>
        {submitting ? 'Procesando...' : 'Finalizar compra'}
      </button>
    </div>
  );
}
