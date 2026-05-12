const levelMap = {
  CRITICAL: 'border-danger/40 bg-danger/15 text-danger',
  HIGH: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
  MEDIUM: 'border-warning/40 bg-warning/10 text-warning',
  LOW: 'border-success/40 bg-success/10 text-success',
  INFO: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
}

export default function RiskBadge({ level = 'INFO' }) {
  const normalized = String(level).toUpperCase()
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${levelMap[normalized] || levelMap.INFO}`}>{normalized}</span>
}
