import { formatDistanceToNow } from 'date-fns'
import { FileCode2, FileImage, FileJson, FileText } from 'lucide-react'
import TagBadge from './TagBadge'

const typeMap = {
  text: FileText,
  markdown: FileCode2,
  json: FileJson,
  image: FileImage
}

export default function EvidenceCard({ evidence, onClick }) {
  const Icon = typeMap[evidence.type] || FileText

  return (
    <button
      type="button"
      onClick={() => onClick?.(evidence)}
      className="glass-panel flex h-full flex-col rounded-3xl p-5 text-left hover:-translate-y-0.5 hover:border-accent-cyan/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-accent-blue/10 p-3 text-accent-blue">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted">{formatDistanceToNow(new Date(evidence.created_at), { addSuffix: true })}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-primary">{evidence.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{evidence.type === 'image' ? 'Image preview stored securely.' : evidence.content || 'No inline content.'}</p>
      <div className="mt-4 text-xs uppercase tracking-[0.25em] text-accent-cyan">{evidence.investigation_title || 'Unassigned case'}</div>
      {evidence.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {evidence.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} color="blue" />
          ))}
        </div>
      ) : null}
    </button>
  )
}
