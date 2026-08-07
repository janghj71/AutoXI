import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Search, Trash2 } from 'lucide-react'
import Button from '../components/Button'
import FixedHeadTable from '../components/FixedHeadTable'
import PopupPageShell from '../components/PopupPageShell'
import PreventionCycleModal from './02_작업일지/PreventionCycleModal'

const preventiveImages = import.meta.glob('../assets/예방/*.gif', { eager: true, query: '?url', import: 'default' })

const BASE_ITEMS = [
  ['101', '엔진오일', 5000, 182], ['102', '자동변속기오일', 40000, 0], ['103', '수동변속기오일', 40000, 0],
  ['104', '브레이크오일', 30000, 730], ['105', '파워스티어링오일', 40000, 0], ['107', '디퍼렌셜오일', 40000, 0],
  ['109', '트랜스퍼 케이스', 40000, 0], ['110', '부동액', 20000, 730], ['111', '연료필터(가솔린)', 30000, 0],
  ['112', '연료필터(디젤)', 20000, 0], ['114', 'LPG 필터', 40000, 0], ['117', '점화플러그', 20000, 0],
  ['121', '부동액', 20000, 730], ['123', '에어컨가스', 40000, 730], ['217', '공기청정필터', 10000, 182],
  ['229', '후방공기정화필터', 20000, 365], ['301', '브레이크 패드', 30000, 0],
].map(([code, name, interval, days]) => ({ code, name, interval, days }))

const ITEM_NAMES = {
  101: '엔진오일', 102: '브레이크오일', 103: '파워스티어링오일', 104: '클러치디스크', 105: '수동밋션오일',
  106: '클러치오일', 107: '디퍼렌션오일', 108: '서스펜션구리스주입', 109: '외부벨트', 110: '타이밍벨트',
  111: '워터펌프', 112: '앞 브레이크 패드', 113: '뒤 브레이크 패드', 114: '타이어위치교환', 115: '타이어 교체',
  116: '배터리 교환', 117: '휠얼라이먼트', 118: '점화플러그(일반)', 119: '점화플러그배선',
  121: '부동액', 122: '연료필터(가솔린)', 123: '에어컨가스',
  126: '타이어', 127: '타이어 공기압', 205: '브레이크액', 217: '공기청정필터', 221: '후방카메라', 222: '자동변속기오일',
  227: '엔진오일필터', 228: '에어클리너필터', 229: '후방공기정화필터', 301: '브레이크 패드', 302: '브레이크 디스크',
  303: '타이밍벨트', 304: '구동벨트', 305: '냉각수', 306: '배터리', 307: '타이어 위치교환', 308: '휠 얼라인먼트',
  401: '정기점검', 402: '검사', 403: '차계부 점검', 404: '기타',
}

const ITEM_TYPES = {
  101: '교환', 102: '교환', 103: '교환', 104: '교환', 105: '교환', 107: '교환', 109: '교환', 110: '보충',
  111: '교환', 112: '교환', 113: '교환', 114: '교환', 115: '교환', 116: '교환', 117: '교환', 118: '교환',
  119: '교환', 121: '교환', 122: '교환', 123: '보충', 126: '점검', 127: '점검', 205: '교환', 217: '교환',
  221: '점검', 222: '교환', 227: '교환', 228: '교환', 229: '교환', 301: '교환', 302: '교환', 303: '교환',
  304: '교환', 305: '보충', 306: '점검', 307: '조정', 308: '조정', 401: '점검', 402: '점검', 403: '세척', 404: '점검',
}

const IMAGE_ITEMS = Object.entries(preventiveImages).map(([path, src]) => {
  const code = path.match(/(\\d+)\\.gif$/)?.[1] || ''
  const base = BASE_ITEMS.find((item) => item.code === code)
  return { code, name: ITEM_NAMES[code] || base?.name || '', type: ITEM_TYPES[code] || '점검', interval: base?.interval || 0, days: base?.days || 0, image: src }
})

const PARTS = [
  { id: 'p1', code: '26300-35505', name: '엔진오일 필터', price: '12,000', labor: '3,000' },
  { id: 'p2', code: '26320-2F000', name: '에어클리너 엘리먼트', price: '22,000', labor: '4,000' },
  { id: 'p3', code: '97133-L1000', name: '에어컨 필터', price: '18,500', labor: '3,500' },
]

const CYCLE_OPTIONS = [
  { km: 5000, days: 182, label: '5,000 KM · 182일' },
  { km: 8000, days: 0, label: '8,000 KM' },
  { km: 7000, days: 200, label: '7,000 KM · 200일' },
  { km: 10000, days: 182, label: '10,000 KM · 182일' },
]

