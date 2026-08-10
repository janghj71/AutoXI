import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, ArrowUpDown, Banknote, Car, CheckCircle2, ChevronDown, ClipboardEdit, FileText, FlaskConical,
  Image as ImageIcon, Paintbrush, Plus, Printer, Radio, Save, Search, Send, Sparkles, Trash2,
  Ruler, UserRound, Wrench, X,
} from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import TelField from '../../components/TelField'
import Toggle from '../../components/Toggle'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'
import { openCenteredWindow } from '../../utils/popup'
import SalesCustomerPage from '../01_기초코드/매출처등록'
import VehicleNamePage from '../01_기초코드/차량명등록'
import AiEstimateModal from './AiEstimateModal'
import PaymentModal from './PaymentModal'
import VehicleCustomerModal from './VehicleCustomerModal'
import VehicleRegistryModal from './VehicleRegistryModal'
import VehicleSpecificationModal from './VehicleSpecificationModal'
import WorkOrderModal from './WorkOrderModal'
import BasicMaintenanceMenu from './BasicMaintenanceMenu'
import PrintFormatModal from './PrintFormatModal'
import EstimateItemsModal from './EstimateItemsModal'
import PartsPurchaseModal from './PartsPurchaseModal'

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const COVERAGE_OPTIONS = ['자차', '대물']
const VAT_OPTIONS = ['0', '5', '8', '9', '9.5', '10'].map((value) => ({ value, label: Number(value).toFixed(1) }))
const SALES_VAT_OPTIONS = [
  { value: '0', label: '0 없음' },
  { value: '1', label: '1 공임' },
  { value: '2', label: '2 공임+부품' },
]
const PAINT_COAT_OPTIONS = [{ value: '1', label: '1 코트' }, { value: '2', label: '2 코트' }, { value: '3', label: '3 코트' }, { value: '4', label: '4 코트' }]
const PAINT_MATERIAL_OPTIONS = [{ value: '1', label: '유성' }, { value: '2', label: '수성' }]
const PAINT_TYPE_OPTIONS = [
  { value: '11', label: '11 유광메탈릭' },
  { value: '12', label: '12 무광메탈릭' },
  { value: '21', label: '21 유광솔리드' },
  { value: '22', label: '22 무광솔리드' },
  { value: '31', label: '31 진주(펄)' },
]
const KIND_STYLE = {
  주체: 'bg-slate-100 text-slate-700',
  부품: 'bg-blue-50 text-blue-700',
  도장: 'bg-violet-50 text-violet-700',
  '#공임': 'bg-amber-50 text-amber-700',
  '#부품': 'bg-cyan-50 text-cyan-700',
}
const MANUAL_WORK_OPTIONS = [
  { code: 'R', label: '탈착' },
  { code: 'X', label: '교환' },
  { code: 'B', label: '판금' },
  { code: 'A', label: '조정' },
  { code: 'O', label: '오버홀' },
  { code: 'S', label: '수리' },
  { code: 'P', label: '도장' },
  { code: 'T', label: '견인' },
  { code: 'G', label: '구난' },
  { code: 'W', label: '세차' },
]
const DIRECT_LABOR_WORKS = new Set(['견인', '구난', '세차'])
const PART_TYPE_OPTIONS = [
  { value: 'A', label: '신품' },
  { value: 'B', label: '재제조' },
  { value: 'C', label: '중고' },
  { value: 'D', label: '인증대체부품' },
  { value: 'F', label: '수입부품' },
]
const STAFF_ROWS = [
  { code: '0001', name: '김정비', department: '정비부', position: '과장' },
  { code: '0002', name: '이판금', department: '판금부', position: '대리' },
  { code: '0003', name: '박도장', department: '도장부', position: '사원' },
]
const INSURER_ROWS = [
  { code: '01', name: '메리츠' },
  { code: '02', name: '한화손해보험' },
  { code: '03', name: '롯데손해보험' },
  { code: '04', name: 'MG손해보험' },
  { code: '08', name: '삼성화재' },
  { code: '09', name: '현대해상' },
  { code: '10', name: 'KB손해보험' },
  { code: '13', name: 'DB손해보험' },
]
const INSURER_CONTACTS = {
  '01': ['장현정'],
  '02': ['김대균'],
  '03': ['박담당'],
  '04': ['최담당'],
  '08': ['삼성담당자', '이재범', '이재철'],
  '09': ['현대담당자'],
  '10': ['KB담당자'],
  '13': ['DB담당자'],
}
const LABOR_MENU_ITEMS = [
  { label: '공임항목', icon: Wrench },
  { label: '도장항목', icon: Paintbrush },
  { label: '케미칼항목', icon: FlaskConical },
  { label: '견적항목', icon: FileText },
  { label: '타견적 불러오기', icon: ClipboardEdit },
]
const PART_MENU_ITEMS = [
  { label: '소요부품', icon: Search },
  { label: '셋트작업', icon: ClipboardEdit },
  { label: '재고부품', icon: FileText },
  { label: '출고부품', icon: Send },
  { label: '중고부품', icon: Search },
  { label: '수입차 부품', icon: Search },
]
const money = (value) => (value || 0).toLocaleString('ko-KR')

const initialMaster = (row) => ({
  carNo: row?.carNo ?? '',
  carName: row?.car ?? '',
  carCode: 'K5A',
  modelName: `${row?.car ?? ''} 4세대`.trim(),
  mileage: '48,200',
  averageMileage: '45',
  vin: 'KNAP841BBBBK12345',
  customer: row?.customer ?? '',
  phone: (row?.phone ?? '010-0000-0000').split('-'),
  companyCode: '0001',
  companyName: '매출처',
  carLedgerAppInstalled: true,
  vatType: '2',
  status: '작업대기',
  inDate: row?.date ?? '',
  inHour: '09',
  outDueDate: row?.due?.slice(0, 10) ?? '',
  outDueHour: row?.due?.slice(11, 13) ?? '11',
  outDate: row?.release ?? '',
  claimDate: row?.claim ?? '',
  customerVoice: '',
  workManager: row?.manager ?? '',
  writer: row?.manager ?? '',
  introducer: '',
  happyCall: false,
  manager: row?.manager ?? '',
  extraRepairAgree: true,
  altCarCode: '',
  altCarName: row?.car ?? '',
  paintType: '11',
  paintCoat: '2',
  paintMaterial: '2',
  paintColor: '',
  heatDryFee: '15,869',
  heatDryClaim: true,
  detachRate: '25,000',
  sheetRate: '28,000',
  paintRate: '26,000',
})

const initialClaims = (row) => [{
  id: 'insurer-1',
  type: 'insurer',
  insurerCode: '08',
  insurer: row?.insurer || '삼성화재',
  contact: '삼성담당자',
  receiptNo: '2026-778812',
  faultRate: '0',
  coverage: '자차',
  accidentDate: row?.claim || '',
  driver: row?.customer ?? '',
  deductible: '0',
  insuredPerson: row?.customer ?? '',
  insuredCar: row?.carNo ?? '',
  carValue: '18,500,000',
  detachRate: '25,000',
  sheetRate: '28,000',
  paintRate: '26,000',
}]

const initialItems = [
  { id: 'i1', kind: '주체', manufacturerCode: '64900T1000', content: '프론트 도어 우측', work: '교환', hour: '1.2', unitPrice: 28000, partAmt: 0, laborAmt: 33600, worker: '김정비', prevention: '100', workStatus: '작업중', molit: 'B03', partType: '', releaseDate: '', pointPolicy: '적용', supplier: '' },
  { id: 'i2', kind: '부품', manufacturerCode: '82651-3S000', content: '도어 아웃사이드핸들', work: '교환', hour: '1', unitPrice: 78000, partAmt: 78000, laborAmt: 0, worker: '박기사', prevention: '110', workStatus: '출고완료', molit: 'B03', partType: 'A', releaseDate: '2026-07-21', pointPolicy: '미적용(부품)', supplier: '한마음상사' },
  { id: 'i4', kind: '부품', manufacturerCode: '86511-R2000', content: '프론트 범퍼 커버', work: '교환', hour: '1', unitPrice: 125000, partAmt: 125000, laborAmt: 0, worker: '박기사', prevention: '120', workStatus: '출고완료', molit: 'B03', partType: 'B', releaseDate: '2026-07-21', pointPolicy: '미적용(부품)', supplier: '대한부품' },
  { id: 'i5', kind: '부품', manufacturerCode: '66311-T1000', content: '프론트 도어 패널', work: '교환', hour: '1', unitPrice: 95000, partAmt: 95000, laborAmt: 0, worker: '김정비', prevention: '130', workStatus: '출고대기', molit: 'B05', partType: 'C', releaseDate: '', pointPolicy: '미적용', supplier: '중고부품센터' },
  { id: 'i3', kind: '도장', manufacturerCode: 'PAINT-1W', content: '도어 우측 교환도장', work: '도장', hour: '2.5', unitPrice: 26000, partAmt: 0, laborAmt: 65000, worker: '이도장', prevention: '140', workStatus: '작업대기', molit: 'B05', partType: '', releaseDate: '', pointPolicy: '미적용', supplier: '' },
]

