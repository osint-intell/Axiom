import { X } from 'lucide-react'

export default function DrawerPanel({ isOpen, onClose, title, children }) {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-background/60 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`glass-panel absolute right-0 top-0 h-full w-full max-w-xl transform rounded-l-3xl p-6 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full border border-border p-2 text-muted hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 h-[calc(100%-4rem)] overflow-y-auto">{children}</div>
      </aside>
    </div>
  )
}
