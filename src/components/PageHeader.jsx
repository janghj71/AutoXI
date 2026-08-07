export default function PageHeader({ title, description, icon: Icon, actions }) {
  return (
    <header className="flex min-h-[61px] shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 text-base font-semibold leading-5 text-gray-800">
          {Icon && <Icon size={17} className="shrink-0 text-green-600" />}
          <span className="truncate">{title}</span>
        </h2>
        <p className="mt-0.5 min-h-[14px] truncate text-[11px] leading-[14px] text-gray-400">{description ?? ''}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
