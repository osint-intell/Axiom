import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, PlusCircle, Save } from 'lucide-react'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import TagBadge from '@/components/ui/TagBadge'
import { useAppStore } from '@/store/useAppStore'

export default function Notes() {
  const { investigations, notes, entities, loadInvestigations, loadNotes, loadEntities } = useAppStore()
  const [activeNoteId, setActiveNoteId] = useState('')
  const [draft, setDraft] = useState('')
  const [selectedInvestigationId, setSelectedInvestigationId] = useState('')
  const [error, setError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadInvestigations().then((items) => {
      const firstId = items[0]?.id || ''
      setSelectedInvestigationId((current) => current || firstId)
    })
  }, [loadInvestigations])

  useEffect(() => {
    if (!selectedInvestigationId) return
    setActiveNoteId('')
    loadNotes(selectedInvestigationId).then((loadedNotes) => {
      if (loadedNotes[0]) {
        setActiveNoteId(loadedNotes[0].id)
        setDraft(loadedNotes[0].content || '')
      }
    })
    loadEntities(selectedInvestigationId)
  }, [loadEntities, loadNotes, selectedInvestigationId])

  const activeNote = useMemo(() => notes.find((note) => note.id === activeNoteId) || null, [activeNoteId, notes])

  useEffect(() => {
    if (activeNote) setDraft(activeNote.content || '')
  }, [activeNote])

  const showError = (msg) => {
    setError(msg)
    setTimeout(() => setError(''), 5000)
  }

  const createNote = async () => {
    if (!selectedInvestigationId) {
      showError('Select an investigation before creating a note.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const note = await window.axiom.notes.create({
        investigation_id: selectedInvestigationId,
        title: 'New Intelligence Note',
        content: '# New Note\n\nCapture findings here.',
        tags: [],
        linked_entities: []
      })
      const refreshed = await loadNotes(selectedInvestigationId)
      const created = refreshed.find((n) => n.id === note?.id) || refreshed[0]
      if (created) setActiveNoteId(created.id)
    } catch (err) {
      showError(err?.message || 'Failed to create note.')
    } finally {
      setCreating(false)
    }
  }

  const saveNote = async () => {
    if (!activeNote) return
    setError('')
    try {
      await window.axiom.notes.update(activeNote.id, { ...activeNote, content: draft })
      await loadNotes(selectedInvestigationId)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err) {
      showError(err?.message || 'Failed to save note.')
    }
  }

  const updateTags = async (value) => {
    if (!activeNote) return
    try {
      await window.axiom.notes.update(activeNote.id, {
        tags: value.split(',').map((item) => item.trim()).filter(Boolean)
      })
      await loadNotes(selectedInvestigationId)
    } catch (err) {
      showError(err?.message || 'Failed to update tags.')
    }
  }

  const toggleLinkedEntity = async (entityId) => {
    if (!activeNote) return
    try {
      const linked = new Set(activeNote.linked_entities || [])
      if (linked.has(entityId)) linked.delete(entityId)
      else linked.add(entityId)
      await window.axiom.notes.update(activeNote.id, { linked_entities: [...linked] })
      await loadNotes(selectedInvestigationId)
    } catch (err) {
      showError(err?.message || 'Failed to update linked entities.')
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" className="text-xs underline opacity-70 hover:opacity-100" onClick={() => setError('')}>Dismiss</button>
        </div>
      ) : null}
      {saveSuccess ? (
        <div className="flex items-center gap-2 rounded-2xl border border-success/40 bg-success/5 px-4 py-3 text-sm text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Note saved.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="glass-panel rounded-3xl p-5">
            {investigations.length ? (
              <select value={selectedInvestigationId} onChange={(event) => setSelectedInvestigationId(event.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
                <option value="">Select investigation…</option>
                {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
              </select>
            ) : (
              <p className="rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
                No investigations yet. Create one first.
              </p>
            )}
            <button
              type="button"
              onClick={createNote}
              disabled={!selectedInvestigationId || creating}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              {creating ? 'Creating…' : 'Create Note'}
            </button>
          </div>
          <div className="glass-panel max-h-[720px] overflow-y-auto rounded-3xl p-4">
            <div className="space-y-3">
              {notes.map((note) => (
                <button key={note.id} type="button" onClick={() => setActiveNoteId(note.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors ${activeNoteId === note.id ? 'border-accent-cyan/40 bg-accent-cyan/5' : 'border-border hover:border-border/80'}`}>
                  <p className="font-medium text-primary">{note.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{note.content}</p>
                </button>
              ))}
              {!notes.length ? (
                <p className="p-4 text-sm text-muted">
                  {selectedInvestigationId ? 'No notes for this investigation. Create one above.' : 'Select an investigation to view notes.'}
                </p>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {activeNote ? (
            <>
              <div className="glass-panel rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <input
                    value={activeNote.title}
                    onChange={async (event) => {
                      try {
                        await window.axiom.notes.update(activeNote.id, { title: event.target.value })
                        await loadNotes(selectedInvestigationId)
                      } catch (err) {
                        showError(err?.message || 'Failed to update title.')
                      }
                    }}
                    className="min-w-[280px] flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-xl font-semibold text-primary outline-none"
                  />
                  <button type="button" onClick={saveNote} className="inline-flex items-center gap-2 rounded-2xl border border-accent-cyan/40 px-4 py-3 text-accent-cyan">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <input defaultValue={(activeNote.tags || []).join(', ')} onBlur={(event) => updateTags(event.target.value)} placeholder="tags, comma, separated" className="rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none" />
                  <div className="flex flex-wrap gap-2">
                    {(activeNote.tags || []).map((tag) => <TagBadge key={tag} tag={tag} />)}
                  </div>
                </div>
              </div>
              <MarkdownEditor value={draft} onChange={setDraft} />
              <div className="glass-panel rounded-3xl p-5">
                <h3 className="text-lg font-semibold text-primary">Linked Entities</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {entities.map((entity) => {
                    const linked = (activeNote.linked_entities || []).includes(entity.id)
                    return (
                      <button key={entity.id} type="button" onClick={() => toggleLinkedEntity(entity.id)} className={`rounded-full border px-3 py-2 text-sm ${linked ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan' : 'border-border text-muted'}`}>
                        {entity.label || entity.value}
                      </button>
                    )
                  })}
                  {!entities.length ? <p className="text-sm text-muted">No entities in this investigation yet.</p> : null}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-3xl p-10 text-center text-muted">
              {selectedInvestigationId
                ? 'Click "Create Note" on the left to start a new intelligence note.'
                : 'Select an investigation and create your first note.'}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
