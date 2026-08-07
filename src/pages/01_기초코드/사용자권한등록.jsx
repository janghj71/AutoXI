import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, KeyRound, Pencil, Plus, RotateCcw, Search, ShieldCheck, Trash2, X } from 'lucide-react'
import { useAlert } from '../../alerts'
import Button from '../../components/Button'
import FixedHeadTable from '../../components/FixedHeadTable'
import FormField from '../../components/FormField'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import Select from '../../components/Select'
import { menuData } from '../../data/menuData'
import { focusNextOnEnter } from '../../utils/focusNextOnEnter'

const CURRENT_ROLE = 'factoryManager'
const ROLE_OPTIONS = [
  { value: 'superAdmin', label: '최상위자' },
  { value: 'factoryManager', label: '공장관리자' },
  { value: 'factoryUser', label: '공장사용자' },
]
const STATUS_OPTIONS = [{ value: 'active', label: '사용' }, { value: 'stopped', label: '중지' }]
const ALL_MENU_IDS = menuData.flatMap((group) => group.children ?? []).map((menu) => menu.id)
const USER_DEFAULT_MENU_IDS = ['0201', '0202', '0203', '0208', '0210', '0301', '0302', '0401', '0402']
const roleDefaultMenus = (role) => role === 'factoryUser' ? USER_DEFAULT_MENU_IDS.filter((id) => ALL_MENU_IDS.includes(id)) : ALL_MENU_IDS
const roleLabel = (role) => ROLE_OPTIONS.find((option) => option.value === role)?.label ?? ''
const statusLabel = (status) => STATUS_OPTIONS.find((option) => option.value === status)?.label ?? ''

const INITIAL_USERS = [
  { id: 'admin01', name: '공장 관리자', role: 'factoryManager', status: 'active', lastLogin: '2026-07-21 09:12', device: 'DESKTOP-AUTO01', certifiedAt: '2026-01-10', cashPermission: true, deletePermission: true, menuIds: roleDefaultMenus('factoryManager') },
  { id: 'worker01', name: '정비 담당자', role: 'factoryUser', status: 'active', lastLogin: '2026-07-20 18:34', device: 'TABLET-01', certifiedAt: '2026-03-15', cashPermission: false, deletePermission: false, menuIds: roleDefaultMenus('factoryUser') },
  { id: 'worker02', name: '접수 담당자', role: 'factoryUser', status: 'stopped', lastLogin: '2026-06-30 14:20', device: 'DESKTOP-RECEP', certifiedAt: '2025-11-02', cashPermission: true, deletePermission: false, menuIds: [...roleDefaultMenus('factoryUser'), '0101'] },
  { id: 'root', name: '시스템 최고관리자', role: 'superAdmin', status: 'active', lastLogin: '2026-07-21 08:00', device: 'SYSTEM', certifiedAt: '2025-01-01', cashPermission: true, deletePermission: true, menuIds: roleDefaultMenus('superAdmin') },
]

