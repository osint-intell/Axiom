import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', icon: Icon = Search, readOnly = false }) {
  return (
    <label className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted">
      <Icon className="h-4 w-4" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full border-none bg-transparent text-primary outline-none placeholder:text-muted"
      />
    </label>
  )
}
