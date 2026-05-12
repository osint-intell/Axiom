import { useEffect, useState } from 'react'
import { CheckCircle, Database, Info, Palette, ShieldCheck, Workflow } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function Settings() {
  const { settings, loadSettings } = useAppStore()
  const [localSettings, setLocalSettings] = useState({ theme: 'dark', animations: true, layout: 'free' })
  const [savedKey, setSavedKey] = useState('')

  useEffect(() => {
    loadSettings().then((loaded) => {
      setLocalSettings({
        theme: loaded['appearance:theme'] || 'dark',
        animations: loaded['graph:animations'] !== 'false',
        layout: loaded['graph:layout'] || 'free'
      })
    })
  }, [loadSettings])

  const updateSetting = async (key, value) => {
    try {
      await window.axiom.settings.set(key, value)
      await loadSettings()
      setSavedKey(key)
      setTimeout(() => setSavedKey(''), 2000)
    } catch (err) {
      console.error('Settings update failed:', err)
    }
  }

  const SavedBadge = ({ settingKey }) => savedKey === settingKey ? (
    <span className="inline-flex items-center gap-1 text-xs text-success">
      <CheckCircle className="h-3 w-3" /> Saved
    </span>
  ) : null

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-accent-cyan" />
            <div>
              <h2 className="text-2xl font-semibold text-primary">Appearance</h2>
              <p className="text-sm text-muted">Visual defaults for the secure desktop workspace.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-muted">Theme</label>
                <SavedBadge settingKey="appearance:theme" />
              </div>
              <select
                value={localSettings.theme}
                onChange={async (event) => {
                  const value = event.target.value
                  setLocalSettings((state) => ({ ...state, theme: value }))
                  await updateSetting('appearance:theme', value)
                }}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none"
              >
                <option value="dark">Dark</option>
                <option value="midnight">Midnight</option>
              </select>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-accent-purple" />
            <div>
              <h2 className="text-2xl font-semibold text-primary">Database</h2>
              <p className="text-sm text-muted">Back up and restore the intelligence store.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                try { await window.axiom.settings.exportDb() } catch (err) { console.error(err) }
              }}
              className="rounded-2xl bg-accent-cyan px-4 py-3 font-semibold text-background"
            >
              Database Backup
            </button>
            <button
              type="button"
              onClick={async () => {
                try { await window.axiom.settings.importDb() } catch (err) { console.error(err) }
              }}
              className="rounded-2xl border border-accent-purple/40 px-4 py-3 font-semibold text-accent-purple"
            >
              Import Database
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await window.axiom.settings.set('cache:lastCleared', new Date().toISOString())
                  setSavedKey('cache:lastCleared')
                  setTimeout(() => setSavedKey(''), 2000)
                } catch (err) { console.error(err) }
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-muted"
            >
              Clear Cache
              <SavedBadge settingKey="cache:lastCleared" />
            </button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Workflow className="h-6 w-6 text-success" />
            <div>
              <h2 className="text-2xl font-semibold text-primary">Graph</h2>
              <p className="text-sm text-muted">Network interaction and visualization preferences.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm text-primary">
              <span className="flex items-center gap-3">
                Enable animations
                <SavedBadge settingKey="graph:animations" />
              </span>
              <input
                type="checkbox"
                checked={localSettings.animations}
                onChange={async (event) => {
                  const value = event.target.checked
                  setLocalSettings((state) => ({ ...state, animations: value }))
                  await updateSetting('graph:animations', String(value))
                }}
                className="h-4 w-4 accent-accent-cyan"
              />
            </label>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-muted">Layout</label>
                <SavedBadge settingKey="graph:layout" />
              </div>
              <select
                value={localSettings.layout}
                onChange={async (event) => {
                  const value = event.target.value
                  setLocalSettings((state) => ({ ...state, layout: value }))
                  await updateSetting('graph:layout', value)
                }}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-primary outline-none"
              >
                <option value="free">Free Layout</option>
                <option value="investigative-grid">Investigative Grid</option>
                <option value="clustered">Clustered</option>
              </select>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Info className="h-6 w-6 text-accent-blue" />
            <div>
              <h2 className="text-2xl font-semibold text-primary">About</h2>
              <p className="text-sm text-muted">Runtime posture, versioning, and responsible use.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm text-muted">
            <div className="rounded-2xl border border-border p-4">
              <p className="font-medium text-primary">Axiom {settings['app:version'] || '1.0.0'}</p>
              <p className="mt-2">Electron-based OSINT desktop platform for controlled investigative workflows.</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <div className="inline-flex items-center gap-2 text-success">
                <ShieldCheck className="h-4 w-4" />
                Context isolation and secure preload bridge are enabled.
              </div>
            </div>
            <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-warning">
              Ethical use notice: operate only with proper authorization, protect privacy, and respect legal limits when processing OSINT data.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