function ReceptionSection({ master, setMaster, onOpenVehicleName, onOpenCompany, onOpenCustomer, onOpenVehicleRegistry, onOpenSpecification }) {
  const set = (key) => (value) => setMaster((prev) => ({ ...prev, [key]: value }))
  const setInput = (key) => (event) => set(key)(event.target.value)
  const inputClass = 'w-full min-w-0 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15'
  const searchButtonClass = 'inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-gray-600'

  return (
    <div className="grid shrink-0 grid-cols-3 gap-x-6 gap-y-2 border-b border-gray-200 px-4 py-3">
      <FormField label="차량번호" labelWidth="w-20" required>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <input value={master.carNo} onChange={setInput('carNo')} className={inputClass} />
          <button type="button" onClick={onOpenCustomer} className="inline-flex h-[30px] shrink-0 items-center justify-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <UserRound size={13} />고객
          </button>
        </div>
      </FormField>
      <FormField label="고객명" labelWidth="w-20">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            <input value={master.customer} onChange={setInput('customer')} placeholder="고객명" className={`${inputClass} pr-8`} />
            {master.customer && <button type="button" aria-label="고객명 삭제" onClick={() => setMaster((prev) => ({ ...prev, customer: '' }))} className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={13} /></button>}
          </div>
          <button type="button" onClick={onOpenVehicleRegistry} className="inline-flex h-[30px] shrink-0 items-center justify-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Car size={13} />차량원부
          </button>
          <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
            차계부 사용
          </span>
        </div>
      </FormField>
      <FormField label="입고일자" labelWidth="w-20">
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_72px] gap-1.5">
          <input type="date" value={master.inDate} onChange={setInput('inDate')} className={inputClass} />
          <Select className="w-full" value={master.inHour} onChange={set('inHour')} options={HOUR_OPTIONS} />
        </div>
      </FormField>

      <FormField label="차량명" labelWidth="w-20" required>
        <div className="grid min-w-0 flex-1 grid-cols-[4.5rem_30px_minmax(0,1fr)] items-center gap-1.5">
          <input value={master.carCode} onChange={setInput('carCode')} placeholder="코드" className={`${inputClass} px-2`} />
          <button type="button" aria-label="차량명 검색" onClick={onOpenVehicleName} className={searchButtonClass}><Search size={13} /></button>
          <input value={master.carName} readOnly placeholder="차량명" className={`${inputClass} bg-gray-50`} />
        </div>
      </FormField>
      <FormField label="연락처" labelWidth="w-20"><TelField value={master.phone} onChange={set('phone')} /></FormField>
      <FormField label="출고예정" labelWidth="w-20">
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_72px] gap-1.5">
          <input type="date" value={master.outDueDate} onChange={setInput('outDueDate')} className={inputClass} />
          <Select className="w-full" value={master.outDueHour} onChange={set('outDueHour')} options={HOUR_OPTIONS} />
        </div>
      </FormField>

      <FormField label="모델명" labelWidth="w-20" value={master.modelName} onChange={setInput('modelName')} />
      <FormField label="소속회사" labelWidth="w-20">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            <input value={master.companyName} readOnly placeholder="소속회사 선택" className={`${inputClass} bg-gray-50 pr-8`} />
            {master.companyName && <button type="button" aria-label="소속회사 삭제" onClick={() => setMaster((prev) => ({ ...prev, companyCode: '', companyName: '' }))} className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={13} /></button>}
          </div>
          <button type="button" aria-label="소속회사 검색" onClick={onOpenCompany} className={searchButtonClass}><Search size={13} /></button>
        </div>
      </FormField>
      <FormField label="출고일자" labelWidth="w-20" type="date" value={master.outDate} onChange={setInput('outDate')} />

      <FormField label="주행거리" labelWidth="w-20" required>
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-1.5">
          <input value={master.mileage} onChange={setInput('mileage')} placeholder="주행거리" className={inputClass} />
          <input value={master.averageMileage} onChange={setInput('averageMileage')} className={inputClass} />
          <span className="shrink-0 text-xs text-gray-400">평균KM</span>
        </div>
      </FormField>
      <FormField label="부가세" labelWidth="w-20"><Select className="w-full" value={master.vatType} onChange={set('vatType')} options={SALES_VAT_OPTIONS} /></FormField>
      <FormField label="청구일자" labelWidth="w-20" type="date" value={master.claimDate} onChange={setInput('claimDate')} />

      <FormField label="차대번호" labelWidth="w-20">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <input value={master.vin} onChange={setInput('vin')} className={inputClass} />
          <button type="button" onClick={onOpenSpecification} className="inline-flex h-[30px] shrink-0 items-center justify-center gap-1 rounded-sm border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Ruler size={13} />규격
          </button>
        </div>
      </FormField>
      <FormField label="고객의 소리" labelWidth="w-20" className="col-span-2" value={master.customerVoice} onChange={setInput('customerVoice')} />
    </div>
  )
}

