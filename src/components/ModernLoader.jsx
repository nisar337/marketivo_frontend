/**
 * Modern animated loader. Use size to scale (default 56px).
 * Shows a sweeping gradient arc with a pulsing center dot.
 */
export default function ModernLoader({ size = 56, label = '', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="modern-loader-svg absolute inset-0"
          viewBox="0 0 50 50"
          width={size}
          height={size}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#dbeafe"
            strokeWidth="4"
          />
          <circle
            className="modern-loader-arc"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#mlGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="90 200"
          />
          <defs>
            <linearGradient id="mlGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
        <div
          className="modern-loader-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600 to-green-500 shadow-lg"
          style={{ width: size * 0.22, height: size * 0.22 }}
        />
      </div>
      {label && <p className="text-sm font-medium text-gray-600">{label}</p>}
    </div>
  )
}
