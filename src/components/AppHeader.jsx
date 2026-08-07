import { Calendar, Cloud } from 'lucide-react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function todayLabel() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} (${DAYS[d.getDay()]})`
}

export default function AppHeader() {
  return (
    <header className="h-12 bg-green-700 text-white flex items-center justify-between shadow-sm flex-shrink-0 px-5">
      <span className="text-sm font-semibold tracking-wide whitespace-nowrap">AutoXI 정비공장 종합관리 시스템</span>
      <span className="flex items-center gap-2 text-xs text-green-100 whitespace-nowrap">
        <Calendar size={14} /> {todayLabel()}
        <span className="opacity-50">·</span>
        <Cloud size={14} /> 경기도 27°C 구름많음
      </span>
      <div className="flex items-center gap-4 text-xs text-green-100 whitespace-nowrap">
        <span className="text-white">홍길동 님</span>
        <button className="hover:text-white transition-colors">로그아웃</button>
      </div>
    </header>
  )
}
