import { useMemo, useState } from 'react'
import { Check, History, Search } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'

const REPAIR_HISTORY = [
  { id: 'repair-1', carNo: '11가1234', releaseDate: '2026-07-21', content: '엔진오일 교환', quantity: 1, partAmt: 48000, laborAmt: 20000, mileage: 52480, kind: '공임', partCode: '', work: '교환', hour: '0.5', unitPrice: 0 },
  { id: 'repair-2', carNo: '11가1234', releaseDate: '2026-07-21', content: '엔진오일 필터', quantity: 1, partAmt: 12000, laborAmt: 0, mileage: 52480, kind: '부품', partCode: '26300-35505', work: '교환', hour: '1', unitPrice: 12000 },
  { id: 'repair-3', carNo: '11가1234', releaseDate: '2026-04-08', content: '프론트 브레이크 패드', quantity: 1, partAmt: 140000, laborAmt: 35000, mileage: 48200, kind: '부품', partCode: '58101-G4A00', work: '교환', hour: '1.2', unitPrice: 140000 },
  { id: 'repair-4', carNo: '11가1111', releaseDate: '2026-07-21', content: '프론트 범퍼 레일 교환', quantity: 1, partAmt: 0, laborAmt: 15600, mileage: 52480, kind: '공임', partCode: '', work: '교환', hour: '0.6', unitPrice: 0 },
  { id: 'repair-5', carNo: '11가1111', releaseDate: '2026-07-21', content: '빔 컴플리트-프론트 범퍼', quantity: 1, partAmt: 187000, laborAmt: 0, mileage: 52480, kind: '부품', partCode: '64900T1000', work: '교환', hour: '1', unitPrice: 187000 },
  { id: 'repair-6', carNo: '11가1111', releaseDate: '2026-07-21', content: '와이어링 하네스-프론트 범퍼', quantity: 1, partAmt: 90500, laborAmt: 0, mileage: 52480, kind: '부품', partCode: '91890T1081', work: '교환', hour: '1', unitPrice: 90500 },
  { id: 'repair-7', carNo: '11가1111', releaseDate: '2026-04-08', content: '에어컨 필터 교환', quantity: 1, partAmt: 28000, laborAmt: 15000, mileage: 48200, kind: '부품', partCode: '97133-D1000', work: '교환', hour: '0.3', unitPrice: 28000 },
]

const RELEASED_PARTS = [
  { id: 'released-1', carNo: '11가1234', releaseDate: '2026-07-21', partCode: '26300-35505', content: '엔진오일 필터', quantity: 1, unitPrice: 12000, inbound: '반입완료', kind: '부품', work: '교환', hour: '1', partAmt: 12000, laborAmt: 0 },
  { id: 'released-2', carNo: '11가1234', releaseDate: '2026-07-21', partCode: '05100-00441', content: '엔진오일 4L', quantity: 1, unitPrice: 36000, inbound: '반입완료', kind: '부품', work: '교환', hour: '1', partAmt: 36000, laborAmt: 0 },
  { id: 'released-3', carNo: '11가1234', releaseDate: '2026-04-08', partCode: '58101-G4A00', content: '프론트 브레이크 패드', quantity: 1, unitPrice: 140000, inbound: '반입대기', kind: '부품', work: '교환', hour: '1', partAmt: 140000, laborAmt: 0 },
  { id: 'released-4', carNo: '11가1111', releaseDate: '2026-07-21', partCode: '64900T1000', content: '빔 컴플리트-프론트 범퍼', quantity: 1, unitPrice: 187000, inbound: '반입완료', kind: '부품', work: '교환', hour: '1', partAmt: 187000, laborAmt: 0 },
  { id: 'released-5', carNo: '11가1111', releaseDate: '2026-07-21', partCode: '91890T1081', content: '와이어링 하네스-프론트 범퍼', quantity: 1, unitPrice: 90500, inbound: '반입완료', kind: '부품', work: '교환', hour: '1', partAmt: 90500, laborAmt: 0 },
  { id: 'released-6', carNo: '11가1111', releaseDate: '2026-04-08', partCode: '97133-D1000', content: '에어컨 필터', quantity: 1, unitPrice: 28000, inbound: '반입완료', kind: '부품', work: '교환', hour: '1', partAmt: 28000, laborAmt: 0 },
]

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

