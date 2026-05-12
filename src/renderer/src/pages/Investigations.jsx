import { useEffect, useMemo, useState } from 'react'
import { useNodesState, useEdgesState } from 'reactflow'
import { Eye, FileText, FolderPlus, Link2, Network, Search } from 'lucide-react'
import InvestigationCard from '@/components/ui/InvestigationCard'
import SearchBar from '@/components/ui/SearchBar'
import Modal from '@/components/ui/Modal'
import EntityCard from '@/components/ui/EntityCard'
import EvidenceCard from '@/components/ui/EvidenceCard'
import TimelineCard from '@/components/ui/TimelineCard'
import GraphPanel from '@/components/graph/GraphPanel'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useAppStore } from '@/store/useAppStore'

const tabs = ['Overview', 'Entities', 'Evidence', 'Notes', 'Timeline', 'Graph']
const mapNodeColor = (type) => ({ username: '#22D3EE', email: '#3B82F6', domain: '#8B5CF6', ip: '#F59E0B', organization: '#22C55E', social: '#EC4899', evidence: '#FACC15', note: '#94A3B8' }[type] || '#94A3B8')

export default function Investigations() {
  const {
    investigations,
    currentInvestigation,
    entities,
    evidence,
    timeline,
    notes,
    loading,
    setCurrentInvestigation,
    loadInvestigations,
    refreshInvestigationContext
  } = useAppStore()

  const [relationships, setRelationships] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', tags: '' })
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    loadInvestigations()
    const openModal = () => setIsModalOpen(true)
    window.addEventListener('axiom:new-investigation', openModal)
    return () => window.removeEventListener('axiom:new-investigation', openModal)
  }, [loadInvestigations])

  useEffect(() => {
    if (!currentInvestigation?.id) return

    const hydrate = async () => {
      await refreshInvestigationContext(currentInvestigation.id)
      const allRelationships = await window.axiom.relationships.getAll()
      setRelationships(allRelationships)
    }

    hydrate()
  }, [currentInvestigation, refreshInvestigationContext])

  useEffect(() => {
    const investigationEntityIds = new Set(entities.map((entity) => entity.id))
    setNodes(
      entities.map((entity, index) => ({
        id: entity.id,
        type: 'custom',
        position: entity.metadata?.position || { x: 120 + index * 60, y: 120 + (index % 3) * 120 },
        data: {
          label: entity.label || entity.value,
          value: entity.value,
          type: entity.type,
          miniMapColor: mapNodeColor(entity.type)
        }
      }))
    )
    setEdges(
      relationships
        .filter((relationship) => investigationEntityIds.has(relationship.source_id) && investigationEntityIds.has(relationship.target_id))
        .map((relationship) => ({
          id: relationship.id,
          source: relationship.source_id,
          target: relationship.target_id,
          label: relationship.label || relationship.type,
          animated: true
        }))
    )
  }, [entities, relationships, setEdges, setNodes])

  const filteredInvestigations = useMemo(() => {
    const query = search.toLowerCase()
    return investigations.filter((investigation) => {
      if (!query) return true
      return [investigation.title, investigation.description, ...(investigation.tags || [])].join(' ').toLowerCase().includes(query)
    })
  }, [investigations, search])

  const createInvestigation = async (event) => {
    event.preventDefault()
    const created = await window.axiom.investigations.create({
      ...form,
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean)
    })
    setIsModalOpen(false)
    setForm({ title: '', description: '', priority: 'medium', tags: '' })
    await loadInvestigations()
    setCurrentInvestigation(created)
  }

  const deleteInvestigation = async (investigation) => {
    await window.axiom.investigations.delete(investigation.id)
    if (currentInvestigation?.id === investigation.id) {
      setCurrentInvestigation(null)
    }
    await loadInvestigations()
  }

  const persistNodePosition = async (_, node) => {
    const entity = entities.find((item) => item.id === node.id)
    if (!entity) return
    await window.axiom.entities.update(node.id, {
      metadata: {
        ...(entity.metadata || {}),
        position: node.position
      }
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search investigations..." icon={Search} />
          <button type="button" onClick={() => setIsModalOpen(true)} className="glow-cyan inline-flex shrink-0 items-center gap-2 rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background">
            <FolderPlus className="h-4 w-4" />
            Create
          </button>
        </div>
        <div className="space-y-4">
          {filteredInvestigations.map((investigation) => (
            <InvestigationCard
              key={investigation.id}
              investigation={investigation}
              onClick={setCurrentInvestigation}
              onDelete={deleteInvestigation}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        {currentInvestigation ? (
          <>
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Active Case</p>
                  <h2 className="mt-2 text-3xl font-semibold text-primary">{currentInvestigation.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm text-muted">{currentInvestigation.description || 'No investigation summary captured yet.'}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted">
                  <span className="rounded-full border border-border px-3 py-1.5">{currentInvestigation.status}</span>
                  <span className="rounded-full border border-border px-3 py-1.5">Priority: {currentInvestigation.priority}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm ${activeTab === tab ? 'bg-accent-cyan text-background glow-cyan' : 'border border-border text-muted hover:text-primary'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'Overview' ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-panel rounded-3xl p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-primary">Case Overview</h3>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Entities</p><p className="mt-2 text-2xl font-semibold">{entities.length}</p></div>
                    <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Evidence</p><p className="mt-2 text-2xl font-semibold">{evidence.length}</p></div>
                    <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Notes</p><p className="mt-2 text-2xl font-semibold">{notes.length}</p></div>
                    <div className="rounded-2xl border border-border p-4"><p className="text-sm text-muted">Timeline</p><p className="mt-2 text-2xl font-semibold">{timeline.length}</p></div>
                  </div>
                </div>
                <div className="glass-panel rounded-3xl p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent-purple" />
                    <h3 className="text-xl font-semibold text-primary">Analyst Notes Snapshot</h3>
                  </div>
                  <div className="mt-4 space-y-4">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="rounded-2xl border border-border p-4">
                        <p className="font-medium text-primary">{note.title}</p>
                        <p className="mt-2 line-clamp-3 text-sm text-muted">{note.content}</p>
                      </div>
                    ))}
                    {!notes.length ? <p className="text-sm text-muted">No notes linked to this investigation yet.</p> : null}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'Entities' ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{entities.map((entity) => <EntityCard key={entity.id} entity={entity} />)}</div> : null}
            {activeTab === 'Evidence' ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{evidence.map((item) => <EvidenceCard key={item.id} evidence={item} />)}</div> : null}
            {activeTab === 'Notes' ? <MarkdownEditor value={notes[0]?.content || currentInvestigation.description || ''} onChange={() => {}} /> : null}
            {activeTab === 'Timeline' ? <div className="space-y-4">{timeline.map((event) => <TimelineCard key={event.id} event={event} />)}</div> : null}
            {activeTab === 'Graph' ? (
              <div className="space-y-4">
                <div className="glass-panel rounded-3xl p-4 text-sm text-muted">
                  Drag nodes to reorganize the investigation network. Positions are persisted to the database.
                </div>
                <GraphPanel
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeDragStop={persistNodePosition}
                  onAddNode={() => setActiveTab('Entities')}
                  onReset={() => {
                    setNodes((existing) => existing.map((node, index) => ({
                      ...node,
                      position: { x: 120 + index * 60, y: 120 + (index % 3) * 120 }
                    })))
                  }}
                />
              </div>
            ) : null}
            {!['Overview', 'Entities', 'Evidence', 'Notes', 'Timeline', 'Graph'].includes(activeTab) ? (
              <div className="glass-panel rounded-3xl p-6 text-muted">
                <div className="inline-flex items-center gap-2"><Link2 className="h-4 w-4" />Unsupported tab.</div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="glass-panel flex min-h-[480px] items-center justify-center rounded-3xl p-6 text-center text-muted">
            Select an investigation to inspect the linked entities, evidence, notes, and graph activity.
          </div>
        )}

        {Object.values(loading).some(Boolean) ? <LoadingOverlay contained label="Loading investigation context..." /> : null}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Investigation">
        <form className="space-y-4" onSubmit={createInvestigation}>
          <div>
            <label className="mb-2 block text-sm text-muted">Title</label>
            <input value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Description</label>
            <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} className="min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-muted">Priority</label>
              <select value={form.priority} onChange={(event) => setForm((state) => ({ ...state, priority: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Tags</label>
              <input value={form.tags} onChange={(event) => setForm((state) => ({ ...state, tags: event.target.value }))} placeholder="fraud, persona, social" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-border px-4 py-3 text-muted">Cancel</button>
            <button type="submit" className="rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background">Create Investigation</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
