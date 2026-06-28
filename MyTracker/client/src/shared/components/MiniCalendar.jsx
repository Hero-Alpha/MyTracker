import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const C = {
  bg:      '#111827',
  border:  '#1f2937',
  surface: '#0d1117',
  text:    '#e5e7eb',
  dim:     '#6b7280',
  green:   '#10b981',
  muted:   '#374151',
};

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MiniCalendar({ selectedDate, onChange, onClose }) {
  const today = new Date();
  const [view, setView] = useState(new Date(selectedDate));

  const year  = view.getFullYear();
  const month = view.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() { setView(new Date(year, month - 1, 1)); }
  function nextMonth() { setView(new Date(year, month + 1, 1)); }

  function selectDay(d) {
    const picked = new Date(year, month, d);
    if (picked > today) return;
    onChange(toDateStr(picked));
    onClose();
  }

  const selectedStr = typeof selectedDate === 'string' ? selectedDate : toDateStr(selectedDate);
  const todayStr    = toDateStr(today);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '64px' }}
      onClick={onClose}>
      <div style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', width: '300px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', padding: '4px' }}>
            <FiChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', padding: '4px' }}>
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: C.dim, fontWeight: 600, padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const dateStr   = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday   = dateStr === todayStr;
            const isSelected = dateStr === selectedStr;
            const isFuture  = new Date(year, month, d) > today;

            return (
              <button key={d} onClick={() => selectDay(d)} disabled={isFuture}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isFuture ? 'default' : 'pointer',
                  fontSize: '13px',
                  fontWeight: isSelected || isToday ? 700 : 400,
                  backgroundColor: isSelected ? C.green : isToday ? C.muted : 'transparent',
                  color: isSelected ? '#fff' : isFuture ? C.muted : C.text,
                  opacity: isFuture ? 0.3 : 1,
                  transition: 'background-color 0.15s',
                }}>
                {d}
              </button>
            );
          })}
        </div>

        <button onClick={() => { onChange(todayStr); onClose(); }}
          style={{ marginTop: '14px', width: '100%', padding: '9px', borderRadius: '10px', border: 'none', backgroundColor: C.muted, color: C.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Go to Today
        </button>
      </div>
    </div>
  );
}
