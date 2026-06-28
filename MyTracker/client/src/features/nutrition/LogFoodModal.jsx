import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiPlus } from 'react-icons/fi';
import api from '../../shared/services/api';

const C = {
  bg:      '#111827',
  surface: '#0d1117',
  border:  '#1f2937',
  muted:   '#374151',
  text:    '#e5e7eb',
  dim:     '#6b7280',
  green:   '#10b981',
  greenDim:'#064e3b',
};

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function LogFoodModal({ date, meal, onClose, onAdded, onOpenSupplement }) {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [quantity, setQuantity]   = useState('');
  const [unit, setUnit]           = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const inputRef = useRef(null);

  const debouncedQ = useDebounce(query);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!debouncedQ.trim()) { setResults([]); return; }
    setSearching(true);
    api.get(`/foods/search?q=${encodeURIComponent(debouncedQ)}&type=food`)
      .then(res => setResults(res.data.foods))
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQ]);

  function selectFood(food) {
    setSelected(food);
    const firstCommon = food.commonUnits?.[0];
    if (firstCommon) {
      setUnit(firstCommon.unit);
      setQuantity('1');
    } else {
      setUnit(food.servingUnit);
      setQuantity('100');
    }
    setResults([]);
    setQuery('');
  }

  function getUnitOptions(food) {
    const opts = [];
    (food.commonUnits || []).forEach(u => opts.push({ label: u.unit, value: u.unit }));
    opts.push({ label: food.servingUnit, value: food.servingUnit });
    return opts;
  }

  async function handleAdd() {
    if (!selected || !quantity || !unit) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/logs/${date}/meals/${meal}`, {
        foodId: selected._id,
        quantity: Number(quantity),
        unit,
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add food');
    } finally {
      setSaving(false);
    }
  }

  const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: C.bg, borderRadius: '20px 20px 0 0', border: `1px solid ${C.border}`, padding: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '16px' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.text }}>Add to {mealLabel}</h2>
            <p style={{ fontSize: '12px', color: C.dim, marginTop: '2px' }}>{date}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Search */}
        {!selected && (
          <>
            <div style={{ position: 'relative' }}>
              <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search food... (e.g. roti, egg, paneer)"
                style={{ width: '100%', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px 12px 42px', color: C.text, fontSize: '14px', outline: 'none' }}
              />
            </div>

            {searching && <p style={{ fontSize: '13px', color: C.dim, textAlign: 'center' }}>Searching...</p>}

            {results.length > 0 && (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px' }}>
                {results.map(food => (
                  <button key={food._id} onClick={() => selectFood(food)}
                    style={{ textAlign: 'left', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{food.name}</p>
                      <p style={{ fontSize: '12px', color: C.dim, marginTop: '2px' }}>
                        per {food.servingSize}{food.servingUnit} · {food.nutrition.calories} kcal · {food.nutrition.protein}g protein
                      </p>
                    </div>
                    <FiPlus size={16} color={C.green} />
                  </button>
                ))}
              </div>
            )}

            {query.trim() && !searching && results.length === 0 && (
              <p style={{ fontSize: '13px', color: C.dim, textAlign: 'center' }}>No results for "{query}"</p>
            )}

            {/* Add supplement button */}
            <button onClick={() => { onClose(); onOpenSupplement(); }}
              style={{ width: '100%', padding: '11px', borderRadius: '12px', border: `1px dashed ${C.muted}`, backgroundColor: 'transparent', color: C.dim, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              + Add Supplement to this meal
            </button>
          </>
        )}

        {/* Quantity picker after food selected */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: C.surface, borderRadius: '12px', padding: '14px 16px', border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{selected.name}</p>
              <p style={{ fontSize: '12px', color: C.dim, marginTop: '3px' }}>
                per {selected.servingSize}{selected.servingUnit}: {selected.nutrition.calories} kcal · P {selected.nutrition.protein}g · C {selected.nutrition.carbs}g · F {selected.nutrition.fat}g
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Quantity</label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={quantity} onChange={e => setQuantity(e.target.value)}
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px', color: C.text, fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)}
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px', color: C.text, fontSize: '14px', outline: 'none' }}>
                  {getUnitOptions(selected).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setSelected(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.dim, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={handleAdd} disabled={saving || !quantity}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Adding...' : 'Add to Meal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
