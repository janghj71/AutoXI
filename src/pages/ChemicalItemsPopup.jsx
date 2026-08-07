import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import Button from '../components/Button'
import FixedHeadTable from '../components/FixedHeadTable'
import PopupPageShell from '../components/PopupPageShell'

const MATERIALS = [
  { id: 'c1', code: 'M-001', name: '퍼티(일반)', unit: 'EA', price: '18,000', hour: '0.20', remark: '판금 보수용' },
  { id: 'c2', code: 'M-002', name: '서페이서', unit: 'L', price: '32,000', hour: '0.35', remark: '도장 전 처리' },
  { id: 'c3', code: 'M-003', name: '탈지제', unit: 'L', price: '12,000', hour: '0.10', remark: '표면 세정' },
  { id: 'c4', code: 'M-004', name: '방청제', unit: 'EA', price: '15,000', hour: '0.15', remark: '부식 방지' },
  { id: 'c5', code: 'M-005', name: '실리콘 제거제', unit: 'EA', price: '21,000', hour: '0.18', remark: '접착면 처리' },
  { id: 'c6', code: 'M-006', name: '언더코팅', unit: 'L', price: '28,000', hour: '0.40', remark: '차체 하부' },
  { id: 'c7', code: 'M-007', name: '왁스', unit: 'EA', price: '9,500', hour: '0.08', remark: '마감 작업' },
]

const columns = [
  { key: 'code', title: '부품코드', width: '14%' },
  { key: 'name', title: '항목', width: '30%' },
  { key: 'unit', title: '단위', width: '10%', align: 'center' },
  { key: 'price', title: '단가', width: '16%', align: 'right' },
  { key: 'hour', title: '작업시간', width: '14%', align: 'right' },
  { key: 'remark', title: '비고', width: '16%' },
]

export default function ChemicalItemsPopup() {
  const [context, setContext] = useState({ carNo: '11가1234' })
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(MATERIALS[0].id)
  const rows = useMemo(() => MATERIALS.filter((row) => !query.trim() || `${row.code} ${row.name} ${row.remark}`.toLowerCase().includes(query.trim().toLowerCase())), [query])
  const selected = rows.find((row) => row.id === selectedId) || rows[0]

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== globalThis.location.origin || event.data?.type !== 'CHEM_ITEMS_SET_CTX') return
      setContext((prev) => ({ ...prev, ...(event.data.payload || {}) }))
    }
    globalThis.addEventListener('message', onMessage)
    return () => globalThis.removeEventListener('message', onMessage)
  }, [])

  const pick = () => {
    if (!selected) return
    try { globalThis.opener?.postMessage({ type: 'CHEM_ITEMS_PICK', payload: { item: selected, carNo: context.carNo } }, globalThis.location.origin) } catch { /* opener unavailable */ }
  }

  return (
    <PopupPageShell title="케미칼항목" description={`차량번호: ${context.carNo}`} onClose={() => globalThis.close?.()} closeWhenOpenerClosed>
      <div className="flex min-h-0 flex-1 flex-col gap-3 bg-gray-50 p-4">
        <div className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3"><Search size={15} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="부품코드 / 항목 / 비고 검색" className="min-w-0 flex-1 text-sm outline-none" /></div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200 bg-white"><FixedHeadTable columns={columns} rows={rows} rowSize="sm" rowKey={(row) => row.id} selectedKey={selected?.id} onRowClick={(row) => setSelectedId(row.id)} onRowDoubleClick={pick} emptyText="케미칼항목이 없습니다." /></div>
        <div className="flex shrink-0 justify-end"><Button variant="primary" onClick={pick} disabled={!selected}>선택</Button></div>
      </div>
    </PopupPageShell>
  )
}
