/**
 * 공용 폼 필드 (라벨 + 입력)
 * - children을 넘기면 그대로 렌더(Select 등 커스텀 입력용)
 * - children 없이 value/onChange만 넘기면 기본 text input 렌더
 * - suffix로 단위 표기 ("개월", "%", "일전" 등)
 */
export default function FormField({
  label,
  children,
  value,
  onChange,
  type = 'text',
  suffix,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  required = false,
  placeholder,
  labelWidth = 'w-28',
  className = '',
  inputClassName = '',
  align = 'center',
}) {
  const valueProps = onChange || readOnly ? { value: value ?? '' } : { defaultValue: value }
  const content = children ?? (
    <input
      type={type}
      {...valueProps}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
      data-modal-autofocus={autoFocus || undefined}
      placeholder={placeholder}
      className={`w-full text-xs rounded-sm px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400 ${
        disabled
          ? 'bg-gray-50 text-gray-400 border-gray-200'
          : readOnly
            ? 'bg-gray-50 text-gray-700 border-gray-300'
          : 'bg-white text-gray-800 border-gray-300'
      } ${inputClassName}`}
    />
  )

  const alignClass = align === 'start' ? 'items-start' : 'items-center'

  return (
    <div className={`flex min-w-0 ${alignClass} gap-2 ${className}`}>
      <label className={`${labelWidth} shrink-0 text-right text-xs text-gray-500 ${align === 'start' ? 'pt-1.5' : ''}`}>
        {required && <span className="mr-0.5 font-semibold text-red-500" aria-hidden="true">*</span>}
        {label}
      </label>
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        {content}
        {suffix && <span className="text-xs text-gray-400 shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}
