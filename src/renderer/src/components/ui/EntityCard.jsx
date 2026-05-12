import { Link2, ShieldCheck } from 'lucide-react'

const typeMap = {
  username: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
  email: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue',
  domain: 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple',
  ip: 'border-warning/40 bg-warning/10 text-warning',
  organization: 'border-success/40 bg-success/10 text-success',
  social: 'border-pink-400/40 bg-pink-400/10 text-pink-300'
}

export default function EntityCard({ entity, onClick, onLink }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onClick?.(entity)} className="text-left">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${typeMap[entity.type] || 'border-border bg-panel text-muted'}`}>
            {entity.type}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-primary">{entity.label || entity.value}</h3>
          <p className="text-sm text-muted">{entity.value}</p>
        </button>
        <button
          type="button"
          onClick={() => onLink?.(entity)}
          className="rounded-full border border-border p-2 text-muted hover:border-accent-cyan/40 hover:text-accent-cyan"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <div className="inline-flex items-center gap-2 text-success">
          <ShieldCheck className="h-4 w-4" />
          <span>{entity.confidence ?? 0}% confidence</span>
        </div>
        <span className="text-muted">{entity.investigation_title || 'Linked investigation'}</span>
      </div>
    </div>
  )
}
