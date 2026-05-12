import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full border border-border p-2 text-muted hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
