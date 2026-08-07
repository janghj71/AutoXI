import { useRef, useState } from 'react'
import { Car, Plus, Search, Trash2, UserRound, UserPlus, Link2, Info, X } from 'lucide-react'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import TelField from '../../components/TelField'
import { useAlert } from '../../alerts'
import { openPostcodeSearch } from '../../utils/postcode'
import SalesCustomerPage from '../01_기초코드/매출처등록'
import VehicleNamePage from '../01_기초코드/차량명등록'

const OWNER_INITIAL = {
  name: '장희세', mobile: ['010', '1010', '5252'], home: ['', '', ''], birth: '1985-04-18', gender: '남', solarLunar: '양력',
  anniversary: '', postcode: '12925', address: '경기도 하남시 미사대로 520', addressDetail: 'C동 7층 722호', grade: 'VIP',
  registeredAt: '2026-07-22', memberNo: 'C000127', category: '일반고객', email: 'hong@example.com', memo: '',
}

// 연결 가능한 기존 고객 (N:M — 한 고객이 여러 차량 소유)
const EXISTING_CUSTOMERS = [
  { id: 'C000127', name: '장희세', mobile: '010-1010-5252', grade: 'VIP', vehicles: 2 },
  { id: 'C000241', name: '이하나', mobile: '010-2241-7730', grade: '우수', vehicles: 1 },
  { id: 'C000305', name: '최민수', mobile: '010-5512-0091', grade: '일반', vehicles: 3 },
]

const makeVehicle = (vehicle) => ({
  carNo: vehicle.carNo, taxi: false, carCode: '0315026', carName: vehicle.car, customerCategory: '일반고객',
  model: '가솔린 2.5 터보', vin: '', madeAt: '', paintColor: '2 수용성', paintCoat: '2 코트', companyCode: '0001', company: '매출처',
  registeredAt: '2022-06-16', inspectExpire: '2026-11-30', inspectCycle: '2년', envInspect: '2026-06-16',
  checkExpire: '2027-06-15', vehicleExpire: '', insuranceExpire: '2027-06-15', insurer: vehicle.insurer || '',
  tempContact: (vehicle.phone || '010-1010-5252').split('-'), memo: '', options: ['후방 카메라', '스마트키', '선루프'],
})

function SectionTitle({ icon: Icon, title, description, actions }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
      <Icon size={15} className="text-green-600" />
      <div>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        {description && <div className="text-[11px] text-gray-400">{description}</div>}
      </div>
      {actions && <div className="ml-auto flex gap-1.5">{actions}</div>}
    </div>
  )
}

