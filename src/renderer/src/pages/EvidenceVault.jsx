import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, FileUp, Search } from 'lucide-react'
import EvidenceCard from '@/components/ui/EvidenceCard'
import SearchBar from '@/components/ui/SearchBar'
import DrawerPanel from '@/components/ui/DrawerPanel'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import TagBadge from '@/components/ui/TagBadge'
import { useAppStore } from '@/store/useAppStore'

export default function EvidenceVault() {
  const { investigations, evidence, loadInvestigations, loadEvidence } = useAppStore()
  const [filters, setFilters] = useState({ search: '', type: 'all', investigationId: 'all', tag: '' })
  const [activeEvidence, setActiveEvidence] = useState(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInvestigations()
    loadEvidence()
  }, [loadEvidence, loadInvestigations])

  const filteredEvidence = useMemo(() => {
    const query = filters.search.toLowerCase()
    return evidence.filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) return false
      if (filters.investigationId !== 'all' && item.investigation_id !== filters.investigationId) return false
      if (filters.tag && !item.tags?.includes(filters.tag)) return false
      return [item.title, item.content, ...(item.tags || [])].join(' ').toLowerCase().includes(query)
    })
  }, [evidence, filters])

  const availableTags = useMemo(() => [...new Set(evidence.flatMap((item) => item.tags || []))], [evidence])

  const importEvidence = async () => {
    const investigationId = filters.investigationId !== 'all' ? filters.investigationId : investigations[0]?.id
    if (!investigationId) {
      setError('Select an investigation filter above, or create an investigation first.')
      return
    }
    setImporting(true)
    setError('')
    try {
      const imported = await window.axiom.evidence.importFile()
      if (!imported) return
      await window.axiom.evidence.create({
        investigation_id: investigationId,
        title: imported.title,
        type: imported.type,
        content: imported.content,
        file_path: imported.file_path,
        metadata: imported.metadata,
        tags: [imported.type]
      })
      await loadEvidence()
    } catch (err) {
      setError(err?.message || 'Import failed. The file may be unsupported or inaccessible.')
    } finally {
      setImporting(false)
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

      <div className="glass-panel rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Vault Filters</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">Evidence Repository</h2>
          </div>
          <button type="button" onClick={importEvidence} disabled={importing} className="glow-cyan inline-flex items-center gap-2 rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background disabled:opacity-60">
            <FileUp className="h-4 w-4" />
            {importing ? 'Importing…' : 'Import Evidence'}
          </button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <SearchBar value={filters.search} onChange={(value) => setFilters((state) => ({ ...state, search: value }))} placeholder="Search evidence…" icon={Search} />
          <select value={filters.type} onChange={(event) => setFilters((state) => ({ ...state, type: event.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            <option value="all">All types</option>
            <option value="text">Text</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="image">Image</option>
          </select>
          <select value={filters.investigationId} onChange={(event) => setFilters((state) => ({ ...state, investigationId: event.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            <option value="all">All investigations</option>
            {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
          </select>
          <select value={filters.tag} onChange={(event) => setFilters((state) => ({ ...state, tag: event.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            <option value="">All tags</option>
            {availableTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvidence.map((item) => <EvidenceCard key={item.id} evidence={item} onClick={setActiveEvidence} />)}
        {!filteredEvidence.length ? (
          <div className="glass-panel col-span-full rounded-3xl p-10 text-center text-muted">
            {evidence.length ? 'No evidence matches the current filters.' : 'No evidence imported yet. Click "Import Evidence" to add files from your investigation.'}
          </div>
        ) : null}
      </div>

      <DrawerPanel isOpen={Boolean(activeEvidence)} onClose={() => setActiveEvidence(null)} title={activeEvidence?.title || 'Evidence Preview'}>
        {activeEvidence ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <TagBadge tag={activeEvidence.type} color="blue" />
              {(activeEvidence.tags || []).map((tag) => <TagBadge key={tag} tag={tag} />)}
            </div>
            {activeEvidence.type === 'image' ? (
              <img src={activeEvidence.content} alt={activeEvidence.title} className="w-full rounded-2xl border border-border object-cover" />
            ) : (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-border bg-background p-4 text-sm text-muted">{activeEvidence.content}</pre>
            )}
            <div className="rounded-2xl border border-border p-4 text-sm text-muted">
              <p className="font-medium text-primary">Metadata</p>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-muted">{JSON.stringify(activeEvidence.metadata || {}, null, 2)}</pre>
            </div>
          </div>
        ) : null}
      </DrawerPanel>

      {importing ? <LoadingOverlay contained label="Importing evidence safely…" /> : null}
    </div>
  )
}
