const VARIANTS = {
  primary:   { backgroundColor: '#10b981', color: '#fff' },
  secondary: { backgroundColor: '#1f2937', color: '#9ca3af' },
  danger:    { backgroundColor: '#dc2626', color: '#fff' },
};

export default function Button({ children, type = 'button', variant = 'primary', loading, className = '', style = {}, ...props }) {
  return (
    <button
      type={type}
      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ ...VARIANTS[variant], ...style }}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
