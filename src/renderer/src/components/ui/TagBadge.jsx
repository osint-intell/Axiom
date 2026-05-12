export default function TagBadge({ tag, color = 'cyan' }) {
  const palette = {
    cyan: 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan',
    blue: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
    purple: 'border-accent-purple/30 bg-accent-purple/10 text-accent-purple',
    orange: 'border-warning/30 bg-warning/10 text-warning',
    green: 'border-success/30 bg-success/10 text-success',
    red: 'border-danger/30 bg-danger/10 text-danger'
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${palette[color] || palette.cyan}`}>
      {tag}
    </span>
  )
}
