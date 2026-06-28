import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../shared/services/api';

const C = {
  bg: '#111827', surface: '#0d1117', border: '#1f2937',
  text: '#e5e7eb', dim: '#6b7280', green: '#10b981',
};

export default function WeightModal({ date, currentWeight, onClose, onLogged }) {
  const [weight, setWeight] = useState(currentWeight || '');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  async function save() {
    if (!weight || isNaN(weight)) return setError('Enter a valid weight');
    setSaving(true);
    try {
      await api.post(`/logs/${date}/weight`, { weight: Number(weight) });
      onLogged(Number(weight));
      onClose();
    } catch {
      setError('Failed to save weight');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '360px', backgroundColor: C.bg, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.text }}>Log Weight</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer' }}><FiX size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Weight (kg)</label>
          <input
            type="number" step="0.1" min="20" max="300"
            value={weight} onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 72.5"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px 16px', color: C.text, fontSize: '24px', fontWeight: 700, outline: 'none', textAlign: 'center' }}
          />
        </div>

        {error && <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>}

        <button onClick={save} disabled={saving}
          style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Weight'}
        </button>
      </div>
    </div>
  );
}
