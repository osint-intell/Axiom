import { formatDistanceToNow } from 'date-fns'
import { FolderOpen, Trash2 } from 'lucide-react'
import TagBadge from './TagBadge'
import RiskBadge from './RiskBadge'

export default function InvestigationCard({ investigation, onClick, onDelete }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(investigation)}
      className="glass-panel group w-full rounded-3xl p-5 text-left hover:-translate-y-0.5 hover:border-accent-cyan/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-accent-cyan/10 p-3 text-accent-cyan">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">{investigation.title}</h3>
            <p className="text-sm text-muted">Updated {formatDistanceToNow(new Date(investigation.updated_at), { addSuffix: true })}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete?.(investigation)
          }}
          className="rounded-full border border-border p-2 text-muted hover:border-danger/50 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-muted">{investigation.description || 'No briefing available.'}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <RiskBadge level={investigation.priority?.toUpperCase() === 'CRITICAL' ? 'CRITICAL' : investigation.priority?.toUpperCase() || 'INFO'} />
        <span className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs text-primary">{investigation.status}</span>
        <span className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs text-muted">{investigation.entity_count ?? 0} entities</span>
      </div>
      {investigation.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {investigation.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      ) : null}
    </button>
  )
}
