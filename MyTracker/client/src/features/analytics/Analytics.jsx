import { useState, useEffect } from 'react';
import { FiMenu, FiTrendingUp, FiActivity, FiDroplet, FiZap } from 'react-icons/fi';
import Sidebar from '../../shared/components/Sidebar';
import useIsMobile from '../../shared/hooks/useIsMobile';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../shared/services/api';

const C = {
  bg:      '#030712', surface: '#0d1117', card: '#111827',
  border:  '#1f2937', muted:   '#374151',
  text:    '#e5e7eb', textDim: '#6b7280', textSub: '#9ca3af', textBold: '#f9fafb',
  green:   '#10b981', greenDim: '#064e3b', greenText: '#6ee7b7',
  blue:    '#60a5fa', amber: '#fbbf24', rose: '#fb7185', purple: '#a78bfa',
};

const card = { backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' };
const sectionLabel = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim, marginBottom: '16px', display: 'block' };

const PERIODS = [7, 14, 30];

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function StatCard({ label, value, unit, sub, color, Icon }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
        <span style={{ fontSize: '12px', color: C.textDim, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 900, color: value != null ? color : C.textDim, lineHeight: 1 }}>
          {value != null ? value : '—'}
        </span>
        {value != null && unit && <span style={{ fontSize: '13px', color: C.textDim }}>{unit}</span>}
      </div>
      {sub && <p style={{ fontSize: '12px', color: C.textDim }}>{sub}</p>}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: '10px',
  color: C.text,
  fontSize: '12px',
};

export default function Analytics() {
  const { user }        = useAuth();
  const isMobile        = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const targets    = user?.dailyTargets || {};

  const [period, setPeriod] = useState(30);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics?period=${period}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const avg = data?.averages || {};
  const calTarget = targets.calories || data?.targets?.calories || 0;

  // Weight delta display
  const weightChangeStr = data?.weightChange != null
    ? `${data.weightChange > 0 ? '+' : ''}${data.weightChange} kg`
    : null;
  const weightColor = data?.weightChange == null ? C.textDim
    : data.weightChange < 0 ? C.green
    : data.weightChange > 0 ? C.rose
    : C.textSub;

  // Calorie adherence
  const adherencePct = calTarget && data?.daysWithData
    ? Math.round(
        (data.days.filter(d => d.calories != null && Math.abs(d.calories - calTarget) / calTarget <= 0.15).length
         / data.daysWithData) * 100
      )
    : null;

  // Days with weight data for chart (filter nulls for line continuity)
  const weightData = data?.days?.filter(d => d.weight != null).map(d => ({
    date: shortDate(d.date),
    weight: d.weight,
  })) || [];

  // Full days array for calorie/macro charts (show 0 for missing, label as empty)
  const dayData = (data?.days || []).map(d => ({
    date: shortDate(d.date),
    calories: d.calories,
    protein:  d.protein,
    carbs:    d.carbs,
    fat:      d.fat,
  }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <FiMenu size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: C.textBold, letterSpacing: '-0.3px' }}>Analytics</h1>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ fontSize: '13px', fontWeight: 700, padding: '7px 14px', borderRadius: '10px', border: `1px solid ${period === p ? C.green : C.border}`, backgroundColor: period === p ? C.greenDim : 'transparent', color: period === p ? C.green : C.textDim, cursor: 'pointer', transition: 'all 0.15s' }}>
              {p}d
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.textDim, fontSize: '14px' }}>Loading analytics...</div>
        )}

        {!loading && data && (
          <>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px' }}>
              <StatCard
                label="Avg Calories" value={avg.calories || null} unit="kcal"
                sub={calTarget ? `Target: ${calTarget} kcal` : null}
                color={C.green} Icon={FiZap}
              />
              <StatCard
                label="Avg Protein" value={avg.protein || null} unit="g"
                sub={targets.protein ? `Target: ${targets.protein}g` : null}
                color={C.blue} Icon={FiActivity}
              />
              <StatCard
                label={`Weight (${period}d)`}
                value={weightChangeStr}
                unit={null}
                sub={weightData.length ? `${weightData.length} entries logged` : 'No weight data'}
                color={weightColor} Icon={FiTrendingUp}
              />
              <StatCard
                label="Workouts" value={data.workoutDays ?? null} unit={`/ ${period} days`}
                sub={adherencePct != null ? `${adherencePct}% calorie adherence` : null}
                color={C.amber} Icon={FiActivity}
              />
            </div>

            {/* Weight trend */}
            {weightData.length >= 2 && (
              <div style={card}>
                <span style={sectionLabel}>Weight Trend</span>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weightData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      domain={['auto', 'auto']}
                      tickFormatter={v => `${v}kg`}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={v => [`${v} kg`, 'Weight']}
                    />
                    {user?.targetWeight && (
                      <ReferenceLine y={user.targetWeight} stroke={C.green} strokeDasharray="6 3"
                        label={{ value: `Target: ${user.targetWeight}kg`, fill: C.green, fontSize: 11 }} />
                    )}
                    <Line type="monotone" dataKey="weight" stroke={C.blue} strokeWidth={2.5}
                      dot={{ r: 4, fill: C.blue, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Calories chart */}
            <div style={card}>
              <span style={sectionLabel}>Daily Calories</span>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dayData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 11 }} interval={period > 14 ? Math.floor(period / 7) : 0} />
                  <YAxis tick={{ fill: C.textDim, fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => v != null ? [`${Math.round(v)} kcal`, 'Calories'] : ['—', 'Calories']} />
                  {calTarget > 0 && (
                    <ReferenceLine y={calTarget} stroke={C.green} strokeDasharray="6 3"
                      label={{ value: `${calTarget} kcal`, fill: C.green, fontSize: 11, position: 'insideTopRight' }} />
                  )}
                  <Bar dataKey="calories" fill={C.green} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Macros chart */}
            <div style={card}>
              <span style={sectionLabel}>Macro Breakdown (g)</span>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dayData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 11 }} interval={period > 14 ? Math.floor(period / 7) : 0} />
                  <YAxis tick={{ fill: C.textDim, fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => v != null ? [`${Math.round(v)}g`, name] : ['—', name]} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: C.textSub, paddingTop: '12px' }} />
                  <Bar dataKey="protein" stackId="a" fill={C.blue}  radius={[0, 0, 0, 0]} maxBarSize={28} name="Protein" />
                  <Bar dataKey="carbs"   stackId="a" fill={C.amber} radius={[0, 0, 0, 0]} maxBarSize={28} name="Carbs" />
                  <Bar dataKey="fat"     stackId="a" fill={C.rose}  radius={[4, 4, 0, 0]} maxBarSize={28} name="Fat" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* No data fallback */}
            {data.daysWithData === 0 && (
              <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: '15px', color: C.textDim }}>No nutrition data logged in the last {period} days.</p>
                <p style={{ fontSize: '13px', color: C.textDim, marginTop: '8px' }}>Start logging meals on the dashboard to see trends here.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
