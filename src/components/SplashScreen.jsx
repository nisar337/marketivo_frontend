import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), 1700)
    const doneTimer = setTimeout(() => onDone?.(), 2200)
    return () => {
      clearTimeout(leaveTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 transition-opacity duration-500 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-green-400/20 blur-3xl animate-pulse"
          style={{ animationDelay: '0.4s' }}
        />
      </div>

      <div className="relative flex flex-col items-center splash-content">
        <div className="splash-logo mb-4 inline-flex items-center justify-center h-28 w-28 rounded-3xl bg-white shadow-2xl ring-4 ring-white/30">
          <svg
            width={88}
            height={88}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Marketivo"
            role="img"
          >
            <path
              d="M24 44S9 29.8 9 18.5C9 10 15.7 3 24 3s15 7 15 15.5C39 29.8 24 44 24 44Z"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M16.5 41.5c-4.1 0-5.8-2.2 0-2.2 3.2 0 3.1 2.2 0 2.2Z" fill="#16a34a" />
            <path d="M31.5 41.5c4.1 0 5.8-2.2 0-2.2-3.2 0-3.1 2.2 0 2.2Z" fill="#16a34a" />
            <g transform="translate(-2 0)">
              <path
                d="M17 14h4l1.5 12.5h11L35 14H21"
                stroke="#16a34a"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M22 17.5h11.2" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M22.6 21h10" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="23.5" cy="31" r="1.7" fill="#16a34a" />
              <circle cx="30.8" cy="31" r="1.7" fill="#16a34a" />
            </g>
          </svg>
        </div>

        <h1 className="splash-title text-4xl font-bold tracking-tight">
          <span className="text-white">Market</span>
          <span className="text-green-300">ivo</span>
        </h1>
        <p className="splash-tagline mt-2 text-sm text-blue-100/90">
          Best choice for local vendors
        </p>

        <div className="splash-bar mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/20">
          <div className="splash-bar-fill h-full w-full bg-gradient-to-r from-green-300 to-white" />
        </div>
      </div>
    </div>
  )
}
