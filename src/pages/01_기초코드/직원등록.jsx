import { useMemo, useRef, useState } from 'react'
import { Building2, Download, Pencil, Plus, Printer, Search, Trash2, UserRound, X } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import Select from '../../components/Select'
import TelField from '../../components/TelField'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'
import { openPostcodeSearch } from '../../utils/postcode'

const STATUS_OPTIONS = [
  { value: 'working', label: '근무' },
  { value: 'leave', label: '휴직' },
  { value: 'retired', label: '퇴사' },
]
const INITIAL_DEPARTMENTS = [
  { code: '001', name: '정비부' },
  { code: '002', name: '판금부' },
  { code: '003', name: '도장부' },
  { code: '004', name: '관리부' },
]
const EMPTY_FORM = {
  code: '', name: '', position: '', department: '', telephone: ['', '', ''], mobile: ['', '', ''],
  joinedAt: '', retiredAt: '', status: 'working', postcode: '', address1: '', address2: '', memo: '', seal: '', sealName: '',
}
const INITIAL_ROWS = [
  { ...EMPTY_FORM, code: '0001', name: '김정비', position: '과장', department: '정비부', telephone: ['02', '424', '1901'], mobile: ['010', '1234', '5678'], joinedAt: '2024-01-02', status: 'working', postcode: '12925', address1: '경기도 하남시 미사대로 520', address2: 'C동 7층' },
  { ...EMPTY_FORM, code: '0002', name: '이판금', position: '대리', department: '판금부', telephone: ['02', '424', '1902'], mobile: ['010', '2345', '6789'], joinedAt: '2023-03-10', status: 'leave' },
  { ...EMPTY_FORM, code: '0003', name: '박퇴사', position: '사원', department: '관리부', mobile: ['010', '3456', '7890'], joinedAt: '2021-05-01', retiredAt: '2025-12-31', status: 'retired' },
]
const inputClass = 'w-full min-w-0 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15 disabled:bg-gray-50 disabled:text-gray-400'
const joinTel = (parts) => parts.filter(Boolean).join('-')

