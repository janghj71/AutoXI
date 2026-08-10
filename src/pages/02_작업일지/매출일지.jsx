import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Banknote, BellRing, BookOpen, CalendarDays, Camera, Car, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardCheck, ClipboardList, FileOutput, FileText, MessageSquare, NotebookPen, Plus,
  MoreVertical, Pencil, Printer, Search, Send, Trash2, UserRound, X,
} from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Select from '../../components/Select'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'
import SalesDetailEditPage from './매출내역수정'
import VehicleCustomerModal from './VehicleCustomerModal'
import VehicleRegistryModal from './VehicleRegistryModal'
import VehicleSpecificationModal from './VehicleSpecificationModal'
import PaymentModal from './PaymentModal'
import PrintFormatModal from './PrintFormatModal'
import { openCenteredWindow } from '../../utils/popup'

const TYPES = ['일반', '경정비', '보험', '보증', '검사']
const TYPE_STYLE = { 일반: 'bg-slate-100 text-slate-700', 보험: 'bg-blue-50 text-blue-700', 보증: 'bg-amber-50 text-amber-700', 검사: 'bg-violet-50 text-violet-700', 경정비: 'bg-emerald-50 text-emerald-700' }
const STATUS_STYLE = { 접수: 'bg-gray-100 text-gray-700', 작업대기: 'bg-amber-50 text-amber-700', 작업중: 'bg-blue-50 text-blue-700', 작업완료: 'bg-green-50 text-green-700', 출고완료: 'bg-slate-100 text-slate-500' }
const ROWS = [
  { id: '2026070001', date: '2026-07-21', type: '보증', carNo: '11가1111', vin: 'KNAP841BBBBK12345', car: 'ALL NEW G80', customer: '홍길동', phone: '010-1010-5252', repair: 306100, paid: 0, insurer: '', manager: '김정비', referrer: '-', status: '작업중', due: '2026-07-23 16:00', release: '', claim: '', memo: '프론트 범퍼 점검', ownerLinked: true },
  { id: '2026070002', date: '2026-07-21', type: '일반', carNo: '37나8254', vin: 'KMHDB51TP9U166970', car: '쏘나타 DN8', customer: '이하나', phone: '010-2241-7730', repair: 185000, paid: 185000, insurer: '', manager: '박기사', referrer: '한마음상사', status: '작업완료', due: '2026-07-21 15:00', release: '2026-07-21', claim: '', memo: '엔진오일 교환', ownerLinked: true },
  { id: '2026070003', date: '2026-07-21', type: '보험', carNo: '162더3308', vin: 'KNAPM81ABGK654321', car: '카니발', customer: '최민수', phone: '010-5512-0091', repair: 1250000, paid: 0, insurer: '삼성화재', manager: '이기술', referrer: '강보험', status: '작업대기', due: '2026-07-25 11:00', release: '', claim: '2026-07-22', memo: '우측 도어 판금', ownerLinked: false },
]
const money = (value) => value.toLocaleString('ko-KR')
function TwoLineHeader({ top, bottom, align = 'left' }) {
  return <div className={align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}><div>{top}</div><div className="mt-1 text-gray-400">{bottom || '\u00a0'}</div></div>
}

const historyRows = {
  visits: [
    { release: '-', date: '2026-07-21', rono: '2026070001', type: '보증', carNo: '11가1111', repair: '306,100', paid: '0', unpaid: '306,100' },
    { release: '2026-04-08', date: '2026-04-08', rono: '2026040018', type: '일반', carNo: '11가1111', repair: '185,000', paid: '185,000', unpaid: '0' },
    { release: '2025-11-23', date: '2025-11-20', rono: '2025110032', type: '보험', carNo: '11가1111', repair: '1,240,000', paid: '1,000,000', unpaid: '240,000' },
  ],
  repairs: [
    { date: '2026-07-21', carNo: '11가1111', part: '주체', content: '프론트범퍼 레일', makerCode: 'B03', work: '교환', qh: '0.6', partCost: '0', labor: '15,600', mileage: '52,480' },
    { date: '2026-07-21', carNo: '11가1111', part: '부품', content: '빔 컴플리트-프론트 범퍼', makerCode: '64900T1000', work: '', qh: '1', partCost: '187,000', labor: '0', mileage: '52,480' },
    { date: '2026-07-21', carNo: '11가1111', part: '부품', content: '와이어링 하네스-프론트 범퍼', makerCode: '91890T1081', work: '', qh: '1', partCost: '90,500', labor: '0', mileage: '52,480' },
  ],
  estimates: [
    { date: '2026-07-18', no: 'E260718-03', carNo: '11가1111', car: 'ALL NEW G80', customer: '홍길동', amount: '356,100', status: '선견적' },
    { date: '2026-04-08', no: 'E260408-11', carNo: '11가1111', car: 'ALL NEW G80', customer: '홍길동', amount: '185,000', status: '매출전환' },
  ],
  sms: [
    { date: '2026-07-21 10:31', type: '입고문자', phone: '010-1010-5252', result: '성공' },
    { date: '2026-07-21 14:05', type: '정비진행 알림톡', phone: '010-1010-5252', result: '성공' },
  ],
}

