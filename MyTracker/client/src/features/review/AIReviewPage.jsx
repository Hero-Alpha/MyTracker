import { useState, useEffect } from 'react';
import { FiMenu, FiZap, FiCheckCircle, FiAlertCircle, FiList, FiShoppingCart, FiClock, FiRefreshCw } from 'react-icons/fi';
import Sidebar from '../../shared/components/Sidebar';
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
  purple: '#a78bfa', purpleDim: '#2e1065',
};

const card = { backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' };
const sectionLabel = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px', display: 'block' };

function ReviewSection({ label, items, color, dimColor, Icon }) {
  if (!items?.length) return null;
  return (
    <div style={{ ...card }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: dimColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{ ...sectionLabel, color, marginBottom: 0 }}>{label}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ marginTop: '3px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: C.text, lineHeight: 1.55 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CooldownCard({ nextAt, hoursRemaining }) {
  const nextDate = new Date(nextAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#1c1107', border: `1px solid #92400e` }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: C.amberDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FiClock size={18} color={C.amber} />
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: C.amber }}>Next review available {nextDate}</p>
        <p style={{ fontSize: '13px', color: '#d97706', marginTop: '3px' }}>
          {hoursRemaining > 24
            ? `${Math.floor(hoursRemaining / 24)} day${Math.floor(hoursRemaining / 24) !== 1 ? 's' : ''} remaining`
            : `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} remaining`}
        </p>
      </div>
    </div>
  );
}

export default function AIReviewPage() {
  const isMobile                        = useIsMobile();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [review, setReview]             = useState(null);
  const [cooldown, setCooldown]         = useState(null); // { nextAvailableAt, hoursRemaining }
  const [generating, setGenerating]     = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    api.get('/review/latest')
      .then(res => setReview(res.data.review))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    setError('');
    const controller = new AbortController();
    // Kill after 35s client-side — Gemini should respond in <20s
    const killTimer = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await api.post('/review/generate', {}, { signal: controller.signal });
      setReview(res.data.review);
      setCooldown(null);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setError('Gemini is slow right now. Try again in a minute.');
      } else if (err.response?.status === 429) {
        setCooldown({
          nextAvailableAt: err.response.data.nextAvailableAt,
          hoursRemaining:  err.response.data.hoursRemaining,
        });
      } else {
        setError(err.response?.data?.message || 'Failed to generate review. Try again.');
      }
    } finally {
      clearTimeout(killTimer);
      setGenerating(false);
    }
  }

  const reviewDate = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const periodStart = review?.periodStart
    ? new Date(review.periodStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;
  const periodEnd = review?.periodEnd
    ? new Date(review.periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <FiMenu size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: C.textBold, letterSpacing: '-0.3px' }}>AI Weekly Review</h1>
        </div>
        <button
          onClick={generate}
          disabled={generating || !!cooldown}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: (generating || cooldown) ? C.textDim : '#fff', backgroundColor: (generating || cooldown) ? C.muted : C.green, border: 'none', borderRadius: '10px', padding: '9px 18px', cursor: (generating || cooldown) ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
          {generating
            ? <><FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
            : <><FiZap size={14} /> {review ? 'Regenerate' : 'Generate Review'}</>}
        </button>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.textDim, fontSize: '14px' }}>Loading...</div>
        )}

        {cooldown && <CooldownCard {...cooldown} />}
        {error && <p style={{ fontSize: '13px', color: C.rose, textAlign: 'center' }}>{error}</p>}

        {!loading && !review && !generating && (
          <div style={{ ...card, textAlign: 'center', padding: '56px 32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: C.greenDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiZap size={24} color={C.green} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.textBold, marginBottom: '10px' }}>No review yet</h2>
            <p style={{ fontSize: '14px', color: C.textDim, maxWidth: '340px', margin: '0 auto', lineHeight: 1.6 }}>
              Generate your first AI weekly review. Gemini will analyze your nutrition, workouts, and progress and give you personalized feedback.
            </p>
          </div>
        )}

        {generating && (
          <div style={{ ...card, textAlign: 'center', padding: '56px 32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: C.greenDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiZap size={24} color={C.green} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.textBold, marginBottom: '10px' }}>Analyzing your week...</h2>
            <p style={{ fontSize: '14px', color: C.textDim }}>Gemini is reviewing your data. This takes a few seconds.</p>
          </div>
        )}

        {review && !generating && (
          <>
            {/* Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: C.textDim }}>
                Generated on <strong style={{ color: C.textSub }}>{reviewDate}</strong>
              </p>
              {periodStart && (
                <p style={{ fontSize: '12px', color: C.textDim }}>
                  Period: {periodStart} – {periodEnd}
                </p>
              )}
            </div>

            {/* Summary */}
            {review.review?.summary && (
              <div style={{ ...card, background: 'linear-gradient(135deg, #064e3b 0%, #111827 60%)', border: `1px solid #065f46` }}>
                <span style={{ ...sectionLabel, color: C.greenText }}>Summary</span>
                <p style={{ fontSize: '15px', color: C.text, lineHeight: 1.65 }}>{review.review.summary}</p>
              </div>
            )}

            {/* Stats snapshot from payload */}
            {review.payload?.weekSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Days Logged',   value: review.payload.weekSummary.daysLogged,     unit: '/ 7',   color: C.green },
                  { label: 'Avg Calories',  value: review.payload.weekSummary.avgCalories,    unit: 'kcal',  color: C.amber },
                  { label: 'Avg Protein',   value: review.payload.weekSummary.avgProtein,     unit: 'g',     color: C.blue  },
                  { label: 'Cal Adherence', value: review.payload.weekSummary.calorieAdherence, unit: '',    color: C.purple },
                ].map(s => (
                  <div key={s.label} style={{ ...card, padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    {s.unit && <p style={{ fontSize: '11px', color: C.textDim, marginTop: '2px' }}>{s.unit}</p>}
                    <p style={{ fontSize: '11px', color: C.textDim, marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <ReviewSection label="Strengths"        items={review.review?.strengths}          color={C.green}  dimColor={C.greenDim}  Icon={FiCheckCircle} />
            <ReviewSection label="Issues"           items={review.review?.issues}             color={C.rose}   dimColor={C.roseDim}   Icon={FiAlertCircle} />
            <ReviewSection label="Recommendations"  items={review.review?.recommendations}    color={C.blue}   dimColor={C.blueDim}   Icon={FiList} />
            <ReviewSection label="Grocery List"     items={review.review?.grocerySuggestions} color={C.purple} dimColor={C.purpleDim} Icon={FiShoppingCart} />
          </>
        )}
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
