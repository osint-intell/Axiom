import { NavLink } from 'react-router-dom'
import {
  Archive,
  Clock,
  Download,
  FileText,
  FolderOpen,
  Hexagon,
  LayoutDashboard,
  Network,
  Settings,
  Shield,
  UserSearch
} from 'lucide-react'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/investigations', label: 'Investigations', icon: FolderOpen },
  { to: '/identity-correlation', label: 'Identity Correlation', icon: UserSearch },
  { to: '/relationship-graph', label: 'Relationship Graph', icon: Network },
  { to: '/evidence-vault', label: 'Evidence Vault', icon: Archive },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/notes', label: 'Notes', icon: FileText },
  { to: '/exports', label: 'Exports', icon: Download },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="glass-panel glow-cyan flex items-center gap-3 rounded-2xl p-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-cyan/10 text-accent-cyan">
          <Hexagon className="absolute h-10 w-10 opacity-60" />
          <Shield className="relative h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted">OSINT-INTELL</p>
          <h1 className="text-xl font-semibold text-gradient">Axiom</h1>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                isActive
                  ? 'border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan glow-cyan'
                  : 'border-transparent text-muted hover:border-border hover:bg-panel/80 hover:text-primary'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="glass-panel rounded-2xl p-4 text-sm text-muted">
        <p className="font-medium text-primary">Secure Desktop Runtime</p>
        <p className="mt-1">Version 1.0.0</p>
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-accent-cyan">Context Isolation Enabled</p>
      </div>
    </div>
  )
}
