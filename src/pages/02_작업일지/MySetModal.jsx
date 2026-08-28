import { useEffect, useMemo, useState } from 'react'
import { Check, ClipboardEdit, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

const INITIAL_SETS = [
  { id: 'my-set-1', no: 1, name: '엔진오일 교환 세트', setAmount: 68000, laborAmount: 20000, partAmount: 48000 },
  { id: 'my-set-2', no: 2, name: '브레이크 패드 교환 세트', setAmount: 175000, laborAmount: 35000, partAmount: 140000 },
  { id: 'my-set-3', no: 3, name: '에어컨 필터 교환 세트', setAmount: 43000, laborAmount: 15000, partAmount: 28000 },
]

const INITIAL_VEHICLES = {
  'my-set-1': [{ id: 'v1', codecar: 'K5A', name: 'G80' }, { id: 'v2', codecar: 'GV80', name: 'GV80' }],
  'my-set-2': [{ id: 'v3', codecar: 'G80', name: 'G80' }, { id: 'v4', codecar: '그랜저 IG', name: '그랜저 IG' }],
  'my-set-3': [{ id: 'v5', codecar: '쏘나타 DN8', name: '쏘나타 DN8' }, { id: 'v6', codecar: 'K5', name: 'K5' }],
}

const INITIAL_COMPONENTS = {
  'my-set-1': [
    { id: 'p1', kind: '부품', partCode: '26300-35505', name: '엔진오일 필터', unitPrice: 12000, quantity: 1, time: 0, amount: 12000 },
    { id: 'p2', kind: '부품', partCode: '05100-00441', name: '엔진오일 4L', unitPrice: 36000, quantity: 1, time: 0, amount: 36000 },
    { id: 'p3', kind: '공임', partCode: '', name: '엔진오일 교환', unitPrice: 0, quantity: 1, time: 0.5, amount: 0 },
  ],
  'my-set-2': [
    { id: 'p4', kind: '부품', partCode: '58101-G4A00', name: '프론트 브레이크 패드', unitPrice: 140000, quantity: 1, time: 0, amount: 140000 },
    { id: 'p5', kind: '공임', partCode: '', name: '브레이크 패드 교환', unitPrice: 0, quantity: 1, time: 1.2, amount: 0 },
  ],
  'my-set-3': [
    { id: 'p6', kind: '부품', partCode: '97133-D1000', name: '에어컨 필터', unitPrice: 28000, quantity: 1, time: 0, amount: 28000 },
    { id: 'p7', kind: '공임', partCode: '', name: '에어컨 필터 교환', unitPrice: 0, quantity: 1, time: 0.3, amount: 0 },
  ],
}

function SetEditor({ value, onClose, onSave }) {
  const [form, setForm] = useState(value || { name: '', setAmount: 0, laborAmount: 0, partAmount: 0 })
  const update = (key, next) => setForm((current) => ({ ...current, [key]: key === 'name' ? next : Number(next.replace(/\D/g, '') || 0) }))
  return <Modal title={value ? '나의 세트 수정' : '나의 세트 추가'} onClose={onClose} width="max-w-md" footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" disabled={!form.name.trim()} onClick={() => onSave(form)}>저장</Button></>}>
    <div className="grid gap-3 text-xs">
      <label className="grid gap-1"><span>세트명</span><input autoFocus value={form.name} onChange={(e) => update('name', e.target.value)} className="rounded border border-gray-300 px-2 py-1.5" /></label>
      {['setAmount', 'laborAmount', 'partAmount'].map((key) => <label key={key} className="grid gap-1"><span>{{ setAmount: '세트금액', laborAmount: '공임액', partAmount: '부품액' }[key]}</span><input inputMode="numeric" value={form[key]} onChange={(e) => update(key, e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-right" /></label>)}
    </div>
  </Modal>
}

export function MySetWorkspace({ vehicleCodecar = '', onApply, onSelectionChange, embedded = false, canManage = false, pageMode = false, showApplyButton = !embedded }) {
  const [sets, setSets] = useState(INITIAL_SETS)
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES)
  const [components, setComponents] = useState(INITIAL_COMPONENTS)
  const [selectedId, setSelectedId] = useState(INITIAL_SETS[0].id)
  const [query, setQuery] = useState('')
  const [repairOnly, setRepairOnly] = useState(false)
  const [editor, setEditor] = useState(null)
  const selected = sets.find((row) => row.id === selectedId) || null
  const filteredSets = useMemo(() => sets.filter((row) => {
    const q = query.trim().toLowerCase()
    const haystack = [row.name, ...(vehicles[row.id] || []).flatMap((v) => [v.name, v.codecar]), ...(components[row.id] || []).flatMap((p) => [p.name, p.partCode])].join(' ').toLowerCase()
    return !q || haystack.includes(q)
  }), [sets, vehicles, components, query])
  const shownVehicles = (vehicles[selectedId] || []).filter((row) => !repairOnly || !vehicleCodecar || row.codecar === vehicleCodecar)
  const saveSet = (value) => {
    if (editor.mode === 'new') {
      const id = `my-set-${Date.now()}`
      setSets((current) => [...current, { ...value, id, no: current.length + 1 }])
      setVehicles((current) => ({ ...current, [id]: [] }))
      setComponents((current) => ({ ...current, [id]: [] }))
      setSelectedId(id)
    } else setSets((current) => current.map((row) => row.id === editor.row.id ? { ...row, ...value } : row))
    setEditor(null)
  }
  const removeSet = (target) => {
    if (!target) return
    const nextRows = sets.filter((row) => row.id !== target.id)
    setSets(nextRows)
    setSelectedId((current) => current === target.id ? nextRows[0]?.id || null : current)
  }
  const selectedApplyRows = useMemo(() => (components[selectedId] || []).map((row) => ({ kind: row.kind, partCode: row.partCode, content: row.name, work: row.kind === '공임' ? row.name : '교환', hour: String(row.time || 0), unitPrice: row.unitPrice, partAmt: row.amount, laborAmt: row.kind === '공임' ? selected?.laborAmount || 0 : 0, quantity: row.quantity })), [components, selected, selectedId])
  useEffect(() => { onSelectionChange?.(selectedApplyRows) }, [onSelectionChange, selectedApplyRows])
  const apply = () => onApply?.(selectedApplyRows)
  const setColumns = [{ key: 'no', title: '순번', width: '52px', align: 'center' }, { key: 'name', title: '세트명', width: 'minmax(170px, 1fr)' }, { key: 'setAmount', title: '세트금액', width: '92px', align: 'right', render: money }, { key: 'laborAmount', title: '공임액', width: '82px', align: 'right', render: money }, { key: 'partAmount', title: '부품액', width: '82px', align: 'right', render: money }]
  if (canManage) setColumns.push({
    key: 'management', title: '관리', width: '82px', align: 'center', noTruncate: true,
    render: (_, row) => <span className="inline-flex items-center gap-1"><button type="button" aria-label={`${row.name} 수정`} title="수정" onClick={(event) => { event.stopPropagation(); setEditor({ mode: 'edit', row }) }} className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600"><Pencil size={14} /></button><button type="button" aria-label={`${row.name} 삭제`} title="삭제" onClick={(event) => { event.stopPropagation(); removeSet(row) }} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></span>,
  })
  const vehicleColumns = [{ key: 'name', title: '적용차명', width: '100%' }]
  const componentColumns = [{ key: 'kind', title: '구분', width: '70px' }, { key: 'partCode', title: '제작사품번', width: '125px' }, { key: 'name', title: '부품명', width: 'minmax(170px, 1fr)' }, { key: 'unitPrice', title: '부품단가', width: '90px', align: 'right', render: money }, { key: 'quantity', title: '수량', width: '55px', align: 'right' }, { key: 'time', title: '시간', width: '60px', align: 'right' }, { key: 'amount', title: '부품액', width: '90px', align: 'right', render: money }]
  const workspace = <div className="flex h-full min-h-0 flex-col gap-3">
    <div className="flex shrink-0 items-center gap-2"><div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-gray-300 bg-white px-2"><Search size={14} className="text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="세트명·적용차명·구성품명·품번 검색" className="min-w-0 flex-1 py-1.5 text-xs outline-none" /></div></div>
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_220px] grid-rows-[minmax(0,1fr)_220px] gap-3">
      <section className="min-h-0 overflow-hidden rounded border border-gray-200 bg-white"><div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">셋트목록 <span className="ml-1 text-xs font-normal text-gray-500">{filteredSets.length}건</span></div><div className="h-[calc(100%-41px)]"><FixedHeadTable columns={setColumns} rows={filteredSets} rowKey={(row) => row.id} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} emptyText="조회된 세트가 없습니다." /></div></section>
      <section className="min-h-0 overflow-hidden rounded border border-gray-200 bg-white"><div className="flex items-center border-b border-gray-200 bg-gray-50 px-3 py-2"><button type="button" role="switch" aria-checked={repairOnly} aria-label="수리차량만" onClick={() => setRepairOnly((enabled) => !enabled)} className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${repairOnly ? 'text-green-700' : 'text-gray-500'}`}><span className={`relative h-4 w-7 rounded-full transition ${repairOnly ? 'bg-green-500' : 'bg-gray-300'}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition ${repairOnly ? 'left-3.5' : 'left-0.5'}`} /></span>수리차량만</button></div><div className="h-[calc(100%-41px)]"><FixedHeadTable columns={vehicleColumns} rows={shownVehicles} rowKey={(row) => row.id} emptyText="적용차종이 없습니다." /></div></section>
      <section className="col-span-2 min-h-0 overflow-hidden rounded border border-gray-200 bg-white"><div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">셋트구성품 목록 <span className="ml-1 text-xs font-normal text-gray-500">{selected?.name || '-'}</span></div><div className="h-[calc(100%-41px)]"><FixedHeadTable columns={componentColumns} rows={components[selectedId] || []} rowKey={(row) => row.id} emptyText="구성품이 없습니다." /></div></section>
    </div>
    {editor && <SetEditor value={editor.mode === 'edit' ? editor.row : null} onClose={() => setEditor(null)} onSave={saveSet} />}
    {showApplyButton && <div className="flex justify-end border-t border-gray-200 pt-3"><Button variant="primary" size="md" disabled={!selectedApplyRows.length} onClick={apply}><Check size={14} />선택</Button></div>}
  </div>
  if (!pageMode) return workspace
  return <div className="flex h-full min-h-0 flex-col bg-gray-50"><PageHeader title="나의셋트" description="매출내역에 자주 사용하는 세트와 구성품을 관리합니다." icon={ClipboardEdit} actions={canManage ? <Button variant="primary" onClick={() => setEditor({ mode: 'new' })}><Plus size={15} />신규 등록</Button> : undefined} /><div className="min-h-0 flex-1 overflow-auto p-3"><div className="h-full min-h-0 rounded-lg border border-gray-200 bg-gray-50 p-3">{workspace}</div></div></div>
}

export default function MySetModal({ vehicle, onClose, onApply }) {
  const [selectedApplyRows, setSelectedApplyRows] = useState([])
  const apply = () => { if (!selectedApplyRows.length) return; onApply?.(selectedApplyRows); onClose?.() }
  return <Modal title="나의 셋트" description={`차량명: ${vehicle?.carName || '-'} · codecar: ${vehicle?.codecar || '-'}`} onClose={onClose} width="max-w-6xl" footer={<><Button onClick={onClose}>닫기</Button><Button variant="primary" size="md" disabled={!selectedApplyRows.length} onClick={apply}><Check size={14} />선택</Button></>}><div className="h-[650px] min-h-0"><MySetWorkspace vehicleCodecar={vehicle?.codecar} onSelectionChange={setSelectedApplyRows} showApplyButton={false} /></div></Modal>
}
