import { Handle, Position } from 'reactflow'
import {
  Archive,
  Building2,
  FileText,
  Globe,
  Mail,
  Network,
  Radio,
  UserRound
} from 'lucide-react'

const nodeConfig = {
  username: { icon: UserRound, classes: 'border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan', handleColor: '#22D3EE' },
  email: { icon: Mail, classes: 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue', handleColor: '#3B82F6' },
  domain: { icon: Globe, classes: 'border-accent-purple/50 bg-accent-purple/10 text-accent-purple', handleColor: '#8B5CF6' },
  ip: { icon: Network, classes: 'border-warning/50 bg-warning/10 text-warning', handleColor: '#F59E0B' },
  organization: { icon: Building2, classes: 'border-success/50 bg-success/10 text-success', handleColor: '#22C55E' },
  social: { icon: Radio, classes: 'border-pink-400/50 bg-pink-400/10 text-pink-300', handleColor: '#EC4899' },
  evidence: { icon: Archive, classes: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300', handleColor: '#FACC15' },
  note: { icon: FileText, classes: 'border-slate-400/50 bg-slate-400/10 text-slate-300', handleColor: '#94A3B8' }
}

export default function CustomNode({ data }) {
  const config = nodeConfig[data.type] || nodeConfig.note
  const Icon = config.icon

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: config.handleColor, border: 'none', width: 10, height: 10 }}
      />
      <div className={`min-w-[200px] rounded-2xl border p-4 ${config.classes}`} style={{ boxShadow: `0 0 16px ${config.handleColor}33` }}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-current/20 p-2">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">{data.label}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{data.value}</p>
            <span className="mt-2 inline-flex rounded-full border border-current/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em]">
              {data.type}
            </span>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: config.handleColor, border: 'none', width: 10, height: 10 }}
      />
    </>
  )
}
