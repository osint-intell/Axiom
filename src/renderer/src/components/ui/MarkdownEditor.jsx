import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownEditor({ value, onChange }) {
  return (
    <div className="glass-panel grid min-h-[560px] grid-cols-1 overflow-hidden rounded-3xl xl:grid-cols-2">
      <div className="border-b border-border xl:border-b-0 xl:border-r">
        <div className="border-b border-border px-4 py-3 text-sm font-medium text-muted">Markdown</div>
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="h-[520px] w-full resize-none bg-transparent px-4 py-4 text-sm text-primary outline-none"
          placeholder="Write intelligence notes, hypotheses, and findings..."
        />
      </div>
      <div>
        <div className="border-b border-border px-4 py-3 text-sm font-medium text-muted">Preview</div>
        <div className="prose prose-invert max-w-none space-y-4 px-4 py-4 prose-headings:text-primary prose-p:text-muted prose-strong:text-primary prose-code:text-accent-cyan">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '_Preview will render here._'}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
