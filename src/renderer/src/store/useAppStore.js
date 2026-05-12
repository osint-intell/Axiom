import { create } from 'zustand'

const hasBridge = () => typeof window !== 'undefined' && Boolean(window.axiom)

const setLoadingState = (set, key, value) => {
  set((state) => ({
    loading: {
      ...state.loading,
      [key]: value
    }
  }))
}

export const useAppStore = create((set, get) => ({
  currentInvestigation: null,
  investigations: [],
  entities: [],
  evidence: [],
  timeline: [],
  notes: [],
  settings: {},
  relationshipGraph: [],
  error: null,
  loading: {
    investigations: false,
    entities: false,
    evidence: false,
    timeline: false,
    notes: false,
    settings: false
  },
  setCurrentInvestigation: (investigation) => set({ currentInvestigation: investigation }),
  setError: (error) => set({ error }),
  loadInvestigations: async () => {
    if (!hasBridge()) {
      set({ error: 'Secure IPC bridge unavailable.' })
      return []
    }

    setLoadingState(set, 'investigations', true)
    try {
      const investigations = await window.axiom.investigations.getAll()
      set({ investigations, error: null })
      if (!get().currentInvestigation && investigations.length) {
        set({ currentInvestigation: investigations[0] })
      }
      return investigations
    } catch (error) {
      set({ error: error.message })
      return []
    } finally {
      setLoadingState(set, 'investigations', false)
    }
  },
  loadEntities: async (investigationId) => {
    if (!hasBridge()) return []
    setLoadingState(set, 'entities', true)
    try {
      const entities = investigationId
        ? await window.axiom.entities.getByInvestigation(investigationId)
        : await window.axiom.entities.getAll()
      set({ entities, error: null })
      return entities
    } catch (error) {
      set({ error: error.message })
      return []
    } finally {
      setLoadingState(set, 'entities', false)
    }
  },
  loadEvidence: async (investigationId) => {
    if (!hasBridge()) return []
    setLoadingState(set, 'evidence', true)
    try {
      const evidence = investigationId
        ? await window.axiom.evidence.getByInvestigation(investigationId)
        : await window.axiom.evidence.getAll()
      set({ evidence, error: null })
      return evidence
    } catch (error) {
      set({ error: error.message })
      return []
    } finally {
      setLoadingState(set, 'evidence', false)
    }
  },
  loadTimeline: async (investigationId) => {
    if (!hasBridge()) return []
    setLoadingState(set, 'timeline', true)
    try {
      const timeline = investigationId
        ? await window.axiom.timeline.getByInvestigation(investigationId)
        : await window.axiom.timeline.getAll()
      set({ timeline, error: null })
      return timeline
    } catch (error) {
      set({ error: error.message })
      return []
    } finally {
      setLoadingState(set, 'timeline', false)
    }
  },
  loadNotes: async (investigationId) => {
    if (!hasBridge()) return []
    setLoadingState(set, 'notes', true)
    try {
      const notes = investigationId
        ? await window.axiom.notes.getByInvestigation(investigationId)
        : await window.axiom.notes.getAll()
      set({ notes, error: null })
      return notes
    } catch (error) {
      set({ error: error.message })
      return []
    } finally {
      setLoadingState(set, 'notes', false)
    }
  },
  loadSettings: async () => {
    if (!hasBridge()) return {}
    setLoadingState(set, 'settings', true)
    try {
      const settings = await window.axiom.settings.get()
      set({ settings, error: null })
      return settings
    } catch (error) {
      set({ error: error.message })
      return {}
    } finally {
      setLoadingState(set, 'settings', false)
    }
  },
  refreshInvestigationContext: async (investigationId) => {
    await Promise.all([
      get().loadEntities(investigationId),
      get().loadEvidence(investigationId),
      get().loadTimeline(investigationId),
      get().loadNotes(investigationId)
    ])
  }
}))
