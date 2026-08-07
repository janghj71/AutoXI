import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * 커스텀 콤보박스 (네이티브 select 대체)
 * - 네이티브 select의 열린 리스트는 OS가 그려 파랑 하이라이트를 못 바꾼다.
 *   직접 리스트를 렌더해 초록 테마로 하이라이트한다. (EST2026 ComboInput 참조)
 * - options: 문자열 배열 또는 { value, label } 배열
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = '선택',
  className = '',
  buttonClassName = '',
  radius = 'rounded-sm',
  disabled = false,
  menuPlacement = 'down',
}) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)

  const items = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }))
  const selected = items.find((i) => i.value === value)

  useEffect(() => {
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between ${radius} border border-gray-300 px-3 py-1.5 text-xs text-left focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400 ${disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400' : `bg-white ${selected ? 'text-gray-800' : 'text-gray-400'}`} ${buttonClassName}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className={`absolute left-0 z-50 w-full rounded-sm border border-gray-200 bg-white py-1 shadow-lg max-h-56 overflow-auto ${menuPlacement === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {items.map((it) => {
            const active = it.value === value
            return (
              <button
                key={it.value}
                type="button"
                onClick={() => {
                  onChange?.(it.value)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <span className="truncate">{it.label}</span>
                {active && <Check size={13} className="text-green-600 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
