import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Search, Wrench } from 'lucide-react'
import Button from '../components/Button'
import FixedHeadTable from '../components/FixedHeadTable'
import PopupPageShell from '../components/PopupPageShell'

const areaImageModules = import.meta.glob('../assets/areas/*.gif', { eager: true, query: '?url', import: 'default' })
const AREA_LABELS = {
  '1A': '프론트 범퍼', '1B': '후드', '1C': '프론트 도어', '1D': '앞 휀더', '1E': '사이드실',
  '1F': '루프', '1G': '트렁크', '1H': '리어 범퍼', '1I': '리어 도어', '1J': '리어 휀더',
  '2A': '프론트 범퍼', '2B': '콘솔박스', '2C': '시트', '2D': '루프', '2E': '바닥 패널',
  '3A': '프론트 유리', '3B': '리어 유리', '4A': '리어 게이트', '5A': '루프', '6A': '엔진룸',
}
const areaImages = Object.fromEntries(Object.entries(areaImageModules).map(([path, url]) => [path.split('/').pop().split('.')[0], url]))
const AREA_CODES = Object.keys(areaImages)
const GROUPS = ['전체', '프론트', '사이드', '루프/실내', '리어']

const WORK_ITEMS = [
  { id: 'w1', code: '64900T1000', name: '프론트 도어 우측', work: '교환', hour: '1.20', labor: '33,600', area: '1C' },
  { id: 'w2', code: '86511R2000', name: '프론트 범퍼 커버', work: '교환', hour: '1.00', labor: '28,000', area: '1A' },
  { id: 'w3', code: '66311T1000', name: '프론트 도어 패널', work: '판금', hour: '2.50', labor: '70,000', area: '1C' },
  { id: 'w4', code: '92101G8000', name: '헤드램프 탈착', work: '탈착', hour: '0.60', labor: '16,800', area: '1A' },
  { id: 'w5', code: '87310D4000', name: '리어 범퍼 도장', work: '도장', hour: '2.00', labor: '56,000', area: '1H' },
]
const TIME_ITEMS = [
  { id: 't1', code: 'B01', name: '탈착·조립 기본', work: '탈착', hour: '0.50' },
  { id: 't2', code: 'B03', name: '교환 기본공임', work: '교환', hour: '1.00' },
  { id: 't3', code: 'B05', name: '판금 기본공임', work: '판금', hour: '1.50' },
  { id: 't4', code: 'B07', name: '도장 준비작업', work: '도장', hour: '0.80' },
]
const PAINT_ITEMS = [
  { id: 'p1', coat: '2코트', name: '프론트범퍼 커버', material: '37,200', hour: '1.73' },
  { id: 'p2', coat: '3코트', name: '프론트 도어 우측', material: '42,000', hour: '2.10' },
  { id: 'p3', coat: '2코트', name: '리어범퍼 커버', material: '39,500', hour: '1.90' },
]
const PART_ITEMS = [
  { id: 'p4', code: '82651-3S000', name: '도어 아웃사이드핸들', qty: '1', unit: '78,000' },
  { id: 'p5', code: '86511-R2000', name: '프론트 범퍼 커버', qty: '1', unit: '125,000' },
  { id: 'p6', code: '66311-T1000', name: '프론트 도어 패널', qty: '1', unit: '95,000' },
]

const tableColumns = {
  work: [
    { key: 'name', title: '작업항목명', width: '100%' },
  ],
  time: [
    { key: 'work', title: '작업', width: '70%' }, { key: 'hour', title: '시간', width: '30%', align: 'right' },
  ],
  paint: [
    { key: 'coat', title: '코트명', width: '22%' }, { key: 'name', title: '도장명', width: '48%' },
    { key: 'material', title: '재료대', width: '18%', align: 'right' }, { key: 'hour', title: '시간', width: '12%', align: 'right' },
  ],
  part: [
    { key: 'code', title: '품번', width: '30%' }, { key: 'name', title: '부품명', width: '40%' },
    { key: 'qty', title: '수량', width: '14%', align: 'right' }, { key: 'unit', title: '단가', width: '16%', align: 'right' },
  ],
}

