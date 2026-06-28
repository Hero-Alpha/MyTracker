import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiCheck, FiMinus } from 'react-icons/fi';
import api from '../../shared/services/api';

const C = {
  bg: '#111827', surface: '#0d1117', border: '#1f2937', muted: '#374151',
  text: '#e5e7eb', dim: '#6b7280', sub: '#9ca3af',
  green: '#10b981', greenDim: '#064e3b',
  amber: '#fbbf24', amberDim: '#451a03',
  rose: '#fb7185', roseDim: '#4c0519',
};

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed',  bg: C.greenDim, color: C.green, Icon: FiCheck },
  { value: 'partial',   label: 'Partial',    bg: C.amberDim, color: C.amber, Icon: FiMinus },
  { value: 'skipped',   label: 'Skipped',    bg: C.roseDim,  color: C.rose,  Icon: FiX    },
];

const VIEWS = { PICK: 'pick', CREATE: 'create', LOG: 'log' };

function TemplateForm({ initial, onSave, onCancel, saving }) {
  const [name, setName]           = useState(initial?.name || '');
  const [exercises, setExercises] = useState(initial?.exercises || [{ name: '', sets: 3, reps: '8-12' }]);

  function updateEx(i, field, value) {
    setExercises(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }
  function addEx()    { setExercises(prev => [...prev, { name: '', sets: 3, reps: '8-12' }]); }
  function removeEx(i){ setExercises(prev => prev.filter((_, idx) => idx !== i)); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Template Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Push Day, Leg Day"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px', color: C.text, fontSize: '14px', outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>EXERCISES</label>
        {exercises.map((ex, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 32px', gap: '8px', alignItems: 'center' }}>
            <input value={ex.name} onChange={e => updateEx(i, 'name', e.target.value)} placeholder="Exercise name"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 12px', color: C.text, fontSize: '13px', outline: 'none' }} />
            <input type="number" value={ex.sets} onChange={e => updateEx(i, 'sets', Number(e.target.value))} placeholder="Sets"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 8px', color: C.text, fontSize: '13px', outline: 'none', textAlign: 'center' }} />
            <input value={ex.reps} onChange={e => updateEx(i, 'reps', e.target.value)} placeholder="Reps"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 8px', color: C.text, fontSize: '13px', outline: 'none', textAlign: 'center' }} />
            <button onClick={() => removeEx(i)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: C.dim, marginTop: '2px' }}>
          <span style={{ color: C.dim }}>Sets · Reps (e.g. 8-12 or 10)</span>
        </div>
        <button onClick={addEx} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: `1px dashed ${C.muted}`, borderRadius: '8px', padding: '9px', color: C.dim, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          <FiPlus size={14} /> Add Exercise
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.dim, fontSize: '14px', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={() => onSave({ name, exercises: exercises.filter(e => e.name.trim()) })}
          disabled={!name.trim() || saving}
          style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}

export default function LogWorkoutModal({ date, onClose, onLogged }) {
  const [view, setView]             = useState(VIEWS.PICK);
  const [templates, setTemplates]   = useState([]);
  const [selected, setSelected]     = useState(null);
  const [status, setStatus]         = useState('completed');
  const [duration, setDuration]     = useState('');
  const [notes, setNotes]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.get('/workouts').then(res => setTemplates(res.data.templates)).catch(() => {});
  }, []);

  async function saveTemplate(data) {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/workouts/${editTarget._id}`, data);
        setTemplates(prev => prev.map(t => t._id === editTarget._id ? res.data.template : t));
      } else {
        const res = await api.post('/workouts', data);
        setTemplates(prev => [...prev, res.data.template]);
      }
      setEditTarget(null);
      setView(VIEWS.PICK);
    } catch { setError('Failed to save template'); }
    finally  { setSaving(false); }
  }

  async function deleteTemplate(id) {
    try {
      await api.delete(`/workouts/${id}`);
      setTemplates(prev => prev.filter(t => t._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {}
  }

  async function logWorkout() {
    setSaving(true);
    setError('');
    try {
      await api.post(`/logs/${date}/workout`, {
        templateId:   selected?._id   || null,
        templateName: selected?.name  || null,
        status,
        duration:     duration ? Number(duration) : null,
        notes,
      });
      onLogged();
      onClose();
    } catch { setError('Failed to log workout'); }
    finally  { setSaving(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: C.bg, borderRadius: '20px 20px 0 0', border: `1px solid ${C.border}`, padding: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.text }}>
            {view === VIEWS.CREATE ? (editTarget ? 'Edit Template' : 'New Template') : 'Log Workout'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer' }}><FiX size={20} /></button>
        </div>

        {/* CREATE / EDIT TEMPLATE */}
        {view === VIEWS.CREATE && (
          <TemplateForm
            initial={editTarget}
            onSave={saveTemplate}
            onCancel={() => { setEditTarget(null); setView(VIEWS.PICK); }}
            saving={saving}
          />
        )}

        {/* PICK TEMPLATE */}
        {view === VIEWS.PICK && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {templates.length === 0 && (
              <p style={{ fontSize: '13px', color: C.dim, textAlign: 'center', padding: '20px 0' }}>No templates yet. Create one below.</p>
            )}
            {templates.map(t => (
              <div key={t._id} style={{ backgroundColor: C.surface, border: `1px solid ${selected?._id === t._id ? C.green : C.border}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setSelected(selected?._id === t._id ? null : t)}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: C.dim, marginTop: '3px' }}>{t.exercises.length} exercises</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {selected?._id === t._id && <FiCheck size={16} color={C.green} />}
                  <button onClick={e => { e.stopPropagation(); setEditTarget(t); setView(VIEWS.CREATE); }}
                    style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '4px 8px' }}>Edit</button>
                  <button onClick={e => { e.stopPropagation(); deleteTemplate(t._id); }}
                    style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={() => { setEditTarget(null); setView(VIEWS.CREATE); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'transparent', border: `1px dashed ${C.muted}`, borderRadius: '12px', padding: '12px', color: C.dim, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
              <FiPlus size={15} /> Create New Template
            </button>

            {/* Status + Log */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600, display: 'block', marginBottom: '8px' }}>STATUS</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setStatus(opt.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${status === opt.value ? opt.color : C.border}`, backgroundColor: status === opt.value ? opt.bg : 'transparent', color: status === opt.value ? opt.color : C.dim, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Duration (min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>Notes</label>
                  <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              {error && <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>}

              <button onClick={logWorkout} disabled={saving}
                style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Logging...' : `Log as ${STATUS_OPTIONS.find(s => s.value === status)?.label}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
