import { useState } from 'react'
import { Car, Search } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'

const SPEC_RECORDS = [
  {
    id: 'spec-1',
    carName: 'i30',
    modelYear: '2009',
    displacement: '1600 CC',
    engineCode: 'D4FB',
    fuel: 'DIESEL',
    drivetrain: 'AUTO · 4 SPEED · 2WD',
    bodySeats: 'SEDAN · 5DR · 5P',
    lubricant: {
      '엔진오일 용량': '5.3 L',
      '엔진오일 점도': '15W-40, 10W-30, 5W-30, 0W-30',
      '엔진오일 규격': 'ACEA C3 / API CH-4',
      '미션오일': '6.8 L',
      '브레이크오일': '필요량',
      '트랜스퍼케이스 오일': '해당없음',
      '프런트 디퍼렌셜': '해당없음',
      '리어 디퍼렌셜': '해당없음',
      '파워스티어링': '해당없음',
      '냉각수': '6.8 L',
      '요소수': '해당없음',
    },
    aircon: {
      'R-134a': '500 ±25g',
      'R-1234yf': '해당없음',
      '냉매 오일량': '150 ±10',
      '냉매 오일종류': 'FD46XG(PAG)',
    },
    tire: {
      '타이어': '185/65 R15\n205/55 R16\n195/65 R15',
      '타이어 공기압': '32 psi',
    },
    battery: {
      '배터리': '80 L',
      '와이퍼': '운전석 600mm · 조수석 450mm',
      '연료탱크': '53 L',
    },
    ev: {
      '윤활유 등급': '해당없음',
      '윤활유 용량': '해당없음',
      '모터 냉각수': '해당없음',
      '배터리 냉각수': '해당없음',
    },
  },
  {
    id: 'spec-2',
    carName: 'i30 cw',
    modelYear: '2009',
    displacement: '1600 CC',
    engineCode: 'D4FB',
    fuel: 'DIESEL',
    drivetrain: 'MANUAL · 5 SPEED · 2WD',
    bodySeats: 'WAGON · 5DR · 5P',
    lubricant: {
      '엔진오일 용량': '5.3 L',
      '엔진오일 점도': '15W-40, 10W-30, 5W-30',
      '엔진오일 규격': 'ACEA C3 / API CH-4',
      '미션오일': '1.9 L',
      '브레이크오일': '필요량',
      '트랜스퍼케이스 오일': '해당없음',
      '프런트 디퍼렌셜': '해당없음',
      '리어 디퍼렌셜': '해당없음',
      '파워스티어링': '해당없음',
      '냉각수': '6.8 L',
      '요소수': '해당없음',
    },
    aircon: {
      'R-134a': '500 ±25g',
      'R-1234yf': '해당없음',
      '냉매 오일량': '150 ±10',
      '냉매 오일종류': 'FD46XG(PAG)',
    },
    tire: {
      '타이어': '185/65 R15\n205/55 R16\n195/65 R15',
      '타이어 공기압': '32 psi',
    },
    battery: {
      '배터리': '80 L',
      '와이퍼': '운전석 600mm · 조수석 450mm',
      '연료탱크': '53 L',
    },
    ev: {
      '윤활유 등급': '해당없음',
      '윤활유 용량': '해당없음',
      '모터 냉각수': '해당없음',
      '배터리 냉각수': '해당없음',
    },
  },
]

const TABS = [
  { id: 'lubricant', label: '윤활유' },
  { id: 'aircon', label: '에어컨가스' },
  { id: 'tire', label: '타이어' },
  { id: 'battery', label: '배터리·와이퍼·연료탱크' },
  { id: 'ev', label: '전기차 모터·감속기' },
]

function SpecificationGrid({ values, notice }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 overflow-hidden rounded-md border border-gray-200 bg-white">
        {Object.entries(values).map(([label, value]) => (
          <div key={label} className="grid min-h-10 grid-cols-[145px_minmax(0,1fr)] items-center border-b border-r border-gray-100">
            <div className="flex h-full items-center bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">{label}</div>
            <div className="flex h-full min-w-0 items-center whitespace-pre-line px-3 py-2 text-sm text-gray-800">{value || '-'}</div>
          </div>
        ))}
      </div>
      {notice && (
        <div className="shrink-0 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          ※ {notice}
        </div>
      )}
    </div>
  )
}

