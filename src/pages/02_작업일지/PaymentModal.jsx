import { useMemo, useState } from 'react'
import { Banknote, CreditCard, Landmark, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const PAYMENT_TYPES = [
  { key: 'cash', label: '현금' },
  { key: 'point', label: '포인트' },
]
const CARD_COMPANIES = ['신한카드', '현대카드', '삼성카드', 'KB국민카드', '롯데카드', '하나카드', 'BC카드']
const BANK_COMPANIES = ['국민은행', '신한은행', '우리은행', '하나은행', '농협은행', '기업은행', '카카오뱅크']
const INITIAL_DISCOUNT_ITEMS = [
  { id: 'discount-general', name: '일반할인', applyType: 'rate', rate: '5', amount: '' },
  { id: 'discount-coupon', name: '쿠폰할인', applyType: 'amount', rate: '', amount: '10000' },
  { id: 'discount-partner', name: '제휴할인', applyType: 'rate', rate: '3', amount: '' },
  { id: 'discount-service', name: '서비스할인', applyType: 'amount', rate: '', amount: '20000' },
]

const amountNumber = (value) => Number(String(value ?? '').replace(/[^0-9]/g, '')) || 0
const money = (value) => amountNumber(value).toLocaleString('ko-KR')
const today = () => new Date().toISOString().slice(0, 10)

function makeInitialPayments(sale) {
  const total = sale.repair || 0
  if (sale.type !== '보험') {
    return {
      single: [
        { id: 'single-cash', date: '2026-07-24', type: '현금', amount: Math.round(total * 0.2), receipt: true, receiptNo: '20260724-100021' },
        { id: 'single-card', date: '2026-07-24', type: '카드', paymentCompany: '신한카드', amount: Math.round(total * 0.25), receipt: false, receiptNo: '' },
        { id: 'single-bank', date: '2026-07-24', type: '은행', paymentCompany: '국민은행', amount: Math.round(total * 0.1), receipt: true, receiptNo: '20260724-100022' },
        { id: 'single-discount', date: '2026-07-24', type: '할인', paymentCompany: '일반할인', amount: Math.round(total * 0.03), receipt: false, receiptNo: '' },
        { id: 'single-discount-2', date: '2026-07-24', type: '할인', paymentCompany: '쿠폰할인', amount: Math.round(total * 0.02), receipt: false, receiptNo: '' },
        { id: 'single-point', date: '2026-07-24', type: '포인트', amount: Math.round(total * 0.02), receipt: false, receiptNo: '' },
      ],
    }
  }

  return {
    'insurer-1': [
      { id: 'insurer-cash', date: '2026-07-24', type: '현금', amount: Math.round(total * 0.08), receipt: true, receiptNo: '20260724-200031' },
      { id: 'insurer-bank', date: '2026-07-24', type: '은행', paymentCompany: '신한은행', amount: Math.round(total * 0.07), receipt: true, receiptNo: '' },
    ],
    'insurer-2': [
      { id: 'insurer-2-bank', date: '2026-07-25', type: '은행', paymentCompany: '우리은행', amount: Math.round(total * 0.06), receipt: true, receiptNo: '20260725-200035' },
      { id: 'insurer-2-card', date: '2026-07-25', type: '카드', paymentCompany: '현대카드', amount: Math.round(total * 0.03), receipt: false, receiptNo: '' },
    ],
    owner: [
      { id: 'owner-card', date: '2026-07-25', type: '카드', paymentCompany: '삼성카드', amount: Math.round(total * 0.025), receipt: false, receiptNo: '' },
      { id: 'owner-card-2', date: '2026-07-25', type: '카드', paymentCompany: 'KB국민카드', amount: Math.round(total * 0.015), receipt: false, receiptNo: '' },
      { id: 'owner-discount', date: '2026-07-25', type: '할인', paymentCompany: '서비스할인', amount: Math.round(total * 0.008), receipt: false, receiptNo: '' },
    ],
    deductible: [
      { id: 'deductible-cash', date: '2026-07-26', type: '현금', amount: Math.round(total * 0.04), receipt: false, receiptNo: '' },
    ],
    vat: [
      { id: 'vat-bank', date: '2026-07-26', type: '은행', paymentCompany: '하나은행', amount: Math.round(total * 0.016), receipt: true, receiptNo: '20260726-200041' },
      { id: 'vat-point', date: '2026-07-26', type: '포인트', amount: Math.round(total * 0.008), receipt: false, receiptNo: '' },
    ],
  }
}

function makeSalesRows(sale) {
  const initialPayments = makeInitialPayments(sale)
  const settledFor = (id) => (initialPayments[id] ?? []).reduce((sum, row) => sum + row.amount, 0)
  if (sale.type !== '보험') {
    return [{
      id: 'single',
      category: '',
      payer: sale.customer || sale.carNo,
      claimAmount: sale.repair || 0,
      settledAmount: settledFor('single'),
    }]
  }

  const total = sale.repair || 0
  const insurer1Amount = Math.round(total * 0.45)
  const insurer2Amount = Math.round(total * 0.27)
  const ownerAmount = Math.round(total * 0.12)
  const deductibleAmount = Math.round(total * 0.08)
  return [
    { id: 'insurer-1', category: '보험사1', payer: sale.insurer || '삼성화재', claimAmount: insurer1Amount, settledAmount: settledFor('insurer-1') },
    { id: 'insurer-2', category: '보험사2', payer: '현대해상', claimAmount: insurer2Amount, settledAmount: settledFor('insurer-2') },
    { id: 'owner', category: '차주부담금', payer: sale.carNo, claimAmount: ownerAmount, settledAmount: settledFor('owner') },
    { id: 'deductible', category: '면책금', payer: sale.carNo, claimAmount: deductibleAmount, settledAmount: settledFor('deductible') },
    { id: 'vat', category: '부가세', payer: sale.carNo, claimAmount: total - insurer1Amount - insurer2Amount - ownerAmount - deductibleAmount, settledAmount: settledFor('vat') },
  ]
}

function AmountField({ label, value, onChange, icon: Icon, action, readOnly = false }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-gray-600">
        {Icon && <Icon size={13} className="text-gray-400" />}{label}
      </label>
      <div className="flex min-w-0 items-center gap-1.5">
        <input
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          inputMode="numeric"
          className={`h-[30px] min-w-0 flex-1 rounded-sm border px-2 text-right text-xs tabular-nums outline-none ${readOnly ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-300 bg-white text-gray-800 focus:border-green-400 focus:ring-2 focus:ring-green-600/15'}`}
        />
        {action}
      </div>
    </div>
  )
}

