import { useState, useEffect } from 'react';
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiPackage } from 'react-icons/fi';
import api from '../../shared/services/api';
import Sidebar from '../../shared/components/Sidebar';
import useIsMobile from '../../shared/hooks/useIsMobile';

const C = {
  bg: '#030712', card: '#111827', surface: '#0d1117',
  border: '#1f2937', muted: '#374151',
  text: '#e5e7eb', textDim: '#6b7280', textBold: '#f9fafb',
  green: '#10b981', greenDim: '#064e3b',
  rose: '#f87171', amber: '#fbbf24',
};

const EMPTY_FORM = {
  name: '', servingSize: '', servingUnit: 'g',
  calories: '', protein: '', carbs: '', fat: '', sugar: '',
  scoopGrams: '',
};

function toNum(v) { return v === '' ? 0 : Number(v); }

function buildPayload(form) {
  const payload = {
    name: form.name.trim(),
    servingSize: toNum(form.servingSize),
    servingUnit: form.servingUnit,
    nutrition: {
      calories: toNum(form.calories),
      protein: toNum(form.protein),
      carbs: toNum(form.carbs),
      fat: toNum(form.fat),
      sugar: toNum(form.sugar),
    },
    commonUnits: form.scoopGrams ? [{ unit: '1 scoop', grams: toNum(form.scoopGrams) }] : [],
  };
  return payload;
}

function numInput(label, field, form, setForm, unit = '') {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{unit && <span style={{ color: C.muted, fontWeight: 400 }}> ({unit})</span>}
      </label>
      <input
        type="number" min="0" step="0.1"
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = C.green}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

export default function SupplementsPage() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api.get('/supplements')
      .then(res => setSupplements(res.data.supplements))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  }

  function openEdit(s) {
    setEditingId(s._id);
    setForm({
      name: s.name,
      servingSize: String(s.servingSize),
      servingUnit: s.servingUnit,
      calories: String(s.nutrition.calories),
      protein: String(s.nutrition.protein),
      carbs: String(s.nutrition.carbs),
      fat: String(s.nutrition.fat),
      sugar: String(s.nutrition.sugar || 0),
      scoopGrams: s.commonUnits?.[0]?.grams ? String(s.commonUnits[0].grams) : '',
    });
    setError('');
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSave() {
    if (!form.name.trim()) return setError('Name is required');
    if (!form.servingSize) return setError('Serving size is required');
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload(form);
      if (editingId) {
        const res = await api.put(`/supplements/${editingId}`, payload);
        setSupplements(prev => prev.map(s => s._id === editingId ? res.data.food : s));
      } else {
        const res = await api.post('/supplements', payload);
        setSupplements(prev => {
          const exists = prev.find(s => s._id === res.data.food._id);
          return exists ? prev.map(s => s._id === res.data.food._id ? res.data.food : s) : [...prev, res.data.food];
        });
      }
      cancelForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await api.delete(`/supplements/${id}`);
      setSupplements(prev => prev.filter(s => s._id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <div style={{ padding: isMobile ? '16px' : '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiMenu size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 900, color: C.textBold, margin: 0, letterSpacing: '-0.3px' }}>Supplements</h1>
            <p style={{ fontSize: '12px', color: C.textDim, marginTop: '2px' }}>Manage your supplement library</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <FiPlus size={15} />
          {!isMobile && 'Add New'}
        </button>
      </div>

      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: C.textBold, margin: 0 }}>{editingId ? 'Edit Supplement' : 'New Supplement'}</h2>
              <button onClick={cancelForm} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', display: 'flex' }}>
                <FiX size={18} />
              </button>
            </div>

            {/* Name + Serving */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Whey Protein"
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              {numInput('Serving Size', 'servingSize', form, setForm)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</label>
                <select
                  value={form.servingUnit}
                  onChange={e => setForm(f => ({ ...f, servingUnit: e.target.value }))}
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none' }}>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="scoop">scoop</option>
                </select>
              </div>
            </div>

            {/* Macros */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Nutrition per serving</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: '10px' }}>
                {numInput('Calories', 'calories', form, setForm, 'kcal')}
                {numInput('Protein', 'protein', form, setForm, 'g')}
                {numInput('Carbs', 'carbs', form, setForm, 'g')}
                {numInput('Fat', 'fat', form, setForm, 'g')}
                {numInput('Sugar', 'sugar', form, setForm, 'g')}
              </div>
            </div>

            {/* Scoop */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '12px', alignItems: 'end' }}>
              {numInput('Scoop weight (optional)', 'scoopGrams', form, setForm, 'g per scoop')}
              <p style={{ fontSize: '12px', color: C.textDim, margin: 0 }}>
                If you enter a scoop weight, you can log by scoop instead of grams when adding to a meal.
              </p>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: C.rose, margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={cancelForm}
                style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.textDim, fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                <FiCheck size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p style={{ textAlign: 'center', color: C.textDim, padding: '40px 0', fontSize: '14px' }}>Loading...</p>
        ) : supplements.length === 0 && !showForm ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiPackage size={24} color={C.textDim} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: C.text, margin: 0 }}>No supplements yet</p>
              <p style={{ fontSize: '13px', color: C.textDim, marginTop: '4px' }}>Add your first supplement to start tracking</p>
            </div>
            <button onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              <FiPlus size={14} />
              Add Supplement
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {supplements.map(s => (
              <div key={s._id}
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: C.textBold, margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: '12px', color: C.textDim, marginTop: '3px' }}>
                    per {s.servingSize}{s.servingUnit}
                    {s.commonUnits?.[0] && ` · 1 scoop = ${s.commonUnits[0].grams}g`}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Cal', value: s.nutrition.calories, color: C.green },
                      { label: 'P', value: `${s.nutrition.protein}g`, color: '#60a5fa' },
                      { label: 'C', value: `${s.nutrition.carbs}g`, color: C.amber },
                      { label: 'F', value: `${s.nutrition.fat}g`, color: '#fb7185' },
                    ].map(m => (
                      <span key={m.label} style={{ fontSize: '12px', color: m.color, fontWeight: 700 }}>
                        {m.label} {m.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => openEdit(s)}
                    style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px', color: C.textDim, cursor: 'pointer', display: 'flex' }}>
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}
                    style={{ background: 'none', border: `1px solid #991b1b`, borderRadius: '8px', padding: '7px', color: '#f87171', cursor: 'pointer', display: 'flex', opacity: deletingId === s._id ? 0.5 : 1 }}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
