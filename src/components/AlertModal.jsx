import { AlertTriangle, CheckCircle2, Info, Trash2, XCircle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

const config = {
  info: { title: '알림', Icon: Info, tone: 'text-blue-600 bg-blue-50' },
  success: { title: '완료', Icon: CheckCircle2, tone: 'text-green-600 bg-green-50' },
  warning: { title: '경고', Icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50' },
  error: { title: '오류', Icon: XCircle, tone: 'text-red-600 bg-red-50' },
  confirm: { title: '확인', Icon: AlertTriangle, tone: 'text-green-700 bg-green-50' },
  remove: { title: '삭제', Icon: Trash2, tone: 'text-red-600 bg-red-50' },
}

export default function AlertModal({ options, onResolve }) {
  if (!options) return null
  const current = config[options.type] ?? config.info
  const { Icon } = current

  return (
    <Modal
      title={options.title ?? current.title}
      size="sm"
      onClose={() => onResolve(false)}
      closeOnBackdrop={!options.showCancel}
      footer={
        <>
          {options.showCancel && <Button onClick={() => onResolve(false)}>{options.cancelText}</Button>}
          <Button variant={options.type === 'remove' ? 'danger' : 'primary'} onClick={() => onResolve(true)} autoFocus>
            {options.confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${current.tone}`}><Icon size={20} /></span>
        <div className="min-h-10 whitespace-pre-wrap pt-2 text-sm leading-5 text-gray-800">{options.message}</div>
      </div>
    </Modal>
  )
}
