import { Plus, Search, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import SearchBar from '@/components/ui/SearchBar'

const titleMap = {
  '/dashboard': 'Operational Dashboard',
  '/investigations': 'Investigation Workspace',
  '/identity-correlation': 'Identity Correlation',
  '/relationship-graph': 'Relationship Graph',
  '/evidence-vault': 'Evidence Vault',
  '/timeline': 'Timeline Analysis',
  '/notes': 'Intelligence Notes',
  '/exports': 'Exports Center',
  '/settings': 'Settings'
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const title = titleMap[location.pathname] || 'Axiom'

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted">OSINT Investigation Platform</p>
          <h2 className="mt-1 text-2xl font-semibold text-primary">{title}</h2>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden w-full max-w-md lg:block">
            <SearchBar value="" onChange={() => {}} placeholder="Search investigations, entities, evidence..." icon={Search} readOnly />
          </div>
          <div className="glass-panel hidden items-center gap-2 rounded-full px-3 py-2 text-xs text-success md:flex">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure bridge connected</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/investigations')
              window.dispatchEvent(new CustomEvent('axiom:new-investigation'))
            }}
            className="glow-cyan inline-flex items-center gap-2 rounded-full bg-accent-cyan px-4 py-2 text-sm font-semibold text-background hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            New Investigation
          </button>
        </div>
      </div>
    </header>
  )
}
