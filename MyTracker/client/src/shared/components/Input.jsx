export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: '#9ca3af' }}>{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white ${className}`}
        style={{
          backgroundColor: '#1f2937',
          border: `1px solid ${error ? '#f87171' : '#374151'}`,
        }}
        {...props}
      />
      {error && <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>}
    </div>
  );
}
