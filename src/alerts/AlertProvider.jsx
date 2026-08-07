import { useCallback, useMemo, useRef, useState } from 'react'
import AlertModal from '../components/AlertModal'
import { AlertContext } from './AlertContext'

export function AlertProvider({ children }) {
  const [options, setOptions] = useState(null)
  const resolver = useRef(null)

  const open = useCallback((next) => new Promise((resolve) => {
    resolver.current = resolve
    setOptions({ confirmText: '확인', cancelText: '취소', showCancel: false, ...next })
  }), [])

  const resolve = useCallback((result) => {
    setOptions(null)
    resolver.current?.(result)
    resolver.current = null
  }, [])

  const api = useMemo(() => ({
    info: (message, title) => open({ type: 'info', message, title }),
    success: (message, title) => open({ type: 'success', message, title }),
    warning: (message, title) => open({ type: 'warning', message, title }),
    error: (message, title) => open({ type: 'error', message, title }),
    confirm: (message, title, custom = {}) => open({ type: 'confirm', message, title, showCancel: true, ...custom }),
    remove: (message, title, custom = {}) => open({ type: 'remove', message, title, showCancel: true, confirmText: '삭제', ...custom }),
  }), [open])

  return <AlertContext.Provider value={api}>{children}<AlertModal options={options} onResolve={resolve} /></AlertContext.Provider>
}
