/**
 * 페이지 내부용 세로 탭 (설정 화면 좌측 서브 내비게이션)
 */
export default function VerticalTabs({ tabs, activeId, onChange, className = '' }) {
  return (
    <div className={`w-36 shrink-0 flex flex-col gap-0.5 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeId === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`text-left px-3 py-2 rounded-md text-sm border-l-2 transition-colors ${
              isActive
                ? 'bg-green-50 text-green-700 font-semibold border-green-600'
                : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
