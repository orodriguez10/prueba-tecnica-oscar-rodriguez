import { useEffect, useMemo, useRef, useState } from 'react';

export default function CustomerSelect({ customers, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const ref = useRef(null);

  const selected = customers.find((c) => c._id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(q));
  }, [customers, query]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const choose = (customer) => {
    onChange(customer._id);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="combo" ref={ref}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-label="Cliente"
        placeholder="Buscar cliente por nombre o email..."
        value={open ? query : selected ? `${selected.name} (${selected.email})` : ''}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul className="combo-list" role="listbox">
          {filtered.length === 0 && <li className="combo-empty">Sin resultados</li>}
          {filtered.map((c, i) => (
            <li
              key={c._id}
              role="option"
              aria-selected={c._id === value}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(c);
              }}
            >
              {c.name} <span className="muted">({c.email})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
