import { format } from 'date-fns'

export default function TimelineCard({ event }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-2 top-2 h-full w-px bg-border" />
      <div className="absolute left-0 top-3 h-4 w-4 rounded-full border-4 border-accent-cyan bg-background glow-cyan" />
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-primary">{event.title}</h3>
          <span className="text-sm text-accent-cyan">{format(new Date(event.event_date), 'PPP p')}</span>
        </div>
        <p className="mt-3 text-sm text-muted">{event.description || 'No event narrative supplied.'}</p>
        {(event.entity_label || event.evidence_title) ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            {event.entity_label ? <span className="rounded-full border border-border px-2.5 py-1">Entity: {event.entity_label}</span> : null}
            {event.evidence_title ? <span className="rounded-full border border-border px-2.5 py-1">Evidence: {event.evidence_title}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
