import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'cyan' }) {
  const accentClass = {
    cyan: 'text-accent-cyan bg-accent-cyan/10',
    blue: 'text-accent-blue bg-accent-blue/10',
    purple: 'text-accent-purple bg-accent-purple/10',
    green: 'text-success bg-success/10'
  }[color] || 'text-accent-cyan bg-accent-cyan/10'

  const TrendIcon = trend && trend >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold text-primary">{value}</h3>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-2xl p-3 ${accentClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {typeof trend === 'number' ? (
        <div className={`mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${trend >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{Math.abs(trend)}%</span>
        </div>
      ) : null}
    </div>
  )
}
