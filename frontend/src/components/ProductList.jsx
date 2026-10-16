import { useEffect, useState } from 'react';
import { get } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

// Opciones del selector; la API acepta como máximo 100 por página.
const PAGE_SIZES = [20, 50, 100];

// Objetos fijos: si se crearan en cada render, ProductCard (memo) se re-renderizaría siempre.
const CARD_STYLE_LOW = { borderColor: 'orange' };
const CARD_STYLE_OK = { borderColor: '#ddd' };

export default function ProductList() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
    setPageSize(Number(value));
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

      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAdd={addToCart}
            style={product.stock < 5 ? CARD_STYLE_LOW : CARD_STYLE_OK}
          />
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading}>
          Siguiente
        </button>
        <select value={pageSize} onChange={(e) => changePageSize(e.target.value)}>
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} por página
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