export default function VehicleSpecificationModal({ vehicle, onClose }) {
  const [selectedId, setSelectedId] = useState(SPEC_RECORDS[0].id)
  const [activeTab, setActiveTab] = useState('lubricant')
  const selected = SPEC_RECORDS.find((row) => row.id === selectedId) ?? SPEC_RECORDS[0]
  const vin = String(vehicle.vin || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  const tabNotice = activeTab === 'aircon'
    ? '본네트 또는 앞도어 하단에 실제 장착된 가스종류를 반드시 확인하세요.'
    : activeTab === 'tire'
      ? '출고 시 휠 옵션 선택에 따라 타이어 규격이 다를 수 있습니다.'
      : ''

  const columns = [
    { key: 'carName', title: '차명', width: '14%' },
    { key: 'modelYear', title: '연식', width: '10%', align: 'center' },
    { key: 'displacement', title: '배기량', width: '13%', align: 'center' },
    { key: 'engineCode', title: '엔진코드', width: '12%', align: 'center' },
    { key: 'fuel', title: '연료', width: '12%', align: 'center' },
    { key: 'drivetrain', title: '구동장치', width: '23%' },
    { key: 'bodySeats', title: '차체·인승', width: '16%' },
  ]

  return (
    <Modal
      title="차량 규격정보"
      description={`${vehicle.carNo || '차량번호 없음'} · 차대번호 앞 11자리 기준 조회`}
      width="max-w-6xl"
      onClose={onClose}
      footer={<Button onClick={onClose}>닫기</Button>}
    >
      <div className="flex h-[610px] max-h-[calc(100vh-180px)] min-h-0 flex-col gap-3 overflow-hidden">
        <section className="grid shrink-0 grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <FormField label="차량번호" labelWidth="w-20" value={vehicle.carNo} readOnly />
          <FormField label="차대번호" labelWidth="w-20" value={vin} readOnly required />
          <Button variant="primary" className="h-[30px]" onClick={() => setSelectedId(SPEC_RECORDS[0].id)}>
            <Search size={14} />조회
          </Button>
          <div className="col-span-3 space-y-1 border-t border-gray-200 pt-2 text-xs leading-5">
            <p className="font-medium text-red-600">
              차량식별 및 규격정보는 정비업무상 참고용으로 제공하며, 연식과 세부모델 등에 따라 약간의 정보차이가 있을 수 있습니다.
            </p>
            <p className="font-medium text-red-600">
              정비하기 전 또는 부품구매 전 해당 차량의 매뉴얼 또는 정비지침서를 반드시 확인하시길 권장합니다.
            </p>
            <p className="text-gray-600">
              데이터 제공 범위: 현대, 기아, 르노삼성, KGM, 쉐보레 / 2000년 이후 생산된 승용, RV, 소형승합, 소형화물, 수입차
              <span className="ml-2 text-gray-400">수입차는 정보수집의 어려움으로 누락 정보가 발생할 수 있습니다.</span>
            </p>
          </div>
        </section>

        <section className="h-[150px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex h-9 items-center border-b border-gray-200 bg-gray-50 px-3">
            <Car size={14} className="mr-2 text-green-600" />
            <span className="text-sm font-semibold text-gray-800">차량별 식별정보</span>
            <span className="ml-auto text-xs text-gray-400">조회결과 {SPEC_RECORDS.length}건 · Row를 선택하면 하단 규격정보가 변경됩니다.</span>
          </div>
          <div className="h-[114px]">
            <FixedHeadTable
              columns={columns}
              rows={SPEC_RECORDS}
              rowKey={(row) => row.id}
              rowSize="sm"
              height={null}
              tableTextClass="text-xs"
              selectedKey={selected.id}
              onRowClick={(row) => setSelectedId(row.id)}
            />
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex h-10 shrink-0 items-end gap-1 border-b border-gray-200 bg-gray-50 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 border-b-2 px-4 text-xs font-medium transition-colors ${activeTab === tab.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto self-center pr-3 text-xs text-gray-400">{selected.carName} · {selected.engineCode}</span>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <SpecificationGrid values={selected[activeTab]} notice={tabNotice} />
          </div>
        </section>
      </div>
    </Modal>
  )
}
