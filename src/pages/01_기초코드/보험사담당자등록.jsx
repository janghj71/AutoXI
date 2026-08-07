import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, UserRound, X } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import TelField from '../../components/TelField'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'

const EMPTY_FORM = { id: '', insurerCode: '', insurerName: '', manager: '', mobile: ['', '', ''], fax: ['', '', ''], email: '', memo: '' }
const INITIAL_ROWS = [
  { ...EMPTY_FORM, id: '1', insurerCode: '08', insurerName: '삼성화재', manager: '삼성담당자', mobile: ['010', '6724', '0037'], fax: ['031', '1234', '1234'], email: 'muyaimma@gmail.com', memo: '' },
  { ...EMPTY_FORM, id: '2', insurerCode: '08', insurerName: '삼성화재', manager: '이재범', mobile: ['010', '6299', '9015'], fax: ['02', '424', '1901'], email: 'jungdh@intravan.com', memo: '' },
  { ...EMPTY_FORM, id: '3', insurerCode: '08', insurerName: '삼성화재', manager: '이재철', mobile: ['010', '4295', '2114'], fax: ['02', '419', '8096'], email: 'jungdh@intravan.com', memo: '' },
  { ...EMPTY_FORM, id: '4', insurerCode: '01', insurerName: '메리츠', manager: '장현정', mobile: ['010', '1111', '2222'], fax: ['02', '111', '2222'], email: 'manager@meritz.com', memo: '' },
]
const joinTel = (parts) => parts.filter(Boolean).join('-')

export default function InsurerManagerPage({ navigationContext }) {
  const alert = useAlert()
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [query, setQuery] = useState(navigationContext?.insurerCode ?? '')
  const [selectedId, setSelectedId] = useState('1')
  const [modalMode, setModalMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const displayedRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return rows.filter((row) => !keyword || [row.insurerCode, row.insurerName, row.manager, joinTel(row.mobile), joinTel(row.fax), row.email].some((value) => value.toLowerCase().includes(keyword)))
  }, [query, rows])

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
  const closeModal = () => setModalMode(null)
  const openNew = () => {
    const selectedRow = rows.find((row) => row.id === selectedId)
    if (!selectedRow) {
      alert.warning('신규 담당자를 등록할 보험사 행을 먼저 선택해 주세요.')
      return
    }
    const nextId = String(Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1)
    setForm({ ...EMPTY_FORM, id: nextId, insurerCode: selectedRow.insurerCode, insurerName: selectedRow.insurerName, mobile: ['', '', ''], fax: ['', '', ''] })
    setModalMode('new')
  }
  const openEdit = (row) => {
    setForm({ ...row, mobile: [...row.mobile], fax: [...row.fax] })
    setModalMode('edit')
  }
  const save = async (continueNew = false) => {
    if (!form.manager.trim()) return alert.warning('담당자명을 입력해 주세요.')
    if (modalMode === 'new') setRows((prev) => [...prev, form])
    else setRows((prev) => prev.map((row) => row.id === form.id ? form : row))
    setSelectedId(form.id)
    if (continueNew) {
      const nextId = String(Math.max(Number(form.id), ...rows.map((row) => Number(row.id) || 0)) + 1)
      setForm((prev) => ({ ...EMPTY_FORM, id: nextId, insurerCode: prev.insurerCode, insurerName: prev.insurerName, mobile: ['', '', ''], fax: ['', '', ''] }))
      setModalMode('new')
      return
    }
    closeModal()
    await alert.success(`보험사 담당자가 ${modalMode === 'new' ? '등록' : '수정'}되었습니다.`)
  }
  const remove = async (row) => {
    if (!(await alert.remove(`'${row.manager}' 담당자를 삭제하시겠습니까?`))) return
    setRows((prev) => prev.filter((item) => item.id !== row.id))
    if (selectedId === row.id) setSelectedId(null)
  }

  const columns = [
    { key: 'insurerCode', title: '보험사코드', width: '10%', align: 'center' },
    { key: 'insurerName', title: '보험사명', width: '16%' },
    { key: 'manager', title: '담당자명', width: '15%' },
    { key: 'mobile', title: '휴대번호', width: '16%', render: joinTel },
    { key: 'fax', title: '팩스번호', width: '16%', render: joinTel },
    { key: 'email', title: '이메일', width: '20%' },
    { key: '__actions', title: '관리', width: '7%', align: 'center', render: (_value, row) => <div className="flex justify-center gap-2"><button type="button" aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(row) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button><button type="button" aria-label="삭제" onClick={(event) => { event.stopPropagation(); remove(row) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div> },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader title="보험사담당자등록" description="보험사별 담당자 연락처를 등록하고 관리합니다." icon={UserRound} actions={<Button variant="primary" onClick={openNew}><Plus size={15} />신규 등록</Button>} />
      <div className="flex-1 overflow-auto p-3">
        <SectionCard title="보험사 담당자 목록" tag={`총 ${displayedRows.length}명`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 max-w-lg flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
              <Search size={15} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="보험사, 담당자명, 휴대번호, 팩스번호, 이메일 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
          </div>
          <FixedHeadTable columns={columns} rows={displayedRows} rowKey={(row) => row.id} rowSize="sm" height={450} selectedKey={selectedId} onRowClick={(row) => setSelectedId(row.id)} onRowDoubleClick={openEdit} emptyText="등록된 보험사 담당자가 없습니다." />
          <div className="pt-2.5 text-[11px] text-gray-400">보험사 행을 선택한 뒤 신규 등록하면 같은 보험사 담당자로 등록되며, 행을 더블클릭하면 수정할 수 있습니다.</div>
        </SectionCard>
      </div>

      {modalMode && (
        <Modal title={`보험사 담당자 ${modalMode === 'new' ? '등록' : '수정'}`} description="보험사 정보는 변경할 수 없으며 담당자 정보만 입력합니다." size="md" onClose={closeModal} footer={<><Button onClick={closeModal}>취소</Button>{modalMode === 'new' && <Button onClick={() => save(true)}>저장 후 신규</Button>}<Button variant="primary" onClick={() => save(false)}>저장</Button></>}>
          <div>
            <div className="mb-2 text-xs font-semibold text-gray-800">보험사 정보</div>
            <div className="flex flex-col gap-2">
              <FormField label="보험사코드" labelWidth="w-20" value={form.insurerCode} readOnly />
              <FormField label="보험사명" labelWidth="w-20" value={form.insurerName} readOnly />
            </div>

            <div className="mt-5 mb-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-800">담당자 정보</div>
            <div className="flex flex-col gap-2">
              <FormField label="담당자명" labelWidth="w-20" value={form.manager} onChange={setField('manager')} autoFocus />
              <FormField label="휴대전화" labelWidth="w-20"><TelField value={form.mobile} onChange={setValue('mobile')} /></FormField>
              <FormField label="팩스번호" labelWidth="w-20"><TelField value={form.fax} onChange={setValue('fax')} /></FormField>
              <FormField label="이메일" labelWidth="w-20" value={form.email} onChange={setField('email')} type="email" />
              <FormField label="메모" labelWidth="w-20" align="start"><textarea value={form.memo} onChange={setField('memo')} rows={4} className="w-full resize-y rounded-sm border border-gray-300 px-3 py-2 text-xs focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15" /></FormField>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
