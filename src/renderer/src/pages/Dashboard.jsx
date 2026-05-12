import { useEffect, useMemo, useState } from 'react'
import { Activity, Archive, Clock3, FileUp, FolderOpen, Network, Plus, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import StatCard from '@/components/ui/StatCard'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useAppStore } from '@/store/useAppStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { investigations, entities, evidence, timeline, loading, loadInvestigations, loadEntities, loadEvidence, loadTimeline } = useAppStore()
  const [stats, setStats] = useState({ investigations: 0, entities: 0, evidence: 0, timeline: 0 })
  const [graphStats, setGraphStats] = useState({ relationships: 0, avgStrength: 0 })

  useEffect(() => {
    const hydrate = async () => {
      const [caseStats, loadedInvestigations, loadedEntities, loadedEvidence, loadedTimeline, relationships] = await Promise.all([
        window.axiom.investigations.getStats(),
        loadInvestigations(),
        loadEntities(),
        loadEvidence(),
        loadTimeline(),
        window.axiom.relationships.getAll()
      ])

      setStats({
        investigations: caseStats.investigations ?? loadedInvestigations.length,
        entities: loadedEntities.length,
        evidence: loadedEvidence.length,
        timeline: loadedTimeline.length
      })
      setGraphStats({
        relationships: relationships.length,
        avgStrength: relationships.length ? Math.round(relationships.reduce((sum, item) => sum + Number(item.strength || 0), 0) / relationships.length) : 0
      })
    }

    hydrate()
  }, [loadEntities, loadEvidence, loadInvestigations, loadTimeline])

  const recentActivity = useMemo(() => {
    return [
      ...timeline.map((item) => ({ type: 'timeline', title: item.title, timestamp: item.created_at || item.event_date })),
      ...evidence.map((item) => ({ type: 'evidence', title: item.title, timestamp: item.created_at })),
      ...entities.map((item) => ({ type: 'entity', title: item.label || item.value, timestamp: item.created_at }))
    ]
      .filter((item) => item.timestamp)
      .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
      .slice(0, 8)
  }, [entities, evidence, timeline])

  const isLoading = Object.values(loading).some(Boolean)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Investigations" value={stats.investigations} subtitle="Active intelligence cases" icon={FolderOpen} trend={12} color="cyan" />
        <StatCard title="Entities" value={stats.entities} subtitle="Tracked digital identities" icon={Network} trend={8} color="blue" />
        <StatCard title="Evidence" value={stats.evidence} subtitle="Imported artifacts and files" icon={Archive} trend={6} color="purple" />
        <StatCard title="Timeline Events" value={stats.timeline} subtitle="Chronological findings" icon={Clock3} trend={15} color="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-primary">Recent Investigations</h3>
              <p className="text-sm text-muted">Priority cases with the latest operational updates.</p>
            </div>
            <button type="button" onClick={() => navigate('/investigations')} className="rounded-full border border-border px-4 py-2 text-sm text-primary hover:border-accent-cyan/40 hover:text-accent-cyan">
              View all
            </button>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel/80 text-muted">
                <tr>
                  <th className="px-4 py-3">Case</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {investigations.slice(0, 6).map((investigation) => (
                  <tr key={investigation.id} className="border-t border-border/80 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-primary">{investigation.title}</td>
                    <td className="px-4 py-3 text-muted">{investigation.status}</td>
                    <td className="px-4 py-3 text-muted">{investigation.priority}</td>
                    <td className="px-4 py-3 text-muted">{formatDistanceToNow(new Date(investigation.updated_at), { addSuffix: true })}</td>
                  </tr>
                ))}
                {!investigations.length ? (
                  <tr>
                    <td className="px-4 py-5 text-muted" colSpan="4">No investigations created yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-primary">Quick Actions</h3>
            <div className="mt-5 grid gap-3">
              <button type="button" onClick={() => navigate('/investigations')} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:border-accent-cyan/40 hover:bg-accent-cyan/5">
                <span>
                  <span className="block font-medium text-primary">New Investigation</span>
                  <span className="text-sm text-muted">Open a fresh intelligence workspace.</span>
                </span>
                <Plus className="h-4 w-4 text-accent-cyan" />
              </button>
              <button type="button" onClick={() => navigate('/relationship-graph')} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:border-accent-blue/40 hover:bg-accent-blue/5">
                <span>
                  <span className="block font-medium text-primary">Add Entity</span>
                  <span className="text-sm text-muted">Expand graph intelligence coverage.</span>
                </span>
                <UserPlus className="h-4 w-4 text-accent-blue" />
              </button>
              <button type="button" onClick={() => navigate('/evidence-vault')} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:border-accent-purple/40 hover:bg-accent-purple/5">
                <span>
                  <span className="block font-medium text-primary">Import Evidence</span>
                  <span className="text-sm text-muted">Safely ingest new artifacts.</span>
                </span>
                <FileUp className="h-4 w-4 text-accent-purple" />
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-xl font-semibold text-primary">Activity Feed</h3>
            </div>
            <div className="mt-5 space-y-3">
              {recentActivity.map((item) => (
                <div key={`${item.type}-${item.title}-${item.timestamp}`} className="rounded-2xl border border-border px-4 py-3">
                  <p className="font-medium text-primary">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">{item.type}</p>
                  <p className="mt-2 text-sm text-muted">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                </div>
              ))}
              {!recentActivity.length ? <p className="text-sm text-muted">No recent activity available.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold text-primary">Graph Statistics</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm text-muted">Node Count</p>
              <p className="mt-3 text-3xl font-semibold text-primary">{entities.length}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm text-muted">Relationship Count</p>
              <p className="mt-3 text-3xl font-semibold text-primary">{graphStats.relationships}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm text-muted">Average Strength</p>
              <p className="mt-3 text-3xl font-semibold text-primary">{graphStats.avgStrength}%</p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? <LoadingOverlay contained label="Synchronizing dashboard..." /> : null}
    </div>
  )
}
