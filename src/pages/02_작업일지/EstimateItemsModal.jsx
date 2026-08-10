import { useMemo, useState } from 'react'
import { ClipboardCheck, ClipboardList } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'

const ESTIMATE_HISTORY_BY_CAR = {
  default: [
    { id: 'estimate-1', date: '2026-07-18', carName: 'ALL NEW G80', amount: '356,100', mileage: '52,480', type: '일반', estimator: '김정비', status: '작성' },
    { id: 'estimate-2', date: '2026-04-08', carName: 'ALL NEW G80', amount: '185,000', mileage: '48,200', type: '일반', estimator: '박담당', status: '매출전환' },
  ],
}

const ESTIMATE_DETAILS = {
  'estimate-1': [
    { id: 'estimate-1-1', kind: '공임', content: '엔진오일 교환', work: '교환', qh: '1.2', partAmt: 0, laborAmt: 33_600, partCode: '', unitPrice: 28_000 },
    { id: 'estimate-1-2', kind: '부품', content: '엔진오일 필터', work: '교환', qh: '1', partAmt: 12_000, laborAmt: 0, partCode: '26300-35505', unitPrice: 12_000 },
    { id: 'estimate-1-3', kind: '부품', content: '에어클리너 엘리먼트', work: '교환', qh: '1', partAmt: 22_000, laborAmt: 0, partCode: '28113-2S000', unitPrice: 22_000 },
  ],
  'estimate-2': [
    { id: 'estimate-2-1', kind: '공임', content: '브레이크 패드 교환', work: '교환', qh: '1.5', partAmt: 0, laborAmt: 45_000, partCode: '', unitPrice: 30_000 },
    { id: 'estimate-2-2', kind: '부품', content: '프론트 브레이크 패드', work: '교환', qh: '1', partAmt: 140_000, laborAmt: 0, partCode: '58101-G4A00', unitPrice: 140_000 },
  ],
}

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

export default function EstimateItemsModal({ vehicle, onClose, onApply }) {
  const alert = useAlert()
  const historyRows = useMemo(() => ESTIMATE_HISTORY_BY_CAR[vehicle?.carNo] || ESTIMATE_HISTORY_BY_CAR.default, [vehicle?.carNo])
  const [selectedId, setSelectedId] = useState(historyRows[0]?.id ?? null)
  const selected = historyRows.find((row) => row.id === selectedId) || null
  const detailRows = selected ? ESTIMATE_DETAILS[selected.id] || [] : []

  const apply = () => {
    if (!selected || detailRows.length === 0) {
      alert.warning('불러올 견적내용이 없습니다.')
      return
    }
    onApply?.(detailRows)
    onClose()
  }

  const historyColumns = [
    { key: 'date', title: '견적일자', width: '100px' },
    { key: 'carName', title: '차량명', width: 'minmax(140px, 1fr)' },
    { key: 'amount', title: '견적금액', width: '100px', align: 'right' },
    { key: 'mileage', title: '주행거리', width: '90px', align: 'right' },
    { key: 'type', title: '구분', width: '70px', align: 'center' },
    { key: 'estimator', title: '견적자', width: '80px', align: 'center' },
    { key: 'status', title: '상태', width: '90px', align: 'center' },
  ]

  const detailColumns = [
    { key: 'kind', title: '구분', width: '70px', align: 'center' },
    { key: 'content', title: '견적내용', width: 'minmax(180px, 1fr)' },
    { key: 'work', title: '작업', width: '70px', align: 'center' },
    { key: 'qh', title: 'Q/H', width: '65px', align: 'right' },
    { key: 'partAmt', title: '부품액', width: '90px', align: 'right', render: (value) => money(value) },
    { key: 'laborAmt', title: '공임액', width: '90px', align: 'right', render: (value) => money(value) },
  ]

  return (
    <Modal
      title={<span className="inline-flex items-center gap-1.5"><ClipboardList size={16} className="text-green-600" />견적항목</span>}
      description={`차량번호: ${vehicle?.carNo || '-'} · 차량명: ${vehicle?.carName || '-'}`}
      onClose={onClose}
      width="max-w-4xl"
      footer={<><Button onClick={onClose}>닫기</Button><Button variant="primary" disabled={!selected || detailRows.length === 0} onClick={apply}><ClipboardCheck size={14} />불러오기</Button></>}
    >
      <div className="grid h-[620px] min-h-0 grid-rows-[250px_minmax(0,1fr)] gap-3">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-3">
            <span className="text-sm font-semibold text-gray-800">견적이력 목록</span>
            <span className="text-xs text-gray-400">{historyRows.length}건</span>
          </div>
          <div className="min-h-0 flex-1">
            <FixedHeadTable columns={historyColumns} rows={historyRows} rowKey={(row) => row.id} rowSize="sm" height={null} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} emptyText="견적이력이 없습니다." />
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-3">
            <span className="text-sm font-semibold text-gray-800">견적내용 목록</span>
            <span className="text-xs text-gray-400">{selected ? `${selected.date} · ${selected.carName}` : '견적을 선택하세요.'} · {detailRows.length}건</span>
          </div>
          <div className="min-h-0 flex-1">
            <FixedHeadTable columns={detailColumns} rows={detailRows} rowKey={(row) => row.id} rowSize="sm" height={null} emptyText="선택한 견적의 내용이 없습니다." />
          </div>
        </section>
      </div>
    </Modal>
  )
}
