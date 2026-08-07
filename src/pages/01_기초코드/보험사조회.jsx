import { useMemo, useState } from 'react'
import { Building2, Pencil, Search, Users, X } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import Select from '../../components/Select'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'

const INITIAL_ROWS = [
  { code: '01', name: '메리츠', manager: '장현정', domesticExchange: '35000', domesticPanel: '35000', domesticPaint: '35000', importExchange: '45000', importPanel: '45000', importPaint: '45000', fullPaintRate: '100', partialPaintRate: '50' },
  { code: '02', name: '한화', manager: '김대균', domesticExchange: '35000', domesticPanel: '35000', domesticPaint: '35000', importExchange: '45000', importPanel: '45000', importPaint: '45000', fullPaintRate: '100', partialPaintRate: '80' },
  { code: '03', name: '롯데', manager: '', domesticExchange: '35000', domesticPanel: '35000', domesticPaint: '35000', importExchange: '45000', importPanel: '45000', importPaint: '45000', fullPaintRate: '100', partialPaintRate: '60' },
  { code: '04', name: 'MG손해보험', manager: '', domesticExchange: '38000', domesticPanel: '38000', domesticPaint: '38000', importExchange: '48000', importPanel: '48000', importPaint: '48000', fullPaintRate: '100', partialPaintRate: '60' },
  { code: '08', name: '삼성화재', manager: '이보험', domesticExchange: '40000', domesticPanel: '40000', domesticPaint: '40000', importExchange: '50000', importPanel: '50000', importPaint: '50000', fullPaintRate: '100', partialPaintRate: '60' },
  { code: '09', name: '현대해상', manager: '', domesticExchange: '40000', domesticPanel: '40000', domesticPaint: '40000', importExchange: '50000', importPanel: '50000', importPaint: '50000', fullPaintRate: '100', partialPaintRate: '60' },
  { code: '10', name: 'KB손해보험', manager: '', domesticExchange: '40000', domesticPanel: '40000', domesticPaint: '40000', importExchange: '50000', importPanel: '50000', importPaint: '50000', fullPaintRate: '100', partialPaintRate: '60' },
  { code: '13', name: 'DB손해보험', manager: '', domesticExchange: '40000', domesticPanel: '40000', domesticPaint: '40000', importExchange: '50000', importPanel: '50000', importPaint: '50000', fullPaintRate: '100', partialPaintRate: '60' },
]
const formatMoney = (value) => Number(value || 0).toLocaleString('ko-KR')

