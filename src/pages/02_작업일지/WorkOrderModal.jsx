import { useMemo, useState } from 'react'
import { ClipboardCheck, ListChecks, RotateCcw } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'

const PARTS = [
  { key: 'front_bumper', label: '앞범퍼', x: 55.1, y: 3.6 },
  { key: 'headlamp_l', label: '헤드램프L', x: 10.6, y: 13.5 },
  { key: 'headlamp_r', label: '헤드램프R', x: 88.9, y: 13.6 },
  { key: 'hood', label: '본네트', x: 56, y: 16.3 },
  { key: 'fender_fl', label: '앞휀다L', x: 10.6, y: 19.4 },
  { key: 'fender_fr', label: '앞휀다R', x: 88.9, y: 19.4 },
  { key: 'door_fl', label: '앞도어L', x: 10.4, y: 43.3 },
  { key: 'door_fr', label: '앞도어R', x: 89, y: 43.3 },
  { key: 'roof', label: '루프', x: 54.4, y: 52 },
  { key: 'door_rl', label: '뒤도어L', x: 10.5, y: 59.4 },
  { key: 'door_rr', label: '뒤도어R', x: 89, y: 59.4 },
  { key: 'fender_rl', label: '뒤휀다L', x: 10.6, y: 82.3 },
  { key: 'fender_rr', label: '뒤휀다R', x: 90, y: 82.3 },
  { key: 'taillamp_l', label: '테일램프L', x: 10.6, y: 89.3 },
  { key: 'taillamp_r', label: '테일램프R', x: 89, y: 89.3 },
  { key: 'trunk', label: '트렁크', x: 56.5, y: 87.9 },
  { key: 'rear_bumper', label: '뒤범퍼', x: 55.1, y: 96.3 },
]

const NEXT_STATE = { none: 'exchange', exchange: 'panel', panel: 'none' }
const STATE_COLOR = { none: '#ffffff', exchange: '#3b82f6', panel: '#22c55e' }
const WORK_LABEL = { exchange: '교환', panel: '판금' }
const WORK_HOUR = { exchange: 1, panel: 0.8 }

function CarTopView() {
  return (
    <img
      src="/car_topview.png"
      alt="자동차 외판 상면도"
      className="absolute inset-0 h-full w-full select-none object-contain"
      draggable={false}
    />
  )
}

export default function WorkOrderModal({ vehicle, onClose, onApply }) {
  const alert = useAlert()
  const [states, setStates] = useState({})
  const [previewRows, setPreviewRows] = useState([])

  const selectedParts = useMemo(
    () => PARTS.map((part) => ({ ...part, state: states[part.key] ?? 'none' })).filter((part) => part.state !== 'none'),
    [states],
  )

  const cyclePart = (key) => {
    setStates((prev) => ({ ...prev, [key]: NEXT_STATE[prev[key] ?? 'none'] }))
    setPreviewRows([])
  }

  const preview = () => {
    if (selectedParts.length === 0) {
      alert.warning('선택된 외판 부위가 없습니다.')
      return
    }
    setPreviewRows(selectedParts.map((part, index) => ({
      id: `work-order-${index}`,
      content: part.label,
      work: WORK_LABEL[part.state],
      hour: WORK_HOUR[part.state],
    })))
  }

  const apply = () => {
    if (previewRows.length === 0) {
      alert.warning('예상 견적확인을 먼저 실행해 주세요.')
      return
    }
    onApply?.(previewRows)
    onClose()
  }

  const columns = [
    { key: 'content', title: '작업내용', width: '55%' },
    { key: 'work', title: '작업', width: '22%', align: 'center' },
    { key: 'hour', title: '시간', width: '23%', align: 'right' },
  ]

  return (
    <Modal
      title="작업지시서"
      description={(
        <span className="inline-flex flex-wrap items-center gap-2">
          <span>{vehicle?.carNo || '차량번호 없음'} · 외판 부위를 클릭하여 작업을 지정하세요</span>
          <span className="text-gray-300">|</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded-sm bg-blue-500" />교환</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded-sm bg-green-500" />판금</span>
        </span>
      )}
      width="max-w-6xl"
      onClose={onClose}
      footer={(
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={() => { setStates({}); setPreviewRows([]) }}><RotateCcw size={14} />초기화</Button>
            <Button onClick={preview}><ListChecks size={14} />예상 견적확인</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onClose}>취소</Button>
            <Button variant="primary" onClick={apply}><ClipboardCheck size={14} />작업반영</Button>
          </div>
        </div>
      )}
    >
      <div className="grid h-[620px] max-h-[calc(100vh-180px)] min-h-0 grid-cols-[minmax(0,1fr)_420px] overflow-hidden rounded-lg border border-gray-200">
        <section className="flex min-h-0 items-center justify-center overflow-hidden bg-slate-100 p-5">
          <div className="relative w-full max-w-[460px]" style={{ aspectRatio: '370 / 340' }}>
            <CarTopView />
            {PARTS.map((part) => {
              const state = states[part.key] ?? 'none'
              return (
                <button
                  key={part.key}
                  type="button"
                  title={state === 'none' ? part.label : `${part.label} · ${WORK_LABEL[state]}`}
                  aria-label={`${part.label} ${state === 'none' ? '선택 안 됨' : WORK_LABEL[state]}`}
                  onClick={() => cyclePart(part.key)}
                  className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border-2 shadow-sm transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  style={{
                    left: `${part.x}%`,
                    top: `${part.y}%`,
                    backgroundColor: STATE_COLOR[state],
                    borderColor: state === 'none' ? '#94a3b8' : '#ffffff',
                  }}
                />
              )
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-col border-l border-gray-200 bg-white">
          <div className="flex h-10 shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3">
            <span className="text-sm font-semibold text-gray-800">예상 견적목록</span>
            <span className="ml-auto text-xs text-gray-400">{previewRows.length}건</span>
          </div>
          <div className="min-h-0 flex-1">
            <FixedHeadTable
              columns={columns}
              rows={previewRows}
              rowKey={(row) => row.id}
              height={null}
              rowSize="sm"
              emptyText="[예상 견적확인]을 눌러 목록을 조회하세요."
            />
          </div>
        </section>
      </div>
    </Modal>
  )
}
