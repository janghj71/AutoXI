import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Circle, PackageSearch, Search } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const CATEGORY1_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'engine', label: '엔진' },
  { value: 'brake', label: '브레이크' },
  { value: 'body', label: '차체' },
]

const CATEGORY2_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'oil', label: '오일/필터' },
  { value: 'pad', label: '패드/디스크' },
  { value: 'panel', label: '패널/커버' },
]

const SORT_OPTIONS = [
  { value: 'name', label: '부품명순' },
  { value: 'stock', label: '재고 많은순' },
  { value: 'recent', label: '최근 등록순' },
]

const MANAGEMENT_STATUS_OPTIONS = [
  { value: '0', label: '0 재고관리' },
  { value: '1', label: '1 공임' },
  { value: '2', label: '2 재고관리 제외' },
]

const PART_STATUS_OPTIONS = [
  { value: 'A', label: 'A 신품' },
  { value: 'B', label: 'B 재재조' },
  { value: 'C', label: 'C 중고' },
  { value: 'D', label: 'D 인증대체' },
  { value: 'F', label: 'F 수입부품' },
]

const INVENTORY_PARTS = [
  {
    id: 'inventory-1', category1: 'engine', category2: 'oil', partCode: '26300-35505', name: '엔진오일 필터', partLabor: 11_500, stock: 8, purchasePrice: 8_500, location: 'A-01-03', repairVehicle: true,
    salesPrices: [{ type: '일반', price: 12_000 }, { type: '보험', price: 13_000 }], engines: ['2.5 GDI', '3.5 GDI'], vehicles: ['G80', 'GV80'],
  },
  {
    id: 'inventory-2', category1: 'engine', category2: 'oil', partCode: '28113-2S000', name: '에어클리너 엘리먼트', partLabor: 23_000, stock: 6, purchasePrice: 16_000, location: 'A-01-05', repairVehicle: true,
    salesPrices: [{ type: '일반', price: 22_000 }], engines: ['2.0 T-GDI'], vehicles: ['쏘나타 DN8', 'K5'],
  },
  {
    id: 'inventory-3', category1: 'brake', category2: 'pad', partCode: '58101-G4A00', name: '프론트 브레이크 패드', partLabor: 145_000, stock: 4, purchasePrice: 98_000, location: 'B-02-01', repairVehicle: true,
    salesPrices: [{ type: '일반', price: 140_000 }, { type: '보험', price: 155_000 }], engines: ['2.5 GDI'], vehicles: ['G80', '그랜저 IG'],
  },
  {
    id: 'inventory-4', category1: 'body', category2: 'panel', partCode: '86511-R2000', name: '프론트 범퍼 커버', partLabor: 130_000, stock: 2, purchasePrice: 92_000, location: 'C-03-02', repairVehicle: false,
    salesPrices: [{ type: '일반', price: 125_000 }], engines: ['2.0 T-GDI'], vehicles: ['아이오닉 5'],
  },
]

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

