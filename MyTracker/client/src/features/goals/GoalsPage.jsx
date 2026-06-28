import { useState } from 'react';
import { FiMenu, FiCheck, FiTrendingDown, FiMinus, FiTrendingUp } from 'react-icons/fi';
import Sidebar from '../../shared/components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../shared/services/api';
import useIsMobile from '../../shared/hooks/useIsMobile';

const C = {
  bg: '#030712', surface: '#0d1117', card: '#111827',
  border: '#1f2937', muted: '#374151',
  text: '#e5e7eb', textDim: '#6b7280', textSub: '#9ca3af', textBold: '#f9fafb',
  green: '#10b981', greenDim: '#064e3b', greenText: '#6ee7b7',
  blue: '#60a5fa', blueDim: '#172554',
  amber: '#fbbf24', amberDim: '#451a03',
  rose: '#fb7185', roseDim: '#4c0519',
};

const card = { backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' };
const sectionLabel = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: '16px', display: 'block' };

const GOALS = [
  { value: 'lose_weight',  label: 'Lose Weight',  sub: 'Calorie deficit',  Icon: FiTrendingDown, color: C.rose,  dim: C.roseDim  },
  { value: 'maintain',     label: 'Maintain',     sub: 'Stay at target',   Icon: FiMinus,        color: C.amber, dim: C.amberDim },
  { value: 'gain_muscle',  label: 'Gain Muscle',  sub: 'Calorie surplus',  Icon: FiTrendingUp,   color: C.green, dim: C.greenDim },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary',  label: 'Sedentary',         sub: 'Desk job, no exercise'     },
  { value: 'light',      label: 'Lightly Active',     sub: '1–3 days / week'           },
  { value: 'moderate',   label: 'Moderately Active',  sub: '3–5 days / week'           },
  { value: 'active',     label: 'Very Active',        sub: '6–7 days / week'           },
  { value: 'very_active',label: 'Extremely Active',   sub: 'Physical job or 2× training' },
];

function FieldRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', color: C.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
  padding: '11px 14px', color: C.text, fontSize: '15px', fontWeight: 600,
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

export default function GoalsPage() {
  const { user, updateUser } = useAuth();
  const isMobile             = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState('');

  const [goal,          setGoal]          = useState(user?.goal          || 'maintain');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'moderate');
  const [currentWeight, setCurrentWeight] = useState(user?.currentWeight || '');
  const [targetWeight,  setTargetWeight]  = useState(user?.targetWeight  || '');
  const [age,           setAge]           = useState(user?.age           || '');

  const targets = user?.dailyTargets || {};

  async function save() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await api.put('/profile', {
        goal,
        activityLevel,
        ...(currentWeight && { currentWeight: Number(currentWeight) }),
        ...(targetWeight  && { targetWeight:  Number(targetWeight)  }),
        ...(age           && { age:           Number(age)           }),
      });
      updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <FiMenu size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: C.textBold, letterSpacing: '-0.3px' }}>Goals</h1>
        </div>
        <button
          onClick={save} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, color: saved ? C.green : '#fff', backgroundColor: saved ? C.greenDim : saving ? C.muted : C.green, border: `1px solid ${saved ? '#065f46' : 'transparent'}`, borderRadius: '10px', padding: '9px 18px', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {saved ? <><FiCheck size={14} /> Saved</> : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>

        {error && <p style={{ fontSize: '13px', color: C.rose, textAlign: 'center' }}>{error}</p>}

        {/* Goal type */}
        <div style={card}>
          <span style={sectionLabel}>Your Goal</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GOALS.map(({ value, label, sub, Icon, color, dim }) => {
              const active = goal === value;
              return (
                <button key={value} onClick={() => setGoal(value)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${active ? color : C.border}`, backgroundColor: active ? dim : C.surface, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: active ? color + '22' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={active ? color : C.textDim} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: active ? color : C.text }}>{label}</p>
                    <p style={{ fontSize: '12px', color: active ? color + 'aa' : C.textDim, marginTop: '2px' }}>{sub}</p>
                  </div>
                  {active && <FiCheck size={16} color={color} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity level */}
        <div style={card}>
          <span style={sectionLabel}>Activity Level</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ACTIVITY_LEVELS.map(({ value, label, sub }) => {
              const active = activityLevel === value;
              return (
                <button key={value} onClick={() => setActivityLevel(value)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${active ? C.blue : C.border}`, backgroundColor: active ? C.blueDim : C.surface, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: active ? 700 : 500, color: active ? C.blue : C.text }}>{label}</p>
                    <p style={{ fontSize: '12px', color: active ? '#60a5fa88' : C.textDim, marginTop: '1px' }}>{sub}</p>
                  </div>
                  {active && <FiCheck size={15} color={C.blue} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body stats */}
        <div style={card}>
          <span style={sectionLabel}>Body Stats</span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '14px' }}>
            <FieldRow label="Current Weight (kg)">
              <input type="number" step="0.1" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} placeholder={user?.currentWeight || '—'} style={inputStyle} />
            </FieldRow>
            <FieldRow label="Target Weight (kg)">
              <input type="number" step="0.1" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} placeholder={user?.targetWeight || '—'} style={inputStyle} />
            </FieldRow>
            <FieldRow label="Age">
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder={user?.age || '—'} style={inputStyle} />
            </FieldRow>
          </div>
          <p style={{ fontSize: '12px', color: C.textDim, marginTop: '14px' }}>
            These values are used in the Mifflin-St Jeor formula to calculate your daily calorie and macro targets.
          </p>
        </div>

        {/* Current daily targets — read-only result */}
        <div style={{ backgroundColor: C.greenDim, border: `1px solid #065f46`, borderRadius: '16px', padding: '24px' }}>
          <span style={{ ...sectionLabel, color: C.greenText }}>Daily Targets</span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
            {[
              { label: 'Calories', value: targets.calories || 0, unit: 'kcal' },
              { label: 'Protein',  value: targets.protein  || 0, unit: 'g' },
              { label: 'Carbs',    value: targets.carbs    || 0, unit: 'g' },
              { label: 'Fat',      value: targets.fat      || 0, unit: 'g' },
            ].map(t => (
              <div key={t.label} style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{t.value}</p>
                <p style={{ fontSize: '11px', color: '#34d399', marginTop: '3px' }}>{t.unit}</p>
                <p style={{ fontSize: '11px', color: C.greenText, marginTop: '5px', fontWeight: 600 }}>{t.label}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: C.greenText, opacity: 0.7 }}>
            Targets update automatically when you save changes.
          </p>
        </div>

      </main>
    </div>
  );
}
