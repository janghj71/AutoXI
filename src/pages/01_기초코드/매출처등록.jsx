import { useMemo, useRef, useState } from 'react'
import { Building2, Download, Pencil, Plus, Printer, Search, Trash2, X } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import Select from '../../components/Select'
import TelField from '../../components/TelField'
import { useAlert } from '../../alerts'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'
import { openPostcodeSearch } from '../../utils/postcode'

const PRICE_OPTIONS = [
  { value: '1', label: '1 판매가격' },
  { value: '2', label: '2 판매가격' },
  { value: '3', label: '3 판매가격' },
]

const EMPTY_FORM = {
  code: '', name: '', branch: '', priceType: '2', businessNo: ['', '', ''], representative: '',
  businessType: '', businessItem: '', telephone: ['', '', ''], fax: ['', '', ''], postcode: '',
  address1: '', address2: '', manager: '', mobile: ['', '', ''], email: '', exchangeLabor: '0',
  panelLabor: '0', paintLabor: '0', memo: '',
}

const INITIAL_ROWS = [
  {
    ...EMPTY_FORM,
    code: '0001', name: '매출처', branch: '하남미사점', businessNo: ['127', '81', '78160'],
    representative: '홍대표', businessType: '업태', businessItem: '업종', telephone: ['02', '424', '1901'],
    fax: ['02', '419', '8096'], postcode: '12925', address1: '경기도 하남시 미사대로 520',
    address2: 'C동 7층 722호', manager: '담당자', mobile: ['010', '3793', '2209'],
    email: 'format2000@hanmail.net', memo: '테스트 메모',
  },
]

const joinTel = (parts) => parts.filter(Boolean).join('-')
const inputClass = 'w-full text-xs rounded-sm px-3 py-1.5 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400'

function BusinessNumberField({ value, onChange }) {
  const widths = ['w-16', 'w-12', 'w-20']
  const maxLengths = [3, 2, 5]
  return (
    <div className="flex items-center gap-1.5">
      {value.map((part, index) => (
        <div key={index} className="contents">
          {index > 0 && <span className="text-gray-300">-</span>}
          <input
            value={part}
            maxLength={maxLengths[index]}
            inputMode="numeric"
            onChange={(event) => {
              const next = [...value]
              next[index] = event.target.value.replace(/\D/g, '')
              onChange(next)
            }}
            className={`${inputClass} ${widths[index]} text-center`}
          />
        </div>
      ))}
    </div>
  )
}

