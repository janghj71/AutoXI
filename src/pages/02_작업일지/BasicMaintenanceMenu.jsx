import { useEffect, useState } from 'react'

// 화면 구현 단계의 기본정비 코드입니다. API 연결 시 이 배열만 조회 데이터로 교체합니다.
const BASIC_MAINTENANCE_CATEGORIES = [
  {
    value: 'm_cate1',
    label: '정형작업',
    
  },
  {
    value: 'm_cate2',
    label: '차체고정',
    items: [
      { value: 'X0101', label: 'Car-Oliner', defValue: '0.5' },
      { value: 'X0102', label: 'Car-Oliner(엔진-뒤서스펜션탈거시)', defValue: '0.3' },
      { value: 'X0103', label: 'Data liner', defValue: '0.3' },
    ],
  },
  {
    value: 'm_cate3',
    label: '차체계측',
    items: [
      { value: 'X0201', label: '차체 2D계측', defValue: '0.8' },
      { value: 'X0202', label: '차체 3D계측', defValue: '0.7' },
      { value: 'X0203', label: '이동형(리프팅포함)', defValue: '0.7' },
    ],
  },
  {
    value: 'm_cate4',
    label: '차체수정',
    items: [
      { value: 'X0301', label: '수리 전 기초정형', defValue: '0.8' },
      { value: 'X0302', label: '양면 스폿 용접(패널당)', defValue: '0.8' },
      { value: 'X0303', label: '수정작업(프레임 수정기 비용별도)', defValue: '0.7' },
    ],
  },
  {
    value: 'm_cate5',
    label: '시운전',
    items: [
      { value: 'X0401', label: '진단 시운전', defValue: '0.8' },
      { value: 'X0402', label: '작업 시운전', defValue: '0.3' },
      { value: 'A0403', label: '출고 시운전', defValue: '0.5' },
    ],
  },
  {
    value: 'm_cate6',
    label: '세차',
    items: [
      { value: 'X0501', label: '세차-내부', defValue: '0.2' },
      { value: 'X0502', label: '세차-외부', defValue: '0.5' },
      { value: 'A0503', label: '세차-전체', defValue: '0.2' },
    ],
  },
]

function CategoryRow({ category, active, onHover, onSelect }) {
  const hasSubmenu = Array.isArray(category.items) && category.items.length > 0
  return (
    <button
      type="button"
      onMouseEnter={(event) => {
        if (!hasSubmenu) return
        onHover({ rect: event.currentTarget.getBoundingClientRect(), category })
      }}
      onClick={() => {
        if (hasSubmenu) return
        onSelect?.(category)
      }}
      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 active:bg-gray-200 ${active ? 'bg-gray-100' : ''}`}
    >
      <span>{category.label}</span>
      {hasSubmenu && <span className="ml-3 text-xs text-gray-400">›</span>}
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
            onSelect={(item) => {
              onItemClick?.(item)
              onClose?.()
            }}
          />
        ))}
      </div>

      {submenu?.category.items?.length > 0 && (
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
