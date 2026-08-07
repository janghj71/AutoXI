import { useMemo, useRef, useState } from 'react'
import { Building2, Download, Pencil, Plus, Printer, Search, Trash2, X } from 'lucide-react'
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

const EMPTY_FORM = {
  code: '', name: '', businessNo: ['', '', ''], representative: '', businessType: '', businessItem: '',
  telephone: ['', '', ''], fax: ['', '', ''], mobile: ['', '', ''], postcode: '', address1: '', address2: '', memo: '',
}

const INITIAL_ROWS = [{
  ...EMPTY_FORM,
  code: '0001', name: '오토부품', businessNo: ['127', '81', '78160'], representative: '홍대표',
  businessType: '도소매', businessItem: '자동차부품', telephone: ['02', '424', '1901'], fax: ['02', '419', '8096'],
  mobile: ['010', '3793', '2209'], postcode: '12925', address1: '경기도 하남시 미사대로 520', address2: 'C동 7층 722호',
}]

const inputClass = 'w-full min-w-0 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600/15'
const joinTel = (parts) => parts.filter(Boolean).join('-')
const joinBusinessNo = (parts) => parts.filter(Boolean).join('-')

function BusinessNumberField({ value, onChange }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.5fr)] items-center gap-1.5">
      {value.map((part, index) => (
        <div key={index} className="contents">
          {index > 0 && <span className="text-gray-300">-</span>}
          <input
            value={part}
            maxLength={[3, 2, 5][index]}
            inputMode="numeric"
            onChange={(event) => {
              const next = [...value]
              next[index] = event.target.value.replace(/\D/g, '')
              onChange(next)
            }}
            className={`${inputClass} text-center`}
          />
        </div>
      ))}
    </div>
  )
}

