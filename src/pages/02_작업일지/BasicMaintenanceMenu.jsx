import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { BASIC_MAINTENANCE_CATEGORIES } from './basicMaintenanceData'

const DEFAULT_CATEGORY = BASIC_MAINTENANCE_CATEGORIES[0]?.value

export default function BasicMaintenanceModal({ open, onClose, onItemClick }) {
  const [categoryValue, setCategoryValue] = useState(DEFAULT_CATEGORY)
  const [keyword, setKeyword] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const normalizedKeyword = keyword.trim().toLowerCase()
  const selectedCategory = BASIC_MAINTENANCE_CATEGORIES.find(
    (category) => category.value === categoryValue,
  )

  const visibleItems = useMemo(() => {
    if (normalizedKeyword) {
      return BASIC_MAINTENANCE_CATEGORIES.flatMap((category) =>
        (category.items?.length ? category.items : [category]).map((item) => ({
          ...item,
          categoryLabel: category.label,
        })),
      ).filter((item) => item.label.toLowerCase().includes(normalizedKeyword))
    }

    const categoryItems = selectedCategory?.items?.length
      ? selectedCategory.items
      : selectedCategory ? [selectedCategory] : []

    return categoryItems.map((item) => ({
      ...item,
      categoryLabel: selectedCategory.label,
    }))
  }, [normalizedKeyword, selectedCategory])

  if (!open) return null

  const close = () => {
    setKeyword('')
    setSelectedItem(null)
    onClose?.()
  }

  const applyItem = (item = selectedItem) => {
    if (!item) return
    onItemClick?.(item)
    close()
  }

  return (
    <Modal
      title="기본정비항목"
      description="분류 또는 검색으로 정비항목을 선택해 매출내역에 추가합니다."
      onClose={close}
      dialogStyle={{ maxWidth: '680px' }}
      footer={(
        <>
          <Button onClick={close}>취소</Button>
          <Button variant="primary" disabled={!selectedItem} onClick={() => applyItem()}>
            선택 적용
          </Button>
        </>
      )}
    >
      <div className="flex h-[430px] min-h-0 flex-col gap-3">
        <label className="relative block shrink-0">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            data-modal-autofocus
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setSelectedItem(null)
            }}
            placeholder="정비항목 검색"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15"
          />
        </label>

        <div className="grid min-h-0 flex-1 grid-cols-[150px_minmax(0,1fr)] overflow-hidden rounded-md border border-gray-200">
          <nav className="overflow-y-auto border-r border-gray-200 bg-gray-50 p-1.5">
            {BASIC_MAINTENANCE_CATEGORIES.map((category) => {
              const active = !normalizedKeyword && category.value === categoryValue
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setCategoryValue(category.value)
                    setKeyword('')
                    setSelectedItem(null)
                  }}
                  className={`mb-0.5 flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-xs ${
                    active
                      ? 'bg-green-600 font-semibold text-white'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <span>{category.label}</span>
                  <span className={active ? 'text-green-100' : 'text-gray-400'}>
                    {category.items?.length || 1}
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="min-h-0 overflow-y-auto bg-white">
            <div className="sticky top-0 grid grid-cols-[minmax(0,1fr)_72px] border-b border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-500">
              <span>정비항목</span>
              <span className="text-right">기본시간</span>
            </div>
            {visibleItems.length > 0 ? visibleItems.map((item) => {
              const active = selectedItem?.value === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  onDoubleClick={() => applyItem(item)}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_72px] items-center border-b border-gray-100 px-3 py-2.5 text-left text-xs ${
                    active
                      ? 'bg-green-50 text-green-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="min-w-0">
                    {normalizedKeyword && (
                      <span className="mr-2 text-[10px] text-gray-400">{item.categoryLabel}</span>
                    )}
                    {item.label}
                  </span>
                  <span className="text-right tabular-nums text-gray-500">
                    {item.defValue ?? '0'}
                  </span>
                </button>
              )
            }) : (
              <div className="flex h-full min-h-40 items-center justify-center text-xs text-gray-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        <p className="shrink-0 text-[11px] text-gray-400">
          항목을 더블클릭하면 선택 적용 버튼 없이 바로 추가됩니다.
        </p>
      </div>
    </Modal>
  )
}
