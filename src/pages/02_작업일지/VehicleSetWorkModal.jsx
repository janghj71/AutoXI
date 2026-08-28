import { useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Search, Trash2 } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const SET_DATA = `
120|엔진|20002A00|엔진오일
120|엔진|01901A00|부동액
120|엔진|24312R00|타이밍벨트 세트
120|엔진|25211R00|벨트 세트
120|엔진|18826R0B|점화플러그
120|엔진|27301R00|점화코일
120|엔진|27501R00|점화케이블 세트
120|엔진|37110R00|배터리
120|엔진|37300R00|발전기
120|엔진|36100R00|시동모터
120|엔진|25300R00|라디에이터
120|엔진|25380R00|라디에이터 팬
120|엔진|25411R00|라디에이터 호스
120|엔진|21830R00|엔진 마운팅
120|엔진|21860R00|미션 마운팅
120|엔진|21680R00|센터미미
140|밋션|44003A00|오토미션오일
140|밋션|01903A00|기어오일
140|밋션|01909A00|데후오일
140|밋션|41100R00|클러치 디스크 세트
140|밋션|45741R00|오일 팬
140|밋션|49506R00|등속고무 (내측)
140|밋션|49509R00|등속고무 (외측)
140|밋션|49500R00|등속조인트
151|브레이크|01902A00|브레이크액
151|브레이크|58115R0B|라이닝(패드)
151|브레이크|51712R00|디스크 (앞)
151|브레이크|58415R00|디스크 (뒤)
151|브레이크|58100R00|캘리퍼 (앞)
151|브레이크|58210R00|캘리퍼 (뒤)
152|서스펜션|54650R00|쇼바 (앞)
152|서스펜션|55310R00|쇼바 (뒤)
152|서스펜션|54840R00|활대 링크 (앞)
152|서스펜션|55580R0A|활대 링크 (뒤)
152|서스펜션|54811R0B|활대 고무
152|서스펜션|54509R00|로워 암 (앞)
152|서스펜션|55201R00|로워 암 (뒤)
153|스티어링|01905A00|파워오일
153|스티어링|57100R00|파워 펌프
153|스티어링|57510R00|파워오일 압력 호스
153|스티어링|57532R00|파워오일 흡입 호스
153|스티어링|57540R00|파워오일 리턴 호스
153|스티어링|57700R00|파워 스티어링 기어
153|스티어링|57760R00|타이로드
153|스티어링|56810R00|타이로드 엔드
180|바디|98800R00|윈도우 모터 (앞)
180|바디|98805R00|윈도우 모터 (뒤)
180|바디|82401R00|유리기어 (앞)
180|바디|83405R00|유리기어 (뒤)
180|바디|81310R00|도어 래치 (앞)
180|바디|81410R00|도어 래치 (뒤)
180|바디|86512R00|범퍼
190|에어컨 및 히터|09763A00|에어컨 가스
190|에어컨 및 히터|97610R00|에어컨 필터
190|에어컨 및 히터|97701R00|에어컨 콤프
190|에어컨 및 히터|97606R00|에어컨 콘덴서
190|에어컨 및 히터|97762R00|에어컨 고압 호스
190|에어컨 및 히터|97763R00|에어컨 저압 호스
190|에어컨 및 히터|97220R00|히터 코어
`.trim().split('\n').map((line, index) => {
  const [setCode, category, partCode, name] = line.split('|')
  return { id: `${setCode}-${index}`, setCode, category, partCode, name }
})

const TABS = { sheet: '시트지 체크', list: '세트 목록', common: '범용 셋트목록' }

