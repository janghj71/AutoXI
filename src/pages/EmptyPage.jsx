import { focusNextOnEnter } from '../utils/focusNextOnEnter'

export default function EmptyPage({ menuId, label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500" onKeyDown={focusNextOnEnter}>
      <div className="text-5xl mb-4">📋</div>
      <div className="text-lg font-semibold text-gray-600">{menuId} {label}</div>
      <div className="text-sm mt-2">개발 예정 화면입니다.</div>
    </div>
  )
}
