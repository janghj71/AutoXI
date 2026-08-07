import { useState } from 'react'
import {
  CalendarCheck, ReceiptText, UserPlus, MessageSquare, FileText,
  Smartphone, Package, Plus, Settings, BarChart3, Megaphone,
  ArrowRight, LayoutGrid, Newspaper, Headset, Boxes, ClipboardList, BookUser,
} from 'lucide-react'
import Select from '../components/Select'
import Button from '../components/Button'
import { menuData } from '../data/menuData'
import QuickMenuSettingsModal from '../components/QuickMenuSettingsModal'
import { focusNextOnEnter } from '../utils/focusNextOnEnter'

// --- 목업 데이터 (추후 API 연동) ---
const MAX_QUICK = 10

// 메뉴 id별 아이콘/배지 (지정 없으면 기본 아이콘)
const META_BY_ID = {
  '0212': { Icon: CalendarCheck, badge: 5 },
  '0201': { Icon: ReceiptText },
  '0501': { Icon: UserPlus },
  '0502': { Icon: MessageSquare },
  '0337': { Icon: FileText },
  '0207': { Icon: Smartphone },
  '0601': { Icon: Package },
  '0602': { Icon: Boxes },
  '0210': { Icon: ClipboardList },
}
const DEFAULT_ICON = FileText

// 전체 메뉴(아코디언용) — 아이콘 해석해서 트리로
const menuGroups = menuData.map((g) => ({
  id: g.id,
  label: g.label,
  children: g.children.map((c) => ({
    id: c.id,
    label: c.label,
    Icon: META_BY_ID[c.id]?.Icon || DEFAULT_ICON,
    badge: META_BY_ID[c.id]?.badge,
  })),
}))

// 초기 퀵메뉴 (표시 라벨은 대시보드용 축약, 매칭은 menuData id 기준)
const INITIAL_QUICK = [
  { id: '0212', label: '예약관리', Icon: CalendarCheck, badge: 5 },
  { id: '0201', label: '매출일지', Icon: ReceiptText },
  { id: '0501', label: '고객등록', Icon: UserPlus },
  { id: '0502', label: '문자발송', Icon: MessageSquare },
  { id: '0337', label: '세금계산서', Icon: FileText },
  { id: '0207', label: '현장 간편조회', Icon: Smartphone },
  { id: '0601', label: '부품등록', Icon: Package },
  { id: '0602', label: '재고조회', Icon: Boxes },
  { id: '0210', label: '견적관리', Icon: ClipboardList },
]

const shortcuts = [
  { label: '원격지원', desc: 'Remote Service', bg: 'bg-green-700', sub: 'text-green-200', light: false, Icon: Headset },
  { label: 'FAQ', desc: '자주하는 질문', bg: 'bg-green-600', sub: 'text-green-100', light: false },
  { label: '메뉴얼', desc: '상세매뉴얼 다운로드', bg: 'bg-green-50', sub: 'text-gray-500', light: true },
]

const notices = [
  { title: '개인정보 문자발송·서명 기능 추가 안내', date: '07.01' },
  { title: '7월 정기 점검 안내', date: '06.28' },
  { title: '전자세금계산서 발행 규정 변경', date: '06.20' },
  { title: '하이웨이 업데이트 v3.2 배포', date: '06.15' },
]

const chagyebu = [
  { label: '누적', value: '1,284' },
  { label: '당월', value: '37' },
  { label: '금일', value: '3', accent: true },
]

const makers = ['현대 GSW', '기아 GSW', '르노 RSM', 'KGM EPC', '쉐보레 ACD']

const templateTabs = ['정비예약', '검사예약', '위치안내']

const senderNumbers = ['0802580615', '0312580615']
const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const v = String(i).padStart(2, '0')
  return { value: v, label: `${v}시` }
})

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>{children}</div>
  )
}