// 대표 연락처 — 상태에 따라 차량↔고객으로 이동. 앰버 강조로 구분.
function ContactField({ label, labelWidth = 'w-20', children }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1.5">
      <label className={`${labelWidth} shrink-0 text-right text-xs font-semibold text-amber-700`}>{label}</label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function CustomerSearchModal({ onClose, onLink }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(EXISTING_CUSTOMERS[0].id)
  const rows = EXISTING_CUSTOMERS.filter((c) => {
    const k = query.trim().toLowerCase()
    return !k || [c.name, c.mobile, c.id].some((v) => v.toLowerCase().includes(k))
  })
  const selected = rows.find((c) => c.id === selectedId)

  return (
    <Modal
      title="기존 고객 검색·연결"
      description="검색한 고객을 현재 차량의 소유자로 연결합니다."
      size="lg"
      onClose={onClose}
      footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" disabled={!selected} onClick={() => selected && onLink(selected)}><Link2 size={14} />소유자로 연결</Button></>}
    >
      <div className="mb-3 flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15">
        <Search size={14} className="text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="고객명, 휴대전화, 회원번호 검색" data-modal-autofocus className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </div>
      <div className="overflow-hidden rounded-md border border-gray-200">
        <FixedHeadTable
          columns={[
            { key: 'name', title: '고객명', width: '22%' },
            { key: 'mobile', title: '휴대전화', width: '30%' },
            { key: 'grade', title: '등급', width: '18%' },
            { key: 'vehicles', title: '보유차량', width: '18%', align: 'right', render: (v) => `${v}대` },
            { key: 'id', title: '회원번호', width: '12%' },
          ]}
          rows={rows}
          rowKey={(row) => row.id}
          rowSize="sm"
          height={200}
          selectedKey={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          onRowDoubleClick={(row) => onLink(row)}
          emptyText="검색 결과가 없습니다."
        />
      </div>
    </Modal>
  )
}

function OwnerRegistrationModal({ initialOwner, mode, onClose, onSave }) {
  const alert = useAlert()
  const detailAddressRef = useRef(null)
  const [owner, setOwner] = useState(initialOwner)
  const isEdit = mode === 'edit'
  const set = (key) => (event) => setOwner((prev) => ({ ...prev, [key]: event.target.value }))
  const setValue = (key) => (value) => setOwner((prev) => ({ ...prev, [key]: value }))
  const searchPostcode = async () => {
    try {
      const result = await openPostcodeSearch()
      if (!result) return
      setOwner((prev) => ({ ...prev, postcode: result.zonecode, address: result.address, addressDetail: '' }))
      requestAnimationFrame(() => detailAddressRef.current?.focus())
    } catch (error) {
      alert.error(error instanceof Error ? error.message : '우편번호 검색을 시작하지 못했습니다.')
    }
  }

  return (
    <Modal title={isEdit ? '고객 정보 수정' : '고객 등록'} description={isEdit ? '현재 연결된 고객 정보를 수정합니다.' : '고객을 등록하고 현재 차량의 소유자로 연결합니다.'} size="xl" onClose={onClose} footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" onClick={() => onSave(owner)}>{isEdit ? '저장' : '등록·연결'}</Button></>}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="col-span-2 grid min-w-0 grid-cols-3 gap-x-6">
          <FormField label="고객명" labelWidth="w-20" value={owner.name} onChange={set('name')} autoFocus required />
          <FormField label="생년월일" labelWidth="w-20" value={owner.birth} onChange={set('birth')} type="date" />
          <FormField label="성별" labelWidth="w-20"><Select className="w-full min-w-0" value={owner.gender} onChange={setValue('gender')} options={['남', '여']} /></FormField>
        </div>
        <div className="col-span-2 grid min-w-0 grid-cols-3 gap-x-6">
          <FormField label="휴대전화" labelWidth="w-20" required><TelField value={owner.mobile} onChange={setValue('mobile')} /></FormField>
          <FormField label="구분" labelWidth="w-20"><Select className="w-full min-w-0" value={owner.solarLunar} onChange={setValue('solarLunar')} options={['양력', '음력']} /></FormField>
          <FormField label="기념일" labelWidth="w-20" value={owner.anniversary} onChange={set('anniversary')} type="date" />
        </div>
        <div className="col-span-2 grid min-w-0 grid-cols-3 gap-x-6">
          <FormField label="자택전화" labelWidth="w-20"><TelField value={owner.home} onChange={setValue('home')} /></FormField>
          <FormField label="고객등급" labelWidth="w-20"><Select className="w-full min-w-0" value={owner.grade} onChange={setValue('grade')} options={['일반', '우수', 'VIP']} /></FormField>
          <FormField label="고객분류" labelWidth="w-20"><Select className="w-full min-w-0" value={owner.category} onChange={setValue('category')} options={['일반고객', '보험고객', '법인고객']} /></FormField>
        </div>
        <div className="col-span-2 grid min-w-0 grid-cols-3 gap-x-6">
          <FormField label="우편번호" labelWidth="w-20">
            <div className="grid w-full min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-1.5">
              <input value={owner.postcode} readOnly inputMode="numeric" maxLength={5} className="w-full min-w-0 rounded-sm border border-gray-300 bg-gray-50 px-2 py-1.5 text-center text-xs text-gray-800 outline-none" />
              <Button className="h-[30px] shrink-0 px-2.5 text-xs" onClick={searchPostcode} title="우편번호 찾기"><Search size={13} />우편번호</Button>
            </div>
          </FormField>
          <div />
          <div />
        </div>
        <FormField label="기본주소" labelWidth="w-20" value={owner.address} onChange={set('address')} className="col-span-2" />
        <FormField label="상세주소" labelWidth="w-20" className="col-span-2"><input ref={detailAddressRef} value={owner.addressDetail} onChange={set('addressDetail')} placeholder="상세주소 입력" className="w-full rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" /></FormField>
        <FormField label="이메일" labelWidth="w-20" value={owner.email} onChange={set('email')} />
        <div />
        <FormField label="메모사항" labelWidth="w-20" align="start" className="col-span-2"><textarea value={owner.memo} onChange={set('memo')} className="min-h-24 w-full resize-none rounded-sm border border-gray-300 p-3 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" /></FormField>
      </div>
    </Modal>
  )
}

export default function VehicleCustomerModal({ vehicle, hasOwner, onClose }) {
  const [linked, setLinked] = useState(hasOwner)
  const [owner, setOwner] = useState(OWNER_INITIAL)
  const [veh, setVeh] = useState(() => makeVehicle(vehicle))
  const [registerOpen, setRegisterOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [vehicleNameOpen, setVehicleNameOpen] = useState(false)
  const setV = (key) => (event) => setVeh((prev) => ({ ...prev, [key]: event.target.value }))
  const setVValue = (key) => (value) => setVeh((prev) => ({ ...prev, [key]: value }))

  const iconBtn = 'inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-gray-300 text-gray-400 hover:bg-gray-50'

  return (
    <>
      <Modal title="차량·고객 정보" width="max-w-6xl" onClose={onClose} footer={<><Button onClick={onClose}>취소</Button><Button variant="primary">저장</Button></>}>
        <div className="max-h-[82vh] space-y-2 overflow-auto pr-1">

          {/* 차량 정보 */}
          <section className="overflow-hidden rounded-lg border border-gray-200">
            <SectionTitle icon={Car} title="차량 정보" description="차량 마스터는 고객과 별도로 관리됩니다 (N:M)" />

            {/* 기본정보 */}
            <div className="grid grid-cols-3 gap-x-5 gap-y-1.5 p-3">
              <FormField label="차량번호" labelWidth="w-20" required>
                <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                  <input value={veh.carNo} onChange={setV('carNo')} className="min-w-0 w-full rounded-sm border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" />
                  <label className="flex shrink-0 items-center gap-1 text-xs text-gray-600"><input type="checkbox" checked={veh.taxi} onChange={(e) => setVeh((p) => ({ ...p, taxi: e.target.checked }))} className="accent-green-600" />택시</label>
                  <Button size="sm" variant="successSoft" className="shrink-0">국토부</Button>
                </div>
              </FormField>
              <FormField label="차대번호" labelWidth="w-20" value={veh.vin} onChange={setV('vin')} placeholder="차대번호" />
              <FormField label="소속회사" labelWidth="w-20">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <div className="relative min-w-0 flex-1">
                    <input value={veh.company} readOnly placeholder="소속회사" className="w-full rounded-sm border border-gray-300 bg-gray-50 py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none" />
                    {veh.company && (
                      <button type="button" aria-label="소속회사 지우기" onClick={() => setVeh((p) => ({ ...p, companyCode: '', company: '' }))} className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button type="button" className={iconBtn} onClick={() => setCompanyOpen(true)} aria-label="소속회사 검색"><Search size={13} /></button>
                </div>
              </FormField>

              <FormField label="차량명" labelWidth="w-20" required>
                <div className="grid min-w-0 flex-1 grid-cols-[4.5rem_30px_minmax(0,1fr)] items-center gap-1.5 overflow-hidden">
                  <input value={veh.carCode} onChange={setV('carCode')} className="w-full min-w-0 rounded-sm border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-green-400" />
                  <button type="button" className={iconBtn} onClick={() => setVehicleNameOpen(true)} aria-label="차량명 검색"><Search size={13} /></button>
                  <input value={veh.carName} readOnly className="min-w-0 w-full rounded-sm border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-700" />
                </div>
              </FormField>
              <FormField label="제작일자" labelWidth="w-20" value={veh.madeAt} onChange={setV('madeAt')} type="date" />
              <FormField label="도장칼라" labelWidth="w-20"><Select className="w-full min-w-0" value={veh.paintColor} onChange={setVValue('paintColor')} options={['1 유용성', '2 수용성']} /></FormField>

              <FormField label="모델명" labelWidth="w-20" value={veh.model} onChange={setV('model')} />
              <FormField label="차량등록일" labelWidth="w-20" value={veh.registeredAt} onChange={setV('registeredAt')} type="date" />
              <FormField label="도장코트" labelWidth="w-20"><Select className="w-full min-w-0" value={veh.paintCoat} onChange={setVValue('paintCoat')} options={['1 코트', '2 코트', '3 코트']} /></FormField>
            </div>

            {/* 검사·만료일 */}
            <div className="grid grid-cols-3 gap-x-5 gap-y-1.5 border-t border-gray-100 p-3">
              <FormField label="검사만료일" labelWidth="w-20">
                <div className="flex flex-1 items-center gap-1.5">
                  <input type="date" value={veh.inspectExpire} onChange={setV('inspectExpire')} className="min-w-0 flex-1 rounded-sm border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-green-400" />
                  <div className="w-16 shrink-0"><Select value={veh.inspectCycle} onChange={setVValue('inspectCycle')} options={['1년', '2년']} /></div>
                </div>
              </FormField>
              <FormField label="점검만료일" labelWidth="w-20" value={veh.checkExpire} onChange={setV('checkExpire')} type="date" />
              <FormField label="보험만료일" labelWidth="w-20" value={veh.insuranceExpire} onChange={setV('insuranceExpire')} type="date" />

              <FormField label="환경검사일" labelWidth="w-20" value={veh.envInspect} onChange={setV('envInspect')} type="date" />
              <FormField label="차량만료일" labelWidth="w-20" value={veh.vehicleExpire} onChange={setV('vehicleExpire')} type="date" />
              <FormField label="보험사명" labelWidth="w-20" value={veh.insurer} onChange={setV('insurer')} placeholder="보험사명" />
            </div>

            {/* 고객분류·연락처(미연결 시) + 메모 */}
            <div className="border-t border-gray-100 p-3">
              {!linked ? (
                <div className="grid grid-cols-3 gap-x-5">
                  <FormField label="메모" labelWidth="w-20" align="start" className="col-span-2"><textarea value={veh.memo} onChange={setV('memo')} className="min-h-[72px] w-full resize-none rounded-sm border border-gray-300 p-2.5 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" /></FormField>
                  <div className="flex flex-col gap-2">
                    <FormField label="고객분류" labelWidth="w-20"><Select value={veh.customerCategory} onChange={setVValue('customerCategory')} options={['일반고객', '보험고객', '법인고객']} /></FormField>
                    <FormField label="연락처" labelWidth="w-20"><TelField value={veh.tempContact} onChange={setVValue('tempContact')} /></FormField>
                    <div className="flex items-center gap-1.5 pl-[88px] text-[11px] text-amber-700"><Info size={12} className="shrink-0" />고객 연결 시 고객쪽 등급·휴대전화로 대체됩니다.</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-x-5"><FormField label="메모" labelWidth="w-20" align="start" className="col-span-3"><textarea value={veh.memo} onChange={setV('memo')} className="min-h-14 w-full resize-none rounded-sm border border-gray-300 p-2.5 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15" /></FormField></div>
              )}
            </div>

            {/* 차량 옵션 */}
            <div className="border-t border-gray-100 p-3">
              <div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-semibold text-gray-700">차량 옵션</span><Button size="sm"><Plus size={13} />옵션 등록</Button></div>
              <div className="flex min-h-10 flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-2.5">
                {veh.options.map((option) => (
                  <span key={option} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
                    {option}
                    <button type="button" aria-label={`${option} 삭제`} onClick={() => setVeh((p) => ({ ...p, options: p.options.filter((o) => o !== option) }))} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 소유자 (고객) */}
          <section className="overflow-hidden rounded-lg border border-gray-200">
            <SectionTitle icon={UserRound} title="소유자 (고객)" description="한 고객은 여러 차량의 소유자로 연결될 수 있습니다." actions={linked && <><Button size="sm" onClick={() => setRegisterOpen(true)}>정보 수정</Button><Button size="sm" onClick={() => setLinked(false)}><Trash2 size={13} />연결 해제</Button></>} />

            {!linked ? (
              <div className="flex min-h-28 flex-col items-center justify-center gap-2.5 bg-white p-4 text-center">
                <div className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-gray-400"><UserPlus size={21} /></div>
                <div>
                  <div className="text-sm font-medium text-gray-700">연결된 소유자가 없습니다</div>
                  <div className="mt-1 text-xs text-gray-400">기존 고객을 검색해 연결하거나, 새 고객을 등록해 소유자로 지정합니다.</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setSearchOpen(true)}><Search size={14} />기존 고객 검색·연결</Button>
                  <Button variant="primary" onClick={() => setRegisterOpen(true)}><UserPlus size={14} />신규 고객 등록</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-5 gap-y-1.5 p-3">
                <FormField label="고객명" labelWidth="w-20" value={owner.name} readOnly />
                <FormField label="생년월일" labelWidth="w-20" value={`${owner.birth} · ${owner.solarLunar} · ${owner.gender}`} readOnly />
                <FormField label="고객등급" labelWidth="w-20" value={owner.grade} readOnly />
                <ContactField label="휴대전화"><div className="text-xs font-medium text-gray-800">{owner.mobile.join('-')}</div></ContactField>
                <FormField label="기념일자" labelWidth="w-20" value={owner.anniversary} readOnly />
                <FormField label="고객등록일" labelWidth="w-20" value={owner.registeredAt} readOnly />
                <FormField label="자택전화" labelWidth="w-20" value={owner.home.join('-')} readOnly />
                <FormField label="회원번호" labelWidth="w-20" value={owner.memberNo} readOnly />
                <FormField label="고객분류" labelWidth="w-20" value={owner.category} readOnly />
                <FormField label="주소" labelWidth="w-20" value={`${owner.address} ${owner.addressDetail}`} readOnly className="col-span-2" />
                <FormField label="이메일" labelWidth="w-20" value={owner.email} readOnly />
                <FormField label="메모사항" labelWidth="w-20" value={owner.memo} readOnly className="col-span-3" />
              </div>
            )}
          </section>
        </div>
      </Modal>

      {searchOpen && <CustomerSearchModal onClose={() => setSearchOpen(false)} onLink={(customer) => { setOwner((prev) => ({ ...prev, name: customer.name, mobile: customer.mobile.split('-'), grade: customer.grade, memberNo: customer.id })); setLinked(true); setSearchOpen(false) }} />}
      {registerOpen && <OwnerRegistrationModal initialOwner={owner} mode={linked ? 'edit' : 'new'} onClose={() => setRegisterOpen(false)} onSave={(next) => { setOwner(next); setLinked(true); setRegisterOpen(false) }} />}
      {companyOpen && <SalesCustomerPage selectionMode onCancel={() => setCompanyOpen(false)} onSelect={(salesCustomer) => { setVeh((prev) => ({ ...prev, companyCode: salesCustomer.code, company: salesCustomer.name })); setCompanyOpen(false) }} />}
      {vehicleNameOpen && <VehicleNamePage selectionMode onCancel={() => setVehicleNameOpen(false)} onSelect={({ vehicle: selectedVehicle, model: selectedModel }) => { setVeh((prev) => ({ ...prev, carCode: selectedVehicle.code, carName: selectedVehicle.name, model: selectedModel?.name ?? '' })); setVehicleNameOpen(false) }} />}
    </>
  )
}
