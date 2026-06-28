import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const C = {
  bg: '#030712', card: '#111827', surface: '#0d1117',
  border: '#1f2937', muted: '#374151',
  text: '#e5e7eb', textDim: '#6b7280', textBold: '#f9fafb',
  green: '#10b981', greenDim: '#064e3b',
  rose: '#f87171',
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  backgroundColor: C.surface, border: `1px solid ${C.border}`,
  borderRadius: '12px', padding: '13px 16px',
  color: C.text, fontSize: '15px', outline: 'none',
  transition: 'border-color 0.15s',
};

function Field({ label, name, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required autoComplete={autoComplete}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = C.green}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

export default function Register() {
  const { register }  = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate('/setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: `radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.07) 0%, ${C.bg} 65%)` }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: C.greenDim, border: `1px solid #065f46`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: C.green }}>MT</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: C.textBold, margin: 0, letterSpacing: '-0.3px' }}>Create account</h1>
            <p style={{ fontSize: '14px', color: C.textDim, marginTop: '5px' }}>Start tracking with MyTracker</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Name"             name="name"     value={form.name}     onChange={onChange} placeholder="Your name"        autoComplete="name" />
          <Field label="Email"            name="email"    type="email"    value={form.email}    onChange={onChange} placeholder="you@example.com"  autoComplete="email" />
          <Field label="Password"         name="password" type="password" value={form.password} onChange={onChange} placeholder="Min 8 characters"  autoComplete="new-password" />
          <Field label="Confirm Password" name="confirm"  type="password" value={form.confirm}  onChange={onChange} placeholder="Repeat password"    autoComplete="new-password" />

          {error && (
            <div style={{ backgroundColor: '#4c0519', border: '1px solid #9f1239', borderRadius: '10px', padding: '10px 14px' }}>
              <p style={{ fontSize: '13px', color: C.rose, margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ marginTop: '4px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: C.green, color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: C.textDim, margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.green, fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
