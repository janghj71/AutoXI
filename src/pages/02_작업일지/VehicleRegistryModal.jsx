import { useState } from 'react'
import { ArrowLeft, ClipboardList, FileSearch } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'

const INSPECTION_ROWS = [
  { id: 1, date: '2025-02-13', type: '검사구분', mileage: 164851, office: '강남자동차검사소' },
  { id: 2, date: '2023-03-03', type: '검사구분', mileage: 139614, office: '강남자동차검사소' },
  { id: 3, date: '2021-02-05', type: '검사구분', mileage: 113394, office: '강남자동차검사소' },
  { id: 4, date: '2019-02-19', type: '검사구분', mileage: 87356, office: '강남자동차검사소' },
  { id: 5, date: '2017-02-13', type: '검사구분', mileage: 87368, office: '강남서울운출장' },
  { id: 6, date: '2015-02-10', type: '검사구분', mileage: 58357, office: '성동자동차검사소' },
]

const OWNERSHIP_ROWS = [
  { id: 1, date: '2009-02-19', type: '신규등록', mileage: 0, owner: '표영수', carNo: '12라6873', vin: 'KMHDB51TP9U166970' },
]

const MORTGAGE_ROWS = [
  {
    id: 1,
    date: '2012-04-16',
    bookNo: '을부 0001',
    receiptNo: '2012-004512',
    holder: '○○캐피탈',
    holderAddress: '서울특별시 강남구 테헤란로 ***',
    setter: '표영수',
    setterAddress: '경기도 하남시 미사대로 ***',
    claimAmount: 12000000,
    debtor: '표영수',
    debtorAddress: '경기도 하남시 미사대로 ***',
    cancellationDate: '2016-05-20',
    closedDate: '-',
  },
]

const JOINT_MORTGAGE_MEMO = '공동저당으로 등록된 자동차 등록번호 정보가 없습니다.'
const VEHICLE_NOTE_MEMO = '자동차 등록원부에 기록된 별도 사항정보가 없습니다.'

const money = (value) => Number(value || 0).toLocaleString('ko-KR')