function SegmentToggle({ value, onChange, options }) {
  return (
    <div className="flex h-7 items-center overflow-hidden rounded-md border border-gray-300 bg-white text-xs">
      {options.map((opt, idx) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-2.5 py-1 font-medium transition-colors ${value === opt ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'} ${idx > 0 ? 'border-l border-gray-300' : ''}`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ToolbarMenu({ id, label, icon: Icon, items, openMenu, setOpenMenu, onItemClick }) {
  const open = openMenu === id
  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpenMenu(open ? null : id)}>
        <Icon size={13} />{label}<ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
      {open && (
        <>
          <button type="button" aria-label={`${label} 메뉴 닫기`} onClick={() => setOpenMenu(null)} className="fixed inset-0 z-20 cursor-default" />
          <div className="absolute left-0 top-full z-30 mt-1 min-w-48 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {items.map(({ label: itemLabel, icon: ItemIcon }) => (
              <button key={itemLabel} type="button" onClick={() => { onItemClick?.(itemLabel); setOpenMenu(null) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
                <ItemIcon size={14} className="shrink-0 text-gray-400" />
                <span>{itemLabel}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ItemsSection({ rows, setRows, selectedId, setSelectedId, workType, carNo, carName, laborRates }) {
  const alert = useAlert()
  const [arrangeMode, setArrangeMode] = useState('블록')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectMenuOpen, setSelectMenuOpen] = useState(false)
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false)
  const [basicMenuOpen, setBasicMenuOpen] = useState(false)
  const [workMenu, setWorkMenu] = useState(null)
  const [partTypeMenu, setPartTypeMenu] = useState(null)
  const [pendingFocus, setPendingFocus] = useState(null)
  const [workOrderOpen, setWorkOrderOpen] = useState(false)
  const [aiEstimateOpen, setAiEstimateOpen] = useState(false)
  const totals = useMemo(() => rows.reduce((acc, row) => ({
    part: acc.part + Number(row.partAmt || 0),
    labor: acc.labor + Number(row.laborAmt || 0),
  }), { part: 0, labor: 0 }), [rows])
  const vat = Math.round((totals.part + totals.labor) * 0.1)

  useEffect(() => {
    if (!pendingFocus) return
    const frame = globalThis.requestAnimationFrame(() => {
      globalThis.document?.getElementById(`item-${pendingFocus.id}-${pendingFocus.key}`)?.focus()
      setPendingFocus(null)
    })
    return () => globalThis.cancelAnimationFrame(frame)
  }, [pendingFocus, rows])

  const parseMoney = (value) => Number(String(value ?? '').replace(/[^0-9-]/g, '')) || 0
  const rateForWork = (work) => {
    if (['탈착', '교환'].includes(work)) return parseMoney(laborRates?.detach)
    if (['판금', '조정', '오버홀', '수리'].includes(work)) return parseMoney(laborRates?.sheet)
    if (work === '도장') return parseMoney(laborRates?.paint)
    return 0
  }

  const setCell = (rowId, key, value) => {
    setRows((prev) => prev.map((row) => {
      if (row.id !== rowId) return row
      const next = { ...row, [key]: value }
      if (row.kind === '#부품' && (key === 'hour' || key === 'unitPrice')) {
        next.partAmt = Math.round((Number(key === 'hour' ? value : row.hour) || 0) * (Number(key === 'unitPrice' ? value : row.unitPrice) || 0))
      }
      if (row.kind === '#공임' && key === 'hour' && !DIRECT_LABOR_WORKS.has(row.work)) {
        next.laborAmt = Math.round((Number(value) || 0) * rateForWork(row.work))
      }
      return next
    }))
  }

  const editableKeys = (row) => {
    if (row.kind === '#공임') {
      return DIRECT_LABOR_WORKS.has(row.work)
        ? ['content', 'laborAmt', 'worker']
        : ['content', 'hour', 'worker']
    }
    if (row.kind === '#부품') return ['manufacturerCode', 'content', 'hour', 'unitPrice', 'worker', 'prevention', 'molit', 'partType']
    return []
  }

  const focusCell = (rowId, key) => {
    globalThis.requestAnimationFrame(() => globalThis.document?.getElementById(`item-${rowId}-${key}`)?.focus())
  }

  const moveCellFocus = (row, key, backward = false) => {
    const keys = editableKeys(row)
    const currentIndex = keys.indexOf(key)
    const nextKey = keys[currentIndex + (backward ? -1 : 1)]
    if (nextKey) {
      focusCell(row.id, nextKey)
      return
    }
    const rowIndex = rows.findIndex((item) => item.id === row.id)
    const direction = backward ? -1 : 1
    for (let index = rowIndex + direction; index >= 0 && index < rows.length; index += direction) {
      const targetKeys = editableKeys(rows[index])
      if (targetKeys.length > 0) {
        focusCell(rows[index].id, backward ? targetKeys.at(-1) : targetKeys[0])
        setSelectedId(rows[index].id)
        return
      }
    }
    const adjacent = rows[rowIndex + direction]
    if (adjacent) setSelectedId(adjacent.id)
  }

  const inputKeyDown = (row, key) => (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.stopPropagation()
    moveCellFocus(row, key, event.shiftKey)
  }

  const addManualRow = (kind) => {
    const selectedRow = rows.find((row) => row.id === selectedId)
    if (selectedRow?.kind?.startsWith('#') && !String(selectedRow.content || '').trim()) {
      alert.warning('현재 추가한 Row의 작업내용을 먼저 입력해 주세요.')
      return
    }
    const insertAt = selectedRow ? rows.findIndex((row) => row.id === selectedId) + 1 : rows.length
    const id = `manual-${Date.now()}`
    const newRow = {
      id,
      kind,
      manufacturerCode: '',
      content: '',
      work: '',
      workCode: '',
      hour: kind === '#부품' ? '1' : '',
      unitPrice: 0,
      partAmt: 0,
      laborAmt: 0,
      worker: '',
      prevention: '',
      workStatus: '',
      molit: '',
      partType: kind === '#부품' ? 'A' : '',
      releaseDate: '',
      pointPolicy: kind === '#부품' ? '미적용(부품)' : '적용',
      supplier: '',
    }
    setRows((prev) => [...prev.slice(0, insertAt), newRow, ...prev.slice(insertAt)])
    setSelectedId(id)
    setSelectedIds(new Set())
    setPendingFocus({ id, key: kind === '#공임' ? 'content' : 'manufacturerCode' })
  }

  const addBasicMaintenanceRow = (item) => {
    if (rows.some((row) => row.basicMaintenanceCode === item.value)) {
      alert.info(`이미 추가된 항목입니다.\n[${item.label}]`)
      return
    }

    const workCode = String(item.value || '').slice(0, 1)
    const work = MANUAL_WORK_OPTIONS.find((option) => option.code === workCode)?.label || ''
    const hour = String(item.defValue ?? '0')
    const id = `basic-${Date.now()}`
    const newRow = {
      id,
      basicMaintenanceCode: item.value,
      kind: '#공임',
      manufacturerCode: '',
      content: item.label,
      work,
      workCode,
      hour,
      unitPrice: 0,
      partAmt: 0,
      laborAmt: Math.round((Number(hour) || 0) * rateForWork(work)),
      worker: '',
      prevention: '',
      workStatus: '',
      molit: '',
      partType: '',
      releaseDate: '',
      pointPolicy: '적용',
      supplier: '',
    }

    setRows((prev) => [...prev, newRow])
    setSelectedId(id)
    setSelectedIds(new Set())
    setPendingFocus({ id, key: 'worker' })
  }

  const selectWork = (rowId, option) => {
    setRows((prev) => prev.map((row) => {
      if (row.id !== rowId) return row
      const direct = DIRECT_LABOR_WORKS.has(option.label)
      return {
        ...row,
        work: option.label,
        workCode: option.code,
        laborAmt: direct ? row.laborAmt : Math.round((Number(row.hour) || 0) * rateForWork(option.label)),
      }
    }))
    setWorkMenu(null)
    focusCell(rowId, DIRECT_LABOR_WORKS.has(option.label) ? 'laborAmt' : 'hour')
  }

  const toggleMultiSelection = (id) => {
    if (!id) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeSelected = () => {
    const targets = selectedIds.size > 0 ? selectedIds : new Set(selectedId ? [selectedId] : [])
    if (targets.size === 0) return
    setRows((prev) => prev.filter((row) => !targets.has(row.id)))
    setSelectedIds(new Set())
    if (selectedId && targets.has(selectedId)) setSelectedId(null)
  }

  const removeAll = () => {
    setRows([])
    setSelectedId(null)
    setSelectedIds(new Set())
  }

  const selectPartsOnly = () => {
    setSelectedIds(new Set(rows.filter((row) => row.kind === '부품' || row.kind === '#부품').map((row) => row.id)))
  }

  const appendSuggestedRows = (suggestedRows, source) => {
    const createdAt = Date.now()
    const nextRows = suggestedRows.map((row, index) => ({
      id: `${source}-${createdAt}-${index}`,
      kind: row.kind === '공임' ? '주체' : row.kind || (String(row.work || '').startsWith('도장') ? '도장' : row.partAmt ? '부품' : '주체'),
      manufacturerCode: row.partCode || '',
      content: row.content,
      work: String(row.work || '').split('·')[0],
      hour: String(row.hour ?? ''),
      unitPrice: Number(row.unitPrice || 0),
      partAmt: Number(row.partAmt || 0),
      laborAmt: Number(row.laborAmt || 0),
      worker: '',
      prevention: '',
      workStatus: '작업대기',
      molit: '',
      partType: row.partAmt ? 'A' : '',
      releaseDate: '',
      pointPolicy: row.partAmt ? '미적용(부품)' : '적용',
      supplier: row.supplier || '',
    }))
    setRows((prev) => [...prev, ...nextRows])
    setSelectedId(nextRows.at(-1)?.id ?? null)
  }

  const cellInputClass = 'h-8 w-full min-w-0 rounded-sm border border-transparent bg-transparent px-1 text-sm text-gray-800 outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-green-600/20'
  const renderCellInput = (row, key, { align = 'left', numeric = false, decimal = false, moneyValue = false, maxLength, expandHorizontal = false } = {}) => (
    <input
      id={`item-${row.id}-${key}`}
      value={moneyValue ? (row[key] ? money(Number(row[key])) : '') : (row[key] ?? '')}
      onMouseDown={(event) => { event.stopPropagation(); setSelectedId(row.id) }}
      onChange={(event) => {
        let value = event.target.value
        if (moneyValue) value = Number(value.replace(/[^0-9]/g, '')) || 0
        else if (decimal) value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
        else if (numeric) value = value.replace(/[^0-9]/g, '')
        setCell(row.id, key, value)
      }}
      onKeyDown={inputKeyDown(row, key)}
      onDragStart={(event) => event.stopPropagation()}
      maxLength={maxLength}
      autoComplete="off"
      className={`${cellInputClass} ${expandHorizontal ? '-mx-1 w-[calc(100%+0.5rem)]' : ''} ${align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : 'text-left'}`}
    />
  )

  const columns = [
    { key: 'kind', title: '구분', width: '58px', align: 'center', className: '!px-1.5', headerClassName: '!px-1.5', render: (value) => <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${KIND_STYLE[value]}`}>{value}</span> },
    { key: 'manufacturerCode', title: '제작사품번', width: '135px', className: '!px-1.5', render: (value, row) => row.kind === '#부품' ? renderCellInput(row, 'manufacturerCode') : value || '-' },
    { key: 'content', title: '작업내용', width: '280px', className: '!px-1.5', render: (value, row) => row.kind?.startsWith('#') ? renderCellInput(row, 'content', { expandHorizontal: true }) : value },
    { key: 'work', title: '작업', width: '70px', align: 'center', className: '!px-1.5', render: (value, row) => row.kind === '#공임' ? (
      <button
        type="button"
        onMouseDown={(event) => { event.stopPropagation(); setSelectedId(row.id) }}
        onClick={(event) => {
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          setPartTypeMenu(null)
          setWorkMenu({ rowId: row.id, left: rect.left, top: rect.bottom + 4 })
        }}
        className="h-8 w-full rounded-sm px-0 text-center text-sm text-gray-700 hover:bg-gray-50 hover:underline"
      >
        {value || '선택'}
      </button>
    ) : row.kind === '#부품' ? '-' : value || '-' },
    { key: 'hour', title: '시간', width: '52px', align: 'right', className: '!px-1', headerClassName: '!px-1 text-right', render: (value, row) => {
      if (row.kind === '#공임') return DIRECT_LABOR_WORKS.has(row.work) ? '-' : renderCellInput(row, 'hour', { align: 'right', decimal: true, maxLength: 5, expandHorizontal: true })
      if (row.kind === '#부품') return renderCellInput(row, 'hour', { align: 'right', numeric: true, maxLength: 5, expandHorizontal: true })
      return value || '0'
    } },
    { key: 'unitPrice', title: '단가', width: '90px', align: 'right', className: '!px-1', render: (value, row) => row.kind === '#부품' ? renderCellInput(row, 'unitPrice', { align: 'right', moneyValue: true }) : row.kind === '#공임' ? '-' : money(value) },
    { key: 'partAmt', title: '부품액', width: '100px', align: 'right', render: (value, row) => row.kind === '#공임' ? '-' : money(value) },
    { key: 'laborAmt', title: '공임액', width: '100px', align: 'right', className: '!px-1', render: (value, row) => row.kind === '#공임' && DIRECT_LABOR_WORKS.has(row.work) ? renderCellInput(row, 'laborAmt', { align: 'right', moneyValue: true }) : row.kind === '#부품' ? '-' : money(value) },
    { key: 'worker', title: '작업자', width: '80px', align: 'center', className: '!px-1.5', render: (value, row) => row.kind?.startsWith('#') ? renderCellInput(row, 'worker', { align: 'center' }) : value || '-' },
    { key: 'prevention', title: '예방', width: '52px', align: 'center', className: '!px-1', headerClassName: '!px-1', render: (value, row) => row.kind === '#부품' ? renderCellInput(row, 'prevention', { align: 'center', numeric: true, maxLength: 3, expandHorizontal: true }) : ['일반', '경정비'].includes(workType) && value ? String(value).slice(0, 3) : '-' },
    { key: 'workStatus', title: '작업상태', width: '90px', align: 'center', render: (value) => value || '-' },
    { key: 'molit', title: '국토부', width: '52px', align: 'center', className: '!px-1', headerClassName: '!px-1', render: (value, row) => row.kind === '#부품' ? renderCellInput(row, 'molit', { align: 'center', maxLength: 3, expandHorizontal: true }) : value || '-' },
    { key: 'partType', title: '부품', width: '58px', align: 'center', className: '!px-1', render: (value, row) => row.kind === '#부품' ? (
      <button
        type="button"
        id={`item-${row.id}-partType`}
        onMouseDown={(event) => { event.stopPropagation(); setSelectedId(row.id) }}
        onClick={(event) => {
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          setWorkMenu(null)
          setPartTypeMenu({ rowId: row.id, left: Math.min(rect.left, globalThis.innerWidth - 170), top: rect.bottom + 4 })
        }}
        onKeyDown={inputKeyDown(row, 'partType')}
        className="h-8 w-full rounded-sm px-0 text-center text-sm text-gray-700 hover:bg-gray-50 hover:underline"
      >
        {value || 'A'}
      </button>
    ) : row.kind === '부품' ? value || '-' : '-' },
    { key: 'releaseDate', title: '출고일자', width: '100px', align: 'center', noTruncate: true, className: '!px-1', headerClassName: '!px-1', render: (value) => value || '-' },
    { key: 'pointPolicy', title: '적립', width: '64px', align: 'center', className: '!px-1', headerClassName: '!px-1', render: (value) => <span title={value || ''}>{String(value || '-').startsWith('미적용') ? '미적용' : value || '-'}</span> },
    { key: 'supplier', title: '매입처', width: '120px', render: (value) => ['일반', '경정비'].includes(workType) ? value || '-' : '-' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <div className="relative">
          <Button size="sm" onClick={() => { setDeleteMenuOpen(false); setSelectMenuOpen((prev) => !prev) }}>
            선택{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}<ChevronDown size={12} />
          </Button>
          {selectMenuOpen && (
            <>
              <button type="button" aria-label="선택 메뉴 닫기" className="fixed inset-0 z-40 cursor-default" onClick={() => setSelectMenuOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 min-w-32 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                <button type="button" disabled={selectedIds.size === 0} onClick={() => { setSelectedIds(new Set()); setSelectMenuOpen(false) }} className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300">
                  선택해제
                </button>
                <button type="button" disabled={!rows.some((row) => row.kind === '부품' || row.kind === '#부품')} onClick={() => { selectPartsOnly(); setSelectMenuOpen(false) }} className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300">
                  부품만 선택
                </button>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <Button size="sm" disabled={rows.length === 0} onClick={() => { setSelectMenuOpen(false); setDeleteMenuOpen((prev) => !prev) }}>
            <Trash2 size={13} />삭제<ChevronDown size={12} />
          </Button>
          {deleteMenuOpen && (
            <>
              <button type="button" aria-label="삭제 메뉴 닫기" className="fixed inset-0 z-40 cursor-default" onClick={() => setDeleteMenuOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 min-w-28 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                <button
                  type="button"
                  disabled={selectedIds.size === 0 && !selectedId}
                  onClick={() => { setDeleteMenuOpen(false); removeSelected() }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  선택삭제
                </button>
                <button type="button" onClick={() => { setDeleteMenuOpen(false); removeAll() }} className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50">
                  전체삭제
                </button>
              </div>
            </>
          )}
        </div>
        <Button size="sm" onClick={() => addManualRow('#공임')}><Plus size={13} />공임추가</Button>
        <Button size="sm" onClick={() => addManualRow('#부품')}><Plus size={13} />부품추가</Button>
        <div className="relative">
          <Button size="sm" onClick={() => {
            setSelectMenuOpen(false)
            setDeleteMenuOpen(false)
            setBasicMenuOpen((prev) => !prev)
          }}>
            <ClipboardEdit size={13} />기본정비항목
          </Button>
          <BasicMaintenanceMenu
            open={basicMenuOpen}
            onClose={() => setBasicMenuOpen(false)}
            onItemClick={addBasicMaintenanceRow}
          />
        </div>
        <span className="mx-0.5 h-5 w-px bg-gray-200" />
        <span className="text-[11px] text-gray-400">자리이동</span>
        <SegmentToggle value={arrangeMode} onChange={setArrangeMode} options={['블록', '자유']} />
        <Button size="sm"><ArrowUpDown size={13} />도장 하단정렬</Button>
        <span className="mx-0.5 h-5 w-px bg-gray-200" />
        <Button size="sm"><ClipboardEdit size={13} />소요매입</Button>
        <Button size="sm" onClick={() => setWorkOrderOpen(true)}><FileText size={13} />작업지시</Button>
        <Button size="sm" variant="violet"><Radio size={13} />정비이력전송</Button>
        <Button size="sm" className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={() => setAiEstimateOpen(true)}><Sparkles size={13} />AI 견적</Button>
      </div>
      <div className="min-h-0 flex-1 bg-white">
        <FixedHeadTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          rowSize="sm"
          height={null}
          selectedKey={selectedId}
          selectedKeys={selectedIds}
          onRowClick={(row, _index, event) => {
            setSelectedId(row.id)
            if (event?.ctrlKey || event?.metaKey) toggleMultiSelection(row.id)
          }}
          onRowDoubleClick={(row) => toggleMultiSelection(row.id)}
          draggable
          dragColumnWidth="28px"
          dragCellClassName="!px-1.5"
          showMultiSelectInDragColumn
          multiSelectionRowHighlight={false}
          onReorder={setRows}
          enableHorizontalScroll
          emptyText="데이터가 없습니다."
        />
      </div>
      <div className="flex h-9 shrink-0 items-center gap-4 border-t border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
        <span>부품액: <strong className="text-gray-800">{money(totals.part)}</strong></span>
        <span>공임액: <strong className="text-gray-800">{money(totals.labor)}</strong></span>
        <span>부품+공임: <strong className="text-gray-800">{money(totals.part + totals.labor)}</strong></span>
        <span>부가세: <strong className="text-gray-800">{money(vat)}</strong></span>
        <span className="ml-auto">합계: <strong className="text-red-600">{money(totals.part + totals.labor + vat)}</strong></span>
      </div>
      <div className="flex h-8 shrink-0 items-center border-t border-gray-200 bg-white px-3 text-xs text-gray-400">정비이력 전송 :</div>
      {workMenu && (
        <>
          <button type="button" aria-label="작업 선택 닫기" className="fixed inset-0 z-[1050] cursor-default" onClick={() => setWorkMenu(null)} />
          <div className="fixed z-[1060] min-w-32 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-xl" style={{ left: workMenu.left, top: workMenu.top }}>
            {MANUAL_WORK_OPTIONS.map((option) => (
              <button key={option.code} type="button" onClick={() => selectWork(workMenu.rowId, option)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-gray-700 hover:bg-green-50 hover:text-green-700">
                <span className="w-4 text-xs text-gray-400">{option.code}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {partTypeMenu && (
        <>
          <button type="button" aria-label="부품 구분 선택 닫기" className="fixed inset-0 z-[1050] cursor-default" onClick={() => setPartTypeMenu(null)} />
          <div className="fixed z-[1060] min-w-40 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-xl" style={{ left: partTypeMenu.left, top: partTypeMenu.top }}>
            {PART_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { setCell(partTypeMenu.rowId, 'partType', option.value); setPartTypeMenu(null) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                <span className="w-4 text-xs text-gray-400">{option.value}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {workOrderOpen && (
        <WorkOrderModal
          vehicle={{ carNo, carName }}
          onClose={() => setWorkOrderOpen(false)}
          onApply={(suggestedRows) => appendSuggestedRows(suggestedRows, 'work-order')}
        />
      )}
      {aiEstimateOpen && (
        <AiEstimateModal
          carName={carName}
          onClose={() => setAiEstimateOpen(false)}
          onSelect={(suggestedRows) => appendSuggestedRows(suggestedRows, 'ai-estimate')}
        />
      )}
    </div>
  )
}

function StaffSelectionModal({ title, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState(STAFF_ROWS[0].code)
  const rows = STAFF_ROWS.filter((staff) => {
    const keyword = query.trim().toLowerCase()
    return !keyword || [staff.code, staff.name, staff.department, staff.position].some((value) => value.toLowerCase().includes(keyword))
  })
  const selected = rows.find((staff) => staff.code === selectedCode)

  return (
    <Modal title={`${title} 선택`} size="md" onClose={onClose} footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" disabled={!selected} onClick={() => selected && onSelect(selected)}>선택</Button></>}>
      <div className="mb-2 flex h-8 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
        <Search size={14} className="text-gray-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="코드, 직원명, 부서, 직위 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
      </div>
      <div className="overflow-hidden rounded-md border border-gray-200">
        <FixedHeadTable columns={[{ key: 'code', title: '코드', width: '18%' }, { key: 'name', title: '직원명', width: '30%' }, { key: 'department', title: '부서', width: '28%' }, { key: 'position', title: '직위', width: '24%' }]} rows={rows} rowKey={(staff) => staff.code} rowSize="sm" height={220} selectedKey={selectedCode} onRowClick={(staff) => setSelectedCode(staff.code)} onRowDoubleClick={onSelect} emptyText="검색 결과가 없습니다." />
      </div>
    </Modal>
  )
}

function StaffLookupField({ value, onClear, onSearch, label }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <div className="relative min-w-0 flex-1">
        <input value={value} readOnly placeholder={`${label} 선택`} className="w-full min-w-0 rounded-sm border border-gray-300 bg-gray-50 py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none" />
        {value && <button type="button" aria-label={`${label} 삭제`} onClick={onClear} className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={13} /></button>}
      </div>
      <button type="button" aria-label={`${label} 검색`} onClick={onSearch} className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-gray-600"><Search size={13} /></button>
    </div>
  )
}

function LaborSettingsPanel({ master, setMaster, workType }) {
  const [staffTarget, setStaffTarget] = useState(null)
  const [altVehicleOpen, setAltVehicleOpen] = useState(false)
  const set = (key) => (value) => setMaster((prev) => ({ ...prev, [key]: value }))
  const setInput = (key) => (event) => set(key)(event.target.value)
  const isPaintRequired = workType === '일반' || workType === '보험'

  return (
    <div className="flex flex-col gap-2">
      <FormField label="대체차종" labelWidth="w-24" required={isPaintRequired}>
        <div className="grid min-w-0 flex-1 grid-cols-[4.5rem_30px_minmax(0,1fr)] items-center gap-1.5">
          <input value={master.altCarCode} onChange={setInput('altCarCode')} placeholder="코드" className="w-full min-w-0 rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15" />
          <button type="button" aria-label="대체차종 검색" onClick={() => setAltVehicleOpen(true)} className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-gray-600"><Search size={13} /></button>
          <input value={master.altCarName} onChange={setInput('altCarName')} placeholder="차종명" className="min-w-0 flex-1 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15" />
        </div>
      </FormField>
      <FormField label="도장종류" labelWidth="w-24" required={isPaintRequired}>
        <Select className="w-full" value={master.paintType} onChange={set('paintType')} options={PAINT_TYPE_OPTIONS} />
      </FormField>
      <div className="my-1 border-t border-gray-100" />
      <FormField label="견적구분" labelWidth="w-24">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">보험</span>
      </FormField>
      <FormField label="작업담당자" labelWidth="w-24"><StaffLookupField value={master.workManager} label="작업담당자" onSearch={() => setStaffTarget('workManager')} onClear={() => set('workManager')('')} /></FormField>
      <FormField label="명세서 작성자" labelWidth="w-24"><StaffLookupField value={master.writer} label="명세서 작성자" onSearch={() => setStaffTarget('writer')} onClear={() => set('writer')('')} /></FormField>
      <FormField label="정비책임자" labelWidth="w-24" value={master.manager} onChange={setInput('manager')} />
      <FormField label="추가정비" labelWidth="w-24">
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Toggle checked={master.extraRepairAgree} onChange={set('extraRepairAgree')} label="동의함" />
        </div>
      </FormField>
      <FormField label="소개자" labelWidth="w-24"><StaffLookupField value={master.introducer} label="소개자" onSearch={() => setStaffTarget('introducer')} onClear={() => set('introducer')('')} /></FormField>
      <FormField label="해피콜" labelWidth="w-24"><div className="flex min-w-0 flex-1 items-center justify-start"><Toggle checked={master.happyCall} onChange={set('happyCall')} label="함" /></div></FormField>
      <div className="my-1 border-t border-gray-100" />
      <FormField label="도장코트" labelWidth="w-24" required={isPaintRequired}>
        <Select className="w-full" value={master.paintCoat} onChange={set('paintCoat')} options={PAINT_COAT_OPTIONS} />
      </FormField>
      <FormField label="도장도료" labelWidth="w-24" required={isPaintRequired}>
        <Select className="w-full" value={master.paintMaterial} onChange={set('paintMaterial')} options={PAINT_MATERIAL_OPTIONS} />
      </FormField>
      <FormField label="도장칼라" labelWidth="w-24" value={master.paintColor} onChange={setInput('paintColor')} placeholder="예: 1W" />
      <FormField label="가열건조비" labelWidth="w-24">
        <div className="grid min-w-0 flex-1 grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
          <input value={master.heatDryFee} onChange={setInput('heatDryFee')} className="w-full min-w-0 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-right text-xs text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15" />
          <div className="flex h-[30px] min-w-0 items-center px-1">
            <Toggle checked={master.heatDryClaim} onChange={set('heatDryClaim')} label="청구함" />
          </div>
        </div>
      </FormField>
      <div className="my-1 border-t border-gray-100" />
      <FormField label="탈착 M/H" labelWidth="w-24" value={master.detachRate} onChange={setInput('detachRate')} align="right" required={isPaintRequired} />
      <FormField label="판금 M/H" labelWidth="w-24" value={master.sheetRate} onChange={setInput('sheetRate')} align="right" required={isPaintRequired} />
      <FormField label="도장 M/H" labelWidth="w-24" value={master.paintRate} onChange={setInput('paintRate')} align="right" required={isPaintRequired} />
      {staffTarget && <StaffSelectionModal title={staffTarget === 'workManager' ? '작업담당자' : staffTarget === 'writer' ? '명세서 작성자' : '소개자'} onClose={() => setStaffTarget(null)} onSelect={(staff) => { set(staffTarget)(staff.name); setStaffTarget(null) }} />}
      {altVehicleOpen && <VehicleNamePage selectionMode onCancel={() => setAltVehicleOpen(false)} onSelect={({ vehicle }) => { setMaster((prev) => ({ ...prev, altCarCode: vehicle.code, altCarName: vehicle.name })); setAltVehicleOpen(false) }} />}
    </div>
  )
}

function InsurerSelectionModal({ selectedCode, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [activeCode, setActiveCode] = useState(selectedCode ?? '')
  const rows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return INSURER_ROWS.filter((row) => !keyword || row.code.includes(keyword) || row.name.toLowerCase().includes(keyword))
  }, [query])
  const activeRow = INSURER_ROWS.find((row) => row.code === activeCode)
  const columns = [
    { key: 'code', title: '코드', width: '24%', align: 'center' },
    { key: 'name', title: '보험사명', width: '76%' },
  ]

  return (
    <Modal
      title="보험사 선택"
      width="max-w-[420px]"
      onClose={onClose}
      footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" disabled={!activeRow} onClick={() => onSelect(activeRow)}>선택</Button></>}
    >
      <div className="grid h-[344px] min-w-0 grid-rows-[32px_minmax(0,1fr)] gap-3">
        <div className="flex h-8 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
          <Search size={14} className="text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="보험사 코드 또는 보험사명 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" autoFocus />
          {query && <button type="button" aria-label="검색어 지우기" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
        </div>
        <FixedHeadTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.code}
          rowSize="sm"
          height={null}
          selectedKey={activeCode}
          onRowClick={(row) => setActiveCode(row.code)}
          onRowDoubleClick={onSelect}
          emptyText="검색된 보험사가 없습니다."
        />
      </div>
    </Modal>
  )
}

function ClaimPanel({ claims, setClaims, selectedIdx, setSelectedIdx, master, workType }) {
  const [insurerOpen, setInsurerOpen] = useState(false)
  const current = claims[selectedIdx]
  const setField = (key) => (value) => setClaims((prev) => prev.map((claim, idx) => (idx === selectedIdx ? { ...claim, [key]: value } : claim)))
  const setInput = (key) => (event) => setField(key)(event.target.value)
  const contactOptions = INSURER_CONTACTS[current?.insurerCode] ?? []
  const insurerCount = claims.filter((claim) => claim.type === 'insurer').length
  const hasOwner = claims.some((claim) => claim.type === 'owner')
  const isInsuranceRequired = workType === '보험'

  const addClaim = () => {
    if (insurerCount >= 2) return
    setClaims((prev) => [...prev, { id: `insurer-${Date.now()}`, type: 'insurer', insurerCode: '', insurer: '', contact: '', receiptNo: '', faultRate: '0', coverage: '자차', accidentDate: '', driver: '', deductible: '0', insuredPerson: '', insuredCar: '', carValue: '', detachRate: '', sheetRate: '', paintRate: '' }])
    setSelectedIdx(claims.length)
  }
  const addOwner = () => {
    if (hasOwner) return
    setClaims((prev) => [...prev, {
      id: 'owner',
      type: 'owner',
      insurerCode: '',
      insurer: '차주부담금',
      contact: master.customer,
      receiptNo: '',
      faultRate: '0',
      coverage: '',
      accidentDate: '',
      driver: master.customer,
      deductible: '0',
      insuredPerson: master.customer,
      insuredCar: master.carNo,
      carValue: '',
      detachRate: '',
      sheetRate: '',
      paintRate: '',
    }])
    setSelectedIdx(claims.length)
  }
  const removeClaim = () => {
    if (!current || (current.type === 'insurer' && insurerCount <= 1)) return
    setClaims((prev) => prev.filter((_, idx) => idx !== selectedIdx))
    setSelectedIdx(0)
  }
  const removeDisabled = !current || (current.type === 'insurer' && insurerCount <= 1)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={insurerCount >= 2} onClick={addClaim}><Plus size={13} />보험사</Button>
        <Button size="sm" disabled={hasOwner} onClick={addOwner}><Plus size={13} />차주 부담금</Button>
        <Button size="sm" variant="danger" disabled={removeDisabled} onClick={removeClaim}><Trash2 size={13} />선택 삭제</Button>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50/80 px-3 py-1.5 text-xs font-bold text-gray-800">청구처</div>
        <div className="flex flex-col gap-1.5 p-2">
          {claims.map((claim, idx) => (
            <button key={idx} type="button" onClick={() => setSelectedIdx(idx)}
              className={`rounded-md border px-2.5 py-2 text-left transition-colors ${idx === selectedIdx ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${claim.type === 'owner' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>{claim.type === 'owner' ? '차주' : '보험사'}</span>
                <span className="truncate text-sm font-semibold text-gray-800">{claim.type === 'owner' ? master.customer || '차주부담금' : claim.insurer || `보험사 ${idx + 1}`}</span>
              </div>
              <div className="mt-0.5 truncate text-xs text-gray-500">
                {claim.type === 'owner' ? `차량번호 ${master.carNo || '-'}` : `접수번호 ${claim.receiptNo || '-'} · 담보 ${claim.coverage || '-'}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {current?.type === 'owner' && <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-2.5">
        <FormField label="차주명" labelWidth="w-20" value={master.customer} readOnly />
        <FormField label="차량번호" labelWidth="w-20" value={master.carNo} readOnly />
        <FormField label="과실율" labelWidth="w-20" value={current.faultRate} onChange={setInput('faultRate')} suffix="%" />
      </div>}
      {current?.type === 'insurer' && <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-2.5">
        <FormField label="보험사" labelWidth="w-20" required={isInsuranceRequired}>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <input value={current.insurer} readOnly placeholder="보험사를 선택하세요" className="h-[30px] min-w-0 flex-1 rounded-sm border border-gray-300 bg-gray-50 px-3 text-xs text-gray-800 outline-none" />
            <button type="button" aria-label="보험사 검색" onClick={() => setInsurerOpen(true)} className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-gray-600"><Search size={13} /></button>
          </div>
        </FormField>
        <div className="grid min-w-0 grid-cols-1 gap-2 @[400px]:grid-cols-2">
          <FormField label="담당자" labelWidth="w-20" required={isInsuranceRequired}>
            <Select
              className="w-full"
              value={current.contact}
              onChange={setField('contact')}
              options={contactOptions}
              placeholder={current.insurer ? '담당자 선택' : '보험사를 먼저 선택하세요'}
              disabled={!current.insurer}
            />
          </FormField>
          <FormField label="접수번호" labelWidth="w-20 @[400px]:w-16" value={current.receiptNo} onChange={setInput('receiptNo')} required={isInsuranceRequired} />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 @[400px]:grid-cols-2">
          <FormField label="담보" labelWidth="w-20" required={isInsuranceRequired}>
            <Select className="w-full" value={current.coverage} onChange={setField('coverage')} options={COVERAGE_OPTIONS} />
          </FormField>
          <FormField label="과실율" labelWidth="w-20 @[400px]:w-16" value={current.faultRate} onChange={setInput('faultRate')} suffix="%" required={isInsuranceRequired} />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 @[400px]:grid-cols-2">
          <FormField label="사고일자" labelWidth="w-20" type="date" value={current.accidentDate} onChange={setInput('accidentDate')} />
          <FormField label="운전자" labelWidth="w-20 @[400px]:w-16" value={current.driver} onChange={setInput('driver')} />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 @[400px]:grid-cols-2">
          <FormField label="면책금" labelWidth="w-20" value={current.deductible} onChange={setInput('deductible')} align="right" />
          <FormField label="차량가액" labelWidth="w-20 @[400px]:w-16" value={current.carValue} onChange={setInput('carValue')} align="right" />
        </div>
        <FormField label="피보험자" labelWidth="w-20" value={current.insuredPerson} onChange={setInput('insuredPerson')} />
        <FormField label="피보험차" labelWidth="w-20" value={current.insuredCar} onChange={setInput('insuredCar')} />
        <div className="my-0.5 border-t border-gray-100" />
        <FormField label="탈착 M/H" labelWidth="w-20" value={current.detachRate} onChange={setInput('detachRate')} align="right" required={isInsuranceRequired} />
        <FormField label="판금 M/H" labelWidth="w-20" value={current.sheetRate} onChange={setInput('sheetRate')} align="right" required={isInsuranceRequired} />
        <FormField label="도장 M/H" labelWidth="w-20" value={current.paintRate} onChange={setInput('paintRate')} align="right" required={isInsuranceRequired} />
      </div>}
      {insurerOpen && current?.type === 'insurer' && (
        <InsurerSelectionModal
          selectedCode={current?.insurerCode}
          onClose={() => setInsurerOpen(false)}
          onSelect={(insurer) => {
            const contacts = INSURER_CONTACTS[insurer.code] ?? []
            setClaims((prev) => prev.map((claim, idx) => (idx === selectedIdx
              ? { ...claim, insurerCode: insurer.code, insurer: insurer.name, contact: contacts[0] ?? '' }
              : claim)))
            setInsurerOpen(false)
          }}
        />
      )}
    </div>
  )
}

const INITIAL_SETTLEMENT = {
  detachExchange: '0',
  panelAdjust: '0',
  towingEtc: '0',
  paintLabor: '0',
  heatDry: '0',
  paintComputer: '0',
  genuineParts: '0',
  usedParts: '0',
  paintMaterials: '0',
  depreciation: '0',
  salvage: '0',
  vatRate: '10',
}

const amountNumber = (value) => Number(String(value ?? '').replace(/,/g, '')) || 0
const formatMoneyValue = (value) => {
  const text = String(value ?? '')
  if (!text) return ''
  const normalized = text.replace(/,/g, '')
  return /^\d+$/.test(normalized) ? Number(normalized).toLocaleString('ko-KR') : text
}
const getSettlementTotals = (settlement, faultRate = 0, deductible = 0) => {
  const laborSum = ['detachExchange', 'panelAdjust', 'towingEtc', 'paintLabor', 'heatDry', 'paintComputer']
    .reduce((sum, key) => sum + amountNumber(settlement[key]), 0)
  const partSum = ['genuineParts', 'usedParts', 'paintMaterials']
    .reduce((sum, key) => sum + amountNumber(settlement[key]), 0)
  const deductionSum = amountNumber(settlement.depreciation) + amountNumber(settlement.salvage)
  const subtotal = Math.max(0, laborSum + partSum - deductionSum)
  const vat = Math.round(subtotal * (Number(settlement.vatRate || 0) / 100))
  const total = subtotal + vat
  const faultAmt = Math.round(total * (Number(faultRate || 0) / 100))
  const claimAmt = Math.max(0, total - faultAmt - amountNumber(deductible))
  return { laborSum, partSum, deductionSum, subtotal, vat, total, faultAmt, claimAmt }
}

function SettleField({ label, value, onChange, suffix, readOnly = false, emphasize = false, red = false, normalLabel = false }) {
  const handleChange = (event) => {
    onChange?.({ target: { value: event.target.value.replace(/\D/g, '') } })
  }

  return (
    <div className="grid min-w-0 grid-cols-[88px_minmax(0,1fr)] items-center gap-1">
      <div className={`whitespace-nowrap text-xs ${red ? 'font-semibold text-red-600' : emphasize && !normalLabel ? 'font-semibold text-gray-800' : 'font-normal text-gray-600'}`}>{label}</div>
      <div className="relative min-w-0">
        <input
          value={formatMoneyValue(value)}
          onChange={handleChange}
          readOnly={readOnly}
          inputMode="numeric"
          className={`h-[30px] w-full min-w-0 rounded-sm border px-2 text-right text-xs tabular-nums outline-none ${suffix ? 'pr-7' : ''} ${readOnly ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white focus:border-green-400 focus:ring-2 focus:ring-green-600/15'} ${emphasize ? 'font-semibold text-gray-900' : 'text-gray-800'} ${red ? '!font-semibold !text-red-600' : ''}`}
        />
        {suffix && <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">{suffix}</span>}
      </div>
    </div>
  )
}

function SettlePanel({ claims, settlements, setSettlements, manualCharges, setManualCharges, master }) {
  const [selectedRowId, setSelectedRowId] = useState(claims[0]?.id ?? '')
  const [vatMenuOpen, setVatMenuOpen] = useState(false)
  const insurerClaims = claims.filter((claim) => claim.type === 'insurer')
  const hasDeductible = manualCharges.some((row) => row.type === 'deductible')
  const hasVat = manualCharges.some((row) => row.type === 'vat')
  const rows = [
    ...claims.map((claim) => {
      const insurerNo = claim.type === 'insurer' ? insurerClaims.findIndex((item) => item.id === claim.id) + 1 : 0
      const detail = settlements[claim.id] ?? INITIAL_SETTLEMENT
      const totals = getSettlementTotals(detail, claim.faultRate, claim.type === 'insurer' ? claim.deductible : 0)
      return {
        id: claim.id,
        type: claim.type,
        kind: claim.type === 'owner' ? '차주부담금' : `보험사${insurerNo}`,
        payer: claim.type === 'owner' ? master.carNo || master.customer : claim.insurer,
        amount: totals.claimAmt,
        source: claim,
      }
    }),
    ...manualCharges.map((row) => ({ ...row, amount: amountNumber(row.amount) })),
  ]
  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? rows[0]
  const currentClaim = selectedRow?.source
  const settlement = selectedRow && (selectedRow.type === 'insurer' || selectedRow.type === 'owner')
    ? settlements[selectedRow.id] ?? INITIAL_SETTLEMENT
    : null
  const totals = settlement
    ? getSettlementTotals(settlement, currentClaim?.faultRate, currentClaim?.type === 'insurer' ? currentClaim.deductible : 0)
    : null
  const setAmount = (key) => (event) => setSettlements((prev) => ({
    ...prev,
    [selectedRow.id]: { ...(prev[selectedRow.id] ?? INITIAL_SETTLEMENT), [key]: event.target.value },
  }))
  const setVatRate = (value) => setSettlements((prev) => ({
    ...prev,
    [selectedRow.id]: { ...(prev[selectedRow.id] ?? INITIAL_SETTLEMENT), vatRate: value },
  }))
  const addDeductible = () => {
    const selfClaim = insurerClaims.find((claim) => claim.coverage === '자차')
    if (!selfClaim || hasDeductible) return
    setManualCharges((prev) => [...prev, {
      id: 'deductible',
      type: 'deductible',
      kind: '면책금',
      payer: master.carNo || master.customer,
      amount: selfClaim.deductible || '0',
      sourceLabel: `${selfClaim.insurer} 자차`,
    }])
    setSelectedRowId('deductible')
  }
  const vatOptions = insurerClaims.map((claim, index) => {
    const detail = settlements[claim.id] ?? INITIAL_SETTLEMENT
    const amount = getSettlementTotals(detail, claim.faultRate, claim.deductible).vat
    return { id: claim.id, label: `${claim.insurer || `보험사${index + 1}`} (부가세)`, amount }
  })
  const totalVat = vatOptions.reduce((sum, option) => sum + option.amount, 0)
  const addVat = (option) => {
    if (hasVat) return
    setManualCharges((prev) => [...prev, {
      id: 'vat',
      type: 'vat',
      kind: '부가세',
      payer: master.carNo || master.customer,
      amount: String(option.amount),
      sourceLabel: option.label,
    }])
    setSelectedRowId('vat')
    setVatMenuOpen(false)
  }
  const removeSelected = () => {
    if (!selectedRow || !['deductible', 'vat'].includes(selectedRow.type)) return
    setManualCharges((prev) => prev.filter((row) => row.id !== selectedRow.id))
    setSelectedRowId(claims[0]?.id ?? '')
  }
  const columns = [
    { key: 'kind', title: '매출구분', width: '25%' },
    { key: 'payer', title: '청구처', width: '43%' },
    { key: 'amount', title: '청구액', width: '32%', align: 'right', render: money },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={hasDeductible || !insurerClaims.some((claim) => claim.coverage === '자차')} onClick={addDeductible}><Plus size={13} />면책금</Button>
        <div className="relative">
          <Button size="sm" disabled={hasVat || insurerClaims.length === 0} onClick={() => setVatMenuOpen((open) => !open)}><Plus size={13} />부가세</Button>
          {vatMenuOpen && !hasVat && (
            <div className="absolute left-0 top-full z-30 mt-1 min-w-52 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              {vatOptions.map((option) => (
                <button key={option.id} type="button" onClick={() => addVat(option)} className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700">
                  <span className="truncate">{option.label}</span><span className="shrink-0 tabular-nums">{money(option.amount)}</span>
                </button>
              ))}
              <div className="my-1 border-t border-gray-100" />
              <button type="button" onClick={() => addVat({ label: '총견적 부가세', amount: totalVat })} className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-xs font-medium text-gray-800 hover:bg-green-50 hover:text-green-700">
                <span>총견적 부가세</span><span className="shrink-0 tabular-nums">{money(totalVat)}</span>
              </button>
            </div>
          )}
        </div>
        <Button size="sm" variant="danger" disabled={!selectedRow || !['deductible', 'vat'].includes(selectedRow.type)} onClick={removeSelected}><Trash2 size={13} />선택 삭제</Button>
      </div>

      <div className="h-[138px] shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
        <FixedHeadTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          rowSize="sm"
          height={null}
          selectedKey={selectedRow?.id}
          onRowClick={(row) => setSelectedRowId(row.id)}
          emptyText="정산 Row가 없습니다."
        />
      </div>

      {settlement && totals && <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-gray-200 bg-white p-3 max-[1200px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="mb-0.5 text-sm font-semibold text-gray-800">공임</div>
          <SettleField label="탈착교환" value={settlement.detachExchange} readOnly />
          <SettleField label="판금교정" value={settlement.panelAdjust} readOnly />
          <SettleField label="견인,기타" value={settlement.towingEtc} readOnly />
          <SettleField label="도장공임" value={settlement.paintLabor} readOnly />
          <SettleField label="가열건조비" value={settlement.heatDry} readOnly />
          <SettleField label="도장정산" value={settlement.paintComputer} readOnly />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="mb-0.5 text-sm font-semibold text-gray-800">부품</div>
          <SettleField label="순정부품" value={settlement.genuineParts} readOnly />
          <SettleField label="중고부품" value={settlement.usedParts} readOnly />
          <SettleField label="도장재료대" value={settlement.paintMaterials} readOnly />
          <div className="pb-0.5 pt-1 text-sm font-semibold text-gray-800">차감</div>
          <SettleField label="감가상각" value={settlement.depreciation} onChange={setAmount('depreciation')} />
          <SettleField label="잔존물" value={settlement.salvage} onChange={setAmount('salvage')} />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3">
        <div className="mb-0.5 text-sm font-semibold text-gray-800">합계</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-[1200px]:grid-cols-1">
          <SettleField label="공임소계" value={money(totals.laborSum)} readOnly />
          <SettleField label="부품소계" value={money(totals.partSum)} readOnly emphasize normalLabel />
          <SettleField label="차감소계" value={money(totals.deductionSum)} readOnly />
          <SettleField label="소계" value={money(totals.subtotal)} readOnly emphasize />
          <div className="grid min-w-0 grid-cols-[88px_minmax(0,1fr)] items-center gap-1">
            <div className="whitespace-nowrap text-xs text-gray-600">부가세율</div>
            <Select value={String(settlement.vatRate)} onChange={setVatRate} options={VAT_OPTIONS} buttonClassName="h-[30px]" />
          </div>
          <SettleField label="부가세" value={money(totals.vat)} readOnly />
        </div>
        <SettleField label="합계" value={money(totals.total)} readOnly emphasize normalLabel />
        <div className="my-1 border-t border-gray-100" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-[1200px]:grid-cols-1">
          <SettleField label="과실상계율" value={`${Number(currentClaim?.faultRate || 0)} %`} readOnly />
          <SettleField label="과실상계액" value={money(totals.faultAmt)} readOnly />
          <SettleField label="면책금" value={currentClaim?.type === 'insurer' ? currentClaim.deductible : '0'} readOnly />
          <SettleField label="청구금액" value={money(totals.claimAmt)} readOnly emphasize red />
        </div>
      </div>
      </>}

      {selectedRow && ['deductible', 'vat'].includes(selectedRow.type) && (
        <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3">
          <div>
            <div className="text-sm font-semibold text-gray-800">{selectedRow.kind}</div>
            <div className="mt-1 text-xs text-gray-500">{selectedRow.sourceLabel}</div>
          </div>
          <SettleField label="청구액" value={manualCharges.find((row) => row.id === selectedRow.id)?.amount ?? '0'} readOnly suffix="원" />
        </div>
      )}
    </div>
  )
}

export default function SalesDetailEditPage({ row, onBack }) {
  const alert = useAlert()
  const [master, setMaster] = useState(() => initialMaster(row))
  const [claims, setClaims] = useState(() => initialClaims(row))
  const [items, setItems] = useState(initialItems)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [claimIdx, setClaimIdx] = useState(0)
  const [settlements, setSettlements] = useState({ 'insurer-1': { ...INITIAL_SETTLEMENT } })
  const [manualCharges, setManualCharges] = useState([])
  const [sidePanel, setSidePanel] = useState({ open: false, tab: 'labor' })
  const [vehicleNameOpen, setVehicleNameOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [vehicleRegistryOpen, setVehicleRegistryOpen] = useState(false)
  const [vehicleSpecificationOpen, setVehicleSpecificationOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [printFormatOpen, setPrintFormatOpen] = useState(false)
  const [estimateItemsOpen, setEstimateItemsOpen] = useState(false)
  const [partsPurchaseOpen, setPartsPurchaseOpen] = useState(false)
  const [toolbarMenu, setToolbarMenu] = useState(null)

  const workType = row?.type ?? '보험'
  const photoWinRef = useRef(null)
  const laborWinRef = useRef(null)
  const paintWinRef = useRef(null)
  const chemicalWinRef = useRef(null)
  const preventiveWinRef = useRef(null)
  const photoContext = { estSerial: row?.id ?? '신규', carNo: master.carNo || '' }

  useEffect(() => () => {
    for (const popupRef of [photoWinRef, laborWinRef, paintWinRef, chemicalWinRef, preventiveWinRef]) {
      const popup = popupRef.current
      if (popup && !popup.closed) {
        try { popup.close() } catch { /* popup may already be unavailable */ }
      }
      popupRef.current = null
    }
  }, [])

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== globalThis.location.origin || event.data?.type !== 'PHOTO_VIEWER_READY') return
      if (photoWinRef.current && event.source !== photoWinRef.current) return
      try { event.source?.postMessage({ type: 'PHOTO_VIEWER_SET_CTX', payload: { estSerial: row?.id ?? '신규', carNo: master.carNo || '' } }, event.origin) } catch { /* popup may have closed */ }
    }
    globalThis.addEventListener('message', onMessage)
    return () => globalThis.removeEventListener('message', onMessage)
  }, [master.carNo, row?.id])

  const openPhotoViewer = () => {
    if (photoWinRef.current && !photoWinRef.current.closed) {
      try {
        photoWinRef.current.focus()
        photoWinRef.current.postMessage({ type: 'PHOTO_VIEWER_SET_CTX', payload: photoContext }, globalThis.location.origin)
        return
      } catch {
        photoWinRef.current = null
      }
    }
    photoWinRef.current = openCenteredWindow('/photo-viewer', 'photoViewer', 1100, 820, {
      windowFeatures: { scrollbars: 'no', resizable: 'yes' },
      postMessage: { type: 'PHOTO_VIEWER_SET_CTX', payload: photoContext, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }
  const openLaborItems = () => {
    const payload = { estSerial: row?.id ?? '신규', carNo: master.carNo || '', carname: master.carName || '' }
    if (laborWinRef.current && !laborWinRef.current.closed) {
      laborWinRef.current.focus()
      laborWinRef.current.postMessage({ type: 'LABOR_ITEMS_SET_CTX', payload }, globalThis.location.origin)
      return
    }
    laborWinRef.current = openCenteredWindow('/labor-items', 'laborItems', 1000, 1300, {
      windowFeatures: { scrollbars: 'yes', resizable: 'yes' },
      postMessage: { type: 'LABOR_ITEMS_SET_CTX', payload, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }
  const openPaintItems = () => {
    const payload = { est_serial: row?.id ?? '신규', carno: master.carNo || '', carname: master.carName || '', pntcot_code: master.paintCoat || '2', pnt_m: master.paintSolvent || '1' }
    if (paintWinRef.current && !paintWinRef.current.closed) {
      paintWinRef.current.focus()
      paintWinRef.current.postMessage({ type: 'PAINT_ITEMS_SET_CTX', payload }, globalThis.location.origin)
      return
    }
    paintWinRef.current = openCenteredWindow('/paint-items', 'paintItems', 1100, 900, {
      windowFeatures: { scrollbars: 'yes', resizable: 'yes' },
      postMessage: { type: 'PAINT_ITEMS_SET_CTX', payload, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }
  const openChemicalItems = () => {
    const payload = { est_serial: row?.id ?? '신규', carno: master.carNo || '' }
    if (chemicalWinRef.current && !chemicalWinRef.current.closed) {
      chemicalWinRef.current.focus()
      chemicalWinRef.current.postMessage({ type: 'CHEM_ITEMS_SET_CTX', payload }, globalThis.location.origin)
      return
    }
    chemicalWinRef.current = openCenteredWindow('/chemical-items', 'chemicalItems', 1060, 900, {
      windowFeatures: { scrollbars: 'yes', resizable: 'yes' },
      postMessage: { type: 'CHEM_ITEMS_SET_CTX', payload, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }
  const openPreventiveItems = () => {
    const payload = { estSerial: row?.id ?? '신규', carNo: master.carNo || '' }
    if (preventiveWinRef.current && !preventiveWinRef.current.closed) {
      preventiveWinRef.current.focus()
      preventiveWinRef.current.postMessage({ type: 'PREVENTIVE_ITEMS_SET_CTX', payload }, globalThis.location.origin)
      return
    }
    preventiveWinRef.current = openCenteredWindow('/preventive-items', 'preventiveItems', 960, 900, {
      windowFeatures: { scrollbars: 'yes', resizable: 'yes' },
      postMessage: { type: 'PREVENTIVE_ITEMS_SET_CTX', payload, attempts: 5, intervals: [0, 200, 600, 1200, 2000] },
    })
  }
  const openVehicleRegistry = () => {
    if (!master.carNo.trim()) {
      alert.warning('차량원부 조회를 위해 차량번호를 입력해 주세요.')
      return
    }
    if (!master.customer.trim()) {
      alert.warning('차량원부 조회를 위해 고객명을 입력해 주세요.')
      return
    }
    setVehicleRegistryOpen(true)
  }
  const openVehicleSpecification = () => {
    const vin = master.vin.replace(/[^A-Za-z0-9]/g, '')
    if (!vin) {
      alert.warning('차량 규격정보 조회를 위해 차대번호를 입력해 주세요.')
      return
    }
    if (vin.length < 11) {
      alert.warning('차대번호를 11자리 이상 입력해 주세요.')
      return
    }
    setVehicleSpecificationOpen(true)
  }
  const safeClaimIdx = Math.min(claimIdx, claims.length - 1)
  const railTabs = [
    { id: 'labor', label: '공임설정', background: '#bfdbfe', selectedBackground: '#93c5fd', accent: '#1d4ed8' },
    { id: 'claim', label: '청구처', background: '#fde68a', selectedBackground: '#fcd34d', accent: '#b45309' },
    { id: 'settle', label: '견적정산', background: '#a7f3d0', selectedBackground: '#6ee7b7', accent: '#047857' },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50" onKeyDown={focusNextOnEnter}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-800">매출내역</h2>
          <p className="mt-0.5 text-xs text-gray-400">RONO : {row?.id ?? '신규'} · 매출_보험</p>
        </div>
        <div className="flex self-center items-center gap-2">
          <Button onClick={() => setPaymentOpen(true)}><Banknote size={14} />입금</Button>
          <Button variant="primary"><Save size={14} />저장</Button>
          <div className="-mr-2 ml-2 flex shrink-0 items-center border-l border-gray-200 pl-[11px]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              매출일지<ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <ToolbarMenu id="labor" label="공임" icon={Wrench} items={LABOR_MENU_ITEMS} openMenu={toolbarMenu} setOpenMenu={setToolbarMenu} onItemClick={(itemLabel) => { if (itemLabel === '공임항목') openLaborItems(); if (itemLabel === '도장항목') openPaintItems(); if (itemLabel === '케미칼항목') openChemicalItems(); if (itemLabel === '견적항목') setEstimateItemsOpen(true) }} />
        <ToolbarMenu id="parts" label="부품" icon={Search} items={PART_MENU_ITEMS} openMenu={toolbarMenu} setOpenMenu={setToolbarMenu} onItemClick={(itemLabel) => { if (itemLabel === '소요부품') setPartsPurchaseOpen(true) }} />
        <Button size="sm" onClick={openPreventiveItems}><CheckCircle2 size={13} />예방</Button>
        <span className="h-5 w-px bg-gray-200" />
        <Button size="sm"><CheckCircle2 size={13} />중복체크</Button>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={openPhotoViewer}><ImageIcon size={13} />사진</Button>
          <Button size="sm" onClick={() => setPrintFormatOpen(true)}><Printer size={13} />서식인쇄</Button>
          <Button size="sm"><Send size={13} />견적청구</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-x-auto">
        <div className="flex min-w-[720px] flex-1 flex-col">
          <ReceptionSection master={master} setMaster={setMaster} onOpenVehicleName={() => setVehicleNameOpen(true)} onOpenCompany={() => setCompanyOpen(true)} onOpenCustomer={() => setCustomerOpen(true)} onOpenVehicleRegistry={openVehicleRegistry} onOpenSpecification={openVehicleSpecification} />
          <ItemsSection
            rows={items}
            setRows={setItems}
            selectedId={selectedItemId}
            setSelectedId={setSelectedItemId}
            workType={workType}
            carNo={master.carNo}
            carName={master.carName}
            laborRates={{ detach: master.detachRate, sheet: master.sheetRate, paint: master.paintRate }}
          />
        </div>

        <div className={`flex min-w-0 items-stretch gap-2 border-l border-gray-200 bg-gray-50 p-2 ${sidePanel.open ? 'min-w-[340px] basis-[500px] shrink' : 'shrink-0'}`}>
          <div className="flex shrink-0 flex-col gap-2">
            <button type="button" onClick={() => setSidePanel((prev) => ({ ...prev, open: !prev.open }))}
              aria-label={sidePanel.open ? '패널 닫기' : '패널 열기'}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-900 text-sm font-bold text-white hover:bg-gray-700">
              {sidePanel.open ? '»' : '«'}
            </button>
            {railTabs.map((tab) => {
              const isActive = sidePanel.open && sidePanel.tab === tab.id
              return (
                <button key={tab.id} type="button"
                  onClick={() => setSidePanel({ open: true, tab: tab.id })}
                  style={{ backgroundColor: isActive ? tab.selectedBackground : tab.background, writingMode: 'vertical-rl' }}
                  className="relative flex h-24 w-9 items-center justify-center rounded-md text-sm font-medium tracking-widest text-gray-800 transition-colors hover:brightness-95">
                  {tab.label}
                  {isActive && <span aria-hidden="true" className="absolute inset-y-0 right-0 w-[3px]" style={{ backgroundColor: tab.accent }} />}
                </button>
              )
            })}
          </div>

          {sidePanel.open && (
            <div className="@container min-w-0 max-w-[500px] flex-1 overflow-auto rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              {sidePanel.tab === 'labor' && <LaborSettingsPanel master={master} setMaster={setMaster} workType={workType} />}
              {sidePanel.tab === 'claim' && <ClaimPanel claims={claims} setClaims={setClaims} selectedIdx={safeClaimIdx} setSelectedIdx={setClaimIdx} master={master} workType={workType} />}
              {sidePanel.tab === 'settle' && <SettlePanel claims={claims} settlements={settlements} setSettlements={setSettlements} manualCharges={manualCharges} setManualCharges={setManualCharges} master={master} />}
            </div>
          )}
        </div>
      </div>

      {vehicleNameOpen && <VehicleNamePage selectionMode onCancel={() => setVehicleNameOpen(false)} onSelect={({ vehicle, model }) => { setMaster((prev) => ({ ...prev, carCode: vehicle.code, carName: vehicle.name, modelName: model?.name ?? '' })); setVehicleNameOpen(false) }} />}
      {companyOpen && <SalesCustomerPage selectionMode onCancel={() => setCompanyOpen(false)} onSelect={(salesCustomer) => { setMaster((prev) => ({ ...prev, companyCode: salesCustomer.code, companyName: salesCustomer.name })); setCompanyOpen(false) }} />}
      {customerOpen && <VehicleCustomerModal vehicle={{ carNo: master.carNo, car: master.carName, customer: master.customer, phone: master.phone.join('-') }} hasOwner={Boolean(master.customer)} onClose={() => setCustomerOpen(false)} />}
      {vehicleRegistryOpen && <VehicleRegistryModal vehicle={{ carNo: master.carNo, customer: master.customer, carName: master.carName, modelName: master.modelName, vin: master.vin }} onClose={() => setVehicleRegistryOpen(false)} />}
      {vehicleSpecificationOpen && <VehicleSpecificationModal vehicle={{ carNo: master.carNo, vin: master.vin }} onClose={() => setVehicleSpecificationOpen(false)} />}
      {paymentOpen && <PaymentModal sale={{ ...row, id: row?.id ?? '신규', type: row?.type ?? '보험', carNo: master.carNo, customer: master.customer }} onClose={() => setPaymentOpen(false)} />}
      {printFormatOpen && <PrintFormatModal menuCode="0201" menuName="매출일지" onClose={() => setPrintFormatOpen(false)} />}
      {estimateItemsOpen && <EstimateItemsModal vehicle={{ carNo: master.carNo, carName: master.carName }} onClose={() => setEstimateItemsOpen(false)} onApply={(estimateRows) => appendSuggestedRows(estimateRows, 'estimate')} />}
      {partsPurchaseOpen && <PartsPurchaseModal onClose={() => setPartsPurchaseOpen(false)} onApply={(partRow) => appendSuggestedRows([partRow], 'purchase')} />}
    </div>
  )
}
