export default function AuthField({
  label,
  id,
  error,
  hint,
  className = "",
  children,
  ...props
}) {
  const inputId = id || props.name;

  if (children) {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        {children}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-gray-200 focus:border-blue-500"
        }`}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
