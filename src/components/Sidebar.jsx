import { useState } from 'react'
import { menuData } from '../data/menuData'

export default function Sidebar({ onMenuClick, activeMenuId }) {
  const [openGroups, setOpenGroups] = useState(['01'])

  const toggleGroup = (id) => {
    // 아코디언: 한 번에 하나의 그룹만 열림
    setOpenGroups((prev) => (prev.includes(id) ? [] : [id]))
  }

  return (
    <aside className="w-56 h-full bg-white text-gray-700 flex flex-col select-none shrink-0 border-r border-gray-200">
      {/* 로고 영역 */}
      <div className="flex items-center px-5 h-12 bg-white text-green-700 font-bold text-base tracking-wide border-b border-gray-200 shrink-0">
        🔧 AutoXI
      </div>
      {/* 메뉴 */}
      <nav className="flex-1 overflow-y-auto">
        {menuData.map((group) => {
          const isOpen = openGroups.includes(group.id)
          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between py-2.5 text-[13px] tracking-wide border-b border-gray-200 transition-colors ${
                  isOpen
                    ? 'bg-gray-100 text-green-700 font-bold'
                    : 'bg-gray-50 text-gray-800 font-semibold hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={{ paddingLeft: '20px', paddingRight: '12px' }}
              >
                <span>{group.label}</span>
                <span className={isOpen ? 'text-green-600' : 'text-gray-400'}>{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen && (
                <ul className="list-none m-0 p-0">
                  {group.children.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onMenuClick(item)}
                        className={`w-full text-left py-1.5 text-sm transition-colors ${
                          activeMenuId === item.id
                            ? 'bg-green-600 text-white font-semibold'
                            : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        style={{ paddingLeft: '28px' }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