export default function RepairHistoryModal({ vehicle, onClose, onApply }) {
  const [activeTab, setActiveTab] = useState('repair')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const rows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const sourceRows = activeTab === 'repair' ? REPAIR_HISTORY : RELEASED_PARTS
    return sourceRows.filter((row) => row.carNo === vehicle?.carNo).filter((row) => !keyword || (activeTab === 'repair' ? [row.releaseDate, row.content, row.partCode, row.mileage] : [row.releaseDate, row.partCode, row.content, row.inbound]).some((value) => String(value).toLowerCase().includes(keyword)))
  }, [activeTab, query, vehicle?.carNo])
  const selected = rows.find((row) => row.id === selectedId) || null
  const apply = (row) => {
    if (!row) return
    onApply?.({ kind: row.kind, partCode: row.partCode, content: row.content, work: row.work, hour: row.hour, unitPrice: row.unitPrice, partAmt: row.partAmt, laborAmt: row.laborAmt, quantity: row.quantity })
    onClose?.()
  }
  const repairColumns = [
    { key: 'releaseDate', title: '출고일자', width: '110px' },
    { key: 'content', title: '작업내용', width: 'minmax(180px, 1fr)' },
    { key: 'quantity', title: '수량', width: '65px', align: 'right' },
    { key: 'partAmt', title: '부품액', width: '100px', align: 'right', render: money },
    { key: 'laborAmt', title: '공임액', width: '100px', align: 'right', render: money },
    { key: 'mileage', title: '주행거리', width: '100px', align: 'right', render: money },
  ]
  const releasedPartColumns = [
    { key: 'releaseDate', title: '출고일자', width: '110px' },
    { key: 'partCode', title: '제작사코드', width: '125px' },
    { key: 'content', title: '부품명', width: 'minmax(180px, 1fr)' },
    { key: 'quantity', title: '수량', width: '65px', align: 'right' },
    { key: 'unitPrice', title: '단가', width: '100px', align: 'right', render: money },
    { key: 'inbound', title: '반입', width: '90px', align: 'center' },
  ]

  return <Modal title={<span className="inline-flex items-center gap-1.5"><History size={16} className="text-green-600" />수리이력</span>} description={`차량번호: ${vehicle?.carNo || '-'}`} onClose={onClose} width="max-w-4xl" footer={<><Button onClick={onClose}>닫기</Button><Button variant="primary" size="md" disabled={!selected} onClick={() => apply(selected)}><Check size={14} />선택</Button></>}>
    <div className="flex h-[520px] min-h-0 flex-col gap-3">
      <div className="flex shrink-0 border-b border-gray-200"><button type="button" onClick={() => { setActiveTab('repair'); setSelectedId(null); setQuery('') }} className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === 'repair' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>수리이력</button><button type="button" onClick={() => { setActiveTab('released'); setSelectedId(null); setQuery('') }} className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === 'released' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>출고부품</button></div>
      <div className="flex shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3"><Search size={15} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activeTab === 'repair' ? '출고일자, 작업내용, 품번, 주행거리 검색' : '출고일자, 제작사코드, 부품명, 반입 검색'} className="min-w-0 flex-1 py-2 text-xs outline-none" /></div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200"><FixedHeadTable columns={activeTab === 'repair' ? repairColumns : releasedPartColumns} rows={rows} rowKey={(row) => row.id} rowSize="sm" height={null} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} onRowDoubleClick={apply} emptyText={activeTab === 'repair' ? '해당 차량의 수리이력이 없습니다.' : '해당 차량의 출고부품이 없습니다.'} /></div>
    </div>
  </Modal>
}
