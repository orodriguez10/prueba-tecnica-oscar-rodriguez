const PAGE_SIZES = [20, 50, 100];

export default function Pagination({ page, total, pageSize, loading, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}>
        Siguiente
      </button>
      <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size} por página
          </option>
        ))}
      </select>
    </div>
  );
}
