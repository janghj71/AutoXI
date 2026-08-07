import { useMemo, useState } from 'react'
import { Car, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import Select from '../../components/Select'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'

const VEHICLE_TYPES = {
  승용: ['경차', '소형', '중형', '대형', '고급형'],
  지프: ['승용지프', '승합지프'],
  화물: ['경화물', '소형', '중형', '대형', '특대형'],
  승합: ['경승합', '소형', '중형', '대형', '고속형'],
  RV: ['등급1', '등급2', '등급3', '등급4', '등급5'],
}
const MAKERS = [
  { code: '01', name: '현대', foreign: false },
  { code: '02', name: '기아', foreign: false },
  { code: '69', name: '어큐라', foreign: true },
  { code: '70', name: '다이하쓰', foreign: true },
  { code: '71', name: '혼다', foreign: true },
  { code: '72', name: '이스즈', foreign: true },
  { code: '73', name: '마쯔다', foreign: true },
  { code: '74', name: '미쯔비시', foreign: true },
  { code: '75', name: '토요타', foreign: true },
  { code: '76', name: '페라리', foreign: true },
  { code: '80', name: '닛산', foreign: true },
]
const INITIAL_VEHICLES = [
  { code: '1001001', makerCode: '01', name: '쏘나타', type: '승용', grade: '중형' },
  { code: '1001002', makerCode: '01', name: '캐스퍼', type: '승용', grade: '경차' },
  { code: '8011001', makerCode: '80', name: '닛산 스카이라인', type: '승용', grade: '중형' },
  { code: '8011002', makerCode: '80', name: '닛산 페어레이디', type: '승용', grade: '고급형' },
  { code: '8011003', makerCode: '80', name: '닛산 실비아', type: '승용', grade: '소형' },
  { code: '8011013', makerCode: '80', name: '닛산 350Z', type: '승용', grade: '고급형' },
  { code: '7512001', makerCode: '75', name: '토요타 RAV4', type: 'RV', grade: '등급3' },
  { code: '7113001', makerCode: '71', name: '혼다 CR-V', type: '지프', grade: '승용지프' },
]
const INITIAL_MODELS = [
  { code: '01', vehicleCode: '8011013', name: '쿠페' },
  { code: '01', vehicleCode: '8011001', name: 'GT-R' },
  { code: '01', vehicleCode: '1001001', name: '2.0 가솔린' },
]
const inputClass = 'w-full rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15'

export default function VehicleNamePage({ selectionMode = false, onSelect, onCancel }) {
  const alert = useAlert()
  const [vehicleType, setVehicleType] = useState('승용')
  const [selectedGrades, setSelectedGrades] = useState(new Set(VEHICLE_TYPES.승용))
  const [makerQuery, setMakerQuery] = useState('')
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [makers] = useState(MAKERS)
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES)
  const [models, setModels] = useState(INITIAL_MODELS)
  const [makerCode, setMakerCode] = useState('80')
  const [vehicleCode, setVehicleCode] = useState('8011013')
  const [modelCode, setModelCode] = useState('01')
  const [dialog, setDialog] = useState(null)
  const [formName, setFormName] = useState('')
  const [formGrade, setFormGrade] = useState('고급형')

  const selectedMaker = makers.find((maker) => maker.code === makerCode)
  const selectedVehicle = vehicles.find((vehicle) => vehicle.code === vehicleCode)
  const selectedModel = models.find((model) => model.vehicleCode === vehicleCode && model.code === modelCode)
  const tableHeight = selectionMode ? null : 430
  const filteredMakers = useMemo(() => {
    const keyword = makerQuery.trim().toLowerCase()
    return !keyword ? makers : makers.filter((maker) => maker.code.toLowerCase().includes(keyword) || maker.name.toLowerCase().includes(keyword))
  }, [makerQuery, makers])
  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) =>
    vehicle.makerCode === makerCode && vehicle.type === vehicleType && selectedGrades.has(vehicle.grade) && (!vehicleQuery.trim() || vehicle.name.toLowerCase().includes(vehicleQuery.trim().toLowerCase())),
  ), [makerCode, selectedGrades, vehicleQuery, vehicleType, vehicles])
  const filteredModels = useMemo(() => models.filter((model) => model.vehicleCode === vehicleCode), [models, vehicleCode])

  const changeType = (type) => {
    setVehicleType(type)
    setSelectedGrades(new Set(VEHICLE_TYPES[type]))
    setVehicleCode(null)
    setModelCode(null)
  }
  const toggleGrade = (grade) => {
    setSelectedGrades((prev) => {
      const next = new Set(prev)
      if (next.has(grade)) next.delete(grade)
      else next.add(grade)
      return next
    })
    setVehicleCode(null)
    setModelCode(null)
  }
  const selectMaker = (maker) => {
    const keyword = vehicleQuery.trim().toLowerCase()
    const firstVehicle = vehicles.find((vehicle) =>
      vehicle.makerCode === maker.code &&
      vehicle.type === vehicleType &&
      selectedGrades.has(vehicle.grade) &&
      (!keyword || vehicle.name.toLowerCase().includes(keyword)),
    )
    const firstModel = firstVehicle
      ? models.find((model) => model.vehicleCode === firstVehicle.code)
      : null
    setMakerCode(maker.code)
    setVehicleCode(firstVehicle?.code ?? null)
    setModelCode(firstModel?.code ?? null)
  }
  const selectVehicle = (vehicle) => {
    const firstModel = models.find((model) => model.vehicleCode === vehicle.code)
    setVehicleCode(vehicle.code)
    setModelCode(firstModel?.code ?? null)
  }

  const openVehicleDialog = (mode, vehicle) => {
    if (!selectedMaker?.foreign) return
    setFormName(vehicle?.name ?? '')
    setFormGrade(vehicle?.grade ?? VEHICLE_TYPES[vehicleType][0])
    setDialog({ kind: 'vehicle', mode, originalCode: vehicle?.code })
  }
  const openModelDialog = (mode, model) => {
    if (!selectedMaker?.foreign || (!selectedVehicle && mode === 'new')) return
    setFormName(model?.name ?? '')
    setDialog({ kind: 'model', mode, originalCode: model?.code })
  }
  const saveDialog = async () => {
    const name = formName.trim()
    if (!name) return alert.warning(`${dialog.kind === 'vehicle' ? '차량명' : '모델명'}을 입력해 주세요.`)
    if (dialog.kind === 'vehicle') {
      if (dialog.mode === 'new') {
        const code = String(Math.max(0, ...vehicles.map((vehicle) => Number(vehicle.code) || 0)) + 1)
        setVehicles((prev) => [...prev, { code, makerCode, name, type: vehicleType, grade: formGrade }])
        setVehicleCode(code)
      } else {
        setVehicles((prev) => prev.map((vehicle) => vehicle.code === dialog.originalCode ? { ...vehicle, name, grade: formGrade } : vehicle))
      }
    } else if (dialog.mode === 'new') {
      const siblings = models.filter((model) => model.vehicleCode === vehicleCode)
      const code = String(Math.max(0, ...siblings.map((model) => Number(model.code) || 0)) + 1).padStart(2, '0')
      setModels((prev) => [...prev, { code, vehicleCode, name }])
      setModelCode(code)
    } else {
      setModels((prev) => prev.map((model) => model.vehicleCode === vehicleCode && model.code === dialog.originalCode ? { ...model, name } : model))
    }
    setDialog(null)
  }
  const deleteVehicle = async (vehicle) => {
    if (models.some((model) => model.vehicleCode === vehicle.code)) return alert.warning('등록된 모델이 있는 차량은 삭제할 수 없습니다.\n먼저 하위 모델을 삭제해 주세요.')
    if (!(await alert.remove(`'${vehicle.name}' 차량을 삭제하시겠습니까?`))) return
    setVehicles((prev) => prev.filter((item) => item.code !== vehicle.code))
    if (vehicleCode === vehicle.code) setVehicleCode(null)
  }
  const deleteModel = async (model) => {
    if (!(await alert.remove(`'${model.name}' 모델을 삭제하시겠습니까?`))) return
    setModels((prev) => prev.filter((item) => !(item.vehicleCode === vehicleCode && item.code === model.code)))
    if (modelCode === model.code) setModelCode(null)
  }

  const content = (
    <div className={`${selectionMode ? 'h-[460px] bg-white' : 'h-full bg-gray-50'} flex flex-col`} onKeyDown={focusNextOnEnter}>
      {!selectionMode && <PageHeader title="차량명등록" description="제작사별 차량명과 모델을 관리합니다. 국산 차량은 조회만 가능합니다." icon={Car} />}
      <div className={`min-h-0 flex-1 ${selectionMode ? 'flex flex-col overflow-hidden p-0' : 'overflow-auto p-3'}`}>
        <div className="mb-3 grid shrink-0 grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5"><span className="mr-1 text-xs font-semibold text-gray-700">차종</span>{Object.keys(VEHICLE_TYPES).map((type) => <button key={type} type="button" onClick={() => changeType(type)} className={`rounded-md border px-4 py-1.5 text-xs font-medium ${vehicleType === type ? 'border-green-600 bg-green-600 text-white' : 'border-green-600 bg-white text-green-700 hover:bg-green-50'}`}>{type}</button>)}</div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5"><span className="mr-1 shrink-0 text-xs font-semibold text-gray-700">등급</span>{VEHICLE_TYPES[vehicleType].map((grade) => <button key={grade} type="button" onClick={() => toggleGrade(grade)} className={`rounded-md border px-3 py-1.5 text-xs font-medium ${selectedGrades.has(grade) ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}>{grade}</button>)}</div>
        </div>
        <div className="mb-3 grid shrink-0 grid-cols-[0.85fr_2.15fr] gap-3">
          <div className={`flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15 ${selectionMode ? 'h-8' : 'h-9'}`}>
            <Search size={selectionMode ? 14 : 15} className="text-gray-400" /><input value={makerQuery} onChange={(event) => setMakerQuery(event.target.value)} placeholder="제작사 코드 또는 제작사명 필터" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
            {makerQuery && <button type="button" onClick={() => setMakerQuery('')} aria-label="제작사 필터 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
          <div className={`flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15 ${selectionMode ? 'h-8' : 'h-9'}`}>
            <Search size={selectionMode ? 14 : 15} className="text-gray-400" /><input value={vehicleQuery} onChange={(event) => setVehicleQuery(event.target.value)} placeholder="차량명 필터" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
            {vehicleQuery && <button type="button" onClick={() => setVehicleQuery('')} aria-label="차량명 필터 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
        </div>

        <div className={`grid grid-cols-[0.85fr_1.15fr_1fr] gap-3 ${selectionMode ? 'min-h-0 flex-1' : ''}`}>
          <SectionCard title="제작사" headerClassName="h-10 shrink-0" className={selectionMode ? 'min-h-0 flex flex-col overflow-hidden' : ''} bodyClassName={selectionMode ? 'min-h-0 flex-1' : ''} flush>
            <FixedHeadTable columns={[{ key: 'code', title: '코드', width: '28%' }, { key: 'name', title: '제작사명', width: '72%' }]} rows={filteredMakers} rowKey={(maker) => maker.code} rowSize="sm" height={tableHeight} selectedKey={makerCode} onRowClick={selectMaker} />
          </SectionCard>
          <SectionCard title="차량" headerClassName="h-10 shrink-0" className={selectionMode ? 'min-h-0 flex flex-col overflow-hidden' : ''} bodyClassName={selectionMode ? 'min-h-0 flex-1' : ''} flush actions={<div className="flex h-7 w-[66px] justify-end">{selectedMaker?.foreign && <Button size="sm" onClick={() => openVehicleDialog('new')}><Plus size={13} />신규</Button>}</div>}>
            <FixedHeadTable columns={[{ key: 'code', title: '코드', width: '28%' }, { key: 'name', title: '차량명', width: selectedMaker?.foreign ? '57%' : '72%' }, ...(selectedMaker?.foreign ? [{ key: '__actions', title: '관리', width: '15%', align: 'center', render: (_value, vehicle) => <div className="flex justify-center gap-2"><button type="button" onClick={(event) => { event.stopPropagation(); openVehicleDialog('edit', vehicle) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button><button type="button" onClick={(event) => { event.stopPropagation(); deleteVehicle(vehicle) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div> }] : [])]} rows={filteredVehicles} rowKey={(vehicle) => vehicle.code} rowSize="sm" height={tableHeight} selectedKey={vehicleCode} onRowClick={selectVehicle} onRowDoubleClick={(vehicle) => selectedMaker?.foreign && openVehicleDialog('edit', vehicle)} emptyText="조건에 맞는 차량이 없습니다." />
          </SectionCard>
          <SectionCard title="모델" headerClassName="h-10 shrink-0" className={selectionMode ? 'min-h-0 flex flex-col overflow-hidden' : ''} bodyClassName={selectionMode ? 'min-h-0 flex-1' : ''} flush actions={<div className="flex h-7 w-[66px] justify-end">{selectedMaker?.foreign && selectedVehicle && <Button size="sm" onClick={() => openModelDialog('new')}><Plus size={13} />신규</Button>}</div>}>
            <FixedHeadTable columns={[{ key: 'code', title: '코드', width: '25%' }, { key: 'name', title: '모델명', width: selectedMaker?.foreign ? '60%' : '75%' }, ...(selectedMaker?.foreign ? [{ key: '__actions', title: '관리', width: '15%', align: 'center', render: (_value, model) => <div className="flex justify-center gap-2"><button type="button" onClick={(event) => { event.stopPropagation(); openModelDialog('edit', model) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button><button type="button" onClick={(event) => { event.stopPropagation(); deleteModel(model) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div> }] : [])]} rows={filteredModels} rowKey={(model) => model.code} rowSize="sm" height={tableHeight} selectedKey={modelCode} onRowClick={(model) => setModelCode(model.code)} onRowDoubleClick={(model) => selectedMaker?.foreign && openModelDialog('edit', model)} emptyText="등록된 모델이 없습니다." />
          </SectionCard>
        </div>
        {!selectionMode && <div className="pt-2.5 text-xs text-gray-500">선택된 항목: <strong>{selectedMaker?.name ?? '-'}</strong> &gt; <strong>{selectedVehicle?.name ?? '-'}</strong> &gt; <strong>{selectedModel?.name ?? '-'}</strong></div>}
      </div>

      {dialog && (
        <Modal title={dialog.kind === 'vehicle' ? `차량 ${dialog.mode === 'new' ? '등록' : '수정'}` : `모델 ${dialog.mode === 'new' ? '등록' : '수정'}`} size="md" onClose={() => setDialog(null)} footer={<><Button onClick={() => setDialog(null)}>취소</Button><Button variant="primary" onClick={saveDialog}>저장</Button></>}>
          <div className="flex flex-col gap-3">
            <FormField label="제작사" labelWidth="w-20" value={selectedMaker?.name ?? ''} readOnly />
            {dialog.kind === 'vehicle' ? <><FormField label="차종" labelWidth="w-20" value={vehicleType} readOnly /><FormField label="등급" labelWidth="w-20"><Select className="flex-1" value={formGrade} onChange={setFormGrade} options={VEHICLE_TYPES[vehicleType]} /></FormField><FormField label="차량명" labelWidth="w-20" value={formName} onChange={(event) => setFormName(event.target.value)} autoFocus /></> : <><FormField label="차량명" labelWidth="w-20" value={selectedVehicle?.name ?? ''} readOnly /><FormField label="모델명" labelWidth="w-20"><input value={formName} onChange={(event) => setFormName(event.target.value)} data-modal-autofocus className={inputClass} /></FormField></>}
          </div>
        </Modal>
      )}
    </div>
  )

  if (selectionMode) {
    return (
      <Modal title="차량명 선택" width="max-w-5xl" onClose={onCancel} footer={<div className="flex min-w-0 w-full items-center gap-4"><div className="min-w-0 flex-1 truncate text-xs text-gray-500">선택된 항목: <strong className="text-gray-700">{selectedMaker?.name ?? '-'}</strong> &gt; <strong className="text-gray-700">{selectedVehicle?.name ?? '-'}</strong> &gt; <strong className="text-gray-700">{selectedModel?.name ?? '-'}</strong></div><div className="flex shrink-0 gap-2"><Button onClick={onCancel}>취소</Button><Button variant="primary" disabled={!selectedVehicle} onClick={() => onSelect?.({ maker: selectedMaker, vehicle: selectedVehicle, model: selectedModel })}>선택</Button></div></div>}>
        {content}
      </Modal>
    )
  }

  return content
}
