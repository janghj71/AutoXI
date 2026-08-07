export default function SectionCard({ title, tag, actions, children, headerClassName = '', className = '', bodyClassName = '', flush = false }) {
  return (
    <div className={`border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}>
      <div className={`flex items-center gap-2 px-3.5 py-1.5 border-b border-gray-100 bg-gray-50/80 rounded-t-lg ${headerClassName}`}>
        <h3 className="text-xs font-bold text-gray-800">{title}</h3>
        {tag && <span className="text-[10px] uppercase tracking-wide text-gray-400">{tag}</span>}
        {actions && <div className="ml-auto flex items-center gap-1.5">{actions}</div>}
      </div>
      <div className={`${flush ? '' : 'p-3'} ${bodyClassName}`}>{children}</div>
    </div>
  )
}