export default function InventoryPartsModal({ vehicleName = '', onClose, onApply }) {
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [repairOnly, setRepairOnly] = useState(false)
  const [appliedRepairOnly, setAppliedRepairOnly] = useState(false)
  const [category1, setCategory1] = useState('all')
  const [category2, setCategory2] = useState('all')
  const [sort, setSort] = useState('name')
  const [selectedId, setSelectedId] = useState(INVENTORY_PARTS[0]?.id ?? null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [managementStatus, setManagementStatus] = useState('0')
  const [partStatus, setPartStatus] = useState('A')
  const [pointsEnabled, setPointsEnabled] = useState(false)
  const [memo, setMemo] = useState('')

  const rows = useMemo(() => {
    const keyword = appliedQuery.trim().toLowerCase()
    const filtered = INVENTORY_PARTS.filter((row) => {
      const matchesQuery = !keyword || [row.partCode, row.name].some((value) => value.toLowerCase().includes(keyword))
      const matchesRepair = !appliedRepairOnly || row.repairVehicle
      const matchesCategory1 = category1 === 'all' || row.category1 === category1
      const matchesCategory2 = category2 === 'all' || row.category2 === category2
      return matchesQuery && matchesRepair && matchesCategory1 && matchesCategory2
    })
    return [...filtered].sort((a, b) => sort === 'stock' ? b.stock - a.stock : sort === 'recent' ? b.id.localeCompare(a.id) : a.name.localeCompare(b.name, 'ko'))
  }, [appliedQuery, appliedRepairOnly, category1, category2, sort])

  const selected = INVENTORY_PARTS.find((row) => row.id === selectedId) || null

  const search = () => {
    setAppliedQuery(query)
    setAppliedRepairOnly(repairOnly)
  }

  const apply = (row) => {
    if (!row) return
    onApply?.({ kind: '부품', partCode: row.partCode, content: row.name, work: '교환', hour: '1', partAmt: row.salesPrices[0]?.price || 0, laborAmt: 0, unitPrice: row.salesPrices[0]?.price || 0, supplier: '' })
    onClose?.()
  }

  const columns = [
    { key: 'partCode', title: '제작사품번', width: '125px' },
    { key: 'name', title: '부품명', width: 'minmax(180px, 1fr)' },
    { key: 'partLabor', title: '부품+공임', width: '100px', align: 'right', render: (value) => money(value) },
    { key: 'stock', title: '재고', width: '70px', align: 'right' },
  ]

  const salesColumns = [
    { key: 'type', title: '단가종류', width: '50%', align: 'left' },
    { key: 'price', title: '판매가', width: '50%', align: 'right', render: (value) => money(value) },
  ]

  const engineColumns = [{ key: 'name', title: '엔진형식', width: '100%' }]
  const vehicleColumns = [{ key: 'name', title: '적용차종', width: '100%' }]

  return (
    <Modal
      title={<span className="inline-flex items-center gap-1.5"><PackageSearch size={16} className="text-green-600" />재고부품</span>}
      description={<span>차량명: {vehicleName || '-'}</span>}
      onClose={onClose}
      width="max-w-5xl"
      footer={<><Button onClick={onClose}>닫기</Button><Button variant="primary" disabled={!selected} onClick={() => apply(selected)}><Check size={14} />선택</Button></>}
    >
      <div className="flex h-[620px] min-h-0 flex-col gap-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex min-w-[260px] flex-1 items-center gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="부품번호, 부품명 검색" className="w-full min-w-0 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" />
            <Button size="sm" onClick={search}><Search size={14} />검색</Button>
          </div>
        </div>

        <div className={`grid min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200 ${detailOpen ? 'grid-cols-[minmax(0,1fr)_minmax(240px,280px)_36px]' : 'grid-cols-[minmax(0,1fr)_36px]'}`}>
          <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_220px] overflow-hidden border-r border-gray-200 bg-gray-100">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="flex h-[37px] shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-800">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-600"><Circle size={7} fill="currentColor" />카테고리</span>
                  <Select value={category1} onChange={setCategory1} options={CATEGORY1_OPTIONS} className="w-[125px] min-w-0" />
                  <Select value={category2} onChange={setCategory2} options={CATEGORY2_OPTIONS} className="w-[125px] min-w-0" />
                </div>
                <Select value={sort} onChange={setSort} options={SORT_OPTIONS} className="w-[130px] min-w-0" />
              </div>
              <div className="min-h-0 flex-1"><FixedHeadTable columns={columns} rows={rows} rowKey={(row) => row.id} rowSize="sm" height={null} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} onRowDoubleClick={apply} emptyText="조회된 부품이 없습니다." /></div>
              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-gray-200 bg-gray-50 p-2 text-xs"><div><span className="text-gray-500">매입가</span><strong className="ml-2 text-gray-800">{selected ? `${money(selected.purchasePrice)}원` : '-'}</strong></div><div><span className="text-gray-500">부품위치</span><strong className="ml-2 text-gray-800">{selected?.location || '-'}</strong></div></div>
            </div>
            <div className="min-h-0 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="flex h-[37px] shrink-0 items-center justify-start border-b border-gray-200 bg-gray-50 px-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={repairOnly}
                  aria-label="수리차량만"
                  onClick={() => {
                    setRepairOnly((enabled) => {
                      setAppliedRepairOnly(!enabled)
                      return !enabled
                    })
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs ${repairOnly ? 'text-green-700' : 'text-gray-500'}`}
                >
                  <span className={`relative h-4 w-7 rounded-full transition ${repairOnly ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition ${repairOnly ? 'left-3.5' : 'left-0.5'}`} />
                  </span>
                  수리차량만
                </button>
              </div>
              <div className="h-[calc(100%-37px)]"><FixedHeadTable columns={vehicleColumns} rows={(selected?.vehicles || []).map((name) => ({ name }))} rowKey={(row) => row.name} rowSize="sm" height={null} emptyText="적용차종이 없습니다." /></div>
            </div>
          </section>

          {detailOpen && <section className="flex min-h-0 flex-col border border-gray-200 bg-white">
            <div className="flex h-[37px] shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-800">부품상세</div>
            <div className="min-h-0 flex-1 overflow-auto p-0">
              <div className="grid h-[150px] grid-rows-[150px]">
                <div className="min-h-0 overflow-hidden"><FixedHeadTable columns={salesColumns} rows={selected?.salesPrices || []} rowKey={(row) => row.type} rowSize="sm" height={null} emptyText="판매가가 없습니다." /></div>
              </div>
              <div className="mt-3 flex flex-col gap-3 border-t border-gray-200 px-2 pt-3 text-xs">
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-gray-600">관리상태</span>
                  <Select value={managementStatus} onChange={setManagementStatus} options={MANAGEMENT_STATUS_OPTIONS} className="min-w-0 w-full" />
                </label>
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-gray-600">부품상태</span>
                  <Select value={partStatus} onChange={setPartStatus} options={PART_STATUS_OPTIONS} className="min-w-0 w-full" />
                </label>
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input type="checkbox" checked={pointsEnabled} onChange={(event) => setPointsEnabled(event.target.checked)} className="accent-green-600" />
                  <span>적립적용</span>
                </label>
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-gray-600">메모</span>
                  <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="메모 입력" rows={5} className="h-28 min-w-0 flex-1 resize-none rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" />
                </label>
              </div>
            </div>
          </section>}

          <div className="flex items-start justify-center bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setDetailOpen((open) => !open)}
              title={detailOpen ? '부품상세 접기' : '부품상세 열기'}
              aria-label={detailOpen ? '부품상세 접기' : '부품상세 열기'}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100"
            >
              {detailOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