function InfoCell({ label, value, className = '' }) {
  return (
    <div className={`grid min-h-12 grid-cols-[110px_minmax(0,1fr)] border-b border-r border-gray-200 ${className}`}>
      <div className="flex items-center bg-gray-50 px-3 text-xs font-medium text-gray-600">{label}</div>
      <div className="flex min-w-0 items-center px-3 text-sm text-gray-800">{value || '-'}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <div className="flex h-9 shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-800">{children}</div>
}

function RegistryView({ data, onDetail }) {
  return (
    <div className="h-full overflow-auto pr-1">
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
        <div className="border-b border-gray-300 px-5 py-5 text-center">
          <div className="text-xs text-gray-500">자동차관리법에 따른 등록정보</div>
          <div className="mt-2 text-3xl font-semibold tracking-[0.28em] text-gray-900">자동차등록증</div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-gray-600">최초등록일자</span>
            <span className="text-base font-semibold tabular-nums text-gray-800">{data.firstRegistration}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 border-l border-t border-gray-200">
          <InfoCell label="자동차등록번호" value={data.carNo} />
          <InfoCell label="차종" value={data.carType} />
          <InfoCell label="용도" value={data.purpose} />
          <InfoCell label="차명" value={data.carName} />
          <InfoCell label="형식 및 연식" value={`${data.modelCode} · ${data.modelYear}`} className="col-span-2" />
          <InfoCell label="차대번호" value={data.vin} className="col-span-2" />
          <InfoCell label="원동기형식" value={data.engineType} />
          <InfoCell label="검사만료일" value={data.inspectionExpiry} />
          <InfoCell label="소유자" value={data.customer} />
          <InfoCell label="사용본거지" value={data.address} />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
        차량번호와 고객명을 기준으로 조회한 자동차 등록정보입니다. 실제 API 연결 시 응답 항목을 동일한 위치에 표시합니다.
      </div>
      <div className="flex items-center justify-center px-4 py-4">
        <Button variant="primary" className="h-10 min-w-52 px-6 text-sm" onClick={onDetail}>
          <FileSearch size={16} />자동차 원부 상세조회
        </Button>
      </div>
    </div>
  )
}

function DetailView({ data }) {
  const [activeTab, setActiveTab] = useState('ownership')
  const [selectedMortgageId, setSelectedMortgageId] = useState(MORTGAGE_ROWS[0]?.id)
  const selectedMortgage = MORTGAGE_ROWS.find((row) => row.id === selectedMortgageId) ?? MORTGAGE_ROWS[0]
  const inspectionRows = INSPECTION_ROWS.map((row) => ({ ...row, carNo: data.carNo, vin: data.vin }))

  const inspectionColumns = [
    { key: 'date', title: '검사일자', width: '14%' },
    { key: 'type', title: '구분', width: '12%' },
    { key: 'mileage', title: '주행거리', width: '13%', align: 'right', render: money },
    { key: 'office', title: '검사소', width: '25%', render: (value) => <span title={value}>{value}</span> },
    { key: 'carNo', title: '차량번호', width: '14%' },
    { key: 'vin', title: '차대번호', width: '22%', render: (value) => <span title={value}>{value}</span> },
  ]
  const ownershipColumns = [
    { key: 'date', title: '이전일자', width: '16%' },
    { key: 'type', title: '구분', width: '14%' },
    { key: 'mileage', title: '주행거리', width: '14%', align: 'right', render: money },
    { key: 'owner', title: '이전소유자', width: '17%' },
    { key: 'carNo', title: '차량번호', width: '16%' },
    { key: 'vin', title: '차대번호', width: '23%' },
  ]
  const mortgageColumns = [
    { key: 'date', title: '저당설정일', width: '24%' },
    { key: 'bookNo', title: '을부번호', width: '22%' },
    { key: 'receiptNo', title: '접수번호', width: '30%' },
    { key: 'claimAmount', title: '채권액', width: '24%', align: 'right', render: money },
  ]

  const infoRows = [
    ['차량번호', data.carNo],
    ['고객명', data.customer],
    ['차명', data.carName],
    ['차대번호', data.vin],
    ['제작연월일', data.productionDate],
    ['모델연도', data.modelYear],
    ['최초등록일', data.firstRegistration],
    ['검사 유효기간', `${data.inspectionStart} ~ ${data.inspectionExpiry}`],
    ['원동기형식', data.engineType],
    ['용도', data.purpose],
    ['차종', data.carType],
    ['예상주행거리', money(data.expectedMileage)],
    ['최종소유자', data.customer],
    ['사용본거지', data.address],
  ]
  const mortgageDetails = selectedMortgage ? [
    ['저당권자', selectedMortgage.holder],
    ['저당권자 주소', selectedMortgage.holderAddress],
    ['저당권 설정자', selectedMortgage.setter],
    ['설정자 주소', selectedMortgage.setterAddress],
    ['채권액', money(selectedMortgage.claimAmount)],
    ['채무자', selectedMortgage.debtor],
    ['채무자 주소', selectedMortgage.debtorAddress],
    ['저당권 말소일', selectedMortgage.cancellationDate],
    ['폐쇄년월일', selectedMortgage.closedDate],
  ] : []
  const tabs = [
    { id: 'ownership', label: '명의이전이력' },
    { id: 'mortgage', label: '저당권·압류' },
    { id: 'joint', label: '공동저당' },
    { id: 'note', label: '사항정보' },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="grid h-[260px] shrink-0 grid-cols-[430px_minmax(0,1fr)] gap-3">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionTitle>차량 기본정보</SectionTitle>
          <div className="grid min-h-0 flex-1 grid-cols-2">
            {infoRows.map(([label, value]) => (
              <div key={label} className="grid min-h-8 grid-cols-[88px_minmax(0,1fr)] items-center border-b border-r border-gray-100 text-xs">
                <div className="px-2 text-right font-medium text-gray-500">{label}</div>
                <div className="min-w-0 truncate px-2 text-gray-800" title={String(value || '-')}>{value || '-'}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionTitle>검사이력</SectionTitle>
          <div className="min-h-0 flex-1">
            <FixedHeadTable columns={inspectionColumns} rows={inspectionRows} rowKey={(row) => row.id} rowSize="sm" height={null} tableTextClass="text-xs" />
          </div>
        </section>
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex h-10 shrink-0 items-end gap-1 border-b border-gray-200 bg-gray-50 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 border-b-2 px-4 text-xs font-medium transition-colors ${activeTab === tab.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          {activeTab === 'ownership' && (
            <FixedHeadTable columns={ownershipColumns} rows={OWNERSHIP_ROWS} rowKey={(row) => row.id} rowSize="sm" height={null} tableTextClass="text-xs" />
          )}

          {activeTab === 'mortgage' && (
            <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-3 p-3">
              <div className="min-h-0 overflow-hidden rounded-md border border-gray-200">
                <FixedHeadTable
                  columns={mortgageColumns}
                  rows={MORTGAGE_ROWS}
                  rowKey={(row) => row.id}
                  rowSize="sm"
                  height={null}
                  tableTextClass="text-xs"
                  selectedKey={selectedMortgage?.id}
                  onRowClick={(row) => setSelectedMortgageId(row.id)}
                />
              </div>
              <div className="min-h-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50/50 p-3">
                <div className="mb-2 text-sm font-semibold text-gray-800">선택 저당권 상세</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {mortgageDetails.map(([label, value]) => (
                    <div key={label} className={`${label.includes('주소') ? 'col-span-2' : ''} grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-center text-xs`}>
                      <div className="text-gray-500">{label}</div>
                      <div className="min-w-0 truncate font-medium text-gray-800" title={String(value || '-')}>{value || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'joint' && (
            <div className="h-full p-3">
              <div className="h-full whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
                {JOINT_MORTGAGE_MEMO}
              </div>
            </div>
          )}

          {activeTab === 'note' && (
            <div className="h-full p-3">
              <div className="h-full whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
                {VEHICLE_NOTE_MEMO}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function VehicleRegistryModal({ vehicle, onClose }) {
  const [detail, setDetail] = useState(false)
  const data = {
    carNo: vehicle.carNo,
    customer: vehicle.customer,
    carName: vehicle.carName || 'i30',
    vin: vehicle.vin || 'KMHDB51TP9U166970',
    productionDate: '2009-02-16',
    modelYear: '2009',
    modelCode: vehicle.modelName || 'FD',
    firstRegistration: '2009-02-19',
    inspectionStart: '2025-02-19',
    inspectionExpiry: '2027-02-18',
    engineType: 'D4FB',
    purpose: '자가용',
    carType: '승용 중형',
    expectedMileage: 183401,
    address: '경기도 하남시 미사대로 ***',
  }

  return (
    <Modal
      title="차량원부 조회"
      description={`${data.carNo} · ${data.customer}`}
      width="max-w-6xl"
      onClose={onClose}
      footer={<Button onClick={onClose}>닫기</Button>}
    >
      <div className="h-[610px] max-h-[calc(100vh-180px)] min-h-0">
        <div className="mb-2 flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3">
          <ClipboardList size={15} className="text-green-600" />
          <span className="text-sm font-semibold text-gray-800">{detail ? '자동차 원부 상세정보' : '자동차 등록정보'}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">차량번호 {data.carNo} · 고객명 {data.customer}</span>
            {detail && (
              <>
                <span className="h-5 w-px bg-gray-200" />
                <Button size="sm" className="h-8 px-3" onClick={() => setDetail(false)}>
                  <ArrowLeft size={14} />등록원부로 돌아가기
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="h-[calc(100%-48px)] min-h-0">
          {detail ? <DetailView data={data} /> : <RegistryView data={data} onDetail={() => setDetail(true)} />}
        </div>
      </div>
    </Modal>
  )
}