function HistoryPanel({ vehicle, activeTab, onClose }) {
  const [selectedVisit, setSelectedVisit] = useState(0)
  const [selectedEstimate, setSelectedEstimate] = useState(0)
  const [selectedSms, setSelectedSms] = useState(0)
  const [repairQuery, setRepairQuery] = useState('')
  const [estimateMoreOpen, setEstimateMoreOpen] = useState(false)
  const filteredRepairs = historyRows.repairs.filter((row) => {
    const keyword = repairQuery.trim().toLowerCase()
    return !keyword || [row.date, row.carNo, row.content, row.makerCode].some((value) => value.toLowerCase().includes(keyword))
  })
  const detailColumns = [
    { key: 'part', title: '구분', width: '14%' }, { key: 'content', title: '작업내용', width: '42%' },
    { key: 'qh', title: 'Q/H', width: '12%', align: 'right' }, { key: 'partCost', title: '부품액', width: '16%', align: 'right' },
    { key: 'labor', title: '공임액', width: '16%', align: 'right' },
  ]
  const visitColumns = [
    { key: 'release', title: '출고일자', width: '15%' }, { key: 'date', title: '입고일자', width: '15%' },
    { key: 'type', title: '업무', width: '10%' }, { key: 'carNo', title: '차량번호', width: '16%' },
    { key: 'repair', title: '정비액', width: '15%', align: 'right' }, { key: 'paid', title: '입금액', width: '14%', align: 'right' },
    { key: 'unpaid', title: '미수액', width: '15%', align: 'right', className: 'text-red-500' },
  ]
  const repairColumns = [
    { key: 'date', title: <TwoLineHeader top="출고일자" />, width: '18%' },
    { key: 'carNo', title: <TwoLineHeader top="차량번호" bottom="주행거리" />, width: '20%', render: (_value, row) => <><div>{row.carNo}</div><div className="mt-1 text-gray-500">{row.mileage}</div></> },
    { key: 'content', title: <TwoLineHeader top="작업내용" bottom="제작사코드" />, width: '34%', render: (_value, row) => <><div className="truncate">{row.content}</div><div className="mt-1 text-gray-500">{row.makerCode}</div></> },
    { key: 'qh', title: <TwoLineHeader top="Q/H" align="right" />, width: '10%', align: 'right' },
    { key: 'partCost', title: <TwoLineHeader top="부품액" bottom="공임액" align="right" />, width: '18%', align: 'right', render: (_value, row) => <><div>{row.partCost}</div><div className="mt-1 text-gray-500">{row.labor}</div></> },
  ]
  const estimateColumns = [
    { key: 'date', title: '견적일자', width: '16%' }, { key: 'carNo', title: '차량번호', width: '17%' },
    { key: 'car', title: '차량명', width: '22%' }, { key: 'customer', title: '고객명', width: '14%' },
    { key: 'amount', title: '견적금액', width: '17%', align: 'right' }, { key: 'status', title: '상태', width: '14%' },
  ]
  const smsColumns = [
    { key: 'date', title: '발송일시', width: '28%' }, { key: 'type', title: '문자종류', width: '28%' },
    { key: 'phone', title: '휴대전화', width: '28%' }, { key: 'result', title: '결과', width: '16%' },
  ]

  return <section className="flex min-w-0 flex-col border-l border-gray-200 bg-white">
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="min-w-0 truncate text-sm text-gray-700"><span className="font-semibold text-gray-900">차량 이력 :</span><span className="ml-2">{vehicle.carNo} · {vehicle.car} · {vehicle.customer}</span></div>
      <button type="button" onClick={onClose} aria-label="이력 닫기" className="inline-flex size-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-700"><X size={17} /></button>
    </div>
    <div className="min-h-0 flex-1 p-3">
      {activeTab === '방문이력' && <div className="grid h-full grid-rows-2 gap-3">
        <div className="min-h-0 overflow-hidden rounded-md border border-gray-200"><FixedHeadTable columns={visitColumns} rows={historyRows.visits} rowKey={(row) => row.rono} height={null} selectedKey={historyRows.visits[selectedVisit]?.rono} onRowClick={(_row, index) => setSelectedVisit(index)} emptyText="방문이력이 없습니다." /></div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200"><div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">수리내용</div><div className="min-h-0 flex-1"><FixedHeadTable columns={detailColumns} rows={historyRows.repairs.slice(0, 2)} rowKey={(row) => row.content} height={null} emptyText="수리내용이 없습니다." /></div></div>
      </div>}

      {activeTab === '수리이력' && <div className="flex h-full flex-col overflow-hidden rounded-md border border-gray-200"><div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2"><div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15"><Search size={14} className="shrink-0 text-gray-400" /><input value={repairQuery} onChange={(event) => setRepairQuery(event.target.value)} placeholder="출고일자, 차량번호, 작업내용, 제작사코드 필터" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" /></div><Button size="sm"><Printer size={13} />수리내용 인쇄</Button></div><div className="min-h-0 flex-1"><FixedHeadTable columns={repairColumns} rows={filteredRepairs} rowKey={(row) => row.content} height={null} emptyText="조건에 맞는 수리이력이 없습니다." /></div></div>}

      {activeTab === '견적이력' && <div className="grid h-full grid-rows-2 gap-3">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white"><div className="flex shrink-0 items-center gap-1.5 border-b border-gray-200 bg-white px-3 py-2"><span className="text-sm font-semibold text-gray-800">견적 목록</span><div className="ml-auto flex gap-1"><Button size="sm" disabled={!historyRows.estimates[selectedEstimate]}>매출작성</Button><Button size="sm"><Plus size={13} />신규</Button><Button size="sm" disabled={!historyRows.estimates[selectedEstimate]}>해제</Button><div className="relative"><Button size="sm" onClick={() => setEstimateMoreOpen((prev) => !prev)}><MoreVertical size={13} />더보기</Button>{estimateMoreOpen && <><button type="button" aria-label="견적 더보기 닫기" className="fixed inset-0 z-20 cursor-default" onClick={() => setEstimateMoreOpen(false)} /><div className="absolute right-0 top-full z-30 mt-1 w-28 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">{[
          { label: '수정', icon: Pencil }, { label: '삭제', icon: Trash2, danger: true }, { label: '인쇄', icon: Printer },
        ].map(({ label, icon: Icon, danger }) => <button key={label} type="button" onClick={() => setEstimateMoreOpen(false)} className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${danger ? 'text-red-600' : 'text-gray-700'}`}><Icon size={14} />{label}</button>)}</div></>}</div></div></div><div className="min-h-0 flex-1"><FixedHeadTable columns={estimateColumns} rows={historyRows.estimates} rowKey={(row) => row.no} height={null} selectedKey={historyRows.estimates[selectedEstimate]?.no} onRowClick={(_row, index) => setSelectedEstimate(index)} emptyText="견적이력이 없습니다." /></div></div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200"><div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">견적내역</div><div className="min-h-0 flex-1"><FixedHeadTable columns={detailColumns} rows={historyRows.repairs} rowKey={(row) => row.content} height={null} emptyText="견적내역이 없습니다." /></div></div>
      </div>}

      {activeTab === 'SMS이력' && <div className="grid h-full grid-rows-2 gap-3">
        <div className="min-h-0 overflow-hidden rounded-md border border-gray-200"><FixedHeadTable columns={smsColumns} rows={historyRows.sms} rowKey={(row) => row.date} height={null} selectedKey={historyRows.sms[selectedSms]?.date} onRowClick={(_row, index) => setSelectedSms(index)} emptyText="SMS 이력이 없습니다." /></div>
        <div className="min-h-0 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-4"><div className="text-sm font-semibold text-gray-700">{historyRows.sms[selectedSms].type}</div><div className="mt-3 whitespace-pre-line rounded-md border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">◇ 출고안내문 ◇{`\n`}사고번호: 2026070001{`\n`}입고일시: 2026-07-21{`\n`}차량번호: {vehicle.carNo}{`\n`}고객님의 차량 정비가 정상적으로 진행되고 있습니다.</div></div>
      </div>}
    </div>
  </section>
}

export default function SalesJournalPage() {
  const alert = useAlert()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('최근 입력순')
  const [enabledTypes, setEnabledTypes] = useState(TYPES)
  const [selectedId, setSelectedId] = useState(ROWS[0].id)
  const [openMenu, setOpenMenu] = useState(null)
  const [openMessageMenu, setOpenMessageMenu] = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [printFormatOpen, setPrintFormatOpen] = useState(false)
  const [vehicleRegistryOpen, setVehicleRegistryOpen] = useState(false)
  const [specificationOpen, setSpecificationOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [activeHistory, setActiveHistory] = useState('방문이력')
  const [openNew, setOpenNew] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const photoWinRef = useRef(null)

  useEffect(() => () => {
    const photoWindow = photoWinRef.current
    if (photoWindow && !photoWindow.closed) {
      try { photoWindow.close() } catch { /* popup may already be unavailable */ }
    }
    photoWinRef.current = null
  }, [])

  const rows = useMemo(() => ROWS.filter((row) => {
    const keyword = query.trim().toLowerCase()
    return enabledTypes.includes(row.type) && (!keyword || [row.id, row.carNo, row.car, row.customer, row.phone, row.insurer].some((value) => value.toLowerCase().includes(keyword)))
  }), [enabledTypes, query])
  const selected = rows.find((row) => row.id === selectedId)
  const openPhotoViewer = (sale) => {
    if (!sale) return
    const payload = { estSerial: sale.id, carNo: sale.carNo || '' }
    if (photoWinRef.current && !photoWinRef.current.closed) {
      photoWinRef.current.focus()
      photoWinRef.current.postMessage({ type: 'PHOTO_VIEWER_SET_CTX', payload }, globalThis.location.origin)
      return
    }
    photoWinRef.current = openCenteredWindow('/photo-viewer', 'photoViewer', 1100, 820, {
      postMessage: { type: 'PHOTO_VIEWER_SET_CTX', payload, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }
  const openVehicleRegistry = () => {
    if (!selected) return
    if (!String(selected.carNo || '').trim()) {
      alert.warning('차량원부 조회를 위해 선택한 차량의 차량번호가 필요합니다.')
      return
    }
    if (!String(selected.customer || '').trim()) {
      alert.warning('차량원부 조회를 위해 선택한 차량의 고객명이 필요합니다.')
      return
    }
    setVehicleRegistryOpen(true)
  }
  const openSpecification = () => {
    if (!selected) return
    const vin = String(selected.vin || '').replace(/[^A-Za-z0-9]/g, '')
    if (!vin) {
      alert.warning('차량 규격정보 조회를 위해 선택한 차량의 차대번호가 필요합니다.')
      return
    }
    if (vin.length < 11) {
      alert.warning('선택한 차량의 차대번호가 11자리 미만입니다.')
      return
    }
    setSpecificationOpen(true)
  }
  const toggleType = (type) => setEnabledTypes((prev) => prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type])
  const openRowMenu = (event, row) => {
    event.stopPropagation()
    setSelectedId(row.id)
    const rect = event.currentTarget.getBoundingClientRect()
    setOpenMenu((prev) => prev?.id === row.id ? null : {
      id: row.id,
      left: Math.max(8, rect.right - 160),
      top: rect.bottom + 284 > globalThis.innerHeight ? Math.max(8, rect.top - 284) : rect.bottom + 4,
    })
  }
  const mainColumns = [
    { key: 'date', title: <TwoLineHeader top="입고일자" bottom="RONO" />, width: '100px', render: (_value, row) => <><div>{row.date}</div><div className="mt-1 font-medium text-gray-500">{row.id}</div></> },
    { key: 'type', title: <TwoLineHeader top="업무" align="center" />, width: '60px', align: 'center', render: (value) => <span className={`rounded-full px-2 py-1 text-sm font-medium ${TYPE_STYLE[value]}`}>{value}</span> },
    { key: 'carNo', title: <TwoLineHeader top="차량번호" bottom="차량명" />, width: '160px', render: (_value, row) => <><div className="font-semibold text-gray-800">{row.carNo}</div><div className="mt-1 text-gray-500">{row.car}</div></> },
    { key: 'customer', title: <TwoLineHeader top="고객명" bottom="연락처" />, width: '144px', render: (_value, row) => <><div>{row.customer}</div><div className="mt-1 text-gray-500">{row.phone}</div></> },
    { key: 'insurer', title: <TwoLineHeader top="보험사" bottom="청구일자" />, width: '112px', render: (_value, row) => <><div>{row.insurer || '-'}</div><div className="mt-1 text-gray-500">{row.claim || '-'}</div></> },
    { key: 'manager', title: <TwoLineHeader top="담당자" bottom="소개자" />, width: '96px', render: (_value, row) => <><div>{row.manager}</div><div className="mt-1 text-gray-500">{row.referrer}</div></> },
    { key: 'repair', title: <TwoLineHeader top="정비액" bottom="입금액" align="right" />, width: '112px', align: 'right', render: (_value, row) => <><div>{money(row.repair)}</div><div className={`mt-1 ${row.repair > row.paid ? 'font-medium text-red-500' : 'text-gray-500'}`}>{money(row.paid)}</div></> },
    { key: 'due', title: <TwoLineHeader top="출고예정일시" bottom="출고일자" />, width: '144px', render: (_value, row) => <><div>{row.due}</div><div className="mt-1 text-gray-500">{row.release || '-'}</div></> },
    { key: 'status', title: <TwoLineHeader top="상태" bottom="메모" />, width: '180px', render: (_value, row) => <><div><span className={`rounded-full px-2 py-1 text-sm font-medium ${STATUS_STYLE[row.status]}`}>{row.status}</span></div><div className="mt-1 text-gray-500">{row.memo}</div></> },
    { key: '__actions', title: '관리', width: '56px', align: 'center', render: (_value, row) => <button type="button" aria-label="관리 메뉴" onClick={(event) => openRowMenu(event, row)} className="inline-flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"><MoreVertical size={16} /></button> },
  ]

  if (editingRow) {
    return <SalesDetailEditPage row={editingRow} onBack={() => setEditingRow(null)} />
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader title="매출일지" description="차량 접수부터 작업, 입금, 출고까지 관리합니다." icon={ClipboardList}
        actions={<><Button><Banknote size={14} />미수 일괄입금</Button><Button variant="primary" onClick={() => setOpenNew(true)}><Plus size={15} />신규 등록</Button></>} />

      <div className="grid min-h-0 flex-1 transition-[grid-template-columns] duration-200" style={{ gridTemplateColumns: historyOpen ? 'minmax(720px, 1fr) 52px minmax(0, 650px)' : 'minmax(720px, 1fr) 52px' }}>
      <div className="flex min-h-0 min-w-0 flex-col">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-600">작업일자</span>
          <div className="flex h-8 items-center rounded-md border border-gray-300 bg-white">
            <button type="button" className="px-2 text-gray-400 hover:text-green-600"><ChevronLeft size={14} /></button>
            <div className="flex items-center gap-1.5 border-x border-gray-200 px-2 text-xs text-gray-700"><CalendarDays size={13} className="text-gray-400" />2026-07-21</div>
            <button type="button" className="px-2 text-gray-400 hover:text-green-600"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" aria-pressed={enabledTypes.length === TYPES.length} onClick={() => setEnabledTypes(TYPES)} className={`h-8 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${enabledTypes.length === TYPES.length ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>전체 <span className="ml-0.5 opacity-60">{ROWS.length}</span></button>
          {TYPES.map((type) => {
            const active = enabledTypes.includes(type)
            return <button key={type} type="button" aria-pressed={active} onClick={() => toggleType(type)} className={`h-8 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${active ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>{type} <span className="ml-0.5 opacity-60">{ROWS.filter((row) => row.type === type).length}</span></button>
          })}
        </div>
        <div className="ml-auto flex h-8 w-72 shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15 xl:w-80">
          <Search size={14} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="차량번호, 고객명, 연락처, RONO 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
        </div>
        <Select className="w-32 shrink-0" value={sort} onChange={setSort} options={['최근 입력순', '입고일자순', '차량번호순', '고객명순']} />
      </div>

      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <Button size="sm" disabled={!selected} onClick={() => setCustomerOpen(true)}><UserRound size={14} />고객</Button>
        <Button size="sm" disabled={!selected} onClick={openVehicleRegistry}><BookOpen size={14} />차량원부</Button>
        <Button size="sm" disabled={!selected} onClick={openSpecification}><Car size={14} />규격</Button>
        <span className="mx-0.5 h-5 w-px bg-gray-200" />
        <button type="button" disabled={!selected} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-blue-500 bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
          <ClipboardCheck size={14} />온라인 점검정비명세서 발행
        </button>
        <div className="relative">
          <Button size="sm" disabled={!selected} onClick={() => setOpenMessageMenu((prev) => !prev)}><MessageSquare size={14} />문자·알림<ChevronDown size={13} /></Button>
          {openMessageMenu && <><button type="button" aria-label="문자 메뉴 닫기" className="fixed inset-0 z-20 cursor-default" onClick={() => setOpenMessageMenu(false)} /><div className="absolute left-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
            <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold text-gray-400">개별 발송</div>
            {['개별 문자발송', '점검정비견적서(고객용)', '점검정비명세서(고객용)', '개인정보활용동의서', '개별 알림톡발송'].map((label) => <button key={label} type="button" onClick={() => setOpenMessageMenu(false)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50"><MessageSquare size={13} className="text-gray-400" />{label}</button>)}
            <div className="my-1 border-t border-gray-100" />
            <div className="px-3 pb-1 pt-1 text-[10px] font-semibold text-gray-400">진행 안내</div>
            {[['입고문자', BellRing], ['수리완료문자', Send], ['출고문자', FileOutput]].map(([label, Icon]) => <button key={label} type="button" onClick={() => setOpenMessageMenu(false)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50"><Icon size={13} className="text-gray-400" />{label}</button>)}
            <div className="my-1 border-t border-gray-100" />
            <button type="button" onClick={() => setOpenMessageMenu(false)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50"><BellRing size={13} className="text-gray-400" />개인정보 동의 푸시</button>
          </div></>}
        </div>
        <span className="mx-0.5 h-5 w-px bg-gray-200" />
        <Button size="sm" disabled={!selected} onClick={() => setPaymentOpen(true)}><Banknote size={14} />입금</Button>
        <Button size="sm" disabled={!selected} onClick={() => setPrintFormatOpen(true)}><Printer size={14} />인쇄</Button>
        <Button size="sm" disabled={!selected}><FileOutput size={14} />출고</Button>
      </div>

      <div className="min-h-0 flex-1 bg-white">
        <FixedHeadTable
          columns={mainColumns}
          rows={rows}
          rowKey={(row) => row.id}
          height={null}
          enableHorizontalScroll={historyOpen}
          selectedKey={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          onRowDoubleClick={(row) => setEditingRow(row)}
          emptyText="조건에 맞는 매출일지가 없습니다."
        />
      </div>

      <div className="flex h-8 shrink-0 items-center border-t border-gray-200 bg-gray-50 px-3 text-[11px] text-gray-500">조회 {rows.length}건 · 선택 RONO {selectedId}</div>
      </div>

      <nav className="z-20 flex min-w-0 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto border-l border-gray-200 bg-gray-50 px-1.5 py-2">
        <button type="button" onClick={() => selected && setHistoryOpen((prev) => !prev)} disabled={!selected} aria-label={historyOpen ? '이력 패널 닫기' : '이력 패널 열기'} className="flex h-9 w-10 items-center justify-center rounded-md bg-gray-900 text-sm font-bold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40">{historyOpen ? '«' : '»'}</button>
        {[
          { label: '방문이력', background: '#bae6fd', selectedBackground: '#7dd3fc', border: '#7dd3fc', accent: '#0369a1', text: '#0c4a6e' },
          { label: '수리이력', background: '#fde68a', selectedBackground: '#fcd34d', border: '#fcd34d', accent: '#b45309', text: '#78350f' },
          { label: '견적이력', background: '#a7f3d0', selectedBackground: '#6ee7b7', border: '#6ee7b7', accent: '#047857', text: '#064e3b' },
          { label: 'SMS이력', background: '#ddd6fe', selectedBackground: '#c4b5fd', border: '#c4b5fd', accent: '#6d28d9', text: '#4c1d95' },
        ].map((item) => {
          const isActive = historyOpen && activeHistory === item.label
          return <button key={item.label} type="button" disabled={!selected} aria-current={isActive ? 'page' : undefined} onClick={() => { setActiveHistory(item.label); setHistoryOpen(true) }} style={{ backgroundColor: isActive ? item.selectedBackground : item.background, borderColor: item.border, color: item.text }} className={`relative flex min-h-[88px] w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border py-2 text-center text-sm font-normal leading-none transition-all disabled:cursor-not-allowed ${isActive ? 'shadow-sm' : 'hover:brightness-95'}`}><span className="flex flex-col items-center gap-0.5">{[...item.label].map((letter, index) => <span key={`${letter}-${index}`} className="block">{letter}</span>)}</span>{isActive && <span aria-hidden="true" className="absolute inset-y-0 right-0 w-[3px]" style={{ backgroundColor: item.accent }} />}</button>
        })}
      </nav>

      {historyOpen && selected && <HistoryPanel vehicle={selected} activeTab={activeHistory} onClose={() => setHistoryOpen(false)} />}
      </div>

      {openMenu && <>
        <button type="button" aria-label="관리 메뉴 닫기" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpenMenu(null)} />
        <div className="fixed z-50 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg" style={{ left: openMenu.left, top: openMenu.top }}>
          {[
            { label: '사진', icon: Camera },
            { label: '메모', icon: NotebookPen },
            { separator: true },
            { label: '삭제', icon: Trash2, danger: true },
            { separator: true },
            { label: '차량점검', icon: ClipboardCheck },
            { separator: true },
            { label: '견적이동', icon: ArrowLeft },
            { label: '견적보관', icon: FileText },
          ].map((item, index) => item.separator
            ? <div key={`separator-${index}`} className="my-1 border-t border-gray-100" />
            : <button key={item.label} type="button" onClick={() => { if (item.label === '사진') openPhotoViewer(rows.find((row) => row.id === openMenu.id)); setOpenMenu(null) }} className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${item.danger ? 'text-red-600' : 'text-gray-700'}`}><item.icon size={14} />{item.label}</button>)}
        </div>
      </>}

      {customerOpen && selected && <VehicleCustomerModal key={selected.id} vehicle={selected} hasOwner={selected.ownerLinked} onClose={() => setCustomerOpen(false)} />}
      {paymentOpen && selected && <PaymentModal key={selected.id} sale={selected} onClose={() => setPaymentOpen(false)} />}
      {printFormatOpen && <PrintFormatModal menuCode="0201" menuName="매출일지" onClose={() => setPrintFormatOpen(false)} />}
      {vehicleRegistryOpen && selected && <VehicleRegistryModal key={selected.id} vehicle={{ carNo: selected.carNo, customer: selected.customer, carName: selected.car, vin: selected.vin }} onClose={() => setVehicleRegistryOpen(false)} />}
      {specificationOpen && selected && <VehicleSpecificationModal key={selected.id} vehicle={{ carNo: selected.carNo, vin: selected.vin }} onClose={() => setSpecificationOpen(false)} />}

      {openNew && <Modal size="md" title="신규 등록" description="등록할 업무 유형을 선택합니다." onClose={() => setOpenNew(false)}>
        <div className="grid grid-cols-5 gap-2">
          {TYPES.map((type) => <button key={type} type="button" onClick={() => {
            setOpenNew(false)
            if (type === '보험') setEditingRow({ id: '신규', date: new Date().toISOString().slice(0, 10), type: '보험', carNo: '', car: '', customer: '', phone: '010-0000-0000', insurer: '', manager: '', due: '', release: '', claim: '' })
          }} className="flex h-20 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:border-green-500 hover:bg-green-50 hover:text-green-700">{type}</button>)}
        </div>
      </Modal>}
    </div>
  )
}