function PaymentSplitModal({ title, description, options, companyTitle, totalLabel, value, onClose, onApply }) {
  const [rows, setRows] = useState(() => value.map((row) => ({ ...row })))
  const [paymentCompany, setPaymentCompany] = useState(options[0])
  const [amount, setAmount] = useState('')
  const total = rows.reduce((sum, row) => sum + amountNumber(row.amount), 0)
  const addRow = () => {
    const nextAmount = amountNumber(amount)
    if (!paymentCompany || nextAmount <= 0) return
    setRows((prev) => [...prev, { id: `split-${Date.now()}`, paymentCompany, amount: nextAmount }])
    setAmount('')
  }
  const columns = [
    { key: 'paymentCompany', title: companyTitle, width: '44%' },
    { key: 'amount', title: '금액', width: '38%', align: 'right', render: money },
    { key: '__delete', title: '삭제', width: '18%', align: 'center', render: (_value, row) => <button type="button" aria-label={`${row.paymentCompany} 삭제`} onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button> },
  ]

  return (
    <Modal
      title={title}
      description={description}
      width="max-w-md"
      onClose={onClose}
      footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" onClick={() => onApply(rows)}>적용</Button></>}
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[150px_minmax(0,1fr)_auto] items-center gap-2">
          <Select value={paymentCompany} onChange={setPaymentCompany} options={options} />
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.nativeEvent?.isComposing || event.nativeEvent?.keyCode === 229) return
              event.preventDefault()
              event.stopPropagation()
              addRow()
            }}
            inputMode="numeric"
            placeholder="금액"
            className="h-[30px] min-w-0 rounded-sm border border-gray-300 bg-white px-2 text-right text-xs tabular-nums outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15"
            autoFocus
          />
          <Button size="sm" onClick={addRow}><Plus size={13} />추가</Button>
        </div>
        <div className="h-[190px] overflow-hidden rounded-md border border-gray-200">
          <FixedHeadTable columns={columns} rows={rows} rowKey={(row) => row.id} rowSize="sm" height={null} emptyText="등록된 카드 분할내역이 없습니다." />
        </div>
        <div className="flex items-center justify-end gap-3 text-sm">
          <span className="text-gray-500">{totalLabel}</span>
          <span className="font-semibold tabular-nums text-gray-900">{money(total)}</span>
        </div>
      </div>
    </Modal>
  )
}