export default function UserPermissionPage() {
  const alert = useAlert()
  const [users, setUsers] = useState(INITIAL_USERS)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('admin01')
  const [editing, setEditing] = useState(null)
  const [menuQuery, setMenuQuery] = useState('')
  const [openGroups, setOpenGroups] = useState(() => menuData.map((group) => group.id))

  const displayedUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return users.filter((user) => (roleFilter === 'all' || user.role === roleFilter) && (!keyword || [user.id, user.name, roleLabel(user.role), statusLabel(user.status), user.device].some((value) => value.toLowerCase().includes(keyword))))
  }, [query, roleFilter, users])
  const selectedMenuIds = new Set(editing?.menuIds ?? [])
  const availableGroups = menuData.map((group) => ({
    ...group,
    children: (group.children ?? []).filter((menu) => !menuQuery.trim() || menu.label.toLowerCase().includes(menuQuery.trim().toLowerCase())),
  })).filter((group) => group.children.length > 0)
  const selectedMenus = menuData.flatMap((group) => (group.children ?? []).map((menu) => ({ ...menu, groupLabel: group.label }))).filter((menu) => selectedMenuIds.has(menu.id))
  const canManageUser = (user) => CURRENT_ROLE === 'superAdmin' || user.role !== 'superAdmin'

  const openEdit = (user) => {
    if (!canManageUser(user)) return alert.warning('최상위자는 최상위자만 수정할 수 있습니다.')
    setEditing({ ...user, menuIds: [...user.menuIds] })
    setMenuQuery('')
  }
  const setField = (key) => (value) => setEditing((prev) => ({ ...prev, [key]: value }))
  const changeRole = (role) => setEditing((prev) => ({ ...prev, role, menuIds: roleDefaultMenus(role) }))
  const addMenu = (id) => setEditing((prev) => prev.menuIds.includes(id) ? prev : { ...prev, menuIds: [...prev.menuIds, id] })
  const removeMenu = (id) => setEditing((prev) => ({ ...prev, menuIds: prev.menuIds.filter((menuId) => menuId !== id) }))
  const addGroup = (group) => setEditing((prev) => ({ ...prev, menuIds: [...new Set([...prev.menuIds, ...group.children.map((menu) => menu.id)])] }))
  const save = async () => {
    if (!editing.name.trim()) return alert.warning('사용자명을 입력해 주세요.')
    setUsers((prev) => prev.map((user) => user.id === editing.id ? editing : user))
    setEditing(null)
    await alert.success('사용자 권한이 수정되었습니다.')
  }
  const remove = async (user) => {
    if (!canManageUser(user)) return alert.warning('최상위자는 삭제할 수 없습니다.')
    if (!(await alert.remove(`'${user.name}' 사용자를 삭제하시겠습니까?`))) return
    setUsers((prev) => prev.filter((item) => item.id !== user.id))
    if (selectedId === user.id) setSelectedId(null)
  }

  const columns = [
    { key: 'id', title: '아이디', width: '13%' },
    { key: 'name', title: '사용자명', width: '14%' },
    { key: 'role', title: '사용자 역할', width: '13%', render: roleLabel },
    { key: 'status', title: '상태', width: '9%', align: 'center', render: (value) => <span className={`rounded-full px-2 py-0.5 text-[11px] ${value === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{statusLabel(value)}</span> },
    { key: 'lastLogin', title: '최종로그인', width: '17%', align: 'center' },
    { key: 'device', title: '인증단말기', width: '15%' },
    { key: 'certifiedAt', title: '인증일자', width: '12%', align: 'center' },
    { key: '__actions', title: '관리', width: '7%', align: 'center', render: (_value, user) => <div className="flex justify-center gap-2"><button type="button" disabled={!canManageUser(user)} aria-label="수정" onClick={(event) => { event.stopPropagation(); openEdit(user) }} className="text-gray-400 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-25"><Pencil size={14} /></button><button type="button" disabled={!canManageUser(user)} aria-label="삭제" onClick={(event) => { event.stopPropagation(); remove(user) }} className="text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-25"><Trash2 size={14} /></button></div> },
  ]

  if (!['superAdmin', 'factoryManager'].includes(CURRENT_ROLE)) {
    return <div className="flex h-full items-center justify-center bg-gray-50"><div className="text-center"><ShieldCheck size={36} className="mx-auto mb-3 text-gray-300" /><div className="font-semibold text-gray-700">접근 권한이 없습니다.</div><div className="mt-1 text-xs text-gray-400">최상위자 또는 공장관리자만 사용할 수 있습니다.</div></div></div>
  }

  return (
    <div className="h-full flex flex-col bg-gray-50" onKeyDown={focusNextOnEnter}>
      <PageHeader title="사용자권한등록" description="사용자 역할과 기능·메뉴 접근 권한을 관리합니다." icon={KeyRound} />
      <div className="flex-1 overflow-auto p-3">
        <SectionCard title="사용자 목록" tag={`총 ${displayedUsers.length}명`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 max-w-xl flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-600/15"><Search size={15} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="아이디, 사용자명, 역할, 상태, 인증단말기 필터" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" />{query && <button type="button" onClick={() => setQuery('')} aria-label="필터 지우기" className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}</div>
            <div className="ml-auto w-36"><Select value={roleFilter} onChange={setRoleFilter} options={[{ value: 'all', label: '전체 역할' }, ...ROLE_OPTIONS]} /></div>
          </div>
          <FixedHeadTable columns={columns} rows={displayedUsers} rowKey={(user) => user.id} rowSize="sm" height={450} selectedKey={selectedId} onRowClick={(user) => setSelectedId(user.id)} onRowDoubleClick={openEdit} emptyText="사용자 정보가 없습니다." />
          <div className="pt-2.5 text-[11px] text-gray-400">신규 사용자는 별도 가입 절차에서 생성되며, 이 화면에서는 권한 수정과 삭제만 가능합니다.</div>
        </SectionCard>
      </div>

      {editing && (
        <Modal title="사용자 권한 수정" description="역할 기본값을 적용한 뒤 사용자별 메뉴를 조정할 수 있습니다." size="xl" onClose={() => setEditing(null)} footer={<><Button onClick={() => setEditing(null)}>취소</Button><Button variant="primary" onClick={save}>저장</Button></>}>
          <div className="max-h-[72vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="mb-2 text-xs font-semibold text-gray-800">사용자 정보</div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
              <FormField label="아이디" labelWidth="w-20" value={editing.id} readOnly />
              <FormField label="사용자명" labelWidth="w-20" value={editing.name} onChange={(event) => setField('name')(event.target.value)} autoFocus />
              <FormField label="사용자 역할" labelWidth="w-24"><Select className="flex-1" value={editing.role} onChange={changeRole} options={ROLE_OPTIONS} /></FormField>
              <FormField label="상태" labelWidth="w-20"><Select className="flex-1" value={editing.status} onChange={setField('status')} options={STATUS_OPTIONS} /></FormField>
              <FormField label="최종로그인" labelWidth="w-20" value={editing.lastLogin} readOnly />
              <FormField label="인증단말기" labelWidth="w-24" value={editing.device} readOnly />
              <FormField label="인증일자" labelWidth="w-20" value={editing.certifiedAt} readOnly />
            </div>

            <div className="mt-5 mb-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-800">기능 권한</div>
            <div className="flex gap-6 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <label className="flex items-center gap-2 text-xs text-gray-700"><input type="checkbox" checked={editing.cashPermission} onChange={(event) => setField('cashPermission')(event.target.checked)} className="accent-green-600" />입출금 권한</label>
              <label className="flex items-center gap-2 text-xs text-gray-700"><input type="checkbox" checked={editing.deletePermission} onChange={(event) => setField('deletePermission')(event.target.checked)} className="accent-green-600" />삭제 권한</label>
            </div>

            <div className="mt-5 mb-2 flex items-center border-t border-gray-100 pt-4"><div className="text-xs font-semibold text-gray-800">메뉴 접근 권한</div><Button variant="ghost" size="sm" className="ml-auto" onClick={() => setEditing((prev) => ({ ...prev, menuIds: roleDefaultMenus(prev.role) }))}><RotateCcw size={13} />역할 기본값</Button></div>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200">
              <div className="border-r border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800">전체 메뉴</div>
                <div className="p-3"><div className="mb-2 flex h-8 items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5"><Search size={14} className="text-gray-400" /><input value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} placeholder="메뉴 검색" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />{menuQuery && <button type="button" onClick={() => setMenuQuery('')}><X size={13} className="text-gray-400" /></button>}</div><div className="h-72 overflow-y-auto pr-1">{availableGroups.map((group) => { const open = menuQuery || openGroups.includes(group.id); return <div key={group.id} className="mb-1"><div className="flex items-center gap-1"><button type="button" onClick={() => setOpenGroups((prev) => prev.includes(group.id) ? prev.filter((id) => id !== group.id) : [...prev, group.id])} className="flex flex-1 items-center gap-1 px-1 py-1.5 text-left text-xs font-semibold text-gray-700">{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}{group.label}</button><button type="button" onClick={() => addGroup(group)} className="rounded px-1.5 py-1 text-[11px] text-green-700 hover:bg-green-50">전체 추가</button></div>{open && group.children.map((menu) => <div key={menu.id} className="flex items-center justify-between rounded-md py-1.5 pl-6 pr-2 hover:bg-gray-50"><span className={selectedMenuIds.has(menu.id) ? 'text-xs text-gray-400' : 'text-xs text-gray-700'}>{menu.label}</span><button type="button" disabled={selectedMenuIds.has(menu.id)} onClick={() => addMenu(menu.id)} className="text-green-600 disabled:text-gray-200"><Plus size={14} /></button></div>)}</div> })}</div></div>
              </div>
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2"><span className="text-xs font-semibold text-gray-800">접근 가능 메뉴</span><span className="text-[11px] text-gray-400">{selectedMenus.length}개</span></div>
                <div className="h-[324px] overflow-y-auto p-3">{selectedMenus.length === 0 && <div className="py-10 text-center text-xs text-gray-400">접근 가능한 메뉴가 없습니다.</div>}{selectedMenus.map((menu) => <div key={menu.id} className="mb-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-2"><span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{menu.groupLabel}</span><span className="min-w-0 flex-1 truncate text-xs text-gray-700">{menu.label}</span><button type="button" onClick={() => removeMenu(menu.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></div>)}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
