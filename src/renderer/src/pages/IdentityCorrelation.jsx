import { useEffect, useState } from 'react'
import { AlertCircle, BrainCircuit, CheckCircle, Link2, PlusCircle, Radar, Sparkles } from 'lucide-react'
import TagBadge from '@/components/ui/TagBadge'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useAppStore } from '@/store/useAppStore'

const initialForm = {
  investigation_id: '',
  username: '',
  alias: '',
  email: '',
  domain: '',
  phone: '',
  ip: ''
}

export default function IdentityCorrelation() {
  const { investigations, loadInvestigations } = useAppStore()
  const [form, setForm] = useState(initialForm)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  useEffect(() => {
    loadInvestigations().then((items) => {
      if (!form.investigation_id && items[0]) {
        setForm((state) => ({ ...state, investigation_id: items[0].id }))
      }
    })
  }, [form.investigation_id, loadInvestigations])

  const hasInput = Object.entries(form).some(([k, v]) => k !== 'investigation_id' && v.trim())

  const analyze = async () => {
    if (!hasInput) {
      setError('Enter at least one identifier (username, email, domain, etc.) to run analysis.')
      return
    }
    setLoading(true)
    setError('')
    setAnalyzed(false)
    try {
      const response = await window.axiom.entities.correlate(form)
      setResults(response)
      setAnalyzed(true)
    } catch (err) {
      setError(err?.message || 'Correlation engine failed. Check the Electron console for details.')
    } finally {
      setLoading(false)
    }
  }

  const addToInvestigation = async () => {
    if (!form.investigation_id) {
      setError('Select an investigation before adding an entity.')
      return
    }
    const value = form.username || form.alias || form.email || form.domain || form.phone || form.ip
    if (!value) {
      setError('Enter at least one identifier to add as an entity.')
      return
    }
    const type = form.email ? 'email' : form.domain ? 'domain' : form.ip ? 'ip' : 'username'
    try {
      await window.axiom.entities.create({
        investigation_id: form.investigation_id,
        type,
        value,
        label: value,
        confidence: results?.confidence || 50,
        metadata: { source: 'identity-correlation' }
      })
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
    } catch (err) {
      setError(err?.message || 'Failed to add entity to investigation.')
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
      {addSuccess ? (
        <div className="flex items-center gap-2 rounded-2xl border border-success/40 bg-success/5 px-4 py-3 text-sm text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Entity added to investigation successfully.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-accent-cyan" />
            <div>
              <h2 className="text-2xl font-semibold text-primary">Identity Correlation Engine</h2>
              <p className="text-sm text-muted">Fuse aliases, domains, email patterns, and IP overlaps against known entities.</p>
            </div>
          </div>
          {!investigations.length ? (
            <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
              Create an investigation first to correlate and save entities.
            </div>
          ) : null}
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-muted">Investigation (for saving results)</label>
              <select value={form.investigation_id} onChange={(event) => setForm((state) => ({ ...state, investigation_id: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none">
                <option value="">Select investigation…</option>
                {investigations.map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
              </select>
            </div>
            {['username', 'alias', 'email', 'domain', 'phone', 'ip'].map((field) => (
              <div key={field}>
                <label className="mb-2 block text-sm capitalize text-muted">{field}</label>
                <input value={form[field]} onChange={(event) => setForm((state) => ({ ...state, [field]: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none focus:border-accent-cyan/50" placeholder={`Enter ${field}`} />
              </div>
            ))}
          </div>
          <button type="button" onClick={analyze} disabled={loading} className="glow-cyan mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background disabled:opacity-60">
            <Radar className="h-4 w-4" />
            {loading ? 'Analyzing…' : 'Run Analysis'}
          </button>
        </section>

        <section className="space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent-purple">Correlation Score</p>
                <h2 className="mt-2 text-2xl font-semibold text-primary">
                  {analyzed
                      ? results?.confidence >= 60
                        ? 'Strong identity signal detected'
                        : results?.confidence >= 20
                          ? 'Partial identity pattern found'
                          : 'Analysis complete — low-confidence signal'
                      : 'Awaiting analysis input'}
                    </h2>
                    {analyzed ? (
                      <p className="mt-2 text-sm text-muted">
                        {results?.suggestions?.length
                          ? `${results.suggestions.length} correlated entity match${results.suggestions.length > 1 ? 'es' : ''} found in your investigations.`
                          : 'No DB matches yet — input analysis complete. Add entities to investigations to enable cross-reference.'}
                      </p>
                    ) : null}
              </div>
              <div
                className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-border text-center"
                style={{ background: `conic-gradient(#22D3EE ${results?.confidence || 0}%, rgba(30,41,59,0.45) 0)` }}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-panel text-3xl font-semibold text-primary">
                  {results?.confidence || 0}%
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  <h3 className="text-lg font-semibold text-primary">Matched Reasons</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  {results?.reasons?.map((reason) => (
                    <li key={reason} className="rounded-2xl border border-border px-4 py-3">{reason}</li>
                  ))}
                  {!results?.reasons?.length ? (
                    <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-center">
                      {analyzed ? 'Run additional input fields to surface more signals.' : 'Run analysis to surface matching rationales.'}
                    </li>
                  ) : null}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-accent-purple" />
                  <h3 className="text-lg font-semibold text-primary">Suggested Relationships</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {results?.suggestions?.map((suggestion) => (
                    <div key={suggestion.id} className="glass-panel rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-primary">{suggestion.label}</p>
                          <p className="text-sm text-muted">{suggestion.value}</p>
                        </div>
                        <TagBadge tag={`${suggestion.confidence}%`} color="purple" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <TagBadge tag={suggestion.type} color="blue" />
                        {suggestion.investigation_title ? <TagBadge tag={suggestion.investigation_title} color="cyan" /> : null}
                      </div>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                        {suggestion.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                      </ul>
                    </div>
                  ))}
                  {!results?.suggestions?.length ? (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                      {analyzed ? 'No correlated entities found. Add more entities across investigations to enable correlation.' : 'No correlated entities yet.'}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <button type="button" onClick={addToInvestigation} disabled={!form.investigation_id || !hasInput} className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-accent-cyan/40 px-4 py-3 text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50">
              <PlusCircle className="h-4 w-4" />
              Add as Entity to Investigation
            </button>
          </div>
          {loading ? <LoadingOverlay contained label="Running identity correlation engine…" /> : null}
        </section>
      </div>
    </div>
  )
}