function DiscountItemModal({ value, onClose, onSave }) {
  const [rows, setRows] = useState(() => value.map((row) => ({ ...row })))
  const [name, setName] = useState('')
  const [applyType, setApplyType] = useState('rate')
  const [rate, setRate] = useState('')
  const [amount, setAmount] = useState('')

  const addItem = () => {
    const trimmedName = name.trim()
    const appliedValue = applyType === 'rate' ? amountNumber(rate) : amountNumber(amount)
    if (!trimmedName || appliedValue <= 0) return
    setRows((prev) => [
      ...prev,
      {
        id: `discount-item-${Date.now()}`,
        name: trimmedName,
        applyType,
        rate: applyType === 'rate' ? String(appliedValue) : '',
        amount: applyType === 'amount' ? String(appliedValue) : '',
      },
    ])
    setName('')
    setRate('')
    setAmount('')
  }

  const columns = [
    { key: 'name', title: '할인항목명', width: '42%' },
    { key: 'applyType', title: '적용방식', width: '24%', align: 'center', render: (type) => type === 'rate' ? '% 할인' : '금액 할인' },
    {
      key: 'value',
      title: '할인값',
      width: '22%',
      align: 'right',
      render: (_value, row) => row.applyType === 'rate' ? `${money(row.rate)}%` : money(row.amount),
    },
    {
      key: '__delete',
      title: '삭제',
      width: '12%',
      align: 'center',
      render: (_value, row) => (
        <button type="button" aria-label={`${row.name} 삭제`} onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))} className="text-gray-400 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      ),
    },
  ]

  return (
    <Modal
      title="할인항목 관리"
      description="입금 처리에 사용할 할인 기준을 등록합니다."
      width="max-w-2xl"
      onClose={onClose}
      footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" onClick={() => onSave(rows)}>저장</Button></>}
    >
      <div className="flex flex-col gap-3">
        <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3">
          <div className="grid grid-cols-[minmax(0,1.4fr)_170px_minmax(0,1fr)_auto] items-end gap-2">
            <div className="min-w-0">
              <label className="mb-1 block text-xs text-gray-600">할인항목명</label>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="할인항목명" autoFocus className="h-[30px] w-full min-w-0 rounded-sm border border-gray-300 bg-white px-2.5 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">적용방식</label>
              <div className="grid h-[30px] grid-cols-2 overflow-hidden rounded-sm border border-gray-300 bg-white">
                <button type="button" onClick={() => setApplyType('rate')} className={`text-xs ${applyType === 'rate' ? 'bg-green-600 font-medium text-white' : 'text-gray-600 hover:bg-gray-50'}`}>% 할인</button>
                <button type="button" onClick={() => setApplyType('amount')} className={`border-l border-gray-300 text-xs ${applyType === 'amount' ? 'bg-green-600 font-medium text-white' : 'text-gray-600 hover:bg-gray-50'}`}>금액 할인</button>
              </div>
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs text-gray-600">{applyType === 'rate' ? '할인율' : '할인금액'}</label>
              <div className="relative">
                <input
                  value={applyType === 'rate' ? rate : amount ? money(amount) : ''}
                  onChange={(event) => applyType === 'rate'
                    ? setRate(event.target.value.replace(/[^0-9]/g, ''))
                    : setAmount(event.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  className={`h-[30px] w-full min-w-0 rounded-sm border border-gray-300 bg-white px-2 text-right text-xs tabular-nums text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15 ${applyType === 'rate' ? 'pr-7' : ''}`}
                />
                {applyType === 'rate' && <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>}
              </div>
            </div>
            <Button size="sm" onClick={addItem}><Plus size={13} />추가</Button>
          </div>
        </div>

        <div className="h-[250px] overflow-hidden rounded-md border border-gray-200 bg-white">
          <FixedHeadTable columns={columns} rows={rows} rowKey={(row) => row.id} rowSize="sm" height={null} emptyText="등록된 할인항목이 없습니다." />
        </div>
      </div>
    </Modal>
  )
}

export default function PaymentModal({ sale, onClose }) {
  const alert = useAlert()
  const [salesRows, setSalesRows] = useState(() => makeSalesRows(sale))
  const [selectedSaleId, setSelectedSaleId] = useState(() => makeSalesRows(sale)[0]?.id)
  const [paymentsBySale, setPaymentsBySale] = useState(() => makeInitialPayments(sale))
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [paymentDate, setPaymentDate] = useState(today)
  const [amounts, setAmounts] = useState({ cash: '', card: '', bank: '', discount: '', point: '' })
  const [cardSplits, setCardSplits] = useState([])
  const [cardSplitOpen, setCardSplitOpen] = useState(false)
  const [bankSplits, setBankSplits] = useState([])
  const [bankSplitOpen, setBankSplitOpen] = useState(false)
  const [discountSplits, setDiscountSplits] = useState([])
  const [discountSplitOpen, setDiscountSplitOpen] = useState(false)
  const [discountItems, setDiscountItems] = useState(INITIAL_DISCOUNT_ITEMS)
  const [discountItemOpen, setDiscountItemOpen] = useState(false)
  const [cashReceiptIssued, setCashReceiptIssued] = useState(false)
  const [receiptNo, setReceiptNo] = useState('')

  const selectedSale = salesRows.find((row) => row.id === selectedSaleId) ?? salesRows[0]
  const payments = paymentsBySale[selectedSale?.id] ?? []
  const selectedPayment = payments.find((row) => row.id === selectedPaymentId)
  const selectedPaymentDate = selectedPayment?.date
  const selectedPaymentGroup = selectedPaymentDate ? payments.filter((row) => row.date === selectedPaymentDate) : []
  const selectedGroupAmount = selectedPaymentGroup.reduce((sum, row) => sum + row.amount, 0)
  const cardAmount = cardSplits.reduce((sum, row) => sum + amountNumber(row.amount), 0)
  const bankAmount = bankSplits.reduce((sum, row) => sum + amountNumber(row.amount), 0)
  const discountAmount = discountSplits.reduce((sum, row) => sum + amountNumber(row.amount), 0)
  const depositAmount = amountNumber(amounts.cash) + cardAmount + bankAmount
  const settlementAmount = depositAmount + discountAmount + amountNumber(amounts.point)
  const unpaidAmount = Math.max(0, (selectedSale?.claimAmount || 0) - (selectedSale?.settledAmount || 0))
  const availableAmount = unpaidAmount + selectedGroupAmount
  const exceedsUnpaid = settlementAmount > availableAmount
  const hasReceiptTarget = amountNumber(amounts.cash) + bankAmount > 0
  const selectedPaymentSupportsReceipt = selectedPaymentGroup.some((row) => ['현금', '은행'].includes(row.type))
  const receiptActionEnabled = hasReceiptTarget || selectedPaymentSupportsReceipt

  const summaryRows = useMemo(() => salesRows.map((row) => ({
    ...row,
    unpaidAmount: Math.max(0, row.claimAmount - row.settledAmount),
  })), [salesRows])

  const paymentColumns = [
    { key: 'date', title: '입금일자', width: '21%' },
    { key: 'type', title: '입금구분', width: '17%' },
    { key: 'paymentCompany', title: '결제처', width: '22%', render: (value) => value || '-' },
    { key: 'amount', title: '결제금액', width: '22%', align: 'right', render: money },
    { key: 'receipt', title: '현금영수증', width: '18%', align: 'center', render: (value) => value ? '발행' : '-' },
  ]

  const setAmount = (key) => (event) => setAmounts((prev) => ({ ...prev, [key]: event.target.value.replace(/[^0-9]/g, '') }))
  const resetEntry = () => {
    setAmounts({ cash: '', card: '', bank: '', discount: '', point: '' })
    setCardSplits([])
    setBankSplits([])
    setDiscountSplits([])
    setPaymentDate(today())
    setCashReceiptIssued(false)
    setReceiptNo('')
    setSelectedPaymentId(null)
  }
  const addPayment = () => {
    if (!selectedSale || settlementAmount <= 0) return
    if (exceedsUnpaid) {
      alert.warning('정산계는 현재 미수액을 초과할 수 없습니다.')
      return
    }
    const timestamp = Date.now()
    const nextRows = PAYMENT_TYPES
      .filter(({ key }) => amountNumber(amounts[key]) > 0)
      .map(({ key, label }, index) => ({
        id: `${timestamp}-${index}`,
        date: paymentDate,
        type: label,
        amount: amountNumber(amounts[key]),
        receipt: ['cash', 'bank'].includes(key) && cashReceiptIssued,
        receiptNo: ['cash', 'bank'].includes(key) ? receiptNo : '',
      }))
    const nextCardRows = cardSplits.map((card, index) => ({
      id: `${timestamp}-card-${index}`,
      date: paymentDate,
      type: '카드',
      paymentCompany: card.paymentCompany,
      amount: amountNumber(card.amount),
      receipt: false,
      receiptNo: '',
    }))
    const nextBankRows = bankSplits.map((bank, index) => ({
      id: `${timestamp}-bank-${index}`,
      date: paymentDate,
      type: '은행',
      paymentCompany: bank.paymentCompany,
      amount: amountNumber(bank.amount),
      receipt: cashReceiptIssued,
      receiptNo,
    }))
    const nextDiscountRows = discountSplits.map((discount, index) => ({
      id: `${timestamp}-discount-${index}`,
      date: paymentDate,
      type: '할인',
      paymentCompany: discount.paymentCompany,
      amount: amountNumber(discount.amount),
      receipt: false,
      receiptNo: '',
    }))
    const preservedRows = selectedPaymentDate ? payments.filter((row) => row.date !== selectedPaymentDate) : payments
    setPaymentsBySale((prev) => ({ ...prev, [selectedSale.id]: [...preservedRows, ...nextRows, ...nextCardRows, ...nextBankRows, ...nextDiscountRows] }))
    setSalesRows((prev) => prev.map((row) => row.id === selectedSale.id
      ? { ...row, settledAmount: Math.max(0, row.settledAmount - selectedGroupAmount + settlementAmount) }
      : row))
    resetEntry()
  }
  const removePayment = () => {
    if (!selectedPayment) return
    setPaymentsBySale((prev) => ({ ...prev, [selectedSale.id]: payments.filter((row) => row.id !== selectedPayment.id) }))
    setSalesRows((prev) => prev.map((row) => row.id === selectedSale.id ? { ...row, settledAmount: Math.max(0, row.settledAmount - selectedPayment.amount) } : row))
    resetEntry()
  }
  const updateSelectedReceipt = (issued, number = '') => {
    if (!selectedPaymentSupportsReceipt) return
    setPaymentsBySale((prev) => ({
      ...prev,
      [selectedSale.id]: payments.map((row) => row.date === selectedPaymentDate && ['현금', '은행'].includes(row.type)
        ? { ...row, receipt: issued, receiptNo: number }
        : row),
    }))
  }
  const issueReceipt = () => {
    if (!receiptActionEnabled) return
    const nextReceiptNo = `20260727-${String(Date.now()).slice(-6)}`
    setReceiptNo(nextReceiptNo)
    setCashReceiptIssued(true)
    updateSelectedReceipt(true, nextReceiptNo)
  }
  const cancelReceipt = () => {
    setReceiptNo('')
    setCashReceiptIssued(false)
    updateSelectedReceipt(false, '')
  }
  const selectPayment = (row) => {
    const group = payments.filter((payment) => payment.date === row.date)
    const values = { cash: '', card: '', bank: '', discount: '', point: '' }
    const keyByType = { 현금: 'cash', 포인트: 'point' }
    group.forEach((payment) => {
      const key = keyByType[payment.type]
      if (key) values[key] = String(payment.amount)
    })
    setCardSplits(group.filter((payment) => payment.type === '카드').map((payment) => ({
      id: payment.id,
      paymentCompany: payment.paymentCompany || '카드사 미지정',
      amount: payment.amount,
    })))
    setBankSplits(group.filter((payment) => payment.type === '은행').map((payment) => ({
      id: payment.id,
      paymentCompany: payment.paymentCompany || '은행 미지정',
      amount: payment.amount,
    })))
    setDiscountSplits(group.filter((payment) => payment.type === '할인').map((payment) => ({
      id: payment.id,
      paymentCompany: payment.paymentCompany || '일반할인',
      amount: payment.amount,
    })))
    const receiptRow = group.find((payment) => ['현금', '은행'].includes(payment.type) && payment.receipt)
    setSelectedPaymentId(row.id)
    setPaymentDate(row.date)
    setAmounts(values)
    setCashReceiptIssued(Boolean(receiptRow))
    setReceiptNo(receiptRow?.receiptNo || '')
  }
  const toggleCashReceipt = (checked) => {
    setCashReceiptIssued(checked)
    if (selectedPaymentSupportsReceipt) updateSelectedReceipt(checked, checked ? receiptNo : '')
  }
  const fillCashWithOutstanding = () => {
    const otherSettlement = cardAmount + bankAmount + discountAmount + amountNumber(amounts.point)
    setAmounts((prev) => ({ ...prev, cash: String(Math.max(0, availableAmount - otherSettlement)) }))
  }

  return (
    <Modal
      title="입금"
      description={`RONO ${sale.id} · ${sale.carNo} · ${sale.customer}`}
      width={sale.type === '보험' ? 'max-w-[820px]' : 'max-w-[618px]'}
      onClose={onClose}
      footer={<Button onClick={onClose}>닫기</Button>}
    >
      <div className={`grid h-[560px] max-h-[calc(100vh-170px)] min-h-0 gap-3 ${sale.type === '보험' ? 'grid-cols-[190px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        {sale.type === '보험' && <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex h-9 shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3">
            <span className="text-sm font-semibold text-gray-800">매출구분</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
            {summaryRows.map((row) => {
              const active = row.id === selectedSale?.id
              const isInsurer = row.id.startsWith('insurer-')
              return (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setSelectedSaleId(row.id); setSelectedPaymentId(null); resetEntry() }}
                  className={`min-h-[82px] shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${active ? 'border-green-500 bg-green-50 ring-1 ring-green-500/20' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {sale.type === '보험' && <div className={`min-w-0 flex-1 truncate text-xs font-semibold ${active ? 'text-green-700' : 'text-gray-800'}`}>{isInsurer ? row.payer : row.category}</div>}
                    {!isInsurer && <div className={`min-w-0 flex-1 truncate text-right ${sale.type === '보험' ? 'text-[11px] text-gray-500' : 'text-sm font-semibold text-gray-800'}`}>{row.payer}</div>}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">미수액</span>
                    <span className="font-semibold tabular-nums text-red-500">{money(row.unpaidAmount)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>}

        <div className="grid min-h-0 grid-rows-[72px_minmax(132px,1fr)_278px] gap-3">
          <section className="flex min-w-0 items-center gap-4 rounded-md border border-gray-200 bg-white px-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-800">
                {selectedSale?.id.startsWith('insurer-') ? selectedSale.payer : sale.type === '보험' ? selectedSale?.category : '전체 매출'}
              </div>
              {!selectedSale?.id.startsWith('insurer-') && <div className="mt-1 truncate text-xs text-gray-500">{selectedSale?.payer}</div>}
            </div>
            <div className="grid shrink-0 grid-cols-3 divide-x divide-gray-100">
              {[
                ['청구액', selectedSale?.claimAmount, 'text-gray-800'],
                ['정산계', selectedSale?.settledAmount, 'text-gray-800'],
                ['미수액', unpaidAmount, 'text-red-500'],
              ].map(([label, value, color]) => (
                <div key={label} className="min-w-[92px] px-3 text-right">
                  <div className="text-[11px] text-gray-400">{label}</div>
                  <div className={`mt-1 text-xs font-semibold tabular-nums ${color}`}>{money(value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-50 px-3">
              <span className="text-sm font-semibold text-gray-800">입금목록</span>
              <div className="ml-auto flex gap-1.5">
                <Button size="sm" onClick={resetEntry}><Plus size={13} />입금추가</Button>
                <Button size="sm" variant="danger" disabled={!selectedPaymentId} onClick={removePayment}><Trash2 size={13} />입금삭제</Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <FixedHeadTable
                columns={paymentColumns}
                rows={payments}
                rowKey={(row) => row.id}
                rowSize="sm"
                height={null}
                selectedKey={selectedPaymentId}
                onRowClick={selectPayment}
                emptyText="선택한 매출구분의 입금내역이 없습니다."
              />
            </div>
          </section>

          <section className="min-h-0 overflow-hidden rounded-md border border-gray-200 bg-white p-2.5">
            <div className="mb-2 flex items-center gap-2">
              <Banknote size={15} className="text-green-600" />
              <span className="text-sm font-semibold text-gray-800">입금 입력</span>
              <Button size="sm" className="ml-auto" onClick={() => setDiscountItemOpen(true)}>할인항목 관리</Button>
            </div>
            <div className="grid min-h-0 grid-cols-[260px_minmax(0,1fr)] gap-5">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2">
                  <label className="text-xs text-gray-600">입금일자</label>
                  <input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} className="h-[30px] min-w-0 rounded-sm border border-gray-300 bg-white px-2 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" />
                </div>
                <AmountField
                  label="현금"
                  icon={Banknote}
                  value={amounts.cash}
                  onChange={setAmount('cash')}
                  action={<button type="button" onClick={fillCashWithOutstanding} className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 bg-white px-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50">전액</button>}
                />
                <AmountField
                  label="카드"
                  icon={CreditCard}
                  value={money(cardAmount)}
                  readOnly
                  action={<button type="button" onClick={() => setCardSplitOpen(true)} className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 bg-white px-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50">분할</button>}
                />
                <AmountField
                  label="은행"
                  icon={Landmark}
                  value={money(bankAmount)}
                  readOnly
                  action={<button type="button" onClick={() => setBankSplitOpen(true)} className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 bg-white px-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50">분할</button>}
                />
                <AmountField
                  label="할인"
                  value={money(discountAmount)}
                  readOnly
                  action={<button type="button" onClick={() => setDiscountSplitOpen(true)} className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 bg-white px-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50">분할</button>}
                />
                <AmountField label="포인트" value={amounts.point} onChange={setAmount('point')} />
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <span className="text-gray-500">입금액</span><span className="text-right font-medium tabular-nums text-gray-800">{money(depositAmount)}</span>
                  <span className="text-gray-500">정산계</span><span className="text-right font-semibold tabular-nums text-gray-900">{money(settlementAmount)}</span>
                  <span className="text-gray-500">미수액</span><span className="text-right font-medium tabular-nums text-red-500">{money(unpaidAmount)}</span>
                </div>
                <div className="my-3 border-t border-gray-100" />
                <div className="flex items-center gap-2">
                  <input id="cash-receipt-issued" type="checkbox" checked={cashReceiptIssued || Boolean(receiptNo)} onChange={(event) => toggleCashReceipt(event.target.checked)} disabled={!receiptActionEnabled && !receiptNo} className="accent-green-600" />
                  <label htmlFor="cash-receipt-issued" className="text-xs text-gray-700">현금영수증 발행</label>
                </div>
                <input value={receiptNo} readOnly placeholder="국세청 신고 후 발행번호 자동 입력" className="mt-1.5 h-[30px] w-full min-w-0 rounded-sm border border-gray-200 bg-gray-50 px-2 text-xs text-gray-600 outline-none" />
                <div className="mt-2 flex justify-end gap-1.5">
                  <Button size="sm" disabled={!receiptActionEnabled} onClick={issueReceipt}><ReceiptText size={13} />국세청 신고</Button>
                  <Button size="sm" disabled={!receiptNo} onClick={cancelReceipt}>발행 취소</Button>
                </div>
                <Button variant="primary" size="sm" className="mt-auto w-full" disabled={settlementAmount <= 0} onClick={addPayment}>{selectedPaymentDate ? '입금 수정' : '입금 적용'}</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {cardSplitOpen && <PaymentSplitModal title="카드 분할입금" description="카드사별 결제금액을 추가합니다." options={CARD_COMPANIES} companyTitle="카드사" totalLabel="카드 합계" value={cardSplits} onClose={() => setCardSplitOpen(false)} onApply={(rows) => { setCardSplits(rows); setCardSplitOpen(false) }} />}
      {bankSplitOpen && <PaymentSplitModal title="은행 분할입금" description="은행별 입금금액을 추가합니다." options={BANK_COMPANIES} companyTitle="은행" totalLabel="은행 합계" value={bankSplits} onClose={() => setBankSplitOpen(false)} onApply={(rows) => { setBankSplits(rows); setBankSplitOpen(false) }} />}
      {discountSplitOpen && <PaymentSplitModal title="할인 분할처리" description="할인구분별 금액을 추가합니다." options={discountItems.map((item) => item.name)} companyTitle="할인구분" totalLabel="할인 합계" value={discountSplits} onClose={() => setDiscountSplitOpen(false)} onApply={(rows) => { setDiscountSplits(rows); setDiscountSplitOpen(false) }} />}
      {discountItemOpen && <DiscountItemModal value={discountItems} onClose={() => setDiscountItemOpen(false)} onSave={(rows) => { setDiscountItems(rows); setDiscountItemOpen(false) }} />}
    </Modal>
  )
}
