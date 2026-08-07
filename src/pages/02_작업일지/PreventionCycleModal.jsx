import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import { useAlert } from '../../alerts'

const DEFAULT_ROWS = [
  ['405', 'DPF재생 초기화', '50,000', '0'], ['101', '엔진 오일', '5,000', '182'], ['222', '자동변속 오일', '40,000', '0'],
  ['105', '브레이크 오일', '30,000', '730'], ['103', '파워스티어링 오일', '40,000', '0'], ['107', '디퍼렌셜 오일', '40,000', '0'],
  ['229', '트랜스퍼 케이스', '40,000', '0'], ['121', '부동액', '20,000', '730'], ['122', '연료필터(가솔린)', '30,000', '0'],
  ['301', '연료필터(디젤)', '20,000', '0'], ['302', '연료필터(커먼레일)', '20,000', '0'], ['303', 'LPG 필터', '40,000', '0'],
  ['217', '항균필터', '10,000', '182'], ['304', '후공기정화기 필터', '20,000', '365'], ['123', '에어컨개스', '40,000', '730'],
  ['117', '휠얼라이먼트', '20,000', '0'], ['112', '앞 브레이크 패드', '30,000', '0'],
].map(([code, name, km, days], index) => ({ id: `default-${code}-${index}`, code, name, type: '기본', km, days, sortOrder: index + 1, canDelete: false }))

const inputClass = 'w-full text-xs rounded-sm px-3 py-1.5 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400'

export default function PreventionCycleModal({ onClose }) {
  const alert = useAlert()
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [selectedId, setSelectedId] = useState(DEFAULT_ROWS[0]?.id ?? null)
  const [itemName, setItemName] = useState(DEFAULT_ROWS[0]?.name ?? '')
  const [exchangeKm, setExchangeKm] = useState('')
  const [exchangeDays, setExchangeDays] = useState('')

  const selectedRow = useMemo(() => rows.find((row) => row.id === selectedId), [rows, selectedId])

  const selectRow = (row) => {
    setSelectedId(row.id)
    setItemName(row.name)
  }

  const addCompanyRow = () => {
    if (!selectedRow) return
    if (!exchangeKm.trim() && !exchangeDays.trim()) {
      alert.warning('교환KM 또는 교환일수 중 하나를 입력해 주세요.')
      return
    }
    const sameCode = rows.filter((row) => row.code === selectedRow.code)
    const insertAt = rows.findLastIndex((row) => row.code === selectedRow.code) + 1
    const newRow = {
      id: `company-${selectedRow.code}-${Date.now()}`,
      code: selectedRow.code,
      name: itemName || selectedRow.name,
      type: '업체',
      km: exchangeKm || '0',
      days: exchangeDays || '0',
      sortOrder: rows.length + 1,
      canDelete: true,
    }
    setRows((prev) => [...prev.slice(0, insertAt), newRow, ...prev.slice(insertAt)].map((row, index) => ({ ...row, sortOrder: index + 1 })))
    setSelectedId(newRow.id)
    setExchangeKm('')
    setExchangeDays('')
    void sameCode
  }

  const deleteSelected = async () => {
    if (!selectedRow?.canDelete) {
      alert.warning('기본 예방항목은 삭제할 수 없습니다.')
      return
    }
    if (!await alert.confirm('선택한 업체 예방항목을 삭제할까요?')) return
    setRows((prev) => prev.filter((row) => row.id !== selectedRow.id).map((row, index) => ({ ...row, sortOrder: index + 1 })))
    setSelectedId(null)
    setItemName('')
  }

  const reorderRows = (nextRows) => {
    const rowsByCode = new Map()
    nextRows.forEach((row) => {
      const group = rowsByCode.get(row.code) || { defaultRow: null, companyRows: [] }
      if (row.canDelete) group.companyRows.push(row)
      else group.defaultRow = row
      rowsByCode.set(row.code, group)
    })

    const orderedCodes = []
    nextRows.forEach((row) => {
      if (!row.canDelete && !orderedCodes.includes(row.code)) orderedCodes.push(row.code)
    })

    const groupedRows = orderedCodes.flatMap((code) => {
      const group = rowsByCode.get(code)
      return group ? [group.defaultRow, ...group.companyRows].filter(Boolean) : []
    })
    const groupedIds = new Set(groupedRows.map((row) => row.id))
    const reorderedRows = [...groupedRows, ...nextRows.filter((row) => !groupedIds.has(row.id))]

    setRows(reorderedRows.map((row, index) => ({ ...row, sortOrder: index + 1 })))
  }

  const columns = [
    { key: 'code', title: '코드', width: '70px', align: 'center' },
    { key: 'name', title: '예방항목명', width: 'minmax(180px, 1fr)' },
    { key: 'type', title: '구분', width: '80px', align: 'center', render: (value, row) => <span className={row.canDelete ? 'font-medium text-red-500' : 'text-gray-700'}>{value}</span> },
    { key: 'km', title: '교환KM', width: '100px', align: 'right' },
    { key: 'days', title: '교환일수', width: '100px', align: 'right' },
  ]

  return (
    <Modal title="예방항목 주기설정" description="기본 예방항목과 업체별 교환 주기를 관리합니다." onClose={onClose} width="max-w-3xl" footer={<><Button onClick={onClose}>닫기</Button></>}>
      <div className="grid grid-cols-2 items-start gap-2 border-b border-gray-200 pb-3 [&>label:first-child]:col-span-2 [&>label:first-child]:mb-2 [&>button]:col-span-2 [&>button]:justify-self-end">
        <label className="text-xs font-semibold text-gray-700">항목명<div className={`${inputClass} mt-1 flex items-center justify-between gap-3 bg-gray-50`}><span className="min-w-0 truncate">{itemName}</span><span className="shrink-0 text-xs font-normal text-gray-500">주기 {selectedRow?.km || '-'} KM{selectedRow?.days && selectedRow.days !== '0' ? ` · ${selectedRow.days}일` : ''}</span></div></label>
        <label className="text-xs font-semibold text-gray-700">교환KM<input value={exchangeKm} onChange={(event) => setExchangeKm(event.target.value.replace(/[^0-9,]/g, ''))} placeholder="KM" className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-xs font-semibold text-gray-700">교환일수<input value={exchangeDays} onChange={(event) => setExchangeDays(event.target.value.replace(/[^0-9]/g, ''))} placeholder="일" className={`${inputClass} mt-1 w-full`} /></label>
        <Button size="sm" onClick={addCompanyRow} disabled={!selectedRow}><Plus size={14} />주기 추가</Button>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-gray-500">기본 항목은 삭제할 수 없으며, 업체 항목만 삭제할 수 있습니다.</span>
        <Button size="sm" onClick={deleteSelected} disabled={!selectedRow}><Trash2 size={14} />항목 삭제</Button>
      </div>
      <div className="h-[430px] overflow-hidden rounded-md border border-gray-200">
        <FixedHeadTable columns={columns} rows={rows} rowKey={(row) => row.id} rowSize="sm" height={null} selectedKey={selectedId} onRowClick={selectRow} draggable dragColumnWidth="28px" dragCellClassName="!px-1" onReorder={reorderRows} enableHorizontalScroll={false} emptyText="예방항목이 없습니다." />
      </div>
    </Modal>
  )
}
