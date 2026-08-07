import { X } from 'lucide-react'
import { useEffect } from 'react'
import { focusNextOnEnter } from '../utils/focusNextOnEnter'
import Button from './Button'

/**
 * 새창 페이지에서 공통으로 사용하는 헤더/닫기 셸입니다.
 * 본문은 호출 화면이 높이와 스크롤 정책을 직접 구성할 수 있도록 그대로 전달합니다.
 */
export default function PopupPageShell({ title, description, onClose, children, className = '', closeWhenOpenerClosed = false, actions }) {
  useEffect(() => {
    if (!closeWhenOpenerClosed || !globalThis.opener) return undefined
    const timer = globalThis.setInterval(() => {
      if (globalThis.opener?.closed) {
        globalThis.clearInterval(timer)
        globalThis.close()
      }
    }, 500)
    return () => globalThis.clearInterval(timer)
  }, [closeWhenOpenerClosed])

  return (
    <div className={`flex h-screen flex-col overflow-hidden bg-white text-gray-800 ${className}`} onKeyDown={focusNextOnEnter}>
      <header className="flex h-[70px] shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="min-w-0 self-stretch">
          <h1 className="flex h-5 items-center truncate text-base font-semibold text-gray-900">{title}</h1>
          {description && <p className="mt-1 flex h-7 min-w-0 items-center truncate text-xs text-gray-500">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <Button
            onClick={onClose}
            aria-label="닫기"
            className="border-zinc-800 bg-zinc-800 text-white hover:border-zinc-700 hover:bg-zinc-700"
          >
            <X size={14} />닫기
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}
