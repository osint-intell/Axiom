import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, PlusCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import TimelineCard from '@/components/ui/TimelineCard'
import { useAppStore } from '@/store/useAppStore'

const initialForm = { investigation_id: '', entity_id: '', evidence_id: '', title: '', description: '', event_date: '' }

export default function Timeline() {
  const { investigations, timeline, entities, evidence, loadInvestigations, loadTimeline, loadEntities, loadEvidence } = useAppStore()
  const [filters, setFilters] = useState({ investigationId: 'all', start: '', end: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadInvestigations().then((items) => {
      const firstId = items[0]?.id || ''
      setForm((state) => ({ ...state, investigation_id: state.investigation_id || firstId }))
    })
    loadTimeline()
    loadEntities()
    loadEvidence()
  }, [loadEntities, loadEvidence, loadInvestigations, loadTimeline])

  const filteredTimeline = useMemo(() => {
    return timeline.filter((item) => {
      const date = new Date(item.event_date)
      if (filters.investigationId !== 'all' && item.investigation_id !== filters.investigationId) return false
      if (filters.start && date < new Date(filters.start)) return false
      if (filters.end && date > new Date(filters.end)) return false
      return true
    })
  }, [filters, timeline])

  const openModal = () => {
    setFormError('')
    setIsModalOpen(true)
  }

  const createEvent = async (event) => {
    event.preventDefault()
    if (!form.investigation_id) {
      setFormError('Please select an investigation.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      await window.axiom.timeline.create(form)
      setIsModalOpen(false)
      setForm((state) => ({ ...initialForm, investigation_id: state.investigation_id }))
      await loadTimeline()
    } catch (err) {
      setFormError(err?.message || 'Failed to create event. Check all required fields.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Chronology</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">Temporal Analysis</h2>
          </div>
          <button type="button" onClick={openModal} className="inline-flex items-center gap-2 rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background">
            <PlusCircle className="h-4 w-4" />
            Add Event
          </button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <select value={filters.investigationId} onChange={(event) => setFilters((state) => ({ ...state, investigationId: event.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            <option value="all">All investigations</option>
            {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
          </select>
          <input type="date" value={filters.start} onChange={(event) => setFilters((state) => ({ ...state, start: event.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
          <input type="date" value={filters.end} onChange={(event) => setFilters((state) => ({ ...state, end: event.target.value }))} className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
        </div>
      </div>

      {!investigations.length ? (
        <div className="glass-panel rounded-3xl border border-warning/30 bg-warning/5 px-5 py-4 text-sm text-warning">
          No investigations found. Go to <strong>Investigations</strong> and create one before adding timeline events.
        </div>
      ) : null}

      <div className="space-y-5">
        {filteredTimeline.map((event) => <TimelineCard key={event.id} event={event} />)}
        {!filteredTimeline.length ? (
          <div className="glass-panel rounded-3xl p-10 text-center text-muted">
            {investigations.length ? 'No timeline events for the current filter. Click Add Event to get started.' : 'Create an investigation first, then add timeline events.'}
          </div>
        ) : null}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Timeline Event">
        <form className="space-y-4" onSubmit={createEvent}>
          {formError ? (
            <div className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}
          <div>
            <label className="mb-2 block text-sm text-muted">Investigation *</label>
            <select value={form.investigation_id} onChange={(event) => setForm((state) => ({ ...state, investigation_id: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" required>
              <option value="">Select investigation</option>
              {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Event title *</label>
            <input value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} placeholder="e.g. Account created on Platform X" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" required />
          </div>
          <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} placeholder="Description (optional)" className="min-h-[100px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
          <div>
            <label className="mb-2 block text-sm text-muted">Event date/time *</label>
            <input type="datetime-local" value={form.event_date} onChange={(event) => setForm((state) => ({ ...state, event_date: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" required />
          </div>
          <select value={form.entity_id} onChange={(event) => setForm((state) => ({ ...state, entity_id: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            <option value="">Link entity (optional)</option>
            {entities.filter((entity) => entity.investigation_id === form.investigation_id).map((entity) => <option key={entity.id} value={entity.id}>{entity.label || entity.value}</option>)}
          </select>
          <select value={form.evidence_id} onChange={(event) => setForm((state) => ({ ...state, evidence_id: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
            <option value="">Link evidence (optional)</option>
            {evidence.filter((item) => item.investigation_id === form.investigation_id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-border px-4 py-3 text-muted">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-2xl bg-accent-cyan px-6 py-3 font-semibold text-background disabled:opacity-60">
              {submitting ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