export default function Dashboard() {
  const [sendNo, setSendNo] = useState(senderNumbers[0])
  const [sendHour, setSendHour] = useState('')
  const [quickItems, setQuickItems] = useState(INITIAL_QUICK)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="min-h-full bg-gray-50 p-4 max-xl:p-3 [@media(max-height:900px)]:p-2" onKeyDown={focusNextOnEnter}>
      {/* 빠른 메뉴 + 바로가기 */}
      <div className="grid grid-cols-[3fr_1fr] gap-3 max-xl:gap-2 [@media(max-height:900px)]:gap-2 mb-4 max-xl:mb-3 [@media(max-height:900px)]:mb-2">
        {/* 빠른 메뉴 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">빠른 메뉴</span>
            <button onClick={() => setEditOpen(true)} className="text-xs text-green-600 flex items-center gap-1 hover:text-green-700">
              <Settings size={13} /> 편집
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {quickItems.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                className="relative bg-white border border-gray-200 rounded-lg py-2.5 px-1.5 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-green-300 transition-all"
              >
                {badge != null && (
                  <span className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1 bg-red-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
                <span className="size-8 rounded-lg bg-green-50 text-green-800 flex items-center justify-center">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </button>
            ))}
            {quickItems.length < MAX_QUICK && (
              <button onClick={() => setEditOpen(true)} className="border border-dashed border-gray-300 rounded-lg py-2.5 px-1.5 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50/40 transition-colors">
                <Plus size={18} />
                <span className="text-xs">추가</span>
              </button>
            )}
          </div>
        </div>

        {/* 바로가기 */}
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900 mb-2">바로가기</div>
          <div className="flex flex-col gap-2 flex-1">
            {shortcuts.map((s) => (
              <button
                key={s.label}
                className={`${s.bg} ${s.light ? 'text-green-800 border border-green-100' : 'text-white'} rounded-md px-3.5 flex-1 flex items-center justify-between hover:opacity-95 transition-opacity`}
              >
                <span className="text-sm font-medium flex items-center gap-1.5">
                  {s.Icon && <s.Icon size={15} />}
                  {s.label}
                </span>
                <span className={`text-xs ${s.sub}`}>{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 문자발송 + (차계부 / 공지 / 제조사 / 외부링크) */}
      <div className="grid grid-cols-2 gap-3 max-xl:gap-2 [@media(max-height:900px)]:gap-2 mb-4 max-xl:mb-3 [@media(max-height:900px)]:mb-2">
        {/* 문자발송 */}
        <Card className="p-3.5 max-xl:p-3 [@media(max-height:900px)]:p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
              <MessageSquare size={15} className="text-green-600" /> 문자발송
            </span>
            <div className="flex gap-1.5">
              {templateTabs.map((t, i) => (
                <span
                  key={t}
                  className={`text-xs rounded-md px-2 py-1 ${i === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <textarea
            className="min-h-30 [@media(max-height:900px)]:min-h-20 bg-gray-50 border border-gray-200 rounded-md p-2.5 text-xs text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:border-green-400"
            placeholder="문자내용을 입력해 주세요. 80Byte 이상은 장문으로 발송됩니다."
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>SMS</span><span>0 / 80 Byte</span>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">보내는사람</div>
            <div className="flex gap-1.5">
              <Select
                className="flex-1"
                value={sendNo}
                onChange={setSendNo}
                options={senderNumbers}
                radius="rounded-md"
              />
              <Button size="sm"><Plus size={13} />발신번호등록</Button>
            </div>
          </div>

          {/* 받는사람 5칸 + 주소록 (3열×2행) */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>받는사람</span><span>0명</span></div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <input
                  key={n}
                  className="border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-green-400"
                  placeholder={`번호${n}`}
                />
              ))}
              <button className="border border-green-600 bg-green-50 text-green-700 font-medium rounded-md px-2 py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-green-100">
                <BookUser size={13} /> 주소록
              </button>
            </div>
          </div>

          {/* 예약전송 */}
          <div>
            <div className="text-xs text-gray-500 mb-1">예약전송</div>
            <div className="flex gap-1.5">
              <input type="date" className="flex-1 border border-gray-300 rounded-md px-2.5 py-1.5 text-xs text-gray-500 focus:outline-none focus:border-green-400" />
              <Select
                className="w-24"
                value={sendHour}
                onChange={setSendHour}
                options={hourOptions}
                placeholder="시간 선택"
                radius="rounded-md"
              />
            </div>
          </div>

          {/* 문자발송 (전체 폭) */}
          <button className="bg-green-600 text-white rounded-md py-2.5 text-sm font-medium hover:bg-green-700">문자발송</button>
        </Card>

        {/* 오른쪽 스택 */}
        <div className="flex flex-col gap-3 max-xl:gap-2 [@media(max-height:900px)]:gap-2">
          {/* 차계부 (통합) */}
          <Card className="p-3.5 max-xl:p-3 [@media(max-height:900px)]:p-2.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-green-600" /> 차계부
                  <span className="text-xs text-gray-400 font-normal ml-1">하이웨이 배포·운영</span>
                </span>
              </div>
              <button className="text-xs text-green-600 flex items-center gap-0.5 hover:text-green-700">관리 <ArrowRight size={12} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {chagyebu.map((c) => (
                <div key={c.label} className="bg-green-50 rounded-lg py-2.5 text-center">
                  <div className="text-xs text-gray-500">{c.label}</div>
                  <div className={`text-lg font-medium ${c.accent ? 'text-green-600' : 'text-green-800'}`}>{c.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* 공지사항 */}
          <Card className="p-3.5 max-xl:p-3 [@media(max-height:900px)]:p-2.5 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <Megaphone size={15} className="text-green-600" /> 공지사항
              </span>
              <button className="text-xs text-gray-400 hover:text-gray-600">더보기</button>
            </div>
            {notices.map((n, i) => (
              <div key={n.title} className={`flex justify-between items-center py-1.5 text-xs ${i < notices.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="truncate text-gray-700">{n.title}</span>
                <span className="text-gray-400 flex-shrink-0 ml-2">{n.date}</span>
              </div>
            ))}
          </Card>

          {/* 제조사 부품 조회 */}
          <Card className="p-3.5 max-xl:p-3 [@media(max-height:900px)]:p-2.5">
            <div className="text-xs text-gray-500 mb-2">제조사 부품 조회</div>
            <div className="flex flex-wrap gap-1.5">
              {makers.map((m) => (
                <button key={m} className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-700 hover:bg-green-50">{m}</button>
              ))}
            </div>
          </Card>

          {/* 부가서비스 / 연합회 */}
          <div className="flex gap-2">
            <button className="flex-1 bg-white border border-gray-200 rounded-lg py-2.5 text-xs text-gray-700 flex items-center justify-center gap-1.5 hover:bg-green-50">
              <LayoutGrid size={14} className="text-green-600" /> 부가서비스 보기
            </button>
            <button className="flex-1 bg-white border border-gray-200 rounded-lg py-2.5 text-xs text-gray-700 flex items-center justify-center gap-1.5 hover:bg-green-50">
              <Newspaper size={14} className="text-green-600" /> 연합회 공지사항
            </button>
          </div>
        </div>
      </div>

      {/* 롤링 배너 */}
      <button className="w-full bg-green-50 border border-green-100 rounded-xl p-4 max-xl:p-3 [@media(max-height:900px)]:p-2.5 flex items-center justify-between mb-4 max-xl:mb-3 [@media(max-height:900px)]:mb-2 hover:bg-green-100/60 transition-colors text-left">
        <div>
          <div className="text-sm font-medium text-green-800">자동차 부품·용품 전문몰</div>
          <div className="text-xs text-gray-500 mt-1">시간대별 롤링 배너 영역</div>
        </div>
        <span className="text-xs text-green-600 flex items-center gap-1">바로가기 <ArrowRight size={14} /></span>
      </button>

      {/* 푸터 */}
      <div className="border-t border-gray-200 pt-3.5 text-xs text-gray-400 leading-relaxed">
        <div className="text-gray-500">고객센터 09:00~18:00 · 토·일·공휴일 휴무 <span className="text-green-600 font-medium">1522-3840</span></div>
        <div>경기도 하남시 덕풍동 831-1, 현대지식산업센터 한강미사 2차 C동 713호</div>
        <div>COPYRIGHT 2026 AutoXI. ALL RIGHTS RESERVED. · 개인정보 처리방침</div>
      </div>

      {editOpen && (
        <QuickMenuSettingsModal
          items={quickItems}
          menuGroups={menuGroups}
          maxItems={MAX_QUICK}
          onClose={() => setEditOpen(false)}
          onSave={(next) => { setQuickItems(next); setEditOpen(false) }}
        />
      )}
    </div>
  )
}
