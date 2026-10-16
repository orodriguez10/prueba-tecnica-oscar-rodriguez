import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderList from './components/OrderList';
import Stats from './components/Stats';

export default function App() {
  const [tab, setTab] = useState('products');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <CartProvider>
      <header className="header">
        <h1>🛒 Tienda</h1>
        <nav>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
            Productos
          </button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            Pedidos
          </button>
          <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
            Estadísticas
          </button>
        </nav>
        <span className="clock">{now.toLocaleTimeString()}</span>
      </header>

      <main className="layout">
        <section className="content">
          {tab === 'products' && <ProductList />}
          {tab === 'orders' && <OrderList />}
          {tab === 'stats' && <Stats />}
        </section>
        <aside className="sidebar">
          <Cart />
        </aside>
      </main>
    </CartProvider>
  );
}
