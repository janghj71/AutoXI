import { useContext } from 'react'
import { AlertContext } from './AlertContext'

export function useAlert() {
  const value = useContext(AlertContext)
  if (!value) throw new Error('useAlert는 AlertProvider 안에서 사용해야 합니다.')
  return value
}
