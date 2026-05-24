import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const styles = type === 'error'
    ? 'bg-red-600 text-white'
    : 'bg-emerald-600 text-white'

  return (
    <div className="fixed right-4 top-5 z-[60]">
      <div className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${styles}`}>
        {message}
      </div>
    </div>
  )
}
