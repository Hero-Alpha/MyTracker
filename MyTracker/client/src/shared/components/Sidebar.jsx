import { useNavigate, useLocation } from 'react-router-dom';
import { FiX, FiHome, FiBarChart2, FiZap, FiTarget, FiPackage } from 'react-icons/fi';

const C = {
  surface: '#0d1117', border: '#1f2937',
  text: '#e5e7eb', textSub: '#9ca3af', textBold: '#f9fafb',
  green: '#10b981', greenDim: '#064e3b',
};

const NAV = [
  { path: '/dashboard',   label: 'Dashboard',        Icon: FiHome      },
  { path: '/analytics',   label: 'Analytics',        Icon: FiBarChart2 },
  { path: '/goals',       label: 'Goals',            Icon: FiTarget    },
  { path: '/supplements', label: 'Supplements',      Icon: FiPackage   },
  { path: '/review',      label: 'AI Weekly Review', Icon: FiZap       },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          backgroundColor: 'rgba(0,0,0,0.6)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '232px', zIndex: 41,
          backgroundColor: C.surface, borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: '17px', fontWeight: 900, color: C.textBold, letterSpacing: '-0.3px' }}>MyTracker</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textSub, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV.map(({ path, label, Icon }) => {
            const active = pathname === path;
            return (
              <button
                key={path}
                onClick={() => { navigate(path); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '12px 14px', borderRadius: '10px', border: 'none',
                  backgroundColor: active ? C.greenDim : 'transparent',
                  color: active ? C.green : C.textSub,
                  fontSize: '14px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
