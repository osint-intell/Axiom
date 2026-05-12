import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEdgesState, useNodesState } from 'reactflow'
import { AlertCircle, Download, Link2, Network, PlusCircle } from 'lucide-react'
import GraphPanel from '@/components/graph/GraphPanel'
import TagBadge from '@/components/ui/TagBadge'
import { useAppStore } from '@/store/useAppStore'

const colorMap = { username: '#22D3EE', email: '#3B82F6', domain: '#8B5CF6', ip: '#F59E0B', organization: '#22C55E', social: '#EC4899', evidence: '#FACC15', note: '#94A3B8' }

export default function RelationshipGraph() {
  const { investigations, loadInvestigations } = useAppStore()
  const [investigationId, setInvestigationId] = useState('')
  const [entities, setEntities] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeForm, setNodeForm] = useState({ type: 'username', value: '', label: '', confidence: 70 })
  const [edgeForm, setEdgeForm] = useState({ source_id: '', target_id: '', type: 'associated_with', label: '', strength: 60 })
  const [nodeError, setNodeError] = useState('')
  const [edgeError, setEdgeError] = useState('')

  const hydrateGraph = useCallback(async (id) => {
    if (!id) return
    try {
      const [loadedEntities, allRelationships] = await Promise.all([
        window.axiom.entities.getByInvestigation(id),
        window.axiom.relationships.getAll()
      ])
      const entityIds = new Set(loadedEntities.map((entity) => entity.id))
      const filteredRelationships = allRelationships.filter((r) => entityIds.has(r.source_id) && entityIds.has(r.target_id))
      setEntities(loadedEntities)
      setNodes(
        loadedEntities.map((entity, index) => ({
          id: entity.id,
          type: 'custom',
          position: entity.metadata?.position || { x: 140 + (index % 4) * 280, y: 100 + Math.floor(index / 4) * 160 },
          data: {
            label: entity.label || entity.value,
            value: entity.value,
            type: entity.type,
            miniMapColor: colorMap[entity.type] || '#94A3B8'
          }
        }))
      )
      setEdges(
        filteredRelationships.map((relationship) => ({
          id: relationship.id,
          source: relationship.source_id,
          target: relationship.target_id,
          label: relationship.label || relationship.type,
          animated: true
        }))
      )
    } catch (err) {
      console.error('Graph hydration failed:', err)
    }
  }, [setNodes, setEdges])

  useEffect(() => {
    loadInvestigations().then((items) => {
      if (!investigationId && items[0]) {
        setInvestigationId(items[0].id)
      }
    })
  }, [investigationId, loadInvestigations])

  useEffect(() => {
    hydrateGraph(investigationId)
  }, [investigationId, hydrateGraph])

  const legend = useMemo(() => Object.entries(colorMap), [])

  const handleAddNode = async (event) => {
    event.preventDefault()
    if (!investigationId) {
      setNodeError('Select an investigation first.')
      return
    }
    if (!nodeForm.value.trim()) {
      setNodeError('Node value is required.')
      return
    }
    setNodeError('')
    try {
      await window.axiom.entities.create({
        investigation_id: investigationId,
        type: nodeForm.type,
        value: nodeForm.value.trim(),
        label: nodeForm.label.trim() || nodeForm.value.trim(),
        confidence: Number(nodeForm.confidence),
        metadata: { source: 'relationship-graph' }
      })
      setNodeForm({ type: 'username', value: '', label: '', confidence: 70 })
      hydrateGraph(investigationId)
    } catch (err) {
      setNodeError(err?.message || 'Failed to create node.')
    }
  }

  const handleAddEdge = async (event) => {
    event.preventDefault()
    if (!edgeForm.source_id || !edgeForm.target_id) {
      setEdgeError('Select both source and target nodes.')
      return
    }
    setEdgeError('')
    try {
      await window.axiom.relationships.create({
        ...edgeForm,
        strength: Number(edgeForm.strength)
      })
      setEdgeForm({ source_id: '', target_id: '', type: 'associated_with', label: '', strength: 60 })
      hydrateGraph(investigationId)
    } catch (err) {
      setEdgeError(err?.message || 'Failed to create edge.')
    }
  }

  const persistNodePosition = async (_, node) => {
    const entity = entities.find((item) => item.id === node.id)
    if (!entity) return
    try {
      await window.axiom.entities.update(node.id, {
        metadata: { ...(entity.metadata || {}), position: node.position }
      })
    } catch {
      // position persistence is non-critical
    }
  }

  const exportGraph = async () => {
    try {
      await window.axiom.settings.exportDb({
        suggestedName: 'axiom-graph-export.json',
        content: { investigationId, nodes, edges, exportedAt: new Date().toISOString() }
      })
    } catch (err) {
      setNodeError(err?.message || 'Export failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Graph Intelligence</p>
              <h2 className="mt-2 text-2xl font-semibold text-primary">Investigation Network Workspace</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={investigationId} onChange={(event) => setInvestigationId(event.target.value)} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
                {!investigations.length ? <option value="">No investigations</option> : null}
                {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
              </select>
              <button type="button" onClick={exportGraph} className="inline-flex items-center gap-2 rounded-2xl border border-accent-cyan/40 px-4 py-3 text-accent-cyan">
                <Download className="h-4 w-4" />
                Export Graph
              </button>
            </div>
          </div>
          {!investigations.length ? (
            <div className="glass-panel rounded-3xl border border-warning/30 bg-warning/5 px-5 py-4 text-sm text-warning">
              Create an investigation in the Investigations section first, then add nodes here.
            </div>
          ) : null}
          <GraphPanel
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            onNodeDragStop={persistNodePosition}
            onConnect={async (connection) => {
              try {
                await window.axiom.relationships.create({ source_id: connection.source, target_id: connection.target, type: 'associated_with', strength: 60 })
                hydrateGraph(investigationId)
              } catch (err) {
                setEdgeError(err?.message || 'Failed to connect nodes.')
              }
            }}
            onAddNode={() => setSelectedNode({ formMode: true })}
            onReset={() => hydrateGraph(investigationId)}
          />
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-accent-purple" />
              <h3 className="text-lg font-semibold text-primary">Node Legend</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {legend.map(([type]) => <TagBadge key={type} tag={type} color={type === 'email' ? 'blue' : type === 'domain' ? 'purple' : type === 'ip' ? 'orange' : type === 'organization' ? 'green' : 'cyan'} />)}
            </div>
          </div>

          <form className="glass-panel space-y-4 rounded-3xl p-5" onSubmit={handleAddNode}>
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-lg font-semibold text-primary">Add Node</h3>
            </div>
            {nodeError ? (
              <div className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                {nodeError}
              </div>
            ) : null}
            <select value={nodeForm.type} onChange={(event) => setNodeForm((state) => ({ ...state, type: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
              {Object.keys(colorMap).map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input value={nodeForm.value} onChange={(event) => setNodeForm((state) => ({ ...state, value: event.target.value }))} placeholder="Value (e.g. user@example.com)" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" required />
            <input value={nodeForm.label} onChange={(event) => setNodeForm((state) => ({ ...state, label: event.target.value }))} placeholder="Label (optional)" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
            <div>
              <label className="mb-2 block text-xs text-muted">Confidence: {nodeForm.confidence}%</label>
              <input type="range" min="0" max="100" value={nodeForm.confidence} onChange={(event) => setNodeForm((state) => ({ ...state, confidence: event.target.value }))} className="w-full accent-accent-cyan" />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background">Create Node</button>
          </form>

          <form className="glass-panel space-y-4 rounded-3xl p-5" onSubmit={handleAddEdge}>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-accent-purple" />
              <h3 className="text-lg font-semibold text-primary">Add Edge</h3>
            </div>
            {edgeError ? (
              <div className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                {edgeError}
              </div>
            ) : null}
            <select value={edgeForm.source_id} onChange={(event) => setEdgeForm((state) => ({ ...state, source_id: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
              <option value="">Source node</option>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.label || entity.value}</option>)}
            </select>
            <select value={edgeForm.target_id} onChange={(event) => setEdgeForm((state) => ({ ...state, target_id: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
              <option value="">Target node</option>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.label || entity.value}</option>)}
            </select>
            <input value={edgeForm.type} onChange={(event) => setEdgeForm((state) => ({ ...state, type: event.target.value }))} placeholder="Relationship type" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
            <input value={edgeForm.label} onChange={(event) => setEdgeForm((state) => ({ ...state, label: event.target.value }))} placeholder="Edge label (optional)" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
            <button type="submit" className="w-full rounded-2xl border border-accent-purple/40 px-4 py-3 font-semibold text-accent-purple">Create Edge</button>
          </form>

          <div className="glass-panel rounded-3xl p-5">
            <h3 className="text-lg font-semibold text-primary">Node Detail</h3>
            {selectedNode?.id ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl border border-border p-4"><p className="text-muted">Label</p><p className="mt-2 text-primary">{selectedNode.data.label}</p></div>
                <div className="rounded-2xl border border-border p-4"><p className="text-muted">Value</p><p className="mt-2 text-primary">{selectedNode.data.value}</p></div>
                <div className="rounded-2xl border border-border p-4"><p className="text-muted">Type</p><p className="mt-2 text-primary">{selectedNode.data.type}</p></div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Click a node to inspect its entity details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