export default function LaborItemsPopup() {
  const [context, setContext] = useState({ carNo: '11가1111', carname: 'ALL NEW G80' })
  const carNo = context.carNo || '11가1111'
  const carName = context.carname || 'ALL NEW G80'
  const [areas, setAreas] = useState(AREA_CODES.map((code) => ({ code, label: AREA_LABELS[code] || `영역 ${code}`, image: areaImages[code] })))
  const [group, setGroup] = useState('전체')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedWork, setSelectedWork] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedPaint, setSelectedPaint] = useState(null)
  const [selectedPart, setSelectedPart] = useState(null)
  const [query, setQuery] = useState('')
  const [dragCode, setDragCode] = useState(null)

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== globalThis.location.origin || event.data?.type !== 'LABOR_ITEMS_SET_CTX') return
      setContext((prev) => ({ ...prev, ...(event.data.payload || {}) }))
    }
    globalThis.addEventListener('message', onMessage)
    return () => globalThis.removeEventListener('message', onMessage)
  }, [])

  const visibleAreas = group === '전체' ? areas : areas.filter((area) => {
    const n = Number(area.code[0])
    return group === '프론트' ? n === 1 : group === '사이드' ? n === 2 : group === '루프/실내' ? n === 3 || n === 4 : n >= 5
  })
  const filteredWork = useMemo(() => WORK_ITEMS.filter((item) => {
    const keyword = query.trim().toLowerCase()
    return (!keyword || `${item.code} ${item.name} ${item.work}`.toLowerCase().includes(keyword)) && (!selectedArea || item.area === selectedArea)
  }), [query, selectedArea])
  const postPick = (type, item) => {
    try { globalThis.opener?.postMessage({ type: 'LABOR_ITEMS_PICK', payload: { type, ...item, seccode: selectedArea } }, globalThis.location.origin) } catch { /* opener unavailable */ }
  }
  const reorder = (from, to) => {
    setAreas((prev) => {
      const next = [...prev]; const fromIndex = next.findIndex((item) => item.code === from); const toIndex = next.findIndex((item) => item.code === to)
      if (fromIndex < 0 || toIndex < 0) return prev
      const [moved] = next.splice(fromIndex, 1); next.splice(toIndex, 0, moved); return next
    })
  }

  return (
    <PopupPageShell title="공임항목" description={`수리차량: ${carName} / 차량번호: ${carNo}`} onClose={() => globalThis.close?.()} closeWhenOpenerClosed actions={<Button className="border-amber-500 bg-amber-100 text-gray-800 hover:bg-amber-200"><ClipboardCheck size={14} />견적점검</Button>}>
      <div className="min-h-0 flex-1 flex gap-3 overflow-hidden bg-gray-50 p-3">
        <section className="flex w-[340px] min-h-0 shrink-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-3 py-2 text-sm font-semibold">영역</div>
          <div className="flex flex-wrap gap-1 border-b border-gray-200 px-3 py-2">{GROUPS.map((item) => <button key={item} type="button" onClick={() => setGroup(item)} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${group === item ? 'bg-zinc-900 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>{item}</button>)}</div>
          <div className="min-h-0 flex-1 overflow-auto p-2"><div className="grid grid-cols-3 gap-3">{visibleAreas.map((area) => <button key={area.code} type="button" draggable onDragStart={() => setDragCode(area.code)} onDragOver={(event) => event.preventDefault()} onDrop={() => { reorder(dragCode, area.code); setDragCode(null) }} onClick={() => setSelectedArea(area.code)} className={`h-[130px] rounded-md border-2 bg-white p-2 text-left ${selectedArea === area.code ? 'border-red-400' : 'border-gray-200 hover:border-gray-400'}`}><div className="flex h-[90px] items-center justify-center overflow-hidden"><img src={area.image} alt={area.label} className="h-[84px] w-auto object-contain" draggable={false} /></div><div className="mt-2 truncate text-sm font-semibold">{area.label}</div></button>)}</div></div>
        </section>

        <div className="min-w-0 min-h-0 flex-1 flex flex-col gap-2">
          <div className="min-h-0 flex-[1.2] grid gap-3" style={{ gridTemplateColumns: '3fr 2fr' }}>
            <section className="min-h-0 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white"><div className="flex items-center border-b border-gray-200 px-3 py-2"><div className="text-sm font-semibold">작업항목 <span className="ml-2 text-xs font-normal text-gray-500">(영역: {areas.find((area) => area.code === selectedArea)?.label || '-'})</span></div><Button size="sm" className="ml-auto" disabled={!selectedWork} onClick={() => selectedWork && postPick('workItem', selectedWork)}>선택</Button></div><div className="min-h-0 flex-1"><FixedHeadTable columns={tableColumns.work} rows={filteredWork} rowKey={(row) => row.id} rowSize="sm" selectedKey={selectedWork?.id} onRowClick={setSelectedWork} onRowDoubleClick={(row) => postPick('workItem', row)} emptyText="작업항목이 없습니다." /></div></section>
            <section className="min-h-0 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white"><div className="flex items-center border-b border-gray-200 px-3 py-2"><div className="text-sm font-semibold">작업 / 시간</div><Button size="sm" className="ml-auto" disabled={!selectedTime} onClick={() => selectedTime && postPick('workTime', selectedTime)}>선택</Button></div><div className="min-h-0 flex-1"><FixedHeadTable columns={tableColumns.time} rows={TIME_ITEMS} rowKey={(row) => row.id} rowSize="sm" selectedKey={selectedTime?.id} onRowClick={setSelectedTime} onRowDoubleClick={(row) => postPick('workTime', row)} /></div></section>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"><Wrench size={15} className="text-gray-500" /><span className="text-sm font-semibold">작업항목 검색</span><div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-300 px-2"><Search size={14} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="작업항목명 또는 코드" /></div></div>
          <section className="flex h-[200px] shrink-0 min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white"><div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2"><span className="text-sm font-semibold">도장</span><div className="flex gap-3 text-xs">{['교환도장', '외판금', '표면판금', '전면판금'].map((item, index) => <label key={item} className="flex items-center gap-1"><input type="radio" name="paint-kind" defaultChecked={index === 0} />{item}</label>)}<span className="font-semibold text-gray-700">유용성 · 2코트</span></div><Button size="sm" className="ml-auto" disabled={!selectedPaint} onClick={() => selectedPaint && postPick('paint', selectedPaint)}>선택</Button></div><div className="min-h-0 flex-1"><FixedHeadTable columns={tableColumns.paint} rows={PAINT_ITEMS} rowKey={(row) => row.id} rowSize="sm" selectedKey={selectedPaint?.id} onRowClick={setSelectedPaint} onRowDoubleClick={(row) => postPick('paint', row)} /></div></section>
          <section className="flex h-[220px] shrink-0 min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white"><div className="flex items-center border-b border-gray-200 px-3 py-2"><span className="text-sm font-semibold">부품</span><Button size="sm" className="ml-auto" disabled={!selectedPart} onClick={() => selectedPart && postPick('part', selectedPart)}>선택</Button></div><div className="min-h-0 flex-1"><FixedHeadTable columns={tableColumns.part} rows={PART_ITEMS} rowKey={(row) => row.id} rowSize="sm" selectedKey={selectedPart?.id} onRowClick={setSelectedPart} onRowDoubleClick={(row) => postPick('part', row)} /></div></section>
        </div>
      </div>
      <footer className="flex shrink-0 items-center border-t border-gray-200 bg-white px-4 py-2 text-xs text-gray-600">선택영역: <strong className="ml-1 text-gray-900">{areas.find((area) => area.code === selectedArea)?.label || '-'}</strong><span className="mx-2">·</span>선택항목: <strong className="ml-1 text-gray-900">{selectedWork?.name || '-'}</strong></footer>
    </PopupPageShell>
  )
}