export default function SalesCustomerPage({ selectionMode = false, onSelect, onCancel }) {
  const alert = useAlert()
  const detailAddressRef = useRef(null)
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [selectedCode, setSelectedCode] = useState('0001')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('code')
  const [modalMode, setModalMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const displayedRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = !keyword ? rows : rows.filter((row) =>
      [row.code, row.name, row.branch, row.manager, joinTel(row.telephone), row.address1]
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko')
      if (sort === 'recent') return b.code.localeCompare(a.code)
      return a.code.localeCompare(b.code)
    })
  }, [query, rows, sort])
  const selectedRow = rows.find((row) => row.code === selectedCode)

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))

  const openNew = () => {
    const nextCode = String(Math.max(0, ...rows.map((row) => Number(row.code) || 0)) + 1).padStart(4, '0')
    setForm({ ...EMPTY_FORM, code: nextCode, businessNo: ['', '', ''], telephone: ['', '', ''], fax: ['', '', ''], mobile: ['', '', ''] })
    setModalMode('new')
  }
  const openEdit = (row) => {
    setForm({ ...row, businessNo: [...row.businessNo], telephone: [...row.telephone], fax: [...row.fax], mobile: [...row.mobile] })
    setModalMode('edit')
  }
  const closeModal = () => setModalMode(null)

  const save = async () => {
    if (!form.name.trim()) {
      await alert.warning('상호를 입력해 주세요.')
      return
    }
    if (modalMode === 'new') setRows((prev) => [...prev, form])
    else setRows((prev) => prev.map((row) => row.code === form.code ? form : row))
    setSelectedCode(form.code)
    closeModal()
    await alert.success(modalMode === 'new' ? '매출처가 등록되었습니다.' : '매출처 정보가 수정되었습니다.')
  }

  const remove = async (row) => {
    if (!(await alert.remove(`'${row.name}' 매출처를 삭제하시겠습니까?`))) return
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

  const managementColumn = {
    key: '__actions', title: '관리', width: '7%', align: 'center', render: (_value, row) => (
      <div className="flex items-center justify-center gap-2">
        <button type="button" aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(row) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button>
        <button type="button" aria-label="삭제" onClick={(event) => { event.stopPropagation(); remove(row) }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
    ),
  }
  const columns = selectionMode ? [
    { key: 'code', title: '코드', width: '9%', align: 'center' },
    { key: 'name', title: '매출처명', width: '22%' },
    { key: 'businessNo', title: '사업자번호', width: '20%', render: (value) => value.filter(Boolean).join('-') },
    { key: 'telephone', title: '전화번호', width: '18%', render: (value) => joinTel(value) },
    { key: 'branch', title: '지점명', width: '23%' },
    { ...managementColumn, width: '8%' },
  ] : [
    { key: 'code', title: '코드', width: '8%', align: 'center' },
    { key: 'name', title: '매출처명', width: '15%' },
    { key: 'branch', title: '지점명', width: '13%' },
    { key: 'manager', title: '담당자', width: '10%' },
    { key: 'telephone', title: '전화번호', width: '13%', render: (value) => joinTel(value) },
    { key: 'fax', title: '팩스번호', width: '13%', render: (value) => joinTel(value) },
    { key: 'address1', title: '주소', width: '22%', render: (value, row) => `${value} ${row.address2}`.trim() },
    managementColumn,
  ]

  const content = (
    <div className={`${selectionMode ? 'h-[460px] bg-white' : 'h-full bg-gray-50'} flex flex-col`} onKeyDown={focusNextOnEnter}>
      {!selectionMode && <PageHeader
        title="매출처등록"
        description="매출처 정보를 등록하고 관리합니다."
        icon={Building2}
        actions={
          <>
          <Button onClick={() => alert.info('인쇄 기능은 API 연결 단계에서 적용합니다.')}><Printer size={14} />인쇄</Button>
          <Button onClick={() => alert.info('엑셀 내보내기는 API 연결 단계에서 적용합니다.')}><Download size={14} />엑셀</Button>
          <Button variant="primary" onClick={openNew}><Plus size={15} />신규 등록</Button>
          </>
        }
      />}

      <div className={`min-h-0 flex-1 ${selectionMode ? 'flex flex-col overflow-hidden p-0' : 'overflow-auto p-3'}`}>
        <SectionCard title="매출처 목록" tag={`총 ${displayedRows.length}건`} actions={selectionMode ? <Button size="sm" onClick={openNew}><Plus size={13} />추가</Button> : undefined} className={selectionMode ? 'min-h-0 flex flex-1 flex-col overflow-hidden' : ''} bodyClassName={selectionMode ? 'min-h-0 flex flex-1 flex-col' : ''} flush={selectionMode}>
          <div className={`flex items-center gap-2 ${selectionMode ? 'm-2' : 'mb-3'}`}>
            <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15 ${selectionMode ? 'h-8 max-w-md' : 'h-9 max-w-xl'}`}>
              <Search size={selectionMode ? 14 : 15} className="text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="코드, 매출처명, 지점명, 담당자, 전화번호 검색" className="min-w-0 flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400" />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="ml-auto w-36"><Select className="w-full" buttonClassName={selectionMode ? 'h-8' : 'h-9'} value={sort} onChange={setSort} options={[{ value: 'code', label: '코드순' }, { value: 'name', label: '매출처명순' }, { value: 'recent', label: '최근 등록순' }]} /></div>
          </div>
          <div className={selectionMode ? 'min-h-0 flex-1' : ''}><FixedHeadTable columns={columns} rows={displayedRows} rowKey={(row) => row.code} rowSize="sm" height={selectionMode ? null : 420} selectedKey={selectedCode} onRowClick={(row) => setSelectedCode(row.code)} onRowDoubleClick={selectionMode ? onSelect : openEdit} emptyText="등록된 매출처가 없습니다." /></div>
          {!selectionMode && <div className="flex items-center justify-between pt-2.5 text-[11px] text-gray-400"><span>행을 더블클릭하면 수정할 수 있습니다.</span><span>1 / 1 페이지</span></div>}
        </SectionCard>
      </div>

      {modalMode && (
        <Modal title={modalMode === 'new' ? '매출처 등록' : '매출처 수정'} description="매출처의 기본정보와 공임 기준을 입력합니다." size="lg" onClose={closeModal} footer={<><Button onClick={closeModal}>취소</Button><Button variant="primary" onClick={save}>{modalMode === 'new' ? '등록' : '저장'}</Button></>}>
          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="mb-2 text-xs font-semibold text-gray-800">기본정보</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <FormField label="코드" labelWidth="w-16" value={form.code} readOnly />
              <FormField label="판매단가" labelWidth="w-16"><Select className="flex-1" value={form.priceType} onChange={setValue('priceType')} options={PRICE_OPTIONS} /></FormField>
              <FormField label="상호" labelWidth="w-16" value={form.name} onChange={setField('name')} autoFocus />
              <FormField label="지점명" labelWidth="w-16" value={form.branch} onChange={setField('branch')} />
              <FormField label="등록번호" labelWidth="w-16"><BusinessNumberField value={form.businessNo} onChange={setValue('businessNo')} /></FormField>
              <FormField label="대표자" labelWidth="w-16" value={form.representative} onChange={setField('representative')} />
              <FormField label="업태" labelWidth="w-16" value={form.businessType} onChange={setField('businessType')} />
              <FormField label="업종" labelWidth="w-16" value={form.businessItem} onChange={setField('businessItem')} />
              <FormField label="전화번호" labelWidth="w-16"><TelField value={form.telephone} onChange={setValue('telephone')} /></FormField>
              <FormField label="팩스번호" labelWidth="w-16"><TelField value={form.fax} onChange={setValue('fax')} /></FormField>
              <FormField label="우편번호" labelWidth="w-16">
                <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
                  <input value={form.postcode} readOnly className={`${inputClass} min-w-0 bg-gray-50 text-center`} />
                  <span className="invisible">-</span>
                  <div className="col-span-3">
                    <Button className="h-[30px] px-3 text-xs" onClick={searchPostcode}>우편번호 찾기</Button>
                  </div>
                </div>
              </FormField>
              <FormField label="기본주소" labelWidth="w-16" className="col-span-2" value={form.address1} readOnly />
              <FormField label="상세주소" labelWidth="w-16" className="col-span-2"><input ref={detailAddressRef} value={form.address2} onChange={setField('address2')} placeholder="상세주소 입력" className={inputClass} /></FormField>
            </div>

            <div className="mt-5 mb-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-800">차량관리</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <FormField label="담당자" labelWidth="w-16" value={form.manager} onChange={setField('manager')} />
              <FormField label="휴대전화" labelWidth="w-16"><TelField value={form.mobile} onChange={setValue('mobile')} /></FormField>
              <FormField label="이메일" labelWidth="w-16" className="col-span-2" value={form.email} onChange={setField('email')} type="email" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2">
              <FormField label="교환공임" labelWidth="w-16" value={form.exchangeLabor} onChange={setField('exchangeLabor')} type="number" />
              <FormField label="판금공임" labelWidth="w-16" value={form.panelLabor} onChange={setField('panelLabor')} type="number" />
              <FormField label="도장공임" labelWidth="w-16" value={form.paintLabor} onChange={setField('paintLabor')} type="number" />
              <FormField label="메모" labelWidth="w-16" className="col-span-3" align="start"><textarea value={form.memo} onChange={setField('memo')} rows={4} className={`${inputClass} resize-y`} /></FormField>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )

  if (selectionMode) {
    return (
      <Modal title="매출처 선택" width="max-w-4xl" onClose={onCancel} footer={<div className="flex min-w-0 w-full items-center gap-4"><div className="min-w-0 flex-1 truncate text-xs text-gray-500">선택된 매출처: <strong className="text-gray-700">{selectedRow ? `${selectedRow.code} · ${selectedRow.name}${selectedRow.branch ? ` · ${selectedRow.branch}` : ''}` : '-'}</strong></div><div className="flex shrink-0 gap-2"><Button onClick={onCancel}>취소</Button><Button variant="primary" disabled={!selectedRow} onClick={() => selectedRow && onSelect?.(selectedRow)}>선택</Button></div></div>}>
        {content}
      </Modal>
    )
  }

  return content
}
