import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSunrise, FiSun, FiMoon, FiShoppingBag, FiDroplet, FiActivity, FiLogOut, FiCalendar, FiChevronLeft, FiChevronRight, FiTrash2, FiTrendingUp, FiBell, FiMenu } from 'react-icons/fi';
import Sidebar from '../../shared/components/Sidebar';
import useIsMobile from '../../shared/hooks/useIsMobile';
import { useAuth } from '../../context/AuthContext';
import MiniCalendar from '../../shared/components/MiniCalendar';
import LogFoodModal from '../nutrition/LogFoodModal';
import SupplementModal from '../nutrition/SupplementModal';
import LogWorkoutModal from '../workout/LogWorkoutModal';
import WeightModal from '../workout/WeightModal';
import MeasurementsModal from '../workout/MeasurementsModal';
import api from '../../shared/services/api';

const C = {
  bg:        '#030712',
  surface:   '#0d1117',
  card:      '#111827',
  border:    '#1f2937',
  muted:     '#374151',
  textDim:   '#6b7280',
  textSub:   '#9ca3af',
  text:      '#e5e7eb',
  textBold:  '#f9fafb',
  green:     '#10b981',
  greenDim:  '#064e3b',
  greenText: '#6ee7b7',
  blue:      '#60a5fa',
  amber:     '#fbbf24',
  rose:      '#fb7185',
};

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function CalorieRing({ consumed, target }) {
  const size = 172, stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = circumference - pct * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={C.muted} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={C.green} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
          <span style={{ fontSize: '36px', fontWeight: 900, color: C.textBold, lineHeight: 1 }}>{Math.round(consumed)}</span>
          <span style={{ fontSize: '11px', color: C.textDim }}>kcal eaten</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: C.green, marginTop: '2px' }}>{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: 900, color: C.textBold }}>{target}</p>
          <p style={{ fontSize: '11px', color: C.textDim, marginTop: '2px' }}>goal</p>
        </div>
        <div style={{ width: '1px', height: '32px', backgroundColor: C.border }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: 900, color: C.green }}>{Math.max(target - Math.round(consumed), 0)}</p>
          <p style={{ fontSize: '11px', color: C.textDim, marginTop: '2px' }}>remaining</p>
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, current, target, color }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: C.textSub, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '13px', color: C.text }}>{Math.round(current)}g <span style={{ color: C.textDim }}>/ {target}g</span></span>
      </div>
      <div style={{ height: '8px', borderRadius: '99px', backgroundColor: C.muted, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '99px', backgroundColor: color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', Icon: FiSunrise },
  { key: 'lunch',     label: 'Lunch',     Icon: FiSun     },
  { key: 'dinner',    label: 'Dinner',    Icon: FiMoon    },
  { key: 'snacks',    label: 'Snacks',    Icon: FiShoppingBag },
];

const card = { backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' };
const sectionLabel = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: '20px', display: 'block' };

function formatQty(quantity, unit) {
  const isBaseUnit = /^(g|ml|kg|l)$/i.test(unit.trim());
  return isBaseUnit ? `${quantity}${unit}` : `${quantity} × ${unit}`;
}

export default function Dashboard() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const isMobile         = useIsMobile();
  const targets = user?.dailyTargets || {};

  const [selectedDate, setSelectedDate]       = useState(toDateStr(new Date()));
  const [showCalendar, setShowCalendar]        = useState(false);
  const [log, setLog]                          = useState(null);
  const [loading, setLoading]                  = useState(true);
  const [modal, setModal]                      = useState(null);
  const [sidebarOpen, setSidebarOpen]          = useState(false);
  const [measurementsDoneToday, setMeasurementsDoneToday] = useState(null);

  const fetchLog = useCallback(async (date) => {
    setLoading(true);
    try {
      const res = await api.get(`/logs/${date}`);
      setLog(res.data);
    } catch {
      setLog(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLog(selectedDate); }, [selectedDate, fetchLog]);

  // Check if body measurements already logged today (only relevant on 1st of month)
  useEffect(() => {
    const todayStr = toDateStr(new Date());
    const isFirst  = new Date().getDate() === 1;
    if (!isFirst || selectedDate !== todayStr) return;
    api.get('/measurements/latest')
      .then(res => {
        const m = res.data.measurement;
        if (!m) { setMeasurementsDoneToday(false); return; }
        const mDate = new Date(m.date).toISOString().substring(0, 10);
        setMeasurementsDoneToday(mDate === todayStr);
      })
      .catch(() => setMeasurementsDoneToday(false));
  }, [selectedDate]);

  async function removeItem(meal, itemId) {
    try {
      const res = await api.delete(`/logs/${selectedDate}/meals/${meal}/${itemId}`);
      setLog(res.data);
    } catch {}
  }

  async function addWater(amount) {
    try {
      const res = await api.post(`/logs/${selectedDate}/water`, { amount });
      setLog(res.data);
    } catch {}
  }

  const totals  = log?.totals  || { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };
  const water   = log?.water   || { total: 0 };
  const workout = log?.workout || { status: 'not_logged' };

  const today        = new Date();
  const isToday      = selectedDate === toDateStr(today);
  const isFirstOfMonth = isToday && today.getDate() === 1;
  const needsWeight  = isFirstOfMonth && !log?.weight;
  const needsMeasurements = isFirstOfMonth && measurementsDoneToday === false;
  const showMonthlyBanner = needsWeight || needsMeasurements;
  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  function prevDay() {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
  }
  function nextDay() {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    if (d <= today) setSelectedDate(toDateStr(d));
  }

  const WORKOUT_STATUS = {
    not_logged: { label: 'Not logged',  bg: C.muted,    color: C.textSub  },
    completed:  { label: 'Completed',   bg: C.greenDim, color: C.green    },
    partial:    { label: 'Partial',     bg: '#451a03',  color: C.amber    },
    skipped:    { label: '#3b0764',     bg: '#3b0764',  color: '#e879f9'  },
  };
  const ws = WORKOUT_STATUS[workout.status] || WORKOUT_STATUS.not_logged;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: isMobile ? '12px 16px' : '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <FiMenu size={20} />
          </button>
          <h1 style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 900, color: C.textBold, letterSpacing: '-0.3px' }}>MyTracker</h1>
        </div>

        {/* Date navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '2px' : '6px' }}>
          <button onClick={prevDay} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', padding: '6px' }}>
            <FiChevronLeft size={18} />
          </button>
          <button onClick={() => setShowCalendar(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '8px 14px', cursor: 'pointer' }}>
            <FiCalendar size={14} color={C.green} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: isToday ? C.green : C.text }}>
              {isToday ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </button>
          <button onClick={nextDay} disabled={isToday}
            style={{ background: 'none', border: 'none', color: isToday ? C.muted : C.textDim, cursor: isToday ? 'default' : 'pointer', padding: '6px' }}>
            <FiChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          {!isMobile && (
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.textSub, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontWeight: 500 }}>
              <FiLogOut size={14} /> Logout
            </button>
          )}
          {isMobile && (
            <button onClick={logout} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <FiLogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {showCalendar && (
        <MiniCalendar selectedDate={selectedDate} onChange={d => { setSelectedDate(d); setShowCalendar(false); }} onClose={() => setShowCalendar(false)} />
      )}

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>

        {!isToday && (
          <div style={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '12px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: '#a8a29e' }}>Viewing <strong style={{ color: '#e7e5e4' }}>{displayDate}</strong></p>
          </div>
        )}

        {/* Monthly check-in banner — shown on 1st of month until weight + measurements are logged */}
        {showMonthlyBanner && (
          <div style={{ backgroundColor: '#1c1107', border: `1px solid #92400e`, borderRadius: '14px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#451a03', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiBell size={16} color={C.amber} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: C.amber }}>Monthly check-in</p>
                <p style={{ fontSize: '12px', color: '#d97706', marginTop: '2px' }}>
                  {[needsWeight && 'weight', needsMeasurements && 'body measurements'].filter(Boolean).join(' & ')} not logged yet
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {needsWeight && (
                <button onClick={() => setModal({ type: 'weight' })}
                  style={{ fontSize: '12px', fontWeight: 700, color: C.amber, backgroundColor: '#451a03', border: `1px solid #92400e`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Log Weight
                </button>
              )}
              {needsMeasurements && (
                <button onClick={() => setModal({ type: 'measurements' })}
                  style={{ fontSize: '12px', fontWeight: 700, color: C.amber, backgroundColor: '#451a03', border: `1px solid #92400e`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Log Measurements
                </button>
              )}
            </div>
          </div>
        )}

        {/* Row 1: Calories + Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '20px' }}>
          <div style={card}>
            <span style={sectionLabel}>Calories</span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CalorieRing consumed={totals.calories} target={targets.calories || 2000} />
            </div>
          </div>

          <div style={card}>
            <span style={sectionLabel}>Macros</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              <MacroBar label="Protein" current={totals.protein} target={targets.protein || 0} color={C.blue} />
              <MacroBar label="Carbs"   current={totals.carbs}   target={targets.carbs   || 0} color={C.amber} />
              <MacroBar label="Fat"     current={totals.fat}     target={targets.fat     || 0} color={C.rose} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Protein', value: Math.round(totals.protein), color: C.blue  },
                { label: 'Carbs',   value: Math.round(totals.carbs),   color: C.amber },
                { label: 'Fat',     value: Math.round(totals.fat),     color: C.rose  },
              ].map(m => (
                <div key={m.label} style={{ backgroundColor: C.muted, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: m.color }}>{m.value}g</p>
                  <p style={{ fontSize: '11px', color: C.textDim, marginTop: '3px' }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Water + Workout */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '20px' }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={sectionLabel}>Water</span>
              {isToday && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                  {[250, 500].map(ml => (
                    <button key={ml} onClick={() => addWater(ml)}
                      style={{ fontSize: '12px', fontWeight: 700, color: C.blue, backgroundColor: '#172554', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer' }}>
                      +{ml}ml
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
              <FiDroplet size={18} color={C.blue} />
              <span style={{ fontSize: '32px', fontWeight: 900, color: C.textBold }}>{water.total}</span>
              <span style={{ fontSize: '14px', color: C.textDim }}>ml</span>
              <span style={{ fontSize: '13px', color: C.textDim, marginLeft: '4px' }}>/ {targets.water || 2500} ml</span>
            </div>
            <div style={{ height: '10px', borderRadius: '99px', backgroundColor: C.muted, overflow: 'hidden', margin: '16px 0 10px' }}>
              <div style={{ height: '100%', borderRadius: '99px', backgroundColor: C.blue, width: `${Math.min((water.total / (targets.water || 2500)) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '12px', color: C.textDim }}>{Math.round(water.total / 250)} / {Math.round((targets.water || 2500) / 250)} glasses</p>
          </div>

          <div style={card}>
            <span style={sectionLabel}>Workout</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FiActivity size={16} color={C.textDim} />
              <span style={{ fontSize: '13px', fontWeight: 600, backgroundColor: ws.bg, color: ws.color, borderRadius: '99px', padding: '4px 12px' }}>
                {ws.label}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: C.textDim, marginBottom: '24px' }}>
              {workout.templateName || 'No workout logged today'}
              {workout.duration ? ` · ${workout.duration} min` : ''}
            </p>
            {isToday && (
              <button onClick={() => setModal({ type: 'workout' })}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: C.green, backgroundColor: C.greenDim, border: `1px solid #065f46`, cursor: 'pointer' }}>
                {workout.status === 'not_logged' ? 'Log Workout' : 'Update Workout'}
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Weight + Measurements */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '20px' }}>

          <div style={card}>
            <span style={sectionLabel}>Today's Weight</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
              <FiTrendingUp size={18} color={C.green} />
              <span style={{ fontSize: '36px', fontWeight: 900, color: log?.weight ? C.textBold : C.textDim }}>
                {log?.weight || '—'}
              </span>
              {log?.weight && <span style={{ fontSize: '15px', color: C.textDim }}>kg</span>}
            </div>
            {isToday && (
              <button onClick={() => setModal({ type: 'weight' })}
                style={{ width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: C.green, backgroundColor: C.greenDim, border: `1px solid #065f46`, cursor: 'pointer' }}>
                {log?.weight ? 'Update Weight' : 'Log Weight'}
              </button>
            )}
          </div>

          <div style={card}>
            <span style={sectionLabel}>Body Measurements</span>
            <p style={{ fontSize: '13px', color: C.textDim, marginBottom: '20px' }}>
              Chest, waist, arm, thigh & more
            </p>
            <button onClick={() => setModal({ type: 'measurements' })}
              style={{ width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: C.blue, backgroundColor: '#172554', border: `1px solid #1e3a8a`, cursor: 'pointer' }}>
              Log Measurements
            </button>
          </div>
        </div>

        {/* Meals */}
        <div style={card}>
          <span style={sectionLabel}>Today's Meals</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {MEALS.map(({ key, label, Icon }) => {
              const items = log?.meals?.[key] || [];
              const mealCals = items.reduce((s, i) => s + (i.nutrition?.calories || 0), 0);

              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', backgroundColor: C.surface }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={17} color={C.textSub} />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{label}</p>
                        <p style={{ fontSize: '12px', color: C.textDim, marginTop: '2px' }}>
                          {Math.round(mealCals)} kcal · {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isToday && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setModal({ type: 'supplement', meal: key })}
                          style={{ fontSize: '11px', fontWeight: 700, color: C.amber, backgroundColor: '#451a03', border: 'none', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          + Supp
                        </button>
                        <button onClick={() => setModal({ type: 'food', meal: key })}
                          style={{ fontSize: '12px', fontWeight: 700, color: C.green, backgroundColor: C.greenDim, border: 'none', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          + Food
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Logged items */}
                  {items.length > 0 && (
                    <div style={{ marginLeft: '68px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {items.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', backgroundColor: C.border }}>
                          <div>
                            <span style={{ fontSize: '13px', color: C.text, fontWeight: 500 }}>{item.foodName}</span>
                            <span style={{ fontSize: '12px', color: C.textDim, marginLeft: '8px' }}>{formatQty(item.quantity, item.unit)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '12px', color: C.textSub }}>{Math.round(item.nutrition?.calories || 0)} kcal</span>
                            {isToday && (
                              <button onClick={() => removeItem(key, item._id)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', padding: '2px' }}>
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Targets */}
        <div style={{ backgroundColor: C.greenDim, border: `1px solid #065f46`, borderRadius: '16px', padding: '24px' }}>
          <span style={{ ...sectionLabel, color: C.greenText }}>Daily Targets</span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: 'Calories', value: targets.calories || 0, unit: 'kcal' },
              { label: 'Protein',  value: targets.protein  || 0, unit: 'g' },
              { label: 'Carbs',    value: targets.carbs    || 0, unit: 'g' },
              { label: 'Fat',      value: targets.fat      || 0, unit: 'g' },
            ].map(item => (
              <div key={item.label} style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: C.greenText, marginBottom: '6px' }}>{item.label}</p>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{item.value}</p>
                <p style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>{item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {modal?.type === 'food' && (
        <LogFoodModal
          date={selectedDate}
          meal={modal.meal}
          onClose={() => setModal(null)}
          onAdded={() => fetchLog(selectedDate)}
          onOpenSupplement={() => setModal({ type: 'supplement', meal: modal.meal })}
        />
      )}
      {modal?.type === 'supplement' && (
        <SupplementModal
          date={selectedDate}
          meal={modal.meal}
          onClose={() => setModal(null)}
          onAdded={() => fetchLog(selectedDate)}
        />
      )}
      {modal?.type === 'workout' && (
        <LogWorkoutModal
          date={selectedDate}
          onClose={() => setModal(null)}
          onLogged={() => fetchLog(selectedDate)}
        />
      )}
      {modal?.type === 'weight' && (
        <WeightModal
          date={selectedDate}
          currentWeight={log?.weight}
          onClose={() => setModal(null)}
          onLogged={() => fetchLog(selectedDate)}
        />
      )}
      {modal?.type === 'measurements' && (
        <MeasurementsModal
          onClose={() => setModal(null)}
          onSaved={() => setMeasurementsDoneToday(true)}
        />
      )}
    </div>
  );
}
