import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiPlus, FiEdit2 } from 'react-icons/fi';
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
  rose:    '#f87171',
};

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const EMPTY_CUSTOM = { name: '', servingSize: '', servingUnit: 'g', calories: '', protein: '', carbs: '', fat: '' };

function numField(label, field, form, setForm, unit = '') {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}{unit && <span style={{ fontWeight: 400 }}> ({unit})</span>}
      </label>
      <input
        type="number" min="0" step="0.1" value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '9px 12px', color: C.text, fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = C.green}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

export default function LogFoodModal({ date, meal, onClose, onAdded, onOpenSupplement }) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [quantity, setQuantity]     = useState('');
  const [unit, setUnit]             = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom]         = useState(EMPTY_CUSTOM);
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError]   = useState('');
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
      await api.post(`/logs/${date}/meals/${meal}`, { foodId: selected._id, quantity: Number(quantity), unit });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add food');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCustom() {
    if (!custom.name.trim()) return setCustomError('Name is required');
    if (!custom.servingSize) return setCustomError('Serving size is required');
    setCustomSaving(true);
    setCustomError('');
    try {
      const res = await api.post('/foods', {
        name: custom.name.trim(),
        servingSize: Number(custom.servingSize),
        servingUnit: custom.servingUnit,
        nutrition: {
          calories: Number(custom.calories) || 0,
          protein:  Number(custom.protein)  || 0,
          carbs:    Number(custom.carbs)    || 0,
          fat:      Number(custom.fat)      || 0,
        },
        category: 'other',
      });
      selectFood(res.data.food);
      setShowCustom(false);
      setCustom(EMPTY_CUSTOM);
    } catch (err) {
      setCustomError(err.response?.data?.message || 'Failed to create food');
    } finally {
      setCustomSaving(false);
    }
  }

  const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);
  const showNoResults = query.trim() && !searching && results.length === 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: C.bg, borderRadius: '20px 20px 0 0', border: `1px solid ${C.border}`, padding: '24px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
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

        {/* Search + results */}
        {!selected && !showCustom && (
          <>
            <div style={{ position: 'relative' }}>
              <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search food... (e.g. roti, egg, paneer)"
                style={{ width: '100%', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px 12px 42px', color: C.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {searching && <p style={{ fontSize: '13px', color: C.dim, textAlign: 'center' }}>Searching...</p>}

            {results.length > 0 && (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px' }}>
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

            {/* No results — offer to add custom */}
            {showNoResults && (
              <div style={{ backgroundColor: C.surface, border: `1px dashed ${C.muted}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: C.dim }}>No results for "<strong style={{ color: C.text }}>{query}</strong>"</p>
                <button
                  onClick={() => { setCustom(f => ({ ...f, name: query.trim() })); setShowCustom(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  <FiEdit2 size={13} />
                  Add "{query.trim()}" as custom food
                </button>
              </div>
            )}

            {/* Always-visible custom + supplement buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setCustom(EMPTY_CUSTOM); setShowCustom(true); }}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px dashed ${C.muted}`, backgroundColor: 'transparent', color: C.dim, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                + Custom food
              </button>
              <button onClick={() => { onClose(); onOpenSupplement(); }}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px dashed ${C.muted}`, backgroundColor: 'transparent', color: C.dim, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                + Add supplement
              </button>
            </div>
          </>
        )}

        {/* Custom food form */}
        {showCustom && !selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.text, margin: 0 }}>Add custom food</h3>
              <button onClick={() => setShowCustom(false)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', display: 'flex' }}>
                <FiX size={16} />
              </button>
            </div>

            {/* Name row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</label>
              <input
                type="text" value={custom.name}
                onChange={e => setCustom(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Homemade dal"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '9px 12px', color: C.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Serving row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {numField('Serving size', 'servingSize', custom, setCustom)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unit</label>
                <select value={custom.servingUnit} onChange={e => setCustom(f => ({ ...f, servingUnit: e.target.value }))}
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '9px 12px', color: C.text, fontSize: '14px', outline: 'none' }}>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="piece">piece</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                </select>
              </div>
            </div>

            {/* Macros */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Nutrition per serving</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
              {numField('Calories', 'calories', custom, setCustom, 'kcal')}
              {numField('Protein', 'protein', custom, setCustom, 'g')}
              {numField('Carbs', 'carbs', custom, setCustom, 'g')}
              {numField('Fat', 'fat', custom, setCustom, 'g')}
            </div>

            {customError && <p style={{ fontSize: '13px', color: C.rose, margin: 0 }}>{customError}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowCustom(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.dim, fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreateCustom} disabled={customSaving}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '14px', fontWeight: 700, cursor: customSaving ? 'not-allowed' : 'pointer', opacity: customSaving ? 0.6 : 1 }}>
                {customSaving ? 'Saving...' : 'Save & Add to Meal'}
              </button>
            </div>
          </div>
        )}

        {/* Quantity picker */}
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

            {error && <p style={{ fontSize: '13px', color: C.rose }}>{error}</p>}

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
