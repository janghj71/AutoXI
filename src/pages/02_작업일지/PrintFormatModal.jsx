import { Eye, EyeOff, Printer, Save } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import Toggle from '../../components/Toggle'

const OPTION_ITEMS = [
  { value: 'signature', label: '서명란함' },
  { value: 'removePartCode', label: '부품코드 제거' },
  { value: 'removeSignaturePartCode', label: '서명안함, 부품코드 제거' },
  { value: 'showVat', label: '부가세표시' },
]

const PRINT_FORMATS_BY_MENU = {
  '0201': [
    { id: 'sales-statement', code: '101', name: '거래명세서', enabled: true, option: 'signature', options: OPTION_ITEMS },
    { id: 'work-order', code: '102', name: '작업지시서', enabled: true, option: null, options: [] },
    { id: 'sales-invoice', code: '103', name: '청구서', enabled: true, option: 'showVat', options: OPTION_ITEMS },
    { id: 'repair-history', code: '104', name: '정비이력서', enabled: false, option: null, options: [] },
    { id: 'estimate', code: '105', name: '견적서', enabled: true, option: 'removePartCode', options: OPTION_ITEMS },
  ],
}

const getInitialRows = (menuCode) => (PRINT_FORMATS_BY_MENU[menuCode] || PRINT_FORMATS_BY_MENU['0201']).map((row, index) => ({
  ...row,
  sortOrder: index + 1,
  options: row.options.map((option) => ({ ...option })),
}))

export default function PrintFormatModal({ menuCode = '0201', menuName = '매출일지', onClose, onSave, onPrint }) {
  const [rows, setRows] = useState(() => getInitialRows(menuCode))
  const [selectedId, setSelectedId] = useState(() => getInitialRows(menuCode)[0]?.id ?? null)
  const [showAll, setShowAll] = useState(false)

  const selected = rows.find((row) => row.id === selectedId) || null
  const visibleRows = showAll ? rows : rows.filter((row) => row.enabled)

  const updateRow = (id, changes) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, ...changes } : row))
  }

  const reorderRows = (nextRows) => {
    const reorderedRows = showAll ? nextRows : [...nextRows, ...rows.filter((row) => !row.enabled)]
    setRows(reorderedRows.map((row, index) => ({ ...row, sortOrder: index + 1 })))
  }

  const handleSave = () => {
    onSave?.({
      menuCode,
      prints: rows.map(({ options, ...row }) => ({ ...row, options: options.map(({ value }) => value) })),
    })
    onClose?.()
  }

  const columns = [
    { key: 'code', title: '코드', width: '80px', align: 'center' },
    { key: 'name', title: '인쇄물명', width: 'minmax(0, 1fr)' },
    {
      key: 'enabled',
      title: '사용 여부',
      width: '100px',
      align: 'center',
      render: (value, row) => (
        <Toggle checked={value} onChange={(nextValue) => updateRow(row.id, { enabled: nextValue })} />
      ),
    },
  ]

  return (
    <Modal
      title={`${menuName} 인쇄물`}
      description="인쇄물을 선택하고 출력 옵션과 사용 여부를 관리합니다."
      onClose={onClose}
      width="max-w-xl"
      footer={<><div className="mr-auto"><Button variant="primary" disabled={!selected || !selected.enabled} onClick={() => selected && onPrint?.({ menuCode, print: selected })}><Printer size={14} />인쇄</Button></div><Button variant="primary" onClick={handleSave}><Save size={14} />저장</Button><Button onClick={onClose}>닫기</Button></>}
    >
      <div className="flex flex-col gap-3">
        <section className="overflow-hidden rounded-md border border-gray-200">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <div className="text-sm font-semibold text-gray-800">인쇄물 목록 <span className="ml-2 text-xs font-normal text-gray-500">사용 중 {rows.filter((row) => row.enabled).length}개 / 전체 {rows.length}개</span></div>
            <Button size="sm" onClick={() => { const nextShowAll = !showAll; setShowAll(nextShowAll); if (!nextShowAll && selected && !selected.enabled) setSelectedId(rows.find((row) => row.enabled)?.id ?? null) }}>
              {showAll ? <EyeOff size={14} /> : <Eye size={14} />}{showAll ? '사용 인쇄물만 보기' : '전체 인쇄물 보기'}
            </Button>
          </div>
          <div className="h-[420px]">
            <FixedHeadTable
              columns={showAll ? columns : columns.filter((column) => column.key !== 'enabled')}
              rows={visibleRows}
              rowSize="sm"
              rowKey={(row) => row.id}
              selectedKey={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              draggable
              dragColumnWidth="32px"
              dragCellClassName="!px-1"
              onReorder={reorderRows}
              enableHorizontalScroll={false}
              emptyText="등록된 인쇄물이 없습니다."
            />
          </div>
        </section>

        <section className="rounded-md border border-gray-200 bg-gray-50/60 p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,220px)] items-center gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">{selected ? `${selected.code} - ${selected.name}` : '인쇄물을 선택하세요.'}</div>
            </div>
            <div className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2">
              <label htmlFor="print-format-option" className="text-xs font-semibold text-gray-700">옵션</label>
              <Select
                value={selected?.option || ''}
                onChange={(value) => selected && updateRow(selected.id, { option: value })}
                options={selected?.options || []}
                placeholder={selected?.options?.length ? '옵션 선택' : '설정 가능한 옵션이 없습니다.'}
                disabled={!selected || !selected.options?.length}
                menuPlacement="up"
                className="min-w-0"
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  )
}
