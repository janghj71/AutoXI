import { useRef, useState } from 'react'
import { Building2, SlidersHorizontal, MessageSquare, Zap, Tags, X, Save, Plus, Trash2, Search, Pencil } from 'lucide-react'
import SectionTabs from '../../components/SectionTabs'
import FormField from '../../components/FormField'
import Select from '../../components/Select'
import TelField from '../../components/TelField'
import SectionCard from '../../components/SectionCard'
import SealBox from '../../components/SealBox'
import FixedHeadTable from '../../components/FixedHeadTable'
import Toggle from '../../components/Toggle'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import sealSample from '../../assets/seal-sample.svg'
import { openPostcodeSearch } from '../../utils/postcode'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'
import { useAlert } from '../../alerts'

const TABS = [
  { id: 'basic', label: '기초설정', icon: Building2 },
  { id: 'option', label: '선택사항', icon: SlidersHorizontal },
  { id: 'sms', label: '고객문자', icon: MessageSquare },
  { id: 'hq', label: '하이퀵설정', icon: Zap },
  { id: 'code', label: '코드설정', icon: Tags },
]

export default function CompanyInfoPage() {
  const alert = useAlert()
  const [activeTab, setActiveTab] = useState('basic')

  const [hqRows, setHqRows] = useState([
    { code: '101', name: '엔진오일', use: true },
    { code: '217', name: '향균필터', use: true },
    { code: '222', name: '자동밋션오일점검', use: true },
    { code: '112', name: '브레이크계통점검', use: true },
    { code: '115', name: '타이어점검 및 교환', use: true },
    { code: '116', name: '배터리', use: true },
    { code: '301', name: '계기판 경고등', use: true },
    { code: '999', name: '정비사상담', use: true },
  ])
  const [hqSelected, setHqSelected] = useState('101')
  const toggleHqUse = (code, next) => {
    setHqRows((prev) => prev.map((r) => (r.code === code ? { ...r, use: next } : r)))
  }

  const [gradeRows, setGradeRows] = useState([
    { code: '01', name: '준회원', rate: '1.0' },
    { code: '02', name: '정회원', rate: '1.2' },
    { code: '03', name: '실버', rate: '1.6' },
    { code: '04', name: '골드', rate: '1.8' },
    { code: '05', name: 'VIP', rate: '2.0' },
    { code: '06', name: 'VVIP', rate: '2.5' },
  ])
  const [gradeSelected, setGradeSelected] = useState('01')
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [newGradeName, setNewGradeName] = useState('')
  const [newGradeRate, setNewGradeRate] = useState('')

  const addGradeRow = () => {
    if (!newGradeName.trim()) {
      alert.warning('고객등급명을 입력해 주세요.')
      return
    }
    const nextCode = String(gradeRows.length + 1).padStart(2, '0')
    setGradeRows((prev) => [...prev, { code: nextCode, name: newGradeName, rate: newGradeRate }])
    setNewGradeName('')
    setNewGradeRate('')
    setGradeModalOpen(false)
  }

  const deleteGradeRow = async (code) => {
    if (!(await alert.remove('선택한 고객등급을 삭제하시겠습니까?'))) return
    setGradeRows((prev) => prev.filter((r) => r.code !== code))
  }

  const [classRows, setClassRows] = useState([
    { code: '01', name: '개인고객' },
    { code: '02', name: '법인고객' },
    { code: '03', name: '보험사고객' },
  ])
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [newClassName, setNewClassName] = useState('')

  const addClassRow = () => {
    if (!newClassName.trim()) {
      alert.warning('고객분류명을 입력해 주세요.')
      return
    }
    const nextCode = String(classRows.length + 1).padStart(2, '0')
    setClassRows((prev) => [...prev, { code: nextCode, name: newClassName }])
    setNewClassName('')
    setClassModalOpen(false)
  }

  const deleteClassRow = async (code) => {
    if (!(await alert.remove('선택한 고객분류를 삭제하시겠습니까?'))) return
    setClassRows((prev) => prev.filter((r) => r.code !== code))
  }

  const [statusRows, setStatusRows] = useState([
    { code: '01', name: '입고대기' },
    { code: '02', name: '작업중' },
    { code: '03', name: '작업완료' },
    { code: '04', name: '출고완료' },
  ])
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatusName, setNewStatusName] = useState('')

  const addStatusRow = () => {
    if (!newStatusName.trim()) {
      alert.warning('작업 상태명을 입력해 주세요.')
      return
    }
    const nextCode = String(statusRows.length + 1).padStart(2, '0')
    setStatusRows((prev) => [...prev, { code: nextCode, name: newStatusName }])
    setNewStatusName('')
    setStatusModalOpen(false)
  }

  const deleteStatusRow = async (code) => {
    if (!(await alert.remove('선택한 작업 상태를 삭제하시겠습니까?'))) return
    setStatusRows((prev) => prev.filter((r) => r.code !== code))
  }

  const [accountRows, setAccountRows] = useState([
    { code: '001', name: '운송비' },
    { code: '002', name: '관세' },
    { code: '003', name: '통관수수료' },
    { code: '004', name: '창고료' },
    { code: '005', name: '기타비용' },
  ])
  const [accountQuery, setAccountQuery] = useState('')
  const [accountModalMode, setAccountModalMode] = useState(null)
  const [editingAccountCode, setEditingAccountCode] = useState(null)
  const [newAccountCode, setNewAccountCode] = useState('')
  const [newAccountName, setNewAccountName] = useState('')
  const filteredAccountRows = accountRows.filter((row) => {
    const keyword = accountQuery.trim().toLowerCase()
    return !keyword || row.code.toLowerCase().includes(keyword) || row.name.toLowerCase().includes(keyword)
  })

  const openAccountModal = () => {
    setNewAccountCode('')
    setNewAccountName('')
    setEditingAccountCode(null)
    setAccountModalMode('new')
  }
  const openAccountEditModal = (row) => {
    setNewAccountCode(row.code)
    setNewAccountName(row.name)
    setEditingAccountCode(row.code)
    setAccountModalMode('edit')
  }
  const saveAccountRow = async () => {
    const code = newAccountCode.trim()
    const name = newAccountName.trim()
    if (!code) return alert.warning('계정코드를 입력해 주세요.')
    if (!name) return alert.warning('계정명을 입력해 주세요.')
    if (accountRows.some((row) => row.code !== editingAccountCode && row.code.toLowerCase() === code.toLowerCase())) {
      return alert.warning('이미 등록된 계정코드입니다.')
    }
    setAccountRows((prev) => accountModalMode === 'new'
      ? [...prev, { code, name }]
      : prev.map((row) => row.code === editingAccountCode ? { code, name } : row))
    setAccountModalMode(null)
  }
  const deleteAccountRow = async (row) => {
    if (!(await alert.remove(`'${row.name}' 계정을 삭제하시겠습니까?`))) return
    setAccountRows((prev) => prev.filter((item) => item.code !== row.code))
  }

  const [ronoMonthly, setRonoMonthly] = useState(true)
  const [ronoExtraCheck, setRonoExtraCheck] = useState(false)
  const emptyRonoTasks = () => ({
    general: { checked: false, value: '0' },
    insurance: { checked: false, value: '0' },
    warranty: { checked: false, value: '0' },
    inspection: { checked: false, value: '0' },
  })
  const [ronoRows, setRonoRows] = useState([
    { key: '202207-00', yearMonth: '202207', day: '00', finalRono: '5', tasks: emptyRonoTasks() },
    { key: '202206-00', yearMonth: '202206', day: '00', finalRono: '8', tasks: emptyRonoTasks() },
    { key: '202205-12', yearMonth: '202205', day: '12', finalRono: '3', tasks: emptyRonoTasks() },
    { key: '202205-09', yearMonth: '202205', day: '09', finalRono: '2', tasks: emptyRonoTasks() },
    { key: '202205-03', yearMonth: '202205', day: '03', finalRono: '4', tasks: emptyRonoTasks() },
    { key: '202205-00', yearMonth: '202205', day: '00', finalRono: '12', tasks: emptyRonoTasks() },
    { key: '202204-25', yearMonth: '202204', day: '25', finalRono: '6', tasks: emptyRonoTasks() },
    { key: '202204-23', yearMonth: '202204', day: '23', finalRono: '1', tasks: emptyRonoTasks() },
  ])
  const [ronoSelected, setRonoSelected] = useState('202204-23')
  const ronoSelectedRow = ronoRows.find((r) => r.key === ronoSelected) ?? ronoRows[0]

  const setRonoFinalValue = (val) => {
    setRonoRows((prev) => prev.map((r) => (r.key === ronoSelected ? { ...r, finalRono: val } : r)))
  }
  const setRonoTask = (taskKey, patch) => {
    setRonoRows((prev) =>
      prev.map((r) => (r.key === ronoSelected ? { ...r, tasks: { ...r.tasks, [taskKey]: { ...r.tasks[taskKey], ...patch } } } : r)),
    )
  }

  const [biz, setBiz] = useState({
    사업자번호: '215-81-90952',
    종사업장번호: '1234',
    상호: '오토세븐 11호점',
    대표자: '윤창희',
    업태: '업체',
    업종: '업종',
    전화번호: ['02', '424', '1901'],
    팩스번호: ['02', '419', '8096'],
    우편번호: '12914',
    사업장주소1: '경기 하남시 미사대로 520',
    사업장주소2: '713호',
    이메일주소: 'k7001@hanmail.net',
    정비등록번호: '제01-2811-000048호',
    정비책임자: '배창은',
    정비등록번호건설기계: '',
  })
  const setBizField = (key) => (e) => setBiz((p) => ({ ...p, [key]: e.target.value }))
  const setTelField = (key) => (parts) => setBiz((p) => ({ ...p, [key]: parts }))
  const addressDetailRef = useRef(null)
  const [postcodeError, setPostcodeError] = useState('')

  const handlePostcodeSearch = async () => {
    setPostcodeError('')

    try {
      const result = await openPostcodeSearch()
      if (!result) return

      setBiz((prev) => ({
        ...prev,
        우편번호: result.zonecode,
        사업장주소1: result.address,
        사업장주소2: '',
      }))
      requestAnimationFrame(() => addressDetailRef.current?.focus())
    } catch (error) {
      setPostcodeError(error instanceof Error ? error.message : '우편번호 검색을 시작하지 못했습니다.')
    }
  }

  const [myinfo] = useState({
    회사아이디: 'at80028',
    전자세금계산서아이디: 'iv2202',
    연합회정비전송아이디: 'sunn0',
  })

  return (
    <div className="h-full flex flex-col" onKeyDown={focusNextOnEnter}>
      <PageHeader
        title="업체정보"
        description="업체 기본정보와 업무 설정을 관리합니다."
        icon={Building2}
        actions={
          <>
            <Button><X size={15} />취소</Button>
            <Button variant="primary"><Save size={15} />저장</Button>
          </>
        }
      />

      <div className="px-4 pt-2 bg-gray-50 shrink-0">
        <SectionTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full overflow-auto p-3">
        {activeTab === 'basic' && (
          <div className="flex flex-col gap-2.5">
            <SectionCard title="사업자정보">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <FormField label="사업자번호" value={biz.사업자번호} onChange={setBizField('사업자번호')} />
                <FormField label="종사업장번호" value={biz.종사업장번호} onChange={setBizField('종사업장번호')} />
                <FormField label="상호" value={biz.상호} onChange={setBizField('상호')} />
                <FormField label="대표자" value={biz.대표자} onChange={setBizField('대표자')} />
                <FormField label="업태" value={biz.업태} onChange={setBizField('업태')} />
                <FormField label="업종" value={biz.업종} onChange={setBizField('업종')} />
                <FormField label="전화번호">
                  <TelField value={biz.전화번호} onChange={setTelField('전화번호')} />
                </FormField>
                <FormField label="팩스번호">
                  <TelField value={biz.팩스번호} onChange={setTelField('팩스번호')} />
                </FormField>
                <FormField label="우편번호" className="col-span-2">
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      className="w-24 text-xs rounded-sm border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400"
                      value={biz.우편번호}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={handlePostcodeSearch}
                      className="text-xs rounded-sm border border-gray-300 text-gray-700 px-2.5 py-1.5 whitespace-nowrap hover:bg-gray-50"
                    >
                      우편번호 찾기
                    </button>
                    {postcodeError && <span className="text-[11px] text-red-500">{postcodeError}</span>}
                  </div>
                </FormField>
                <FormField label="사업장주소" value={biz.사업장주소1} readOnly />
                <FormField label="이메일주소" value={biz.이메일주소} onChange={setBizField('이메일주소')} />
                <FormField label="">
                  <input
                    ref={addressDetailRef}
                    value={biz.사업장주소2}
                    onChange={setBizField('사업장주소2')}
                    placeholder="상세주소 입력"
                    className="w-full text-xs rounded-sm px-3 py-1.5 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400"
                  />
                </FormField>
                <FormField label="정비책임자" value={biz.정비책임자} onChange={setBizField('정비책임자')} />
                <FormField label="정비등록번호" value={biz.정비등록번호} onChange={setBizField('정비등록번호')} />
                <FormField
                  label="정비등록번호(건설기계용)"
                  value={biz.정비등록번호건설기계}
                  onChange={setBizField('정비등록번호건설기계')}
                />
              </div>
            </SectionCard>

            <SectionCard title="나의 정보">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <FormField label="회사아이디" value={myinfo.회사아이디} disabled />
                <FormField label="재고이월일자" value="" />
                <FormField label="전자세금계산서 ID" value={myinfo.전자세금계산서아이디} />
                <FormField label="전자세금계산서 PW" type="password" value="123456" />
                <FormField label="정비이력전송 ID" value={myinfo.연합회정비전송아이디} />
                <FormField label="정비이력전송 PW" type="password" value="123456" />
              </div>
            </SectionCard>

            <SectionCard title="인감 관리">
              <div className="grid grid-cols-2 gap-6">
                <SealBox label="회사직인" image={sealSample} />
                <SealBox label="정비책임자 인감" image={sealSample} />
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'option' && (
          <div className="flex flex-col gap-2.5">
            <SectionCard title="선택사항">
              <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                <FormField label="신규매출업무">
                  <Select className="flex-1" value="13" onChange={() => {}} options={[{ value: '13', label: '13 보증' }]} />
                </FormField>
                <FormField label="품질보증기간" value="12" suffix="개월" />
                <FormField label="견적방식" value="KAIMA" />

                <FormField label="매출부가세">
                  <Select className="flex-1" value="0" onChange={() => {}} options={[{ value: '0', label: '0 없음' }]} />
                </FormField>
                <FormField label="푸시받을 닉네임" value="장희정" />
                <FormField label="탈부착시간종류">
                  <Select className="flex-1" value="3" onChange={() => {}} options={[{ value: '3', label: '3 18수가/참고' }]} />
                </FormField>

                <FormField label="매입부가세">
                  <Select className="flex-1" value="1" onChange={() => {}} options={[{ value: '1', label: '1 10%' }]} />
                </FormField>
                <FormField label="결산결제자1" value="담" />
                <FormField label="부분판금율" value="80" suffix="%" />

                <FormField label="현금매출포인트" value="10" suffix="%" />
                <FormField label="결산결제자2" value="대" />
                <FormField label="도장체감율" value="5" suffix="%" />

                <FormField label="카드매출포인트" value="0" suffix="%" />
                <FormField label="결산결제자3" value="부" />
                <FormField label="유용성 도장인상율" value="0" suffix="%" />

                <FormField label="가용최소포인트" value="1000" />
                <FormField label="결산결제자4" value="사" />
                <FormField label="수용성 도장인상율" value="10" suffix="%" />
              </div>
            </SectionCard>

            <div className="grid grid-cols-2 gap-2.5">
              <SectionCard title="부가 설정">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">M/H 단가</div>
                  <div className="flex items-center gap-x-8 gap-y-1.5 flex-wrap pl-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-700 w-8">국산</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">탈착</span>
                        <input defaultValue="26000" className="w-20 text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400" />
                        <span className="text-xs text-gray-400">원</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">판금</span>
                        <input defaultValue="26000" className="w-20 text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400" />
                        <span className="text-xs text-gray-400">원</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">도장</span>
                        <input defaultValue="26000" className="w-20 text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400" />
                        <span className="text-xs text-gray-400">원</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-700 w-8">외산</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">탈착</span>
                        <input defaultValue="150000" className="w-20 text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400" />
                        <span className="text-xs text-gray-400">원</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">판금</span>
                        <input defaultValue="150000" className="w-20 text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400" />
                        <span className="text-xs text-gray-400">원</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">도장</span>
                        <input defaultValue="150000" className="w-20 text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400" />
                        <span className="text-xs text-gray-400">원</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">잔고 초기화</div>
                  <div className="flex items-center gap-5 text-xs text-gray-700 pl-2">
                    <label className="flex items-center gap-1.5"><input type="radio" name="reset" defaultChecked className="accent-green-600" />계속 이월</label>
                    <label className="flex items-center gap-1.5"><input type="radio" name="reset" className="accent-green-600" />매월 0으로 초기화</label>
                    <label className="flex items-center gap-1.5"><input type="radio" name="reset" className="accent-green-600" />매일 0으로 초기화</label>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">동작 옵션</div>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs text-gray-700 pl-2">
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />주행거리 자동계산</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-green-600" />인쇄물 마스킹 제거</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />[방문이력] 차량번호로 조회하기</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-green-600" />매출내역 [차량번호] 입력시 [고객]창 출력</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />[셋트부품] 단가 공급가액으로 적용</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />[AOS2017] 사진불러오기</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-green-600" />문자발송 - 개인정보 동의조건 적용하기</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />차계부 [수리이력] 비활성화</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-green-600" />점검정비명세서 인쇄 후 차계부 설치안내문 자동발송</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-green-600" />타업체와 수리이력 공유 불가</label>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="RONO설정">
                <div className="mb-3">
                  <Toggle checked={ronoMonthly} onChange={setRonoMonthly} label="월 단위 RONO 증가" />
                </div>

                <div className="flex gap-6">
                  <div className="w-40 shrink-0">
                    <FixedHeadTable
                      columns={[
                        { key: 'yearMonth', title: '년월', width: '55%' },
                        { key: 'day', title: '일', width: '45%' },
                      ]}
                      rows={ronoRows}
                      rowKey={(row) => row.key}
                      rowSize="sm"
                      height={200}
                      selectedKey={ronoSelected}
                      onRowClick={(row) => setRonoSelected(row.key)}
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 w-16">최종 RONO</div>
                      <input
                        value={ronoSelectedRow.finalRono}
                        onChange={(e) => setRonoFinalValue(e.target.value)}
                        className="w-24 text-xs rounded-sm border border-gray-300 px-2.5 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {[
                        { key: 'general', label: '일반' },
                        { key: 'insurance', label: '보험' },
                        { key: 'warranty', label: '보증' },
                        { key: 'inspection', label: '점검' },
                      ].map((t) => {
                        const task = ronoSelectedRow.tasks[t.key]
                        return (
                          <div key={t.key} className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs text-gray-700 w-16">
                              <input
                                type="checkbox"
                                checked={task.checked}
                                onChange={(e) => setRonoTask(t.key, { checked: e.target.checked })}
                                className="accent-green-600"
                              />
                              {t.label}
                            </label>
                            <input
                              disabled={!task.checked}
                              value={task.value}
                              onChange={(e) => setRonoTask(t.key, { value: e.target.value })}
                              className={`w-24 text-xs rounded-sm border px-2.5 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400 ${
                                task.checked ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                              }`}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-[10px] text-gray-400">※ 체크한 업무는 별도 RONO 증가</div>

                    <label className="flex items-center gap-1.5 text-xs text-gray-700 pt-3 border-t border-gray-100 mt-1">
                      <input
                        type="checkbox"
                        checked={ronoExtraCheck}
                        onChange={(e) => setRonoExtraCheck(e.target.checked)}
                        className="accent-green-600"
                      />
                      보험외 업무 경정비 기본 선택
                    </label>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="grid grid-cols-2 gap-3.5">
            <SectionCard title="고객문자발송">
              <div className="flex flex-col gap-2">
                <FormField label="문자상호" labelWidth="w-20" value="인트라밴공업사" />
                <FormField label="발신번호" labelWidth="w-20">
                  <div className="flex-1 flex items-center gap-2">
                    <input className="flex-1 text-xs rounded-sm px-3 py-1.5 border border-gray-300" placeholder="발신번호" />
                    <Button size="sm" variant="successSoft">등록</Button>
                  </div>
                </FormField>
                <FormField label="자동문자" labelWidth="w-20">
                  <Select className="flex-1" value="1" onChange={() => {}} options={[{ value: '1', label: '1 사용' }]} />
                </FormField>
              </div>

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">발송 시점 (일 단위 오프셋)</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <FormField label="보험만료" labelWidth="w-20" value="1" suffix="일전" />
                  <FormField label="정기검사" labelWidth="w-20" value="1" suffix="일전" />
                  <FormField label="엔진오일교환" labelWidth="w-20" value="1" suffix="일전" />
                  <FormField label="환경검사" labelWidth="w-20" value="1" suffix="일전" />
                  <FormField label="해피콜" labelWidth="w-20" value="1" suffix="일후" />
                  <FormField label="첫방문" labelWidth="w-20" value="1" suffix="일후" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="통장표지설정">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">메모</div>
                  <textarea
                    defaultValue="통장표기 메모입니다. 표기화면 테스트 입니다!!"
                    className="w-full h-24 text-xs rounded-sm border border-gray-300 p-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">한줄메모</div>
                  <input
                    defaultValue="우리공장 기술력있어요. 수리받으러 오세요!!"
                    className="w-full text-xs rounded-sm border border-gray-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-700">
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />인쇄 후 강제 배출</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-green-600" />통장 돌려찍기</label>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'hq' && (
          <SectionCard title="하이퀵설정" tag="드래그로 노출 순서 변경">
            <FixedHeadTable
              columns={[
                { key: 'code', title: '코드', width: '15%' },
                { key: 'name', title: '정비메뉴명', width: '60%' },
                {
                  key: 'use',
                  title: '사용 유무',
                  width: '25%',
                  render: (val, row) => (
                    <Toggle checked={val} onChange={(next) => toggleHqUse(row.code, next)} label={val ? '사용' : '미사용'} />
                  ),
                },
              ]}
              rows={hqRows}
              rowKey={(row) => row.code}
              rowSize="sm"
              height={260}
              draggable
              onReorder={setHqRows}
              selectedKey={hqSelected}
              onRowClick={(row) => setHqSelected(row.code)}
            />
          </SectionCard>
        )}

        {activeTab === 'code' && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-3 gap-3.5">
              <SectionCard
                title="고객등급"
                actions={
                  <Button size="sm" onClick={() => setGradeModalOpen(true)}>
                    <Plus size={13} />
                    추가
                  </Button>
                }
              >
                <FixedHeadTable
                  columns={[
                    { key: 'code', title: '코드', width: '20%' },
                    { key: 'name', title: '고객등급', width: '43%' },
                    { key: 'rate', title: '적립율', width: '30%' },
                    {
                      key: '__delete',
                      title: '',
                      width: '15%',
                      render: (_val, row) => (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteGradeRow(row.code)
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      ),
                    },
                  ]}
                  rows={gradeRows}
                  rowKey={(row) => row.code}
                  rowSize="sm"
                  height={200}
                  selectedKey={gradeSelected}
                  onRowClick={(row) => setGradeSelected(row.code)}
                />
              </SectionCard>

              <SectionCard
                title="고객분류"
                actions={
                  <Button size="sm" onClick={() => setClassModalOpen(true)}>
                    <Plus size={13} />
                    추가
                  </Button>
                }
              >
                <FixedHeadTable
                  columns={[
                    { key: 'code', title: '코드', width: '20%' },
                    { key: 'name', title: '고객분류', width: '60%' },
                    {
                      key: '__delete',
                      title: '',
                      width: '20%',
                      render: (_val, row) => (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteClassRow(row.code)
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      ),
                    },
                  ]}
                  rows={classRows}
                  rowKey={(row) => row.code}
                  rowSize="sm"
                  height={200}
                />
              </SectionCard>

              <SectionCard
                title="작업상태"
                actions={
                  <Button size="sm" onClick={() => setStatusModalOpen(true)}>
                    <Plus size={13} />
                    추가
                  </Button>
                }
              >
                <FixedHeadTable
                  columns={[
                    { key: 'code', title: '코드', width: '20%' },
                    { key: 'name', title: '작업 상태명', width: '60%' },
                    {
                      key: '__delete',
                      title: '',
                      width: '20%',
                      render: (_val, row) => (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteStatusRow(row.code)
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      ),
                    },
                  ]}
                  rows={statusRows}
                  rowKey={(row) => row.code}
                  rowSize="sm"
                  height={200}
                />
              </SectionCard>

              <div className="col-span-3">
                <SectionCard
                  title="수입비용계정"
                  tag={`총 ${filteredAccountRows.length}건`}
                  actions={
                    <Button size="sm" onClick={openAccountModal}>
                      <Plus size={13} />
                      추가
                    </Button>
                  }
                >
                  <div className="mb-2.5 flex h-8 max-w-md items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
                    <Search size={14} className="text-gray-400" />
                    <input
                      value={accountQuery}
                      onChange={(e) => setAccountQuery(e.target.value)}
                      placeholder="계정코드 또는 계정명 검색"
                      className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                    />
                    {accountQuery && <button type="button" onClick={() => setAccountQuery('')} aria-label="검색어 지우기" className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
                  </div>
                  <FixedHeadTable
                    columns={[
                      { key: 'code', title: '계정코드', width: '25%' },
                      { key: 'name', title: '계정명', width: '60%' },
                      {
                        key: '__actions', title: '관리', width: '15%', align: 'center', render: (_val, row) => (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); openAccountEditModal(row) }} aria-label="수정" className="text-gray-400 hover:text-green-600"><Pencil size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteAccountRow(row) }} aria-label="삭제" className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        ),
                      },
                    ]}
                    rows={filteredAccountRows}
                    rowKey={(row) => row.code}
                    rowSize="sm"
                    height={240}
                    onRowDoubleClick={openAccountEditModal}
                    emptyText="등록된 수입비용계정이 없습니다."
                  />
                </SectionCard>
              </div>
            </div>

            {gradeModalOpen && (
              <Modal
                title="고객등급 추가"
                onClose={() => setGradeModalOpen(false)}
                footer={
                  <>
                    <Button onClick={() => setGradeModalOpen(false)}>취소</Button>
                    <Button variant="primary" onClick={addGradeRow}>등록</Button>
                  </>
                }
              >
                <div className="flex flex-col gap-3">
                  <FormField label="고객등급명" labelWidth="w-24" value={newGradeName} onChange={(e) => setNewGradeName(e.target.value)} />
                  <FormField label="포인트 적립율" labelWidth="w-24" value={newGradeRate} onChange={(e) => setNewGradeRate(e.target.value)} />
                </div>
              </Modal>
            )}

            {classModalOpen && (
              <Modal
                title="고객분류 추가"
                onClose={() => setClassModalOpen(false)}
                footer={
                  <>
                    <Button onClick={() => setClassModalOpen(false)}>취소</Button>
                    <Button variant="primary" onClick={addClassRow}>등록</Button>
                  </>
                }
              >
                <FormField label="고객분류명" labelWidth="w-24" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
              </Modal>
            )}
            {statusModalOpen && (
              <Modal
                title="작업상태 추가"
                onClose={() => setStatusModalOpen(false)}
                footer={
                  <>
                    <Button onClick={() => setStatusModalOpen(false)}>취소</Button>
                    <Button variant="primary" onClick={addStatusRow}>등록</Button>
                  </>
                }
              >
                <FormField label="작업 상태명" labelWidth="w-24" value={newStatusName} onChange={(e) => setNewStatusName(e.target.value)} />
              </Modal>
            )}
            {accountModalMode && (
              <Modal
                title={`수입비용계정 ${accountModalMode === 'new' ? '추가' : '수정'}`}
                description="수입비용일지에서 사용할 계정을 등록합니다."
                onClose={() => setAccountModalMode(null)}
                footer={
                  <>
                    <Button onClick={() => setAccountModalMode(null)}>취소</Button>
                    <Button variant="primary" onClick={saveAccountRow}>{accountModalMode === 'new' ? '등록' : '저장'}</Button>
                  </>
                }
              >
                <div className="flex flex-col gap-3">
                  <FormField label="계정코드" labelWidth="w-24" value={newAccountCode} onChange={(e) => setNewAccountCode(e.target.value)} autoFocus />
                  <FormField label="계정명" labelWidth="w-24" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
                </div>
              </Modal>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
