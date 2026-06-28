import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../shared/services/api';

const C = {
  bg: '#111827', surface: '#0d1117', border: '#1f2937',
  text: '#e5e7eb', dim: '#6b7280', sub: '#9ca3af',
  green: '#10b981', greenDim: '#064e3b', blue: '#60a5fa',
};

const FIELDS = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hip',   label: 'Hip'   },
  { key: 'arm',   label: 'Arm'   },
  { key: 'thigh', label: 'Thigh' },
  { key: 'neck',  label: 'Neck'  },
];

export default function MeasurementsModal({ onClose, onSaved }) {
  const [values, setValues] = useState({ chest: '', waist: '', hip: '', arm: '', thigh: '', neck: '' });
  const [latest, setLatest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/measurements/latest')
      .then(res => {
        if (res.data.measurement) {
          setLatest(res.data.measurement);
          const m = res.data.measurement.measurements;
          setValues({
            chest: m.chest ?? '', waist: m.waist ?? '', hip:   m.hip   ?? '',
            arm:   m.arm   ?? '', thigh: m.thigh ?? '', neck:  m.neck  ?? '',
          });
        }
      })
      .catch(() => {});
  }, []);

  function set(key, val) { setValues(prev => ({ ...prev, [key]: val })); }

  async function save() {
    const measurements = {};
    FIELDS.forEach(f => { if (values[f.key] !== '' && values[f.key] !== null) measurements[f.key] = Number(values[f.key]); });
    if (Object.keys(measurements).length === 0) return setError('Enter at least one measurement');
    setSaving(true);
    setError('');
    try {
      await api.post('/measurements', { measurements });
      onSaved?.();
      onClose();
    } catch {
      setError('Failed to save measurements');
    } finally {
      setSaving(false);
    }
  }

  const latestDate = latest?.date
    ? new Date(latest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '380px', backgroundColor: C.bg, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.text, margin: 0 }}>Body Measurements</h2>
            {latestDate
              ? <p style={{ fontSize: '12px', color: C.dim, marginTop: '3px' }}>Last logged {latestDate}</p>
              : <p style={{ fontSize: '12px', color: C.dim, marginTop: '3px' }}>First time logging</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
            <FiX size={20} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: C.dim, margin: 0 }}>
          All values in <strong style={{ color: C.sub }}>cm</strong>. Leave blank to skip.
        </p>

        {/* Fields — 3 rows × 2 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {FIELDS.map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
              <label style={{ fontSize: '11px', color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {f.label}
              </label>
              <input
                type="number" step="0.1" inputMode="decimal"
                value={values[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={latest?.measurements?.[f.key] != null ? String(latest.measurements[f.key]) : '—'}
                style={{ width: '100%', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '16px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>

        {error && <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>}

        <button
          onClick={save} disabled={saving}
          style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Measurements'}
        </button>
      </div>
    </div>
  );
}