export default function InsurerPage({ onOpenPage }) {
  const alert = useAlert()
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('code')
  const [selectedCode, setSelectedCode] = useState('08')
  const [editing, setEditing] = useState(null)

  const displayedRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = !keyword ? rows : rows.filter((row) => [row.code, row.name, row.manager].some((value) => value.toLowerCase().includes(keyword)))
    return [...filtered].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'ko') : a.code.localeCompare(b.code))
  }, [query, rows, sort])

  const openEdit = (row) => setEditing({ ...row })
  const setField = (key) => (event) => {
    const value = event.target.value.replace(/[^0-9.]/g, '')
    setEditing((prev) => ({ ...prev, [key]: value }))
  }
  const save = async () => {
    setRows((prev) => prev.map((row) => row.code === editing.code ? editing : row))
    setSelectedCode(editing.code)
    setEditing(null)
    await alert.success('보험사 M/H 금액과 도장율이 수정되었습니다.')
  }

  const moneyColumn = (key, title) => ({ key, title, width: '10%', align: 'right', render: formatMoney })
  const columns = [
    { key: 'code', title: '코드', width: '6%', align: 'center' },
    { key: 'name', title: '보험사명', width: '16%' },
    { key: 'manager', title: '담당자', width: '10%' },
    moneyColumn('domesticExchange', '교환 M/H'),
    moneyColumn('domesticPanel', '판금 M/H'),
    moneyColumn('domesticPaint', '도장 M/H'),
    moneyColumn('importExchange', '교환 M/H'),
    moneyColumn('importPanel', '판금 M/H'),
    moneyColumn('importPaint', '도장 M/H'),
    { key: '__actions', title: '관리', width: '6%', align: 'center', render: (_value, row) => <button type="button" aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(row) }} className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button> },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader
        title="보험사조회"
        description="보험사별 국산차·수입차 M/H 금액과 도장율을 관리합니다."
        icon={Building2}
        actions={<Button onClick={() => onOpenPage?.('0109', { insurerCode: selectedCode })}><Users size={14} />담당자 관리</Button>}
      />
      <div className="flex-1 overflow-auto p-3">
        <SectionCard title="보험사 목록" tag={`총 ${displayedRows.length}건`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 max-w-xl flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
              <Search size={15} className="text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="보험사 코드, 보험사명, 담당자 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
            <div className="ml-auto w-32"><Select value={sort} onChange={setSort} options={[{ value: 'code', label: '코드순' }, { value: 'name', label: '보험사명순' }]} /></div>
          </div>
          <FixedHeadTable
            columns={columns}
            headerGroups={[
              { title: '국산차', keys: ['domesticExchange', 'domesticPanel', 'domesticPaint'] },
              { title: '수입차', keys: ['importExchange', 'importPanel', 'importPaint'] },
            ]}
            rows={displayedRows}
            rowKey={(row) => row.code}
            rowSize="sm"
            height={450}
            tableTextClass="text-sm"
            selectedKey={selectedCode}
            onRowClick={(row) => setSelectedCode(row.code)}
            onRowDoubleClick={openEdit}
            emptyText="보험사 정보가 없습니다."
          />
          <div className="pt-2.5 text-[11px] text-gray-400">보험사 추가·삭제는 지원하지 않으며, 행을 더블클릭하면 M/H 금액과 도장율을 수정할 수 있습니다.</div>
        </SectionCard>
      </div>

      {editing && (
        <Modal title="보험사 수정" description="M/H 금액과 도장율만 수정할 수 있습니다." size="lg" onClose={() => setEditing(null)} footer={<><Button onClick={() => setEditing(null)}>취소</Button><Button variant="primary" onClick={save}>저장</Button></>}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <FormField label="코드" labelWidth="w-20" value={editing.code} readOnly />
              <FormField label="보험사명" labelWidth="w-20" value={editing.name} readOnly />
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="mb-2 text-xs font-semibold text-gray-800">M/H 금액</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                <div className="rounded-md border border-gray-200 p-3">
                  <div className="mb-2 text-center text-xs font-semibold text-gray-700">국산차</div>
                  <div className="flex flex-col gap-2">
                    <FormField label="교환공임" labelWidth="w-20" value={editing.domesticExchange} onChange={setField('domesticExchange')} type="number" autoFocus />
                    <FormField label="판금공임" labelWidth="w-20" value={editing.domesticPanel} onChange={setField('domesticPanel')} type="number" />
                    <FormField label="도장공임" labelWidth="w-20" value={editing.domesticPaint} onChange={setField('domesticPaint')} type="number" />
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 p-3">
                  <div className="mb-2 text-center text-xs font-semibold text-gray-700">수입차</div>
                  <div className="flex flex-col gap-2">
                    <FormField label="교환공임" labelWidth="w-20" value={editing.importExchange} onChange={setField('importExchange')} type="number" />
                    <FormField label="판금공임" labelWidth="w-20" value={editing.importPanel} onChange={setField('importPanel')} type="number" />
                    <FormField label="도장공임" labelWidth="w-20" value={editing.importPaint} onChange={setField('importPaint')} type="number" />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="mb-2 text-xs font-semibold text-gray-800">도장율</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <FormField label="전체도장율" labelWidth="w-24" value={editing.fullPaintRate} onChange={setField('fullPaintRate')} type="number" suffix="%" />
                <FormField label="부분판금도장율" labelWidth="w-28" value={editing.partialPaintRate} onChange={setField('partialPaintRate')} type="number" suffix="%" />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
