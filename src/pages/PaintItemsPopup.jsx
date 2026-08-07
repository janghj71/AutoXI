import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import Button from '../components/Button'
import FixedHeadTable from '../components/FixedHeadTable'
import PopupPageShell from '../components/PopupPageShell'

const PAINT_ROWS = [
  { id: 'p1', coat: '2코트', name: '프론트범퍼 커버', swapMaterial: '37,200', swapHour: '1.73', outerMaterial: '39,200', outerHour: '2.38', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p2', coat: '2코트', name: '후드', swapMaterial: '70,300', swapHour: '3.30', outerMaterial: '76,000', outerHour: '4.08', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p3', coat: '2코트', name: '프론트 펜더(좌)', swapMaterial: '30,000', swapHour: '1.59', outerMaterial: '33,500', outerHour: '2.07', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p4', coat: '2코트', name: '프론트 펜더(우)', swapMaterial: '30,000', swapHour: '1.59', outerMaterial: '33,500', outerHour: '2.07', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p5', coat: '2코트', name: '프론트 휠하우스&에어프런 패널(좌)', swapMaterial: '8,300', swapHour: '0.48', outerMaterial: '11,400', outerHour: '0.78', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p6', coat: '2코트', name: '프론트 사이드멤버(좌)', swapMaterial: '15,200', swapHour: '0.88', outerMaterial: '21,000', outerHour: '1.44', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p7', coat: '2코트', name: '카울 패널', swapMaterial: '6,400', swapHour: '0.28', outerMaterial: '8,500', outerHour: '0.40', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p8', coat: '2코트', name: '대쉬 패널(일체형)', swapMaterial: '21,800', swapHour: '1.25', outerMaterial: '29,900', outerHour: '2.03', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p9', coat: '2코트', name: '프론트 필러(좌)', swapMaterial: '18,900', swapHour: '1.04', outerMaterial: '24,300', outerHour: '1.43', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p10', coat: '2코트', name: '프론트 도어(좌)', swapMaterial: '59,700', swapHour: '2.89', outerMaterial: '66,600', outerHour: '4.13', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p11', coat: '2코트', name: '프론트 도어(우)', swapMaterial: '59,700', swapHour: '2.89', outerMaterial: '66,600', outerHour: '4.13', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
  { id: 'p12', coat: '2코트', name: '리어 도어(좌)', swapMaterial: '50,600', swapHour: '2.45', outerMaterial: '56,500', outerHour: '3.50', surfaceMaterial: '0', surfaceHour: '0', frontMaterial: '0', frontHour: '0' },
]

const columns = [
  { key: 'coat', title: '코트', width: '8%' }, { key: 'name', title: '도장항목', width: '26%' },
  { key: 'swapMaterial', title: <Header top="교환도장" bottom="재료비" />, width: '11%', align: 'right' },
  { key: 'swapHour', title: <Header top="교환도장" bottom="지수" />, width: '8%', align: 'right' },
  { key: 'outerMaterial', title: <Header top="외측판금" bottom="재료비" />, width: '11%', align: 'right' },
  { key: 'outerHour', title: <Header top="외측판금" bottom="지수" />, width: '8%', align: 'right' },
  { key: 'surfaceMaterial', title: <Header top="표면판금" bottom="재료비" />, width: '11%', align: 'right' },
  { key: 'surfaceHour', title: <Header top="표면판금" bottom="지수" />, width: '8%', align: 'right' },
  { key: 'frontMaterial', title: <Header top="전면판금" bottom="재료비" />, width: '11%', align: 'right' },
  { key: 'frontHour', title: <Header top="전면판금" bottom="지수" />, width: '8%', align: 'right' },
]

function Header({ top, bottom }) {
  return <div className="text-right leading-tight"><div>{top}</div><div className="text-xs font-normal text-gray-500">{bottom}</div></div>
}

export default function PaintItemsPopup() {
  const [context, setContext] = useState({ carNo: '11가1234', carName: 'LF 쏘나타', coat: '2코트', solvent: '유성용' })
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(PAINT_ROWS[0].id)
  const [paintGroup, setPaintGroup] = useState('swap')
  const [maskMode, setMaskMode] = useState('all')
  const rows = useMemo(() => PAINT_ROWS.filter((row) => !query.trim() || `${row.coat} ${row.name}`.toLowerCase().includes(query.trim().toLowerCase())), [query])
  const selected = rows.find((row) => row.id === selectedId) || rows[0]
  const paintColumns = useMemo(() => columns.map((column) => {
    const group = column.key.includes('swap') ? 'swap' : column.key.includes('outer') ? 'outer' : column.key.includes('surface') ? 'surface' : column.key.includes('front') ? 'front' : ''
    return { ...column, headerClassName: '', cellClassName: (row) => selected?.id === row.id && paintGroup === group ? 'bg-yellow-100' : '' }
  }), [paintGroup, selected?.id])

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== globalThis.location.origin || event.data?.type !== 'PAINT_ITEMS_SET_CTX') return
      setContext((prev) => ({ ...prev, ...(event.data.payload || {}) }))
    }
    globalThis.addEventListener('message', onMessage)
    return () => globalThis.removeEventListener('message', onMessage)
  }, [])

  const postPick = (action = 'paintItem') => {
    if (!selected) return
    try { globalThis.opener?.postMessage({ type: 'PAINT_ITEMS_PICK', payload: { type: action, ...selected, coat: context.coat, solvent: context.solvent, maskMode } }, globalThis.location.origin) } catch { /* opener unavailable */ }
  }

  return (
    <PopupPageShell title="도장항목" description={<span className="flex flex-nowrap items-center gap-2 whitespace-nowrap"><span>수리차량: {context.carName}</span><span>/ 차량번호: {context.carNo}</span><span className="rounded-md bg-gray-100 px-2 py-1 text-sm font-semibold leading-[14px] text-gray-800">도장코트: {context.coat}</span><span className="rounded-md bg-gray-100 px-2 py-1 text-sm font-semibold leading-[14px] text-gray-800">도장도료: {context.solvent}</span></span>} onClose={() => globalThis.close?.()} closeWhenOpenerClosed>
      <div className="flex min-h-0 flex-1 flex-col gap-2 bg-gray-50 p-3">
        <div className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3"><Search size={15} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="도장항목 검색" className="min-w-0 flex-1 text-sm outline-none" /></div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white"><FixedHeadTable columns={paintColumns} rows={rows} rowSize="sm" rowKey={(row) => row.id} selectedKey={selected?.id} onHeaderClick={(key) => { if (key.includes('swap')) setPaintGroup('swap'); else if (key.includes('outer')) setPaintGroup('outer'); else if (key.includes('surface')) setPaintGroup('surface'); else if (key.includes('front')) setPaintGroup('front') }} onRowClick={(row, _index, event) => { setSelectedId(row.id); const cellIndex = event?.target?.closest?.('td')?.cellIndex; if ([2, 3].includes(cellIndex)) setPaintGroup('swap'); if ([4, 5].includes(cellIndex)) setPaintGroup('outer'); if ([6, 7].includes(cellIndex)) setPaintGroup('surface'); if ([8, 9].includes(cellIndex)) setPaintGroup('front') }} onRowDoubleClick={() => postPick()} emptyText="도장항목이 없습니다." /></div>
        <footer className="flex shrink-0 flex-wrap items-center gap-2 pt-1"><Button variant="primary" onClick={() => postPick('estimatePaint')}>견적항목 대상 도장입력</Button><Button variant="secondary" size="md" className={`rounded-md ${maskMode === 'all' ? 'bg-gray-100' : ''}`} onClick={() => setMaskMode('all')}>차체 마스킹(전체)</Button><Button variant="secondary" size="md" className={`rounded-md ${maskMode === 'work' ? 'bg-gray-100' : ''}`} onClick={() => setMaskMode('work')}>차체 마스킹(탈착작업)</Button><Button variant="violet" className="ml-auto" onClick={() => postPick('colorMatch')}>도장 컬러매칭</Button></footer>
      </div>
    </PopupPageShell>
  )
}
