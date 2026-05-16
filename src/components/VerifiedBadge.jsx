import { FiCheck } from 'react-icons/fi'

/** Shown on marketplace vendor listings — approved shops are verified by Marketivo. */
export default function VerifiedBadge({ className = '', compact = false }) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${className}`}
        title="Verified by Marketivo"
      >
        <FiCheck size={10} strokeWidth={3} />
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700 ${className}`}
      title="This vendor is verified by Marketivo"
    >
      <FiCheck size={12} className="text-green-600" strokeWidth={3} />
      Verified
    </span>
  )
}
