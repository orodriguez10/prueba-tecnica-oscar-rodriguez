import { useEffect, useMemo, useState } from 'react';
import { get } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

function sortProducts(products, sortBy) {
  return [...products].sort((a, b) =>
    sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name)
  );
}

// Objetos fijos: si se crearan en cada render, ProductCard (memo) se re-renderizaría siempre.
const CARD_STYLE_LOW = { borderColor: 'orange' };
const CARD_STYLE_OK = { borderColor: '#ddd' };

export default function ProductList() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Espera a que el usuario deje de escribir antes de consultar la API.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    get(`/products?search=${encodeURIComponent(debouncedSearch)}`)
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  // Solo se recalculan cuando cambian los datos o los filtros, no en cada render.
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const sorted = useMemo(
    () =>
      sortProducts(
        products.filter((p) => !category || p.category === category),
        sortBy
      ),
    [products, category, sortBy]
  );

  return (
    <div>
      <div className="toolbar">
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
        </select>
        {loading && <span>Cargando...</span>}
      </div>

      {error && <p className="error">Error cargando productos: {error}</p>}
      <p className="muted">{sorted.length} productos</p>

      <div className="grid">
        {sorted.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAdd={addToCart}
            style={product.stock < 5 ? CARD_STYLE_LOW : CARD_STYLE_OK}
          />
        ))}
      </div>
    </div>
  );
}
