import { useEffect, useMemo, useState } from 'react'
import { PackageSearch } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'

const RATE_STORAGE_KEY = 'autoxi.parts.sale-rate'

const PURCHASE_ROWS = [
  { id: 'purchase-1', supplier: '현대모비스', date: '2026-07-21', partCode: '26300-35505', name: '엔진오일 필터', quantity: 12, released: 4, purchasePrice: 8_500, inventoryPrice: 12_000 },
  { id: 'purchase-2', supplier: '현대모비스', date: '2026-07-20', partCode: '28113-2S000', name: '에어클리너 엘리먼트', quantity: 8, released: 2, purchasePrice: 16_000, inventoryPrice: 22_000 },
  { id: 'purchase-3', supplier: '기아부품', date: '2026-07-19', partCode: '58101-G4A00', name: '프론트 브레이크 패드', quantity: 6, released: 1, purchasePrice: 98_000, inventoryPrice: 140_000 },
  { id: 'purchase-4', supplier: '대한부품', date: '2026-07-18', partCode: '86511-R2000', name: '프론트 범퍼 커버', quantity: 3, released: 1, purchasePrice: 92_000, inventoryPrice: 125_000 },
  { id: 'purchase-5', supplier: '대한부품', date: '2026-07-17', partCode: '66311-T1000', name: '프론트 도어 패널', quantity: 4, released: 2, purchasePrice: 72_000, inventoryPrice: 95_000 },
]

const money = (value) => Number(value || 0).toLocaleString('ko-KR')
const loadRate = () => {
  const stored = Number(globalThis.localStorage?.getItem(RATE_STORAGE_KEY))
  return Number.isFinite(stored) && stored > 0 ? String(stored) : '1.1'
}

export default function PartsPurchaseModal({ onClose, onApply }) {
  const [query, setQuery] = useState('')
  const [supplier, setSupplier] = useState('전체')
  const [rate, setRate] = useState(loadRate)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const value = Number(rate)
    if (Number.isFinite(value) && value > 0) globalThis.localStorage?.setItem(RATE_STORAGE_KEY, String(value))
  }, [rate])

  const suppliers = useMemo(() => ['전체', ...new Set(PURCHASE_ROWS.map((row) => row.supplier))], [])
  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return PURCHASE_ROWS.filter((row) => {
      const matchesSupplier = supplier === '전체' || row.supplier === supplier
      const matchesQuery = !keyword || [row.supplier, row.partCode, row.name].some((value) => String(value).toLowerCase().includes(keyword))
      return matchesSupplier && matchesQuery
    })
  }, [query, supplier])

  const salePrice = (row) => Math.round(row.purchasePrice * (Number(rate) || 0))

  const handleDoubleClick = (row) => {
    onApply?.({
      kind: '부품',
      partCode: row.partCode,
      content: row.name,
      work: '교환',
      hour: '1',
      partAmt: salePrice(row),
      laborAmt: 0,
      unitPrice: salePrice(row),
      supplier: row.supplier,
    })
    onClose?.()
  }

  const columns = [
    { key: 'supplier', title: '매입처명', width: '110px' },
    { key: 'date', title: '매입일자', width: '95px' },
    { key: 'partCode', title: '제작사코드', width: '125px' },
    { key: 'name', title: '부품명', width: 'minmax(160px, 1fr)' },
    { key: 'quantity', title: '수량', width: '58px', align: 'right' },
    { key: 'released', title: '출고', width: '58px', align: 'right' },
    { key: 'purchasePrice', title: '매입단가', width: '95px', align: 'right', render: (value) => money(value) },
    { key: 'salePrice', title: '판매단가', width: '95px', align: 'right', render: (_value, row) => money(salePrice(row)) },
    { key: 'inventoryPrice', title: '재고판매가', width: '95px', align: 'right', render: (value) => money(value) },
  ]

  return (
    <Modal
      title={<span className="inline-flex items-center gap-1.5"><PackageSearch size={16} className="text-green-600" />소요부품</span>}
      description="매입목록에서 부품을 선택해 매출내역에 추가합니다."
      onClose={onClose}
      width="max-w-6xl"
      footer={<Button onClick={onClose}>닫기</Button>}
    >
      <div className="flex h-[620px] min-h-0 flex-col gap-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="매입처명, 제작사코드, 부품명 검색" className="h-9 min-w-[260px] flex-1 rounded-sm border border-gray-300 bg-white px-3 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" />
          <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1">
            {suppliers.map((item) => <button key={item} type="button" onClick={() => setSupplier(item)} className={`shrink-0 rounded-sm border px-2.5 py-1.5 text-xs font-medium ${supplier === item ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}>{item}</button>)}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-xs font-semibold text-gray-700">판매단가 = 매입단가 × 배율</span>
          <input value={rate} onChange={(event) => setRate(event.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" className="h-8 w-16 rounded-sm border border-gray-300 bg-white px-2 text-right text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" aria-label="판매단가 배율" />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200">
          <FixedHeadTable columns={columns} rows={filteredRows} rowKey={(row) => row.id} rowSize="sm" height={null} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} onRowDoubleClick={handleDoubleClick} emptyText="조건에 맞는 매입부품이 없습니다." />
        </div>
      </div>
    </Modal>
  )
}
