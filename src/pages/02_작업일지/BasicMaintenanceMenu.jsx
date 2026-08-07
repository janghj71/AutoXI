import { useEffect, useState } from 'react'

// 화면 구현 단계의 기본정비 코드입니다. API 연결 시 이 배열만 조회 데이터로 교체합니다.
const BASIC_MAINTENANCE_CATEGORIES = [
  {
    value: 'engine',
    label: '엔진·오일',
    items: [
      { value: 'X0101', label: '엔진오일 교환', defValue: '0.5' },
      { value: 'X0102', label: '엔진오일 필터 교환', defValue: '0.3' },
      { value: 'X0103', label: '에어클리너 교환', defValue: '0.3' },
    ],
  },
  {
    value: 'mission',
    label: '변속기·구동',
    items: [
      { value: 'X0201', label: '자동변속기 오일 교환', defValue: '0.8' },
      { value: 'X0202', label: '수동변속기 오일 교환', defValue: '0.7' },
      { value: 'X0203', label: '디퍼렌셜 오일 교환', defValue: '0.7' },
    ],
  },
  {
    value: 'brake',
    label: '브레이크',
    items: [
      { value: 'X0301', label: '앞 브레이크 패드 교환', defValue: '0.8' },
      { value: 'X0302', label: '뒤 브레이크 패드 교환', defValue: '0.8' },
      { value: 'X0303', label: '브레이크 오일 교환', defValue: '0.7' },
    ],
  },
  {
    value: 'cooling',
    label: '냉각·에어컨',
    items: [
      { value: 'X0401', label: '부동액 교환', defValue: '0.8' },
      { value: 'X0402', label: '에어컨 필터 교환', defValue: '0.3' },
      { value: 'A0403', label: '에어컨 가스 점검·충전', defValue: '0.5' },
    ],
  },
  {
    value: 'consumable',
    label: '일반 소모품',
    items: [
      { value: 'X0501', label: '와이퍼 블레이드 교환', defValue: '0.2' },
      { value: 'X0502', label: '배터리 교환', defValue: '0.5' },
      { value: 'A0503', label: '타이어 공기압 점검', defValue: '0.2' },
    ],
  },
]

function CategoryRow({ category, active, onHover }) {
  return (
    <button
      type="button"
      onMouseEnter={(event) => onHover({
        rect: event.currentTarget.getBoundingClientRect(),
        category,
      })}
      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 active:bg-gray-200 ${active ? 'bg-gray-100' : ''}`}
    >
      <span>{category.label}</span>
      <span className="ml-3 text-xs text-gray-400">›</span>
    </button>
  )
}

export default function BasicMaintenanceMenu({ open, onClose, onItemClick }) {
  const [submenu, setSubmenu] = useState(null)

  useEffect(() => {
    if (!open) setSubmenu(null)
  }, [open])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="기본정비항목 메뉴 닫기"
        onMouseDown={onClose}
        className="fixed inset-0 z-[1040] cursor-default"
      />
      <div
        className="absolute left-0 top-full z-[1050] mt-1 min-w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {BASIC_MAINTENANCE_CATEGORIES.map((category) => (
          <CategoryRow
            key={category.value}
            category={category}
            active={submenu?.category.value === category.value}
            onHover={setSubmenu}
          />
        ))}
      </div>

      {submenu && (
        <div
          className="fixed z-[1060] min-w-52 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          style={{
            top: Math.min(submenu.rect.top, globalThis.innerHeight - 220),
            left: submenu.rect.right + 4,
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-0.5 p-1">
            {submenu.category.items.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onItemClick?.(item)
                  onClose?.()
                }}
                className="whitespace-nowrap rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 active:bg-green-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