export default function PreventiveItemsPopup() {
  const [context, setContext] = useState({ carNo: '11가1234', mileage: 45000 })
  const [query, setQuery] = useState('')
  const [managedRows, setManagedRows] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [menu, setMenu] = useState(null)
  const [cycleOpen, setCycleOpen] = useState(false)

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin === globalThis.location.origin && event.data?.type === 'PREVENTIVE_ITEMS_SET_CTX') {
        setContext((prev) => ({ ...prev, ...(event.data.payload || {}) }))
      }
    }
    globalThis.addEventListener('message', onMessage)
    return () => globalThis.removeEventListener('message', onMessage)
  }, [])

  const filtered = useMemo(() => BASE_ITEMS.filter((item) => !query.trim() || `${item.code} ${item.name}`.includes(query.trim())), [query])
  const selected = managedRows.find((row) => row.id === selectedId)

  const addManaged = (item, cycle = CYCLE_OPTIONS[0]) => {
    const row = { ...item, id: `${item.code}-${Date.now()}`, status: item.type, interval: cycle.km, days: cycle.days, nextKm: Number(context.mileage || 0) + cycle.km, nextDate: cycle.days ? '2027-08-06' : '-' }
    setManagedRows((prev) => [...prev, row])
    setSelectedId(row.id)
  }
  const removeManaged = (id) => setManagedRows((prev) => prev.filter((row) => row.id !== id))

  const scheduleColumns = [
    { key: 'code', title: '코드', width: '70px', align: 'center' },
    { key: 'name', title: '예방항목명', width: 'minmax(180px, 1fr)' },
    { key: 'interval', title: '주기KM', width: '90px', align: 'right', render: (value) => Number(value || 0).toLocaleString() },
    { key: 'status', title: '구분', width: '70px', align: 'center' },
    { key: 'nextKm', title: '차기KM', width: '95px', align: 'right', render: (value) => Number(value || 0).toLocaleString() },
    { key: 'nextDate', title: '차기일자', width: '105px' },
    { key: '__actions', title: '관리', width: '55px', align: 'center', render: (_value, row) => <button type="button" onClick={(event) => { event.stopPropagation(); removeManaged(row.id) }} className="text-gray-400 hover:text-red-600" aria-label="삭제"><Trash2 size={14} /></button> },
  ]
  const partColumns = [
    { key: 'code', title: '제조사품번', width: '28%' }, { key: 'name', title: '부품명', width: '36%' },
    { key: 'price', title: '부품액', width: '18%', align: 'right' }, { key: 'labor', title: '공임액', width: '18%', align: 'right' },
  ]

  return (
    <PopupPageShell title="예방항목" description={`차량번호: ${context.carNo} · 현재 주행거리: ${Number(context.mileage || 0).toLocaleString()} KM`} onClose={() => globalThis.close?.()} closeWhenOpenerClosed>
      <div className="flex min-h-0 flex-1 gap-3 bg-gray-50 p-3">
        <section className="relative flex w-[300px] shrink-0 min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-3 py-2 text-sm font-semibold">예방항목</div>
          <div className="flex h-9 items-center gap-2 border-b border-gray-200 px-2"><Search size={14} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="항목명 검색" className="min-w-0 flex-1 text-xs outline-none" /></div>
          <div className="min-h-0 flex-1 overflow-auto p-2"><div className="grid grid-cols-2 gap-2">{IMAGE_ITEMS.filter((item) => !query.trim() || `${item.code} ${item.name}`.includes(query.trim())).map((item) => <button key={item.code} type="button" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setMenu({ item, left: rect.right + 4, top: rect.top }) }} className={`flex min-h-[122px] flex-col items-stretch rounded-md border p-2 text-left hover:border-green-500 hover:bg-green-50 ${selected?.code === item.code ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}><img src={item.image} alt="" className="mx-auto h-16 w-16 shrink-0 object-contain" /><span className="mt-1 min-h-[30px] whitespace-normal text-center text-xs font-semibold leading-tight text-red-500">{item.name || '미등록'}</span></button>)}</div></div>
          {menu && <div className="fixed z-50 w-48 rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg" style={{ left: menu.left, top: menu.top }} onMouseLeave={() => setMenu(null)}><div className="border-b border-gray-100 px-2 py-1 text-xs text-gray-500">{menu.item.name}</div>{CYCLE_OPTIONS.map((cycle) => <button key={cycle.label} type="button" className="block w-full rounded px-2 py-1.5 text-left hover:bg-gray-100" onClick={() => { addManaged(menu.item, cycle); setMenu(null) }}>{cycle.label}</button>)}</div>}
        </section>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <section className="flex min-h-0 flex-[1.2] flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="flex items-center border-b border-gray-200 px-3 py-2"><div className="text-sm font-semibold">예방항목 목록 <span className="ml-2 text-xs font-normal text-gray-500">차량 예방관리</span></div><Button size="sm" className="ml-auto" onClick={() => setCycleOpen(true)}>주기설정</Button></div>
            <div className="min-h-0 flex-1"><FixedHeadTable columns={scheduleColumns} rows={managedRows} rowSize="sm" rowKey={(row) => row.id} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} emptyText="등록된 예방항목이 없습니다." /></div>
          </section>
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="flex items-center border-b border-gray-200 px-3 py-2"><div className="text-sm font-semibold">예방부품 <span className="ml-2 text-xs font-normal text-gray-500">연결코드: {selected?.code || '-'}</span></div><Button variant="primary" size="sm" className="ml-auto">부품 추가</Button></div>
            <div className="min-h-0 flex-1"><FixedHeadTable columns={partColumns} rows={selected ? PARTS : []} rowSize="sm" rowKey={(row) => row.id} emptyText="연결된 부품이 없습니다." /></div>
          </section>
          <div className="flex shrink-0 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"><div className="flex items-center gap-2 text-xs text-gray-600"><CalendarDays size={14} className="text-gray-400" />차기 교환 예정: <strong className="text-gray-900">{selected ? `${Number(selected.nextKm).toLocaleString()} KM · ${selected.nextDate}` : '-'}</strong></div><Button variant="primary" size="sm">매출내역에 추가</Button></div>
        </div>
      </div>
      {cycleOpen && <PreventionCycleModal onClose={() => setCycleOpen(false)} />}
    </PopupPageShell>
  )
}
