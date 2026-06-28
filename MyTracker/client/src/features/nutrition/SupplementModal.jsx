import { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiPlus, FiCheck } from 'react-icons/fi';
import api from '../../shared/services/api';

const C = {
  bg:       '#111827',
  surface:  '#0d1117',
  border:   '#1f2937',
  muted:    '#374151',
  text:     '#e5e7eb',
  dim:      '#6b7280',
  green:    '#10b981',
  greenDim: '#064e3b',
  amber:    '#fbbf24',
};

const STEPS = { LIST: 'list', UPLOAD: 'upload', REVIEW: 'review', QUANTITY: 'quantity' };

export default function SupplementModal({ date, meal, onClose, onAdded }) {
  const [step, setStep]               = useState(STEPS.LIST);
  const [supplements, setSupplements] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [parsed, setParsed]           = useState(null);
  const [quantity, setQuantity]       = useState('');
  const [unit, setUnit]               = useState('');
  const [uploading, setUploading]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/supplements')
      .then(res => setSupplements(res.data.supplements))
      .catch(() => {});
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('label', file);
      const res = await api.post('/supplements/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setParsed(res.data.parsed);
      setStep(STEPS.REVIEW);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse label. Try a clearer image.');
    } finally {
      setUploading(false);
    }
  }

  async function saveAndProceed() {
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/supplements', {
        name:        parsed.name,
        servingSize: parsed.servingSize,
        servingUnit: parsed.servingUnit,
        nutrition:   parsed.nutrition,
        commonUnits: parsed.commonUnits || [],
      });
      const supp = res.data.food;
      setSupplements(prev => {
        const exists = prev.find(s => s._id === supp._id);
        return exists ? prev.map(s => s._id === supp._id ? supp : s) : [...prev, supp];
      });
      selectSupplement(supp);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplement');
    } finally {
      setSaving(false);
    }
  }

  function selectSupplement(supp) {
    setSelected(supp);
    const defaultUnit = supp.commonUnits?.[0]?.unit || supp.servingUnit;
    setUnit(defaultUnit);
    setQuantity('1');
    setStep(STEPS.QUANTITY);
  }

  async function addToMeal() {
    if (!selected || !quantity || !unit) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/logs/${date}/meals/${meal}`, {
        foodId:   selected._id,
        quantity: Number(quantity),
        unit,
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add supplement');
    } finally {
      setSaving(false);
    }
  }

  function getUnitOptions(supp) {
    const opts = [];
    (supp.commonUnits || []).forEach(u => opts.push({ label: u.unit, value: u.unit }));
    opts.push({ label: supp.servingUnit, value: supp.servingUnit });
    return opts;
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
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.text }}>Supplements — {mealLabel}</h2>
            <p style={{ fontSize: '12px', color: C.dim, marginTop: '2px' }}>Add a supplement to this meal</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        {/* STEP: LIST */}
        {step === STEPS.LIST && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            {supplements.length > 0 && (
              <>
                <p style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>YOUR SUPPLEMENTS</p>
                {supplements.map(s => (
                  <button key={s._id} onClick={() => selectSupplement(s)}
                    style={{ textAlign: 'left', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{s.name}</p>
                      <p style={{ fontSize: '12px', color: C.dim, marginTop: '2px' }}>
                        per {s.servingSize}{s.servingUnit} · {s.nutrition.calories} kcal · {s.nutrition.protein}g protein
                      </p>
                    </div>
                    <FiPlus size={16} color={C.green} />
                  </button>
                ))}
              </>
            )}

            <button onClick={() => setStep(STEPS.UPLOAD)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px dashed ${C.muted}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <FiUpload size={22} color={C.amber} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: C.amber }}>Scan New Supplement Label</span>
              <span style={{ fontSize: '12px', color: C.dim }}>Take a photo of the nutrition label — Gemini will read it</span>
            </button>
          </div>
        )}

        {/* STEP: UPLOAD */}
        {step === STEPS.UPLOAD && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />

            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: '100%', padding: '40px 20px', borderRadius: '16px', border: `2px dashed ${C.muted}`, backgroundColor: C.surface, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: uploading ? 0.6 : 1 }}>
              <FiUpload size={32} color={C.amber} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{uploading ? 'Analysing with Gemini...' : 'Upload Label Photo'}</span>
              <span style={{ fontSize: '12px', color: C.dim }}>JPEG, PNG up to 5MB · Free tier: 10 scans/hour</span>
            </button>

            {error && <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>}

            <button onClick={() => setStep(STEPS.LIST)}
              style={{ padding: '11px', borderRadius: '12px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.dim, fontSize: '13px', cursor: 'pointer' }}>
              Back
            </button>
          </div>
        )}

        {/* STEP: REVIEW parsed data */}
        {step === STEPS.REVIEW && parsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flex: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FiCheck size={16} color={C.green} />
                <span style={{ fontSize: '13px', color: C.green, fontWeight: 600 }}>Label scanned successfully</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{parsed.name}</p>
              <p style={{ fontSize: '13px', color: C.dim, marginBottom: '12px' }}>Per {parsed.servingSize}{parsed.servingUnit}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                {[
                  { label: 'Calories', value: parsed.nutrition.calories, unit: 'kcal', color: C.green },
                  { label: 'Protein',  value: parsed.nutrition.protein,  unit: 'g',    color: '#60a5fa' },
                  { label: 'Carbs',    value: parsed.nutrition.carbs,    unit: 'g',    color: '#fbbf24' },
                  { label: 'Fat',      value: parsed.nutrition.fat,      unit: 'g',    color: '#fb7185' },
                ].map(m => (
                  <div key={m.label} style={{ backgroundColor: C.muted, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', fontWeight: 900, color: m.color }}>{m.value}</p>
                    <p style={{ fontSize: '10px', color: C.dim, marginTop: '2px' }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '12px', color: C.dim }}>Review the values above. If they look correct, save and add to your meal.</p>

            {error && <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(STEPS.UPLOAD)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.dim, fontSize: '14px', cursor: 'pointer' }}>
                Rescan
              </button>
              <button onClick={saveAndProceed} disabled={saving}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save & Add to Meal'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: QUANTITY */}
        {step === STEPS.QUANTITY && selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: C.surface, borderRadius: '12px', padding: '14px 16px', border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{selected.name}</p>
              <p style={{ fontSize: '12px', color: C.dim, marginTop: '3px' }}>
                per {selected.servingSize}{selected.servingUnit}: {selected.nutrition.calories} kcal · P {selected.nutrition.protein}g
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Amount</label>
                <input type="number" min="0.1" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)}
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px', color: C.text, fontSize: '14px', outline: 'none' }} />
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
              <button onClick={() => { setSelected(null); setStep(STEPS.LIST); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.dim, fontSize: '14px', cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={addToMeal} disabled={saving || !quantity}
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