const SHEET_OPTION_OVERRIDES = {
  '라디에이터 호스': { partCode: '25412R00', options: ['상', '하'] },
  센터미미: { partCode: '21630R00', options: ['앞', '뒤'] },
  '등속고무 (내측)': { partCode: '49506R0R', options: ['좌', '우'] },
  '등속고무 (외측)': { partCode: '49509R0R', options: ['좌', '우'] },
  등속조인트: { partCode: '49500R0R', options: ['좌', '우'] },
  '라이닝(패드)': { partCode: '58215R0B', options: ['앞', '뒤'] },
  '디스크 (앞)': { partCode: '51712R0R', options: ['좌', '우'] },
  '디스크 (뒤)': { partCode: '58415R0R', options: ['좌', '우'] },
  '캘리퍼 (앞)': { partCode: '58100R0R', options: ['좌', '우'] },
  '캘리퍼 (뒤)': { partCode: '58210R0R', options: ['좌', '우'] },
  '쇼바 (앞)': { partCode: '54650R0R', options: ['좌', '우'] },
  '쇼바 (뒤)': { partCode: '55310R0R', options: ['좌', '우'] },
  '활대 링크 (앞)': { partCode: '54840R0R', options: ['좌', '우'] },
  '활대 링크 (뒤)': { partCode: '55580R0R', options: ['좌', '우'] },
  '활대 고무': { partCode: '55570R00', options: ['앞', '뒤'] },
  '로워 암 (앞)': { partCode: '54509R0R', options: ['좌', '우'] },
  '로워 암 (뒤)': { partCode: '55201R0R', options: ['좌', '우'] },
  타이로드: { partCode: '57760R0R', options: ['좌', '우'] },
  '타이로드 엔드': { partCode: '56810R0R', options: ['좌', '우'] },
  '윈도우 모터 (앞)': { partCode: '98800R0R', options: ['좌', '우'] },
  '윈도우 모터 (뒤)': { partCode: '98805R0R', options: ['좌', '우'] },
  '유리기어 (앞)': { partCode: '82401R0R', options: ['좌', '우'] },
  '유리기어 (뒤)': { partCode: '83405R0R', options: ['좌', '우'] },
  '도어 래치 (앞)': { partCode: '81310R0R', options: ['좌', '우'] },
  '도어 래치 (뒤)': { partCode: '81410R0R', options: ['좌', '우'] },
  범퍼: { partCode: '86651R00', options: ['앞', '뒤'] },
  '에어컨 가스': { partCode: '09764A00', options: ['완충', '보충'] },
}

const SHEET_ROWS = SET_DATA.map((row) => ({
  ...row,
  category: row.category === '밋션' ? '미션' : row.category,
  ...(SHEET_OPTION_OVERRIDES[row.name] || {}),
  options: SHEET_OPTION_OVERRIDES[row.name]?.options || [],
}))

const SHEET_CATEGORY_ORDER = ['엔진', '미션', '서스펜션', '브레이크', '스티어링', '바디', '에어컨 및 히터']
const SET_LIST_GROUPS = [
  { label: '주요 소모품', type: 'title' },
  ...SHEET_CATEGORY_ORDER.map((label) => ({ label, type: 'category' })),
  { label: '엔진 전기 시스템', type: 'group' },
  { label: '엔진 연료 / 제어 시스템', type: 'group' },
  { label: '엔진 전장 시스템', type: 'group' },
  { label: '변속기 및 액슬', type: 'group' },
  { label: '브레이크 시스템', type: 'group' },
  { label: '서스펜션 시스템', type: 'group' },
  { label: '스티어링 시스템', type: 'group' },
  { label: '바디 내장 및 외장', type: 'group' },
  { label: '바디 전장', type: 'group' },
  { label: '에어컨 및 히터', type: 'group' },
]
const SHEET_CATEGORY_PLACEMENT = {
  엔진: 'col-start-1 row-start-1 row-span-3',
  미션: 'col-start-2 row-start-1',
  브레이크: 'col-start-2 row-start-2',
  바디: 'col-start-2 row-start-3',
  스티어링: 'col-start-3 row-start-1',
  서스펜션: 'col-start-3 row-start-2',
  '에어컨 및 히터': 'col-start-3 row-start-3',
}

