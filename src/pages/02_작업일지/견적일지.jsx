import { useMemo, useRef, useState } from 'react'
import {
  Camera,
  BookOpen,
  ClipboardList,
  FileX2,
  GripVertical,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings2,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Select from '../../components/Select'
import { openCenteredWindow } from '../../utils/popup'
import MessageNotificationModal from './MessageNotificationModal'
import PrintFormatModal from './PrintFormatModal'
import VehicleCustomerModal from './VehicleCustomerModal'
import VehicleRegistryModal from './VehicleRegistryModal'

const TYPE_OPTIONS = ['전체', '일반', '보험']
const SORT_OPTIONS = [
  '견적일자 최신순',
  '견적일자 오래된순',
  '차량번호순',
  '고객명순',
  '견적금액 높은순',
]

const STATUS_STYLE = {
  작성중: 'bg-gray-100 text-gray-700',
  견적완료: 'bg-blue-50 text-blue-700',
  매출전환: 'bg-green-50 text-green-700',
  선견적: 'bg-amber-50 text-amber-700',
  취소: 'bg-red-50 text-red-600',
}

const INITIAL_ROWS = [
  { id: 'EST2026070001', estimateDate: '2026-07-21', type: '일반', carNo: '37나8254', car: '쏘나타 DN8', customer: '이하나', phone: '010-2241-7730', insurer: '', manager: '김견적', workDate: '2026-07-22', amount: 185000, status: '견적완료', vin: 'KMHDB51TP9U166970', ownerLinked: true },
  { id: 'EST2026070002', estimateDate: '2026-07-21', type: '보험', carNo: '162더3308', car: '카니발', customer: '최민수', phone: '010-5512-0091', insurer: '삼성화재', manager: '이기술', workDate: '2026-07-23', amount: 1250000, status: '선견적', vin: 'KNAPM81ABGK654321', ownerLinked: false, accidentNo: '2026-0719-00321' },
  { id: 'EST2026070003', estimateDate: '2026-07-20', type: '일반', carNo: '11가1111', car: 'ALL NEW G80', customer: '홍길동', phone: '010-1010-5252', insurer: '', manager: '박정비', workDate: '', amount: 306100, status: '작성중', vin: 'KNAP841BBBBK12345', ownerLinked: true },
  { id: 'EST2026070004', estimateDate: '2026-07-18', type: '보험', carNo: '83마4712', car: '포터Ⅱ', customer: '정검사', phone: '010-3388-7721', insurer: 'DB손해보험', manager: '최견적', workDate: '2026-07-21', amount: 864000, status: '매출전환', vin: 'KMHGN41DPPU321654', ownerLinked: true },
  { id: 'EST2026070005', estimateDate: '2026-07-16', type: '일반', carNo: '56하9021', car: 'K5', customer: '', phone: '010-7733-2190', insurer: '', manager: '김견적', workDate: '', amount: 98000, status: '취소', vin: 'KNAGM418BGP654987', ownerLinked: false },
]

const COLUMN_DEFINITIONS = [
  { key: 'estimateDate', title: '견적일자', width: '105px' },
  { key: 'type', title: '업무', width: '72px', align: 'center' },
  { key: 'carNo', title: '차량번호', width: '112px' },
  { key: 'car', title: '차량명', width: '160px' },
  { key: 'customer', title: '고객명', width: '92px' },
  { key: 'phone', title: '연락처', width: '125px' },
  { key: 'insurer', title: '보험사', width: '110px' },
  { key: 'manager', title: '견적담당', width: '90px', align: 'center' },
  { key: 'workDate', title: '작업일자', width: '105px' },
  { key: 'amount', title: '견적금액', width: '110px', align: 'right' },
  { key: 'status', title: '상태', width: '90px', align: 'center' },
]

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

function ColumnSettingsModal({ columns, onChange, onClose }) {
  const [draggedKey, setDraggedKey] = useState(null)

  const moveColumn = (targetKey) => {
    if (!draggedKey || draggedKey === targetKey) return
    onChange((previous) => {
      const next = [...previous]
      const fromIndex = next.findIndex((column) => column.key === draggedKey)
      const targetIndex = next.findIndex((column) => column.key === targetKey)
      const [moved] = next.splice(fromIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }

  return (
    <Modal
      title="견적목록 컬럼설정"
      description="표시할 컬럼을 선택하고 드래그하여 순서를 변경합니다."
      onClose={onClose}
      dialogStyle={{ maxWidth: '430px' }}
      footer={<Button variant="primary" onClick={onClose}>확인</Button>}
    >
      <div className="max-h-[430px] overflow-y-auto rounded-md border border-gray-200">
        {columns.map((column) => (
          <div
            key={column.key}
            draggable
            onDragStart={() => setDraggedKey(column.key)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveColumn(column.key)}
            onDragEnd={() => setDraggedKey(null)}
            className={`flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 last:border-b-0 ${draggedKey === column.key ? 'bg-green-50' : 'bg-white'}`}
          >
            <GripVertical size={15} className="cursor-grab text-gray-400" />
            <input
              type="checkbox"
              checked={column.visible}
              onChange={(event) => onChange((previous) => previous.map((item) => item.key === column.key ? { ...item, visible: event.target.checked } : item))}
              className="size-4 accent-green-600"
            />
            <span className="text-xs text-gray-700">{column.title}</span>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function EstimateJournal() {
  const alert = useAlert()
  const photoWindowRef = useRef(null)
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('2026-07-01')
  const [endDate, setEndDate] = useState('2026-07-31')
  const [type, setType] = useState('전체')
  const [sort, setSort] = useState(SORT_OPTIONS[0])
  const [appliedCriteria, setAppliedCriteria] = useState({ query: '', startDate: '2026-07-01', endDate: '2026-07-31', type: '전체' })
  const [columns, setColumns] = useState(() => COLUMN_DEFINITIONS.map((column) => ({ ...column, visible: true })))
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [vehicleRegistryOpen, setVehicleRegistryOpen] = useState(false)
  const [openManagementMenu, setOpenManagementMenu] = useState(null)

  const selected = rows.find((row) => row.id === selectedId)

  const filteredRows = useMemo(() => {
    const keyword = appliedCriteria.query.trim().toLowerCase()
    const next = rows.filter((row) => {
      const matchesDate = (!appliedCriteria.startDate || row.estimateDate >= appliedCriteria.startDate)
        && (!appliedCriteria.endDate || row.estimateDate <= appliedCriteria.endDate)
      const matchesType = appliedCriteria.type === '전체' || row.type === appliedCriteria.type
      const matchesKeyword = !keyword || [row.carNo, row.car, row.customer, row.phone, row.insurer, row.manager]
        .some((value) => String(value || '').toLowerCase().includes(keyword))
      return matchesDate && matchesType && matchesKeyword
    })

    return [...next].sort((a, b) => {
      if (sort === '견적일자 오래된순') return a.estimateDate.localeCompare(b.estimateDate)
      if (sort === '차량번호순') return a.carNo.localeCompare(b.carNo, 'ko')
      if (sort === '고객명순') return a.customer.localeCompare(b.customer, 'ko')
      if (sort === '견적금액 높은순') return b.amount - a.amount
      return b.estimateDate.localeCompare(a.estimateDate) || b.id.localeCompare(a.id)
    })
  }, [appliedCriteria, rows, sort])

  const executeSearch = () => {
    setAppliedCriteria({ query, startDate, endDate, type })
    setSelectedId(null)
  }

  const removeEstimate = async (row) => {
    if (!(await alert.remove(`${row.carNo} 견적을 삭제할까요?`))) return
    setRows((previous) => previous.filter((item) => item.id !== row.id))
    if (selectedId === row.id) setSelectedId(null)
  }

  const editEstimate = (row) => {
    alert.info(`${row.carNo} 견적 수정 화면은 상세 화면 연결 단계에서 처리합니다.`)
  }

  const openRowMenu = (event, row) => {
    event.stopPropagation()
    setSelectedId(row.id)
    const rect = event.currentTarget.getBoundingClientRect()
    setOpenManagementMenu((previous) => previous?.id === row.id ? null : {
      id: row.id,
      left: Math.max(8, rect.right - 144),
      top: rect.bottom + 124 > globalThis.innerHeight
        ? Math.max(8, rect.top - 124)
        : rect.bottom + 4,
    })
  }

  const releasePreEstimate = async () => {
    if (!selected || selected.status !== '선견적') return
    if (!(await alert.confirm(`${selected.carNo}의 선견적 상태를 해제할까요?`, '선견적 해제'))) return
    setRows((previous) => previous.map((row) => row.id === selected.id ? { ...row, status: '견적완료' } : row))
  }

  const openPhotoViewer = () => {
    if (!selected) return
    const payload = { estSerial: selected.id, carNo: selected.carNo }
    if (photoWindowRef.current && !photoWindowRef.current.closed) {
      photoWindowRef.current.focus()
      photoWindowRef.current.postMessage({ type: 'PHOTO_VIEWER_SET_CTX', payload }, globalThis.location.origin)
      return
    }
    photoWindowRef.current = openCenteredWindow('/photo-viewer', 'estimatePhotoViewer', 1100, 820, {
      postMessage: { type: 'PHOTO_VIEWER_SET_CTX', payload, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }

  const tableColumns = [
    ...columns.filter((column) => column.visible).map((column) => ({
      ...column,
      render: (value, row) => {
        if (column.key === 'type') return <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.type === '보험' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{row.type}</span>
        if (column.key === 'carNo') return <span className="font-semibold text-gray-800">{row.carNo}</span>
        if (column.key === 'amount') return money(value)
        if (column.key === 'status') return <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLE[value]}`}>{value}</span>
        return value || '-'
      },
    })),
    {
      key: '__management',
      title: '관리',
      width: '56px',
      align: 'center',
      render: (_value, row) => (
        <button
          type="button"
          aria-label="관리 메뉴"
          onClick={(event) => openRowMenu(event, row)}
          className="inline-flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <MoreVertical size={16} />
        </button>
      ),
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50">
      <PageHeader
        title="견적일지"
        description="일반·보험 견적을 조회하고 고객 및 차량별 견적 진행상태를 관리합니다."
        icon={ClipboardList}
        actions={<Button variant="primary" onClick={() => alert.info('신규 견적 등록 화면은 상세 화면 연결 단계에서 처리합니다.')}><Plus size={15} />신규 등록</Button>}
      />

      <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <Button size="sm" disabled={!selected} onClick={() => setCustomerOpen(true)}><UserRound size={14} />고객</Button>
        <Button size="sm" disabled={!selected} onClick={() => setMessageOpen(true)}><MessageSquare size={14} />문자</Button>
        <span className="mx-0.5 h-5 w-px bg-gray-200" />
        <Button size="sm" disabled={!selected} onClick={() => setPrintOpen(true)}><Printer size={14} />인쇄</Button>
        <Button size="sm" disabled={!selected} onClick={openPhotoViewer}><Camera size={14} />사진</Button>
        <Button size="sm" disabled={!selected || selected.status !== '선견적'} onClick={releasePreEstimate}><FileX2 size={14} />선견적 해제</Button>
      </div>

      <form className="grid min-h-12 shrink-0 grid-cols-[minmax(300px,1fr)_auto_minmax(300px,1fr)] items-center gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2" onSubmit={(event) => { event.preventDefault(); executeSearch() }}>
        <div className="flex min-w-0 items-center justify-start gap-2">
          <div className="flex h-8 w-80 min-w-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="차량번호, 차량명, 고객명, 연락처 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
          </div>
          <Button size="sm" type="submit"><Search size={14} />검색</Button>
        </div>
        <div className="flex shrink-0 items-center justify-center gap-2">
          <span className="text-[11px] font-semibold text-gray-600">견적일자</span>
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none focus:border-green-400" />
          <span className="text-xs text-gray-400">~</span>
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none focus:border-green-400" />
          <Button size="sm" onClick={executeSearch}>조회</Button>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <Select className="w-28" value={type} onChange={setType} options={TYPE_OPTIONS} placeholder="업무" />
          <Select className="w-40" value={sort} onChange={setSort} options={SORT_OPTIONS} />
          <Button size="sm" onClick={() => setColumnSettingsOpen(true)}>
            <Settings2 size={14} />컬럼설정
          </Button>
        </div>
      </form>

      <div className="min-h-0 flex-1 bg-white">
        <FixedHeadTable
          columns={tableColumns}
          rows={filteredRows}
          rowKey={(row) => row.id}
          height={null}
          selectedKey={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          onRowDoubleClick={editEstimate}
          emptyText="조건에 맞는 견적이 없습니다."
        />
      </div>

      <div className="flex h-8 shrink-0 items-center border-t border-gray-200 bg-gray-50 px-3 text-[11px] text-gray-500">
        조회 {filteredRows.length}건 · 견적금액 합계 {money(filteredRows.reduce((sum, row) => sum + row.amount, 0))}원
        {selected && <span className="ml-2">· 선택 {selected.carNo}</span>}
      </div>

      {openManagementMenu && (
        <>
          <button
            type="button"
            aria-label="관리 메뉴 닫기"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpenManagementMenu(null)}
          />
          <div
            className="fixed z-50 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg"
            style={{ left: openManagementMenu.left, top: openManagementMenu.top }}
          >
            <button
              type="button"
              onClick={() => {
                const row = rows.find((item) => item.id === openManagementMenu.id)
                setOpenManagementMenu(null)
                if (row) editEstimate(row)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={14} />수정
            </button>
            <button
              type="button"
              onClick={() => {
                const row = rows.find((item) => item.id === openManagementMenu.id)
                setOpenManagementMenu(null)
                if (row) removeEstimate(row)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />삭제
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={() => {
                setSelectedId(openManagementMenu.id)
                setOpenManagementMenu(null)
                setVehicleRegistryOpen(true)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <BookOpen size={14} />원부조회
            </button>
          </div>
        </>
      )}

      {columnSettingsOpen && <ColumnSettingsModal columns={columns} onChange={setColumns} onClose={() => setColumnSettingsOpen(false)} />}
      {customerOpen && selected && <VehicleCustomerModal vehicle={selected} hasOwner={selected.ownerLinked} onClose={() => setCustomerOpen(false)} />}
      {messageOpen && selected && (
        <MessageNotificationModal
          sale={{ ...selected, date: selected.estimateDate, repair: selected.amount }}
          allowedTypes={['individual', 'estimate']}
          initialType="individual"
          onClose={() => setMessageOpen(false)}
          onSend={() => alert.info('문자 발송은 API 연결 단계에서 처리합니다.')}
        />
      )}
      {printOpen && <PrintFormatModal menuCode="0210" menuName="견적일지" onClose={() => setPrintOpen(false)} />}
      {vehicleRegistryOpen && selected && (
        <VehicleRegistryModal
          key={selected.id}
          vehicle={{ carNo: selected.carNo, customer: selected.customer, carName: selected.car, vin: selected.vin }}
          onClose={() => setVehicleRegistryOpen(false)}
        />
      )}
    </div>
  )
}
