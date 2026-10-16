import { useEffect, useMemo, useState } from 'react';
import { get } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

// Objetos fijos: si se crearan en cada render, ProductCard (memo) se re-renderizaría siempre.
const CARD_STYLE_LOW = { borderColor: 'orange' };
const CARD_STYLE_OK = { borderColor: '#ddd' };

export default function ProductList() {
  const { cart, addToCart, changeQuantity } = useCart();
  // Unidades de cada producto en el carrito, para mostrarlas en su tarjeta.
  const quantities = useMemo(
    () => Object.fromEntries(cart.map((item) => [item._id, item.quantity])),
    [cart]
  );
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Las categorías vienen del servidor, no de los productos de la página actual.
  useEffect(() => {
    get('/products/categories')
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  // Espera a que el usuario deje de escribir antes de consultar la API.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page, limit: pageSize, sort: sortBy });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('category', category);

    setLoading(true);
    setError(null);
    get(`/products?${params}`)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data);
        setTotal(res.total);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    // Si llega una respuesta vieja después de cambiar un filtro, se ignora.
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, category, sortBy]);

  // Cambiar un filtro vuelve a la primera página.
  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  const changePageSize = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const changeSort = (value) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <div>
      <div className="toolbar">
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => changeCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => changeSort(e.target.value)}>
          <option value="name">Nombre</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
        {loading && <span>Cargando...</span>}
      </div>

      {error && <p className="error">Error cargando productos: {error}</p>}
      <p className="muted">{total} productos</p>
      {!loading && !error && products.length === 0 && (
        <p className="muted">No hay productos que coincidan con la búsqueda</p>
      )}

      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            quantity={quantities[product._id] || 0}
            onAdd={addToCart}
            onDecrease={changeQuantity}
            style={product.stock < 5 ? CARD_STYLE_LOW : CARD_STYLE_OK}
          />
        ))}
      </div>

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
