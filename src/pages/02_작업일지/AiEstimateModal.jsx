import { useMemo, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'

const ESTIMATES = [
  {
    id: 'ai-1',
    carName: 'ALL NEW G80',
    scopes: ['앞범퍼', '헤드램프'],
    details: [
      { id: 'ai-1-1', content: '프론트범퍼 커버', work: '교환', hour: 1, laborAmt: 35000, partAmt: 187000, partCode: '86511-B1000' },
      { id: 'ai-1-2', content: '헤드램프 어셈블리 좌', work: '교환', hour: 0.6, laborAmt: 21000, partAmt: 420000, partCode: '92101-T1000' },
      { id: 'ai-1-3', content: '프론트범퍼 도장', work: '도장·수성·2코트', hour: 2.5, laborAmt: 87500, partAmt: 0, partCode: '' },
    ],
  },
  {
    id: 'ai-2',
    carName: 'ALL NEW G80',
    scopes: ['앞도어', '뒤도어'],
    details: [
      { id: 'ai-2-1', content: '앞도어 우측', work: '판금', hour: 2.4, laborAmt: 84000, partAmt: 0, partCode: '' },
      { id: 'ai-2-2', content: '뒤도어 우측 몰딩', work: '교환', hour: 0.4, laborAmt: 14000, partAmt: 73000, partCode: '87732-T1100' },
      { id: 'ai-2-3', content: '도어 우측 도장', work: '도장·유성·2코트', hour: 3, laborAmt: 105000, partAmt: 0, partCode: '' },
    ],
  },
  {
    id: 'ai-3',
    carName: '쏘나타 DN8',
    scopes: ['본네트', '앞펜더'],
    details: [
      { id: 'ai-3-1', content: '본네트 패널', work: '교환', hour: 1.2, laborAmt: 42000, partAmt: 315000, partCode: '66400-L1000' },
      { id: 'ai-3-2', content: '앞펜더 좌', work: '판금', hour: 1.5, laborAmt: 52500, partAmt: 0, partCode: '' },
    ],
  },
  {
    id: 'ai-4',
    carName: '카니발',
    scopes: ['뒷범퍼', '트렁크리드'],
    details: [
      { id: 'ai-4-1', content: '리어범퍼 커버', work: '교환', hour: 1, laborAmt: 35000, partAmt: 265000, partCode: '86611-R0000' },
      { id: 'ai-4-2', content: '테일게이트', work: '판금', hour: 2.2, laborAmt: 77000, partAmt: 0, partCode: '' },
    ],
  },
]

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

export default function AiEstimateModal({ carName, onClose, onSelect }) {
  const vehicleNames = [...new Set(ESTIMATES.map((row) => row.carName))]
  const initialVehicle = vehicleNames.includes(carName) ? carName : vehicleNames[0]
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicle)
  const [selectedScopes, setSelectedScopes] = useState(new Set())
  const [selectedId, setSelectedId] = useState(
    ESTIMATES.find((row) => row.carName === initialVehicle)?.id ?? ESTIMATES[0].id,
  )

  const scopeOptions = useMemo(
    () => [...new Set(ESTIMATES.filter((row) => row.carName === selectedVehicle).flatMap((row) => row.scopes))],
    [selectedVehicle],
  )

  const filteredRows = useMemo(() => {
    return ESTIMATES.filter((row) => {
      if (row.carName !== selectedVehicle) return false
      if (selectedScopes.size > 0 && ![...selectedScopes].every((scope) => row.scopes.includes(scope))) return false
      return true
    })
  }, [selectedScopes, selectedVehicle])

  const selected = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null
  const details = selected?.details ?? []
  const laborTotal = details.reduce((sum, row) => sum + row.laborAmt, 0)
  const partTotal = details.reduce((sum, row) => sum + row.partAmt, 0)

  const changeVehicle = (name) => {
    setSelectedVehicle(name)
    setSelectedScopes(new Set())
    setSelectedId(ESTIMATES.find((row) => row.carName === name)?.id ?? null)
  }

  const toggleScope = (scope) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }

  const estimateColumns = [
    { key: 'carName', title: '차량명', width: '28%' },
    { key: 'scopes', title: '견적부위', width: '72%', render: (value) => value.join(', ') },
  ]
  const detailColumns = [
    { key: 'content', title: '작업내용', width: '30%' },
    { key: 'work', title: '작업', width: '18%' },
    { key: 'hour', title: '시간', width: '10%', align: 'right' },
    { key: 'laborAmt', title: '공임액', width: '13%', align: 'right', render: money },
    { key: 'partAmt', title: '부품액', width: '13%', align: 'right', render: money },
    { key: 'partCode', title: '부품코드', width: '16%', render: (value) => value || '-' },
  ]

  return (
    <Modal
      title={(
        <span className="inline-flex items-center gap-2">
          <Sparkles size={17} className="text-violet-500" />
          <span>AI 견적</span>
        </span>
      )}
      description="차량명과 사고부위가 유사한 공유 견적을 조회하여 작업목록에 반영합니다."
      width="max-w-6xl"
      onClose={onClose}
      footer={<><Button onClick={onClose}>닫기</Button><Button variant="primary" size="md" disabled={!selected} onClick={() => { onSelect?.(details, selected); onClose() }}><Check size={14} />선택</Button></>}
    >
      <div className="grid h-[680px] max-h-[calc(100vh-180px)] min-h-0 grid-cols-[190px_minmax(0,1fr)] overflow-hidden rounded-lg border border-gray-200">
        <aside className="flex min-h-0 flex-col border-r border-gray-200 bg-gray-50">
          <section className="max-h-[210px] shrink-0 overflow-y-auto border-b border-gray-200 p-2">
            <h3 className="mb-2 px-1 text-[11px] font-semibold text-gray-400">차량명</h3>
            <div className="space-y-1">
              {vehicleNames.map((name) => (
                <button key={name} type="button" onClick={() => changeVehicle(name)}
                  className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition-colors ${selectedVehicle === name ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {name}
                </button>
              ))}
            </div>
          </section>
          <section className="min-h-0 flex-1 overflow-y-auto p-2">
            <h3 className="mb-2 px-1 text-[11px] font-semibold text-gray-400">사고부위</h3>
            <div className="grid grid-cols-2 gap-1">
              <button type="button" onClick={() => setSelectedScopes(new Set())}
                className={`col-span-2 rounded-md border py-1.5 text-xs ${selectedScopes.size === 0 ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                전체
              </button>
              {scopeOptions.map((scope) => (
                <button key={scope} type="button" onClick={() => toggleScope(scope)}
                  className={`truncate rounded-md border px-1 py-1.5 text-xs ${selectedScopes.has(scope) ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {scope}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col bg-white">
          <div className="flex h-12 shrink-0 items-center gap-4 border-b border-gray-200 px-3 text-xs text-gray-500"><div className="min-w-0 flex-1 truncate">선택된 항목: <strong className="text-gray-800">{selected ? `${selected.carName} · ${selected.scopes.join(', ')}` : '-'}</strong></div><div className="flex shrink-0 gap-4"><span>공임합계: <strong className="text-gray-700">{money(laborTotal)}</strong></span><span>부품합계: <strong className="text-gray-700">{money(partTotal)}</strong></span></div></div>
          <section className="h-[265px] shrink-0 border-b border-gray-200 p-3">
            <div className="h-full overflow-hidden rounded-md border border-gray-200">
              <FixedHeadTable
                columns={estimateColumns}
                rows={filteredRows}
                rowKey={(row) => row.id}
                selectedKey={selected?.id}
                onRowClick={(row) => setSelectedId(row.id)}
                height={null}
                rowSize="sm"
                emptyText="조건에 맞는 공유 견적이 없습니다."
              />
            </div>
          </section>
          <section className="min-h-0 flex-1 p-3">
            <div className="h-full overflow-hidden rounded-md border border-gray-200">
              <FixedHeadTable
                columns={detailColumns}
                rows={details}
                rowKey={(row) => row.id}
                height={null}
                rowSize="sm"
                emptyText="위 목록에서 견적을 선택하세요."
              />
            </div>
          </section>
        </main>
      </div>
    </Modal>
  )
}
