import { X } from 'lucide-react'

export default function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onCloseAll }) {
  if (tabs.length === 0) return null

  return (
    <div className="flex h-12 shrink-0 items-stretch border-b border-gray-200 bg-white px-2">
      <div className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id
          return (
            <div
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`-mb-px flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 text-xs transition-colors ${
                isActive
                  ? 'border-green-600 font-semibold text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              <button
                type="button"
                aria-label={`${tab.label} 탭 닫기`}
                onClick={(event) => {
                  event.stopPropagation()
                  onTabClose(tab.id)
                }}
                className="ml-0.5 rounded-sm text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="ml-2 flex shrink-0 items-center border-l border-gray-200 pl-2">
        <button
          type="button"
          onClick={onCloseAll}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <X size={14} strokeWidth={2} />
          모두 닫기
        </button>
      </div>
    </div>
  )
}
