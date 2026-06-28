import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';

export default function Login() {
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.profileComplete ? '/dashboard' : '/setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#030712' }}>
      <div className="w-full max-w-md p-8 rounded-2xl" style={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}>
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Sign in to MyTracker</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} required />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          No account?{' '}
          <Link to="/register" className="font-medium hover:underline" style={{ color: '#10b981' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