export default function PurchaseCustomerPage() {
  const alert = useAlert()
  const detailAddressRef = useRef(null)
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [selectedCode, setSelectedCode] = useState('0001')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const [modalMode, setModalMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const displayedRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = !keyword ? rows : rows.filter((row) =>
      [row.code, row.name, row.representative, joinTel(row.telephone), joinTel(row.mobile), joinBusinessNo(row.businessNo), row.address1]
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko')
      if (sort === 'code') return a.code.localeCompare(b.code)
      return b.code.localeCompare(a.code)
    })
  }, [query, rows, sort])

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
  const closeModal = () => setModalMode(null)
  const openNew = () => {
    const nextCode = String(Math.max(0, ...rows.map((row) => Number(row.code) || 0)) + 1).padStart(4, '0')
    setForm({ ...EMPTY_FORM, code: nextCode, businessNo: ['', '', ''], telephone: ['', '', ''], fax: ['', '', ''], mobile: ['', '', ''] })
    setModalMode('new')
  }
  const openEdit = (row) => {
    setForm({ ...row, businessNo: [...row.businessNo], telephone: [...row.telephone], fax: [...row.fax], mobile: [...row.mobile] })
    setModalMode('edit')
  }
  const save = async () => {
    if (!form.name.trim()) return alert.warning('상호를 입력해 주세요.')
    if (modalMode === 'new') setRows((prev) => [...prev, form])
    else setRows((prev) => prev.map((row) => row.code === form.code ? form : row))
    setSelectedCode(form.code)
    closeModal()
    await alert.success(modalMode === 'new' ? '매입처가 등록되었습니다.' : '매입처 정보가 수정되었습니다.')
  }
  const remove = async (row) => {
    if (!(await alert.remove(`'${row.name}' 매입처를 삭제하시겠습니까?`))) return
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

  const columns = [
    { key: 'code', title: '코드', width: '8%', align: 'center' },
    { key: 'name', title: '매입처명', width: '16%' },
    { key: 'telephone', title: '전화번호', width: '13%', render: joinTel },
    { key: 'fax', title: '팩스번호', width: '13%', render: joinTel },
    { key: 'address1', title: '주소', width: '21%', render: (value, row) => `${value} ${row.address2}`.trim() },
    { key: 'representative', title: '대표자', width: '10%' },
    { key: 'businessNo', title: '사업자번호', width: '12%', render: joinBusinessNo },
    { key: '__actions', title: '관리', width: '7%', align: 'center', render: (_value, row) => <div className="flex justify-center gap-2"><button type="button" aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(row) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button><button type="button" aria-label="삭제" onClick={(event) => { event.stopPropagation(); remove(row) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div> },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader title="매입처등록" description="매입처 정보를 등록하고 관리합니다." icon={Building2} actions={<><Button onClick={() => alert.info('인쇄 기능은 API 연결 단계에서 적용합니다.')}><Printer size={14} />인쇄</Button><Button onClick={() => alert.info('엑셀 내보내기는 API 연결 단계에서 적용합니다.')}><Download size={14} />엑셀</Button><Button variant="primary" onClick={openNew}><Plus size={15} />신규 등록</Button></>} />

      <div className="flex-1 overflow-auto p-3">
        <SectionCard title="매입처 목록" tag={`총 ${displayedRows.length}건`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 max-w-xl flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
              <Search size={15} className="text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="코드, 매입처명, 대표자, 전화번호, 사업자번호 검색" className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
            <div className="ml-auto w-36"><Select value={sort} onChange={setSort} options={[{ value: 'recent', label: '최근매입순' }, { value: 'code', label: '코드순' }, { value: 'name', label: '매입처명순' }]} /></div>
          </div>
          <FixedHeadTable columns={columns} rows={displayedRows} rowKey={(row) => row.code} rowSize="sm" height={420} selectedKey={selectedCode} onRowClick={(row) => setSelectedCode(row.code)} onRowDoubleClick={openEdit} emptyText="등록된 매입처가 없습니다." />
          <div className="flex justify-between pt-2.5 text-[11px] text-gray-400"><span>행을 더블클릭하면 수정할 수 있습니다.</span><span>1 / 1 페이지</span></div>
        </SectionCard>
      </div>

      {modalMode && (
        <Modal title={modalMode === 'new' ? '매입처 등록' : '매입처 수정'} description="매입처의 기본정보를 입력합니다." size="lg" onClose={closeModal} footer={<><Button onClick={closeModal}>취소</Button><Button variant="primary" onClick={save}>{modalMode === 'new' ? '등록' : '저장'}</Button></>}>
          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="mb-2 text-xs font-semibold text-gray-800">기본정보</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <FormField label="코드" labelWidth="w-16" value={form.code} readOnly />
              <div />
              <FormField label="상호" labelWidth="w-16" value={form.name} onChange={setField('name')} autoFocus />
              <FormField label="대표자" labelWidth="w-16" value={form.representative} onChange={setField('representative')} />
              <FormField label="등록번호" labelWidth="w-16"><BusinessNumberField value={form.businessNo} onChange={setValue('businessNo')} /></FormField>
              <FormField label="휴대전화" labelWidth="w-16"><TelField value={form.mobile} onChange={setValue('mobile')} /></FormField>
              <FormField label="업태" labelWidth="w-16" value={form.businessType} onChange={setField('businessType')} />
              <FormField label="업종" labelWidth="w-16" value={form.businessItem} onChange={setField('businessItem')} />
              <FormField label="전화번호" labelWidth="w-16"><TelField value={form.telephone} onChange={setValue('telephone')} /></FormField>
              <FormField label="팩스번호" labelWidth="w-16"><TelField value={form.fax} onChange={setValue('fax')} /></FormField>
              <FormField label="우편번호" labelWidth="w-16"><div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5"><input value={form.postcode} readOnly className={`${inputClass} bg-gray-50 text-center`} /><span className="invisible">-</span><div className="col-span-3"><Button className="h-[30px] px-3 text-xs" onClick={searchPostcode}>우편번호 찾기</Button></div></div></FormField>
              <div />
              <FormField label="기본주소" labelWidth="w-16" className="col-span-2" value={form.address1} readOnly />
              <FormField label="상세주소" labelWidth="w-16" className="col-span-2"><input ref={detailAddressRef} value={form.address2} onChange={setField('address2')} placeholder="상세주소 입력" className={inputClass} /></FormField>
              <FormField label="메모" labelWidth="w-16" className="col-span-2" align="start"><textarea value={form.memo} onChange={setField('memo')} rows={5} className={`${inputClass} resize-y`} /></FormField>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
