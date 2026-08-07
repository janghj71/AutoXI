import { useMemo, useState } from 'react'
import { Building2, CreditCard, Landmark, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import SectionTabs from '../../components/SectionTabs'
import Select from '../../components/Select'
import TelField from '../../components/TelField'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'

const TABS = [
  { id: 'card', label: '카드사', icon: CreditCard },
  { id: 'bank', label: '은행', icon: Landmark },
]
const EMPTY_CARD = { code: '', name: '', telephone: ['', '', ''], memo: '', bankCode: '', feeRate: '0' }
const EMPTY_BANK = { code: '', name: '', telephone: ['', '', ''], holder: '', accountNo: '', printOnDocument: false, memo: '' }
const INITIAL_BANKS = [
  { ...EMPTY_BANK, code: '001', name: '국민은행', telephone: ['1588', '9999', ''], holder: '오토세븐', accountNo: '123-456-789012', printOnDocument: true },
  { ...EMPTY_BANK, code: '002', name: '신한은행', telephone: ['1577', '8000', ''], holder: '오토세븐', accountNo: '110-123-456789', printOnDocument: false },
]
const INITIAL_CARDS = [
  { ...EMPTY_CARD, code: '001', name: '국민카드', telephone: ['1588', '1688', ''], bankCode: '001', feeRate: '2.3', memo: '' },
  { ...EMPTY_CARD, code: '002', name: '신한카드', telephone: ['1544', '7000', ''], bankCode: '002', feeRate: '2.1', memo: '' },
]
const joinTel = (parts) => parts.filter(Boolean).join('-')

export default function CardBankPage() {
  const alert = useAlert()
  const [activeTab, setActiveTab] = useState('card')
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [banks, setBanks] = useState(INITIAL_BANKS)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')
  const [selectedCode, setSelectedCode] = useState(null)
  const [modalMode, setModalMode] = useState(null)
  const [form, setForm] = useState(EMPTY_CARD)

  const bankOptions = banks.map((bank) => ({ value: bank.code, label: bank.name }))
  const rows = activeTab === 'card' ? cards : banks
  const displayedRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = !keyword ? rows : rows.filter((row) =>
      [row.code, row.name, joinTel(row.telephone), row.memo, row.holder, row.accountNo]
        .some((value) => String(value ?? '').toLowerCase().includes(keyword)),
    )
    return [...filtered].sort((a, b) => sort === 'code' ? a.code.localeCompare(b.code) : a.name.localeCompare(b.name, 'ko'))
  }, [query, rows, sort])

  const changeTab = (id) => {
    setActiveTab(id)
    setQuery('')
    setSelectedCode(null)
  }
  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
  const closeModal = () => setModalMode(null)
  const openNew = () => {
    const nextCode = String(Math.max(0, ...rows.map((row) => Number(row.code) || 0)) + 1).padStart(3, '0')
    setForm(activeTab === 'card'
      ? { ...EMPTY_CARD, code: nextCode, telephone: ['', '', ''] }
      : { ...EMPTY_BANK, code: nextCode, telephone: ['', '', ''] })
    setModalMode('new')
  }
  const openEdit = (row) => {
    setForm({ ...row, telephone: [...row.telephone] })
    setModalMode('edit')
  }
  const save = async () => {
    if (!form.name.trim()) return alert.warning(`${activeTab === 'card' ? '카드사명' : '은행명'}을 입력해 주세요.`)
    const setter = activeTab === 'card' ? setCards : setBanks
    setter((prev) => modalMode === 'new' ? [...prev, form] : prev.map((row) => row.code === form.code ? form : row))
    setSelectedCode(form.code)
    closeModal()
    await alert.success(`${activeTab === 'card' ? '카드사' : '은행'} 정보가 ${modalMode === 'new' ? '등록' : '수정'}되었습니다.`)
  }
  const remove = async (row) => {
    if (!(await alert.remove(`'${row.name}' 정보를 삭제하시겠습니까?`))) return
    const setter = activeTab === 'card' ? setCards : setBanks
    setter((prev) => prev.filter((item) => item.code !== row.code))
    if (selectedCode === row.code) setSelectedCode(null)
  }

  const actionsColumn = {
    key: '__actions', title: '관리', width: '10%', align: 'center', render: (_value, row) => (
      <div className="flex justify-center gap-2">
        <button type="button" aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(row) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button>
        <button type="button" aria-label="삭제" onClick={(event) => { event.stopPropagation(); remove(row) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
    ),
  }
  const cardColumns = [
    { key: 'code', title: '코드', width: '10%', align: 'center' },
    { key: 'name', title: '카드사명', width: '25%' },
    { key: 'telephone', title: '전화번호', width: '20%', render: joinTel },
    { key: 'bankCode', title: '결제은행', width: '20%', render: (value) => banks.find((bank) => bank.code === value)?.name ?? '' },
    { key: 'feeRate', title: '수수료율', width: '15%', align: 'right', render: (value) => `${value}%` },
    actionsColumn,
  ]
  const bankColumns = [
    { key: 'code', title: '코드', width: '10%', align: 'center' },
    { key: 'name', title: '은행명', width: '20%' },
    { key: 'holder', title: '예금주', width: '17%' },
    { key: 'accountNo', title: '계좌번호', width: '25%' },
    { key: 'telephone', title: '전화번호', width: '18%', render: joinTel },
    actionsColumn,
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader title="카드·은행등록" description="카드사와 은행 정보를 등록하고 관리합니다." icon={Building2} actions={<Button variant="primary" onClick={openNew}><Plus size={15} />{activeTab === 'card' ? '카드사' : '은행'} 등록</Button>} />
      <div className="shrink-0 bg-gray-50 px-4 pt-2"><SectionTabs tabs={TABS} activeId={activeTab} onChange={changeTab} /></div>
      <div className="flex-1 overflow-auto p-3">
        <SectionCard title={activeTab === 'card' ? '카드사 목록' : '은행 목록'} tag={`총 ${displayedRows.length}건`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 max-w-xl flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
              <Search size={15} className="text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${activeTab === 'card' ? '카드사명' : '은행명'}, 코드, 전화번호 검색`} className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
            <div className="ml-auto w-32"><Select value={sort} onChange={setSort} options={[{ value: 'name', label: '이름순' }, { value: 'code', label: '코드순' }]} /></div>
          </div>
          <FixedHeadTable columns={activeTab === 'card' ? cardColumns : bankColumns} rows={displayedRows} rowKey={(row) => row.code} rowSize="sm" height={420} selectedKey={selectedCode} onRowClick={(row) => setSelectedCode(row.code)} onRowDoubleClick={openEdit} emptyText={`등록된 ${activeTab === 'card' ? '카드사' : '은행'}가 없습니다.`} />
          <div className="flex justify-between pt-2.5 text-[11px] text-gray-400"><span>행을 더블클릭하면 수정할 수 있습니다.</span><span>1 / 1 페이지</span></div>
        </SectionCard>
      </div>

      {modalMode && (
        <Modal title={`${activeTab === 'card' ? '카드사' : '은행'} ${modalMode === 'new' ? '등록' : '수정'}`} description={`${activeTab === 'card' ? '카드사' : '은행'} 기본정보를 입력합니다.`} size="md" onClose={closeModal} footer={<><Button onClick={closeModal}>취소</Button><Button variant="primary" onClick={save}>{modalMode === 'new' ? '등록' : '저장'}</Button></>}>
          <div className="flex flex-col gap-2.5">
            <FormField label="코드" labelWidth="w-20" value={form.code} readOnly />
            <FormField label={activeTab === 'card' ? '카드사명' : '은행명'} labelWidth="w-20" value={form.name} onChange={setField('name')} autoFocus />
            <FormField label="전화번호" labelWidth="w-20"><TelField value={form.telephone} onChange={setValue('telephone')} /></FormField>
            {activeTab === 'card' ? (
              <>
                <FormField label="결제은행" labelWidth="w-20"><Select className="flex-1" value={form.bankCode} onChange={setValue('bankCode')} options={bankOptions} placeholder="은행 선택" /></FormField>
                <FormField label="수수료율" labelWidth="w-20" value={form.feeRate} onChange={setField('feeRate')} type="number" suffix="%" />
              </>
            ) : (
              <>
                <FormField label="예금주명" labelWidth="w-20" value={form.holder} onChange={setField('holder')} />
                <FormField label="계좌번호" labelWidth="w-20" value={form.accountNo} onChange={setField('accountNo')} />
                <FormField label="" labelWidth="w-20">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700">
                    <input type="checkbox" checked={form.printOnDocument} onChange={(event) => setForm((prev) => ({ ...prev, printOnDocument: event.target.checked }))} className="accent-green-600" />
                    인쇄 시 출력
                  </label>
                </FormField>
              </>
            )}
            <FormField label="메모" labelWidth="w-20" align="start"><textarea value={form.memo} onChange={setField('memo')} rows={4} className="w-full resize-y rounded-sm border border-gray-300 px-3 py-2 text-xs focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15" /></FormField>
          </div>
        </Modal>
      )}
    </div>
  )
}
