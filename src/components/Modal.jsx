import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { focusNextOnEnter } from '../utils/focusNextOnEnter'

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * 공용 모달
 */
export default function Modal({ title, description, onClose, children, footer, size = 'md', width, headerActions, closeOnBackdrop = false }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    window.addEventListener('keydown', onKeyDown)
    requestAnimationFrame(() => {
      const firstField = dialogRef.current?.querySelector('[data-modal-autofocus]')
        ?? dialogRef.current?.querySelector(
          'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly])',
        )
      firstField?.focus()
    })
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/45 flex items-center justify-center p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full max-h-[calc(100vh-32px)] flex flex-col ${width ?? widths[size]} bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={focusNextOnEnter}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/70">
          <div>
            <div id={titleId} className="text-base font-semibold text-gray-900">{title}</div>
            {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
          </div>
          <div className="flex items-center gap-3">
            {headerActions}
            <button type="button" onClick={onClose} aria-label="닫기" className="inline-flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={17} />
          </button>
          </div>
        </div>
        <div className="min-h-0 overflow-auto px-5 py-3">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-2.5 border-t border-gray-100 bg-gray-50/40">{footer}</div>}
      </div>
    </div>
  )
}
