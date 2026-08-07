/**
 * 페이지 내부용 탭
 * - variant="classic" (기본): 상위 레벨용. 탭 아래 전체 폭 가로줄이 항상 이어지고,
 *   활성 탭은 그 줄 위에 흰 배경 박스로 얹혀 구분된다.
 * - variant="pill": 하위(중첩) 레벨용. 회색 배경 알약형 세그먼트로, 상위 탭과
 *   위계가 겹치지 않게 시각적으로 더 가볍게 보인다.
 * - tab.icon에 lucide 아이콘 컴포넌트를 넘기면 라벨 앞에 표시
 */
export default function SectionTabs({ tabs, activeId, onChange, className = '', variant = 'classic' }) {
  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeId === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                isActive ? 'bg-white text-green-700 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {Icon && <Icon size={14} className={isActive ? 'text-green-600' : 'text-gray-400'} />}
              {tab.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-1 border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeId === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm whitespace-nowrap rounded-t-md border-t border-l border-r transition-colors ${
              isActive
                ? 'bg-white border-gray-200 text-green-700 font-semibold'
                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {Icon && <Icon size={14} className={isActive ? 'text-green-600' : 'text-gray-400'} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