export default function EmployeePage() {
  const alert = useAlert()
  const detailAddressRef = useRef(null)
  const fileInputRef = useRef(null)
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [query, setQuery] = useState('')
  const [showRetired, setShowRetired] = useState(false)
  const [sort, setSort] = useState('code')
  const [selectedCode, setSelectedCode] = useState('0001')
  const [modalMode, setModalMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [sealDragging, setSealDragging] = useState(false)
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS)
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const [editingDepartmentCode, setEditingDepartmentCode] = useState(null)
  const [departmentName, setDepartmentName] = useState('')

  const departmentOptions = departments.map((department) => ({ value: department.name, label: department.name }))

  const displayedRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      if (!showRetired && row.status === 'retired') return false
      return !keyword || [row.code, row.name, row.position, row.department, joinTel(row.telephone), joinTel(row.mobile), row.address1]
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko')
      if (sort === 'joinedAt') return b.joinedAt.localeCompare(a.joinedAt)
      return a.code.localeCompare(b.code)
    })
  }, [query, rows, showRetired, sort])

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
  const closeModal = () => setModalMode(null)
  const openNew = () => {
    const nextCode = String(Math.max(0, ...rows.map((row) => Number(row.code) || 0)) + 1).padStart(4, '0')
    setForm({ ...EMPTY_FORM, code: nextCode, telephone: ['', '', ''], mobile: ['', '', ''] })
    setSealDragging(false)
    setModalMode('new')
  }
  const openEdit = (row) => {
    setForm({ ...row, telephone: [...row.telephone], mobile: [...row.mobile] })
    setSealDragging(false)
    setModalMode('edit')
  }
  const save = async () => {
    if (!form.name.trim()) return alert.warning('직원명을 입력해 주세요.')
    if (form.status === 'retired' && !form.retiredAt) return alert.warning('퇴사일자를 입력해 주세요.')
    const next = form.status === 'retired' ? form : { ...form, retiredAt: '' }
    if (modalMode === 'new') setRows((prev) => [...prev, next])
    else setRows((prev) => prev.map((row) => row.code === form.code ? next : row))
    setSelectedCode(form.code)
    closeModal()
    await alert.success(`직원 정보가 ${modalMode === 'new' ? '등록' : '수정'}되었습니다.`)
  }
  const remove = async (row) => {
    if (!(await alert.remove(`'${row.name}' 직원을 삭제하시겠습니까?`))) return
    setRows((prev) => prev.filter((item) => item.code !== row.code))
    if (selectedCode === row.code) setSelectedCode(null)
  }
  const searchPostcode = async () => {
    try {
      const result = await openPostcodeSearch()
      if (!result) return
      setForm((prev) => ({ ...prev, postcode: result.zonecode, address1: result.address, address2: '' }))
      requestAnimationFrame(() => detailAddressRef.current?.focus())
    } catch (error) {
      alert.error(error instanceof Error ? error.message : '우편번호 검색을 시작하지 못했습니다.')
    }
  }
  const applySealFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return alert.warning('이미지 파일을 선택해 주세요.')
    const reader = new FileReader()
    reader.onload = () => setForm((prev) => ({ ...prev, seal: String(reader.result), sealName: file.name }))
    reader.readAsDataURL(file)
  }
  const selectSeal = (event) => {
    applySealFile(event.target.files?.[0])
    event.target.value = ''
  }
  const dropSeal = (event) => {
    event.preventDefault()
    setSealDragging(false)
    applySealFile(event.dataTransfer.files?.[0])
  }

  const resetDepartmentForm = () => {
    setEditingDepartmentCode(null)
    setDepartmentName('')
  }
  const openDepartmentManager = () => {
    resetDepartmentForm()
    setDepartmentModalOpen(true)
  }
  const editDepartment = (department) => {
    setEditingDepartmentCode(department.code)
    setDepartmentName(department.name)
  }
  const saveDepartment = async () => {
    const name = departmentName.trim()
    if (!name) return alert.warning('부서명을 입력해 주세요.')
    if (departments.some((department) => department.code !== editingDepartmentCode && department.name.toLowerCase() === name.toLowerCase())) return alert.warning('이미 등록된 부서명입니다.')

    if (editingDepartmentCode) {
      const previousName = departments.find((department) => department.code === editingDepartmentCode)?.name
      setDepartments((prev) => prev.map((department) => department.code === editingDepartmentCode ? { ...department, name } : department))
      if (previousName !== name) setRows((prev) => prev.map((employee) => employee.department === previousName ? { ...employee, department: name } : employee))
    } else {
      const code = String(Math.max(0, ...departments.map((department) => Number(department.code) || 0)) + 1).padStart(3, '0')
      setDepartments((prev) => [...prev, { code, name }])
    }
    resetDepartmentForm()
  }
  const deleteDepartment = async (department) => {
    if (rows.some((employee) => employee.department === department.name)) return alert.warning('직원이 사용 중인 부서는 삭제할 수 없습니다.')
    if (!(await alert.remove(`'${department.name}' 부서를 삭제하시겠습니까?`))) return
    setDepartments((prev) => prev.filter((item) => item.code !== department.code))
    if (editingDepartmentCode === department.code) resetDepartmentForm()
  }

  const columns = [
    { key: 'code', title: '코드', width: '7%', align: 'center' },
    { key: 'name', title: '직원명', width: '11%' },
    { key: 'telephone', title: '전화번호', width: '12%', render: joinTel },
    { key: 'mobile', title: '휴대번호', width: '12%', render: joinTel },
    { key: 'joinedAt', title: '입사일자', width: '10%', align: 'center' },
    { key: 'retiredAt', title: '퇴사일자', width: '10%', align: 'center' },
    { key: 'status', title: '상태', width: '8%', align: 'center', render: (value) => STATUS_OPTIONS.find((option) => option.value === value)?.label },
    { key: 'address1', title: '주소', width: '16%', render: (value, row) => `${value} ${row.address2}`.trim() },
    { key: 'position', title: '직위', width: '7%' },
    { key: '__actions', title: '관리', width: '7%', align: 'center', render: (_value, row) => <div className="flex justify-center gap-2"><button type="button" aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(row) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button><button type="button" aria-label="삭제" onClick={(event) => { event.stopPropagation(); remove(row) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div> },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader title="직원등록" description="직원 정보와 점검정비 견적서 작성자 인감을 관리합니다." icon={UserRound} actions={<><Button onClick={() => alert.info('인쇄 기능은 API 연결 단계에서 적용합니다.')}><Printer size={14} />인쇄</Button><Button onClick={() => alert.info('엑셀 내보내기는 API 연결 단계에서 적용합니다.')}><Download size={14} />엑셀</Button><Button onClick={openDepartmentManager}><Building2 size={14} />부서관리</Button><Button variant="primary" onClick={openNew}><Plus size={15} />신규 등록</Button></>} />
      <div className="flex-1 overflow-auto p-3">
        <SectionCard title="직원 목록" tag={`총 ${displayedRows.length}명`}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 max-w-xl flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
              <Search size={15} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="코드, 직원명, 전화번호, 주소, 직위 검색" className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
            <label className="flex items-center gap-1.5 text-xs text-gray-700"><input type="checkbox" checked={showRetired} onChange={(event) => setShowRetired(event.target.checked)} className="accent-green-600" />퇴사자 보기</label>
            <div className="ml-auto w-32"><Select value={sort} onChange={setSort} options={[{ value: 'code', label: '코드순' }, { value: 'name', label: '직원명순' }, { value: 'joinedAt', label: '최근입사순' }]} /></div>
          </div>
          <FixedHeadTable columns={columns} rows={displayedRows} rowKey={(row) => row.code} rowSize="sm" height={420} selectedKey={selectedCode} onRowClick={(row) => setSelectedCode(row.code)} onRowDoubleClick={openEdit} emptyText="등록된 직원이 없습니다." />
          <div className="flex justify-between pt-2.5 text-[11px] text-gray-400"><span>행을 더블클릭하면 수정할 수 있습니다.</span><span>1 / 1 페이지</span></div>
        </SectionCard>
      </div>

      {modalMode && (
        <Modal title={`직원 ${modalMode === 'new' ? '등록' : '수정'}`} description="직원 기본정보와 점검정비 견적서 작성자 인감을 입력합니다." size="lg" onClose={closeModal} footer={<><Button onClick={closeModal}>취소</Button><Button variant="primary" onClick={save}>{modalMode === 'new' ? '등록' : '저장'}</Button></>}>
          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="mb-2 text-xs font-semibold text-gray-800">기본정보</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <FormField label="코드" labelWidth="w-16" value={form.code} readOnly />
              <FormField label="직위" labelWidth="w-16" value={form.position} onChange={setField('position')} />
              <FormField label="이름" labelWidth="w-16" value={form.name} onChange={setField('name')} autoFocus />
              <FormField label="부서" labelWidth="w-16"><Select className="flex-1" value={form.department} onChange={setValue('department')} options={departmentOptions} placeholder="부서 선택" /></FormField>
              <FormField label="전화번호" labelWidth="w-16"><TelField value={form.telephone} onChange={setValue('telephone')} /></FormField>
              <FormField label="입사일자" labelWidth="w-16" value={form.joinedAt} onChange={setField('joinedAt')} type="date" />
              <FormField label="휴대전화" labelWidth="w-16"><TelField value={form.mobile} onChange={setValue('mobile')} /></FormField>
              <FormField label="퇴사일자" labelWidth="w-16" value={form.retiredAt} onChange={setField('retiredAt')} type="date" disabled={form.status !== 'retired'} />
              <div />
              <FormField label="상태" labelWidth="w-16"><Select className="flex-1" value={form.status} onChange={setValue('status')} options={STATUS_OPTIONS} /></FormField>
              <FormField label="우편번호" labelWidth="w-16"><div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5"><input value={form.postcode} readOnly className={`${inputClass} bg-gray-50 text-center`} /><span className="invisible">-</span><div className="col-span-3"><Button className="h-[30px] px-3 text-xs" onClick={searchPostcode}>우편번호 찾기</Button></div></div></FormField>
              <div />
              <FormField label="기본주소" labelWidth="w-16" className="col-span-2" value={form.address1} readOnly />
              <FormField label="상세주소" labelWidth="w-16" className="col-span-2"><input ref={detailAddressRef} value={form.address2} onChange={setField('address2')} placeholder="상세주소 입력" className={inputClass} /></FormField>
              <FormField label="메모" labelWidth="w-16" className="col-span-2" align="start"><textarea value={form.memo} onChange={setField('memo')} rows={3} className={`${inputClass} resize-y`} /></FormField>
            </div>

            <div className="mt-5 mb-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-800">점검정비 견적서 작성자 인감</div>
            <div className="flex items-start gap-3 pl-18">
              <div
                onDragEnter={(event) => { event.preventDefault(); setSealDragging(true) }}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSealDragging(false) }}
                onDrop={dropSeal}
                className={`flex size-28 items-center justify-center overflow-hidden rounded-md border border-dashed text-center text-[11px] transition-colors ${sealDragging ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-400'}`}
              >
                {sealDragging ? '여기에 놓아주세요' : form.seal ? <img src={form.seal} alt="점검정비 견적서 작성자 인감" className="h-full w-full object-contain p-2" /> : <span className="px-2">이미지를 끌어 놓거나 등록을 눌러주세요.</span>}
              </div>
              <div className="flex flex-col items-start gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={selectSeal} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()}><Plus size={14} />{form.seal ? '변경' : '등록'}</Button>
                <Button variant="ghost" disabled={!form.seal} onClick={() => setForm((prev) => ({ ...prev, seal: '', sealName: '' }))}><Trash2 size={14} />삭제</Button>
                {form.sealName && <span className="max-w-48 truncate text-[11px] text-gray-400">{form.sealName}</span>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {departmentModalOpen && (
        <Modal
          title="부서관리"
          description="직원 등록에서 사용할 부서를 관리합니다."
          size="md"
          onClose={() => setDepartmentModalOpen(false)}
          footer={<Button onClick={() => setDepartmentModalOpen(false)}>닫기</Button>}
        >
          <div className="flex min-h-[420px] flex-col gap-3">
            {editingDepartmentCode ? (
              <div className="flex h-9 items-center justify-end gap-2">
                <Button onClick={resetDepartmentForm}>취소</Button>
                <Button variant="primary" onClick={saveDepartment}>저장</Button>
              </div>
            ) : (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input
                  value={departmentName}
                  onChange={(event) => setDepartmentName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); saveDepartment() }
                  }}
                  placeholder="부서명"
                  data-modal-autofocus
                  className={`${inputClass} h-9`}
                />
                <Button variant="primary" onClick={saveDepartment}>추가</Button>
              </div>
            )}
            <FixedHeadTable
              columns={[
                { key: 'code', title: '부서코드', width: '25%' },
                {
                  key: 'name', title: '부서명', width: '55%', render: (value, department) => editingDepartmentCode === department.code ? (
                    <input
                      value={departmentName}
                      onChange={(event) => setDepartmentName(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        event.stopPropagation()
                        if (event.key === 'Enter') { event.preventDefault(); saveDepartment() }
                        if (event.key === 'Escape') { event.preventDefault(); resetDepartmentForm() }
                      }}
                      autoFocus
                      className="-mx-2 h-7 w-[calc(100%+1rem)] rounded-sm border border-green-400 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600/15"
                    />
                  ) : value,
                },
                {
                  key: '__actions', title: '관리', width: '20%', align: 'center', render: (_value, department) => editingDepartmentCode === department.code ? null : (
                    <div className="flex justify-center gap-2">
                      <button type="button" disabled={!!editingDepartmentCode} aria-label="수정" onClick={(event) => { event.stopPropagation(); editDepartment(department) }} className="text-gray-400 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-30"><Pencil size={14} /></button>
                      <button type="button" disabled={!!editingDepartmentCode} aria-label="삭제" onClick={(event) => { event.stopPropagation(); deleteDepartment(department) }} className="text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={14} /></button>
                    </div>
                  ),
                },
              ]}
              rows={departments}
              rowKey={(department) => department.code}
              rowSize="sm"
              height={300}
              onRowDoubleClick={(department) => { if (!editingDepartmentCode) editDepartment(department) }}
              getRowClassName={(department) => editingDepartmentCode === department.code ? '!bg-green-50' : ''}
              emptyText="등록된 부서가 없습니다."
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
