import { useState } from 'react'
import { X, Plus, Check, Search, GripVertical, ChevronDown } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * 퀵메뉴 설정 모달
 * - 좌: 전체 메뉴(아코디언) + 검색 → 추가
 * - 우: 내 퀵메뉴 → 드래그로 순서 변경 / 삭제 (HTML5 네이티브 DnD)
 * - 저장 시 onSave(next), 취소/닫기 시 변경 폐기
 */
export default function QuickMenuSettingsModal({ items, menuGroups, maxItems = 10, onClose, onSave }) {
  const [working, setWorking] = useState(items)
  const [openGroups, setOpenGroups] = useState(menuGroups.length ? [menuGroups[0].id] : [])
  const [query, setQuery] = useState('')
  const [dragIndex, setDragIndex] = useState(null)

  const isAdded = (id) => working.some((w) => w.id === id)
  const full = working.length >= maxItems
  const q = query.trim().toLowerCase()

  const toggleGroup = (id) =>
    setOpenGroups((p) => (p.includes(id) ? p.filter((g) => g !== id) : [...p, id]))

  const addItem = (item) => {
    if (isAdded(item.id) || full) return
    setWorking((p) => [...p, item])
  }
  const removeItem = (id) => setWorking((p) => p.filter((w) => w.id !== id))

  const onDragEnter = (i) => {
    if (dragIndex === null || dragIndex === i) return
    setWorking((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIndex(i)
  }

  return (
    <Modal
      title="퀵메뉴 설정"
      description={`자주 쓰는 메뉴를 최대 ${maxItems}개까지 등록하세요`}
      size="lg"
      onClose={onClose}
      headerActions={<span className="text-xs bg-green-50 text-green-700 rounded-full px-2.5 py-1">{working.length} / {maxItems}</span>}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={() => onSave(working)}>저장</Button>
        </>
      }
    >
        {/* 본문 2단 */}
        <div className="grid grid-cols-2">
          {/* 전체 메뉴 (아코디언) */}
          <div className="border-r border-gray-100 p-3.5">
            <div className="text-xs font-medium text-gray-900 mb-2">전체 메뉴</div>
            <div className="flex items-center gap-1.5 border border-gray-300 rounded-md px-2.5 py-1.5 mb-2.5">
              <Search size={14} className="text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="메뉴 검색…"
                className="flex-1 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <div className="h-72 overflow-auto flex flex-col gap-0.5 pr-0.5">
              {menuGroups.map((g) => {
                const children = g.children.filter((c) => !q || c.label.toLowerCase().includes(q))
                if (q && children.length === 0) return null
                const open = q ? true : openGroups.includes(g.id)
                return (
                  <div key={g.id}>
                    <button
                      onClick={() => toggleGroup(g.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800"
                    >
                      <span>{g.id} {g.label}</span>
                      <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
                    </button>
                    {open && children.map((c) => {
                      const added = isAdded(c.id)
                      return (
                        <div key={c.id} className={`flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md ${added ? 'bg-gray-50' : 'hover:bg-green-50'}`}>
                          <span className={`text-xs ${added ? 'text-gray-400' : 'text-gray-700'}`}>{c.label}</span>
                          {added ? (
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Check size={12} />추가됨</span>
                          ) : (
                            <button
                              disabled={full}
                              onClick={() => addItem(c)}
                              className={full ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:text-green-700'}
                            >
                              <Plus size={15} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 내 퀵메뉴 (드래그 순서) */}
          <div className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-900">내 퀵메뉴</span>
              <span className="text-xs text-gray-400">드래그로 순서 변경</span>
            </div>
            <div className="h-80 overflow-auto flex flex-col gap-1.5">
              {working.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-10">왼쪽에서 메뉴를 추가하세요</div>
              )}
              {working.map((item, idx) => {
                const Icon = item.Icon
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragEnter={() => onDragEnter(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={() => setDragIndex(null)}
                    className={`flex items-center gap-2 border rounded-md px-2.5 py-2 bg-white ${dragIndex === idx ? 'border-green-400 opacity-60' : 'border-gray-200'}`}
                  >
                    <GripVertical size={15} className="text-gray-300 cursor-grab shrink-0" />
                    <span className="size-6 rounded bg-green-50 text-green-800 flex items-center justify-center shrink-0">
                      {Icon && <Icon size={13} />}
                    </span>
                    <span className="flex-1 text-xs text-gray-700 truncate">{item.label}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 shrink-0"><X size={15} /></button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
    </Modal>
  )
}