function PositionChecks({ row, checked, toggle }) {
  if (!row.options.length) return null
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-2 text-[11px] text-gray-600">
      {row.options.map((option) => {
        const key = `${row.id}-${option}`
        return (
          <label key={option} className="inline-flex items-center gap-0.5 whitespace-nowrap">
            {option}
            <input type="checkbox" checked={checked.has(key)} onChange={() => toggle(key)} className="accent-green-600" />
          </label>
        )
      })}
    </span>
  )
}

export default function VehicleSetWorkModal({ vehicle, onClose, onApply }) {
  const initialVin = String(vehicle?.vin || '').replace(/\s/g, '').slice(0, 11)
  const [vin, setVin] = useState(initialVin)
  const [searchedVin, setSearchedVin] = useState(initialVin)
  const [activeTab, setActiveTab] = useState(initialVin.length === 11 ? 'sheet' : 'common')
  const [selectedListCategory, setSelectedListCategory] = useState('엔진')
  const [selectedSetRow, setSelectedSetRow] = useState(null)
  const [selectedDetailId, setSelectedDetailId] = useState(null)
  const [checked, setChecked] = useState(new Set())
  const [selectedSetIds, setSelectedSetIds] = useState(new Set())
  const [isCartExpanded, setIsCartExpanded] = useState(false)
  const [mhRate, setMhRate] = useState('26000')
  const [excludedCartRowIds, setExcludedCartRowIds] = useState(new Set())
  const [commonMaker, setCommonMaker] = useState('현대')
  const [commonCarType, setCommonCarType] = useState('고급형')
  const [commonCarName, setCommonCarName] = useState('에쿠스 00')
  const [commonYear, setCommonYear] = useState('2000')
  const hasVinData = searchedVin.length === 11
  const rows = SHEET_ROWS
  const vehicleInfo = [
    { label: '차대번호', value: searchedVin || '-' },
    { label: '차량명', value: vehicle?.carName || 'I30/I30CW 07' },
    { label: '제작일자', value: vehicle?.manufactureDate || '20090216' },
    { label: '연료', value: vehicle?.fuel || 'DIESEL - DIESEL' },
    { label: '엔진', value: vehicle?.engine || '1600 CC - U' },
    { label: '연료분사', value: vehicle?.fuelInjection || 'DOHC - TCI' },
    { label: '변속기', value: vehicle?.transmission || 'AUTO - 4 SPEED 2WD' },
    { label: '바디', value: vehicle?.body || 'SEDAN - 5DR 5P' },
  ]
  const groupedRows = useMemo(() => Object.groupBy?.(rows, (row) => row.category) || rows.reduce((groups, row) => ({ ...groups, [row.category]: [...(groups[row.category] || []), row] }), {}), [rows])
  const visibleRows = hasVinData ? rows : []

  const search = () => {
    const nextVin = vin.replace(/\s/g, '').slice(0, 11)
    setVin(nextVin)
    setSearchedVin(nextVin)
    setActiveTab(nextVin.length === 11 ? 'sheet' : 'common')
    setChecked(new Set())
    setSelectedSetIds(new Set())
    setIsCartExpanded(false)
    setExcludedCartRowIds(new Set())
  }

  const toggle = (id) => {
    const sourceRow = rows.find((row) => id === row.id || id.startsWith(`${row.id}-`))
    if (sourceRow) {
      setExcludedCartRowIds((current) => new Set([...current].filter((rowId) => !rowId.startsWith(`${sourceRow.id}-`))))
    }
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addSetToCart = (row) => {
    setExcludedCartRowIds((current) => new Set([...current].filter((rowId) => !rowId.startsWith(`${row.id}-`))))
    setSelectedSetIds((current) => new Set([...current, row.id]))
  }

  const clearCart = () => {
    setChecked(new Set())
    setSelectedSetIds(new Set())
    setExcludedCartRowIds(new Set())
  }

  const searchCommonSet = () => {
    setSelectedListCategory('엔진')
    setSelectedSetRow(null)
    setSelectedDetailId(null)
  }

  const removeCartRow = (id) => setExcludedCartRowIds((current) => new Set([...current, id]))

  const cartSourceRows = useMemo(() => rows.filter((row) => (
    selectedSetIds.has(row.id)
    || checked.has(row.id)
    || row.options.some((option) => checked.has(`${row.id}-${option}`))
  )), [checked, rows, selectedSetIds])

  const generatedCartRows = useMemo(() => cartSourceRows.flatMap((row, index) => {
    const partPrice = 5000 + ((index % 6) * 3700)
    const workTime = 0.4
    const laborAmount = Math.round((Number(mhRate) || 0) * workTime)

    return [
      {
        id: `${row.id}-work`,
        partCode: '',
        name: `${row.name} 교환`,
        unitPrice: 0,
        quantity: 1,
        partAmount: 0,
        laborAmount,
        workTime: workTime.toFixed(1),
        isWork: true,
      },
      {
        id: `${row.id}-part`,
        partCode: row.partCode,
        name: row.name,
        unitPrice: partPrice,
        quantity: 1,
        partAmount: partPrice,
        laborAmount: 0,
        workTime: '0',
      },
    ]
  }), [cartSourceRows, mhRate])

  const cartRows = useMemo(() => generatedCartRows.filter((row) => !excludedCartRowIds.has(row.id)), [excludedCartRowIds, generatedCartRows])

  const cartTotals = useMemo(() => cartRows.reduce((totals, row) => ({
    partAmount: totals.partAmount + row.partAmount,
    laborAmount: totals.laborAmount + row.laborAmount,
  }), { partAmount: 0, laborAmount: 0 }), [cartRows])

  const cartColumns = [
    { key: 'partCode', title: '부품코드', width: '17%', className: '!px-2', headerClassName: '!px-2' },
    { key: 'name', title: '작업명 / 부품명', width: '32%', className: '!px-2', headerClassName: '!px-2' },
    { key: 'unitPrice', title: '단가', width: '10%', align: 'right', render: (value) => value ? Number(value).toLocaleString() : '' },
    { key: 'quantity', title: '수량', width: '7%', align: 'right' },
    { key: 'partAmount', title: '부품액', width: '10%', align: 'right', render: (value) => Number(value).toLocaleString() },
    { key: 'laborAmount', title: '공임액', width: '10%', align: 'right', render: (value) => Number(value).toLocaleString() },
    { key: 'workTime', title: '시간', width: '7%', align: 'right' },
    {
      key: 'delete',
      title: '',
      width: '7%',
      align: 'center',
      noTruncate: true,
      render: (_, row) => (
        <button type="button" title="선택 작업 삭제" aria-label="선택 작업 삭제" onClick={(event) => { event.stopPropagation(); removeCartRow(row.id) }} className="inline-flex size-5 items-center justify-center text-gray-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      ),
    },
  ]

  const applyCartToSales = () => {
    if (cartRows.length === 0) return

    onApply?.(cartRows.map((row) => ({
      kind: row.isWork ? '공임' : '부품',
      partCode: row.partCode,
      content: row.name,
      work: '교환',
      hour: row.workTime,
      unitPrice: row.unitPrice,
      partAmt: row.partAmount,
      laborAmt: row.laborAmount,
    })))
    onClose()
  }

  const detailColumns = [
    { key: 'partCode', title: '부품코드', width: '18%', className: '!pl-3 !pr-1', headerClassName: '!pl-3 !pr-1' },
    { key: 'partName', title: '부품명', width: '30%', className: '!px-1', headerClassName: '!px-1' },
    { key: 'quantity', title: '수량', width: '6%', align: 'right', className: '!px-1', headerClassName: '!px-1' },
    { key: 'unitPrice', title: '', width: '10%', align: 'right', className: '!px-1', headerClassName: '!px-1' },
    { key: 'amount', title: '부품액', width: '10%', align: 'right', className: '!px-1', headerClassName: '!px-1' },
    { key: 'startYear', title: '', width: '9%', align: 'right', className: '!px-1', headerClassName: '!px-1' },
    { key: 'endYear', title: '종료년', width: '9%', align: 'right', className: '!pl-1 !pr-3', headerClassName: '!pl-1 !pr-2 !text-right' },
  ]
  const detailRows = selectedSetRow ? [
    {
      id: selectedSetRow.id,
      partCode: selectedSetRow.partCode,
      partName: `${selectedSetRow.name} 어셈블리`,
      unitPrice: '238,000',
      quantity: 1,
      amount: '238,000',
      startYear: '2003',
      endYear: '2011',
    },
    {
      id: `${selectedSetRow.id}-sub`,
      partCode: `${selectedSetRow.partCode}-B`,
      partName: `${selectedSetRow.name} 부속품`,
      unitPrice: '42,000',
      quantity: 2,
      amount: '84,000',
      startYear: '2003',
      endYear: '2011',
    },
  ] : []

  const renderDetailRow = ({ row, trProps }) => {
    const { ref: rowRef, ...secondRowProps } = trProps
    const mergedCellClass = 'h-12 whitespace-nowrap px-1 align-middle'
    const detailCellClass = 'h-6 whitespace-nowrap px-1 align-middle'

    return (
      <>
        <tr {...trProps} ref={rowRef} className={`${trProps.className} !border-b-0`}>
          <td rowSpan={2} className={`${mergedCellClass} !pl-3 text-left`}>{row.partCode}</td>
          <td rowSpan={2} className={`${mergedCellClass} truncate text-left`} title={row.partName}>{row.partName}</td>
          <td rowSpan={2} className={`${mergedCellClass} text-right tabular-nums`}>{row.quantity}</td>
          <td colSpan={2} className={`${detailCellClass} !text-right tabular-nums`}>{row.unitPrice}</td>
          <td colSpan={2} className={`${detailCellClass} !pr-3 !text-right tabular-nums`}>{row.startYear}</td>
        </tr>
        <tr {...secondRowProps}>
          <td colSpan={2} className={`${detailCellClass} !text-right tabular-nums`}>{row.amount}</td>
          <td colSpan={2} className={`${detailCellClass} !pr-3 !text-right tabular-nums`}>{row.endYear}</td>
        </tr>
      </>
    )
  }

  return (
    <Modal
      title="차량별 셋트작업"
      description={`차량명: ${vehicle?.carName || '-'} · 차대번호 11자리 기준`}
      onClose={onClose}
      width="max-w-6xl"
      footer={(
        <>
          <div className="mr-auto flex items-center gap-2 text-xs text-gray-700">
            <label htmlFor="vehicle-set-mh-rate" className="font-semibold">M/H</label>
            <input
              id="vehicle-set-mh-rate"
              value={mhRate}
              inputMode="numeric"
              onChange={(event) => setMhRate(event.target.value.replace(/\D/g, ''))}
              className="h-8 w-24 rounded-sm border border-gray-300 px-2 text-right tabular-nums outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15"
            />
            <span>원</span>
          </div>
          <Button onClick={onClose}>닫기</Button>
          <Button variant="primary" size="md" onClick={applyCartToSales} disabled={cartRows.length === 0}><Check size={14} />선택</Button>
        </>
      )}
    >
      <div className="flex h-[760px] min-h-0 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 pb-3">
          <span className="shrink-0 text-xs font-semibold text-gray-700">차대번호</span>
          <input value={vin} maxLength={11} onChange={(event) => setVin(event.target.value.replace(/\s/g, '').slice(0, 11))} className={`min-w-0 rounded-sm border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15 ${hasVinData ? 'flex-1' : 'w-36'}`} />
          <Button size="sm" onClick={search}><Search size={14} />검색</Button>
          {!hasVinData && (
            <div className="ml-1 flex items-center gap-8">
              <span className="h-5 border-l border-gray-300" />
              <label className="flex items-center gap-1.5 text-xs text-gray-700"><span className="font-semibold">제작사</span><Select value={commonMaker} onChange={setCommonMaker} options={['현대', '기아', '제네시스']} className="w-20" buttonClassName="!h-7 !px-2" /></label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700"><span className="font-semibold">차종</span><Select value={commonCarType} onChange={setCommonCarType} options={['고급형', '승용', 'RV']} className="w-24" buttonClassName="!h-7 !px-2" /></label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700"><span className="font-semibold">차량명</span><Select value={commonCarName} onChange={setCommonCarName} options={['에쿠스 00', '그랜저 HG', '쏘나타 DN8']} className="w-32" buttonClassName="!h-7 !px-2" /></label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700"><span className="font-semibold">연식</span><Select value={commonYear} onChange={setCommonYear} options={['2000', '2001', '2002']} className="w-[4.5rem]" buttonClassName="!h-7 !px-2" /></label>
              <Button size="sm" onClick={searchCommonSet}><Search size={14} />조회</Button>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-10 shrink-0 border-b border-gray-200">
            {(hasVinData ? ['sheet', 'list'] : ['common']).map((key) => (
              <button key={key} type="button" onClick={() => setActiveTab(key)} className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{TABS[key]}</button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
            <aside className="mt-1 h-[calc(100%-8px)] w-44 shrink-0 overflow-hidden border border-gray-300 bg-gray-50">
              <div className="flex h-7 items-center justify-center border-b border-gray-300 bg-gray-100 px-2 text-xs font-semibold text-gray-700">차량정보</div>
              {vehicleInfo.map((item) => (
                <div key={item.label} className="border-b border-gray-200 px-2 py-1.5 last:border-b-0">
                  <div className="text-[11px] font-semibold text-gray-600">{item.label}</div>
                  <div className="truncate text-[11px] text-gray-700" title={item.value}>{item.value}</div>
                </div>
              ))}
            </aside>

            <div className="h-full min-w-0 flex-1 overflow-hidden">
            <div className="h-full min-h-0 overflow-hidden">
          {activeTab === 'sheet' && hasVinData && (
            <div className="grid h-full grid-cols-3 grid-rows-[220px_196px_minmax(0,1fr)] gap-x-2 gap-y-1 overflow-auto bg-gray-0 p-1">
              {Object.entries(groupedRows)
                .sort(([first], [second]) => SHEET_CATEGORY_ORDER.indexOf(first) - SHEET_CATEGORY_ORDER.indexOf(second))
                .map(([category, categoryRows]) => (
                <section key={category} className={`${SHEET_CATEGORY_PLACEMENT[category] || ''} ${category === '브레이크' || category === '서스펜션' ? 'h-[196px] self-start' : ''} min-h-0 overflow-hidden border border-gray-300 bg-white`}>
                  <div className="flex h-7 items-center justify-center border-b border-gray-300 bg-gray-100 text-xs font-semibold text-gray-700">{category}</div>
                  <div>
                    {categoryRows.map((row) => (
                      <label key={row.id} className="flex min-h-6 items-center gap-2 border-b border-gray-100 px-2 text-xs text-gray-700 hover:bg-green-50">
                        <span className="truncate">{row.name}</span>
                        {row.options.length ? (
                          <PositionChecks row={row} checked={checked} toggle={toggle} />
                        ) : (
                          <input type="checkbox" checked={checked.has(row.id)} onChange={() => toggle(row.id)} className="ml-auto accent-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          {activeTab === 'list' && hasVinData && (
            <div className="flex h-full min-w-0 gap-2 overflow-hidden bg-gray-0 p-1">
              <div className="w-44 shrink-0 overflow-auto border border-gray-300 bg-white">
                <div className="flex h-7 items-center justify-center border-b border-gray-300 bg-gray-100 px-2 text-xs font-semibold text-gray-700">분류명</div>
                {SET_LIST_GROUPS.map((group) => (
                  <button
                    key={group.label}
                    type="button"
                    disabled={group.type !== 'category'}
                    onClick={() => {
                      setSelectedListCategory(group.label)
                      setSelectedSetRow(null)
                      setSelectedDetailId(null)
                    }}
                    className={`flex min-h-6 w-full items-center border-b border-gray-100 py-1 text-left text-xs transition-colors ${group.type !== 'category' ? 'justify-between' : ''} ${group.type === 'category' ? (selectedListCategory === group.label ? 'bg-green-600 font-semibold text-white' : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900') : 'bg-gray-50 font-semibold text-gray-800 hover:bg-gray-100'}`}
                    style={{ paddingLeft: group.type === 'category' ? '20px' : '10px', paddingRight: '12px' }}
                  >
                    {group.label}
                    {group.type !== 'category' && <span className="ml-auto text-xs text-gray-400">{group.type === 'title' ? '▾' : '▸'}</span>}
                  </button>
                ))}
              </div>

              <div className="w-52 shrink-0 overflow-auto border border-gray-300 bg-white">
                <div className="flex h-7 items-center justify-center border-b border-gray-300 bg-gray-100 px-2 text-xs font-semibold text-gray-700">세트명</div>
                {(rows.filter((row) => row.category === selectedListCategory).length
                  ? rows.filter((row) => row.category === selectedListCategory).map((row) => (
                    <button key={row.id} type="button" onClick={() => {
                      setSelectedSetRow(row)
                      setSelectedDetailId(row.id)
                    }} onDoubleClick={() => addSetToCart(row)} className={`block min-h-6 w-full border-b border-gray-100 px-2 py-1 text-left text-xs ${selectedSetRow?.id === row.id ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'}`}>
                      {row.name} 교환
                    </button>
                  ))
                  : <div className="px-2 py-1 text-xs text-gray-400">해당 분류의 세트작업 항목이 없습니다.</div>
                )}
              </div>

              <div className="min-h-0 min-w-0 flex-1 overflow-hidden border border-gray-300 bg-white">
                <FixedHeadTable
                  columns={detailColumns}
                  rows={detailRows}
                  rowKey={(row) => row.id}
                  rowSize="sm"
                  tableTextClass="text-xs"
                  headerTextClass="text-xs"
                  headerGroups={[
                    { title: '단가', keys: ['unitPrice', 'amount'], align: 'right', headerClassName: '!border-b-0 !px-1 !text-right' },
                    { title: '시작년', keys: ['startYear', 'endYear'], align: 'right', headerClassName: '!border-b-0 !pl-1 !pr-2 !text-right' },
                  ]}
                  rowRenderer={renderDetailRow}
                  measureRenderedRowGroup
                  height={null}
                  selectedKey={selectedDetailId}
                  onRowClick={(row) => setSelectedDetailId(row.id)}
                  emptyText="세트명을 선택하면 부품 내용이 표시됩니다."
                />
              </div>
            </div>
          )}
          {activeTab === 'common' && (
            <div className="flex h-full min-h-0 flex-col gap-2 bg-gray-0 p-1">
              <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
                <div className="w-44 shrink-0 overflow-auto border border-gray-300 bg-white">
                  <div className="flex h-7 items-center justify-center border-b border-gray-300 bg-gray-100 px-2 text-xs font-semibold text-gray-700">분류명</div>
                  {SET_LIST_GROUPS.map((group) => (
                    <button
                      key={group.label}
                      type="button"
                      disabled={group.type !== 'category'}
                      onClick={() => {
                        setSelectedListCategory(group.label)
                        setSelectedSetRow(null)
                        setSelectedDetailId(null)
                      }}
                      className={`flex min-h-6 w-full items-center border-b border-gray-100 py-1 text-left text-xs transition-colors ${group.type !== 'category' ? 'justify-between' : ''} ${group.type === 'category' ? (selectedListCategory === group.label ? 'bg-green-600 font-semibold text-white' : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900') : 'bg-gray-50 font-semibold text-gray-800 hover:bg-gray-100'}`}
                      style={{ paddingLeft: group.type === 'category' ? '20px' : '10px', paddingRight: '12px' }}
                    >
                      {group.label}
                      {group.type !== 'category' && <span className="ml-auto text-xs text-gray-400">{group.type === 'title' ? '▾' : '▸'}</span>}
                    </button>
                  ))}
                </div>

                <div className="w-52 shrink-0 overflow-auto border border-gray-300 bg-white">
                  <div className="flex h-7 items-center justify-center border-b border-gray-300 bg-gray-100 px-2 text-xs font-semibold text-gray-700">세트명</div>
                  {(rows.filter((row) => row.category === selectedListCategory).length
                    ? rows.filter((row) => row.category === selectedListCategory).map((row) => (
                      <button key={row.id} type="button" onClick={() => {
                        setSelectedSetRow(row)
                        setSelectedDetailId(row.id)
                      }} onDoubleClick={() => addSetToCart(row)} className={`block min-h-6 w-full border-b border-gray-100 px-2 py-1 text-left text-xs ${selectedSetRow?.id === row.id ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'}`}>
                        {row.name} 교환
                      </button>
                    ))
                    : <div className="px-2 py-1 text-xs text-gray-400">해당 조건의 세트작업이 없습니다.</div>
                  )}
                </div>

                <div className="min-h-0 min-w-0 flex-1 overflow-hidden border border-gray-300 bg-white">
                  <FixedHeadTable
                    columns={detailColumns}
                    rows={detailRows}
                    rowKey={(row) => row.id}
                    rowSize="sm"
                    tableTextClass="text-xs"
                    headerTextClass="text-xs"
                    headerGroups={[
                      { title: '단가', keys: ['unitPrice', 'amount'], align: 'right', headerClassName: '!border-b-0 !px-1 !text-right' },
                      { title: '시작년', keys: ['startYear', 'endYear'], align: 'right', headerClassName: '!border-b-0 !pl-1 !pr-2 !text-right' },
                    ]}
                    rowRenderer={renderDetailRow}
                    measureRenderedRowGroup
                    height={null}
                    selectedKey={selectedDetailId}
                    onRowClick={(row) => setSelectedDetailId(row.id)}
                    emptyText="세트명을 선택하면 부품 내용이 표시됩니다."
                  />
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
        <section className={`shrink-0 overflow-hidden border border-gray-300 bg-white ${isCartExpanded ? 'h-48' : 'h-9'}`}>
            <div className="flex h-8 bg-gray-100 text-xs text-gray-700">
              <button
              type="button"
              onClick={() => setIsCartExpanded((current) => !current)}
              className="flex min-w-0 flex-1 items-center gap-3 px-3 text-left hover:bg-gray-200"
            >
              <span className="font-semibold">선택 작업</span>
              <span className="text-gray-500">{cartSourceRows.length}세트 · {cartRows.length}건</span>
              <span className="ml-auto tabular-nums text-gray-600">부품액 {cartTotals.partAmount.toLocaleString()}원 · 공임액 {cartTotals.laborAmount.toLocaleString()}원</span>
              {isCartExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              type="button"
              onClick={clearCart}
              disabled={cartRows.length === 0}
              title="선택 작업 전체삭제"
              aria-label="선택 작업 전체삭제"
              className="flex w-9 shrink-0 items-center justify-center border-l border-gray-300 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <Trash2 size={15} />
            </button>
            </div>
            {isCartExpanded && (
              <FixedHeadTable
                columns={cartColumns}
                rows={cartRows}
                rowKey={(row) => row.id}
                rowSize="sm"
                height={150}
                tableTextClass="text-xs"
                headerTextClass="text-xs"
                getRowClassName={(row) => row.isWork ? { className: 'bg-rose-50 text-gray-800', allowBg: true } : ''}
                getGutterRowClass={(key) => cartRows.find((row) => row.id === key)?.isWork ? '!bg-rose-50' : ''}
                emptyText="선택한 세트작업이 없습니다."
              />
            )}
        </section>
      </div>
      </div>
    </Modal>
  )
}
