import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Clock3, Download, Package } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const exportCards = [
  { key: 'case', title: 'Export Case', desc: 'Investigation + entities + evidence', extension: 'json' },
  { key: 'timeline', title: 'Export Timeline', desc: 'Chronological event log in Markdown', extension: 'md' },
  { key: 'graph', title: 'Export Graph', desc: 'Nodes and edges as JSON', extension: 'json' },
  { key: 'notes', title: 'Export Notes', desc: 'All intelligence notes in Markdown', extension: 'md' },
  { key: 'all', title: 'Export All', desc: 'Complete investigation package', extension: 'json' }
]

export default function Exports() {
  const { investigations, loadInvestigations } = useAppStore()
  const [investigationId, setInvestigationId] = useState('')
  const [payload, setPayload] = useState({ investigation: null, entities: [], evidence: [], notes: [], timeline: [], relationships: [] })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [exporting, setExporting] = useState('')

  useEffect(() => {
    loadInvestigations().then((items) => {
      if (!investigationId && items[0]) {
        setInvestigationId(items[0].id)
      }
    })
  }, [investigationId, loadInvestigations])

  useEffect(() => {
    if (!investigationId) return
    const hydrate = async () => {
      try {
        const investigation = await window.axiom.investigations.getById(investigationId)
        const [entities, evidence, notes, timeline, relationships] = await Promise.all([
          window.axiom.entities.getByInvestigation(investigationId),
          window.axiom.evidence.getByInvestigation(investigationId),
          window.axiom.notes.getByInvestigation(investigationId),
          window.axiom.timeline.getByInvestigation(investigationId),
          window.axiom.relationships.getAll()
        ])
        const entityIds = new Set(entities.map((entity) => entity.id))
        setPayload({
          investigation,
          entities,
          evidence,
          notes,
          timeline,
          relationships: relationships.filter((r) => entityIds.has(r.source_id) && entityIds.has(r.target_id))
        })
      } catch (err) {
        setError(err?.message || 'Failed to load investigation data.')
      }
    }
    hydrate()
  }, [investigationId])

  const notesMarkdown = useMemo(() => payload.notes.map((note) => `## ${note.title}\n\n${note.content}`).join('\n\n---\n\n'), [payload.notes])
  const timelineMarkdown = useMemo(() => payload.timeline.map((event) => `- **${event.title}** (${event.event_date})\n  ${event.description || ''}`).join('\n'), [payload.timeline])

  const exportContent = (key) => {
    switch (key) {
      case 'case':
        return JSON.stringify({ investigation: payload.investigation, entities: payload.entities, evidence: payload.evidence }, null, 2)
      case 'timeline':
        return `# ${payload.investigation?.title || 'Timeline Export'}\n\n${timelineMarkdown || '(no events)'}`
      case 'graph':
        return JSON.stringify({ nodes: payload.entities, edges: payload.relationships }, null, 2)
      case 'notes':
        return `# ${payload.investigation?.title || 'Notes Export'}\n\n${notesMarkdown || '(no notes)'}`
      case 'all':
      default:
        return JSON.stringify({ ...payload, exportedAt: new Date().toISOString() }, null, 2)
    }
  }

  const runExport = async (card) => {
    if (!investigationId) {
      setError('Select an investigation before exporting.')
      return
    }
    setExporting(card.key)
    setError('')
    setSuccessMsg('')
    try {
      const filePath = await window.axiom.settings.exportDb({
        suggestedName: `axiom-${card.key}-export.${card.extension}`,
        content: exportContent(card.key)
      })
      if (filePath) {
        setSuccessMsg(`Saved: ${filePath}`)
        setTimeout(() => setSuccessMsg(''), 5000)
      }
    } catch (err) {
      setError(err?.message || 'Export failed.')
    } finally {
      setExporting('')
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" className="text-xs underline opacity-70 hover:opacity-100" onClick={() => setError('')}>Dismiss</button>
        </div>
      ) : null}
      {successMsg ? (
        <div className="flex items-center gap-2 rounded-2xl border border-success/40 bg-success/5 px-4 py-3 text-sm text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      ) : null}

      <div className="glass-panel rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Export Pipeline</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">Case Packaging & Distribution</h2>
          </div>
          <select value={investigationId} onChange={(event) => setInvestigationId(event.target.value)} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            {!investigations.length ? <option value="">No investigations</option> : null}
            {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
          </select>
        </div>
        {!investigations.length ? (
          <p className="mt-4 text-sm text-warning">Create an investigation first before using the export pipeline.</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exportCards.map((card) => (
          <div key={card.key} className="glass-panel rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-primary">{card.title}</h3>
                <p className="mt-2 text-sm text-muted">{card.desc}</p>
              </div>
              {card.key === 'timeline' ? <Clock3 className="h-5 w-5 text-accent-purple" /> : <Package className="h-5 w-5 text-accent-cyan" />}
            </div>
            <button
              type="button"
              onClick={() => runExport(card)}
              disabled={!investigationId || exporting === card.key}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-accent-cyan/40 px-4 py-3 text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting === card.key ? 'Exporting…' : 'Export'}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-primary">Export Preview</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Investigation</p><p className="mt-2 truncate font-medium text-primary">{payload.investigation?.title || '—'}</p></div>
          <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Entities</p><p className="mt-2 text-2xl font-semibold text-primary">{payload.entities.length}</p></div>
          <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Evidence</p><p className="mt-2 text-2xl font-semibold text-primary">{payload.evidence.length}</p></div>
          <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Timeline</p><p className="mt-2 text-2xl font-semibold text-primary">{payload.timeline.length}</p></div>
          <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Notes</p><p className="mt-2 text-2xl font-semibold text-primary">{payload.notes.length}</p></div>
        </div>
      </div>
    </div>
  )
}
