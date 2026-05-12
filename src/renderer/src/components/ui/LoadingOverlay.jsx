export default function LoadingOverlay({ label = 'Loading intelligence...', contained = false }) {
  return (
    <div className={`${contained ? 'absolute inset-0 rounded-3xl' : 'fixed inset-0 z-50'} flex items-center justify-center bg-background/60 backdrop-blur-sm`}>
      <div className="glass-panel flex items-center gap-4 rounded-2xl px-5 py-4">
        <div className="h-10 w-10 animate-pulse rounded-full border-2 border-accent-cyan border-t-transparent" />
        <span className="text-sm text-primary">{label}</span>
      </div>
    </div>
  )
}
