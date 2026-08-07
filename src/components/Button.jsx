import { Plus, X } from 'lucide-react'

const variants = { primary: 'border-green-600 bg-green-600 text-white hover:bg-green-700', successSoft: 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100', secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50', violet: 'border-violet-600 bg-violet-600 text-white hover:bg-violet-700', danger: 'border-red-600 bg-red-600 text-white hover:bg-red-700', ghost: 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100' }
const sizes = { sm: 'h-7 px-2.5 text-xs', md: 'h-9 px-4 text-sm' }

export default function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', children, ...props }) {
  const isCreate = children === '추가' || children === '등록' || children === '신규 등록' || children === '주기 추가'
  const label = children === '주기 추가' ? '등록' : children
  const content = children === '닫기' ? <><X size={14} />{children}</> : isCreate ? <><Plus size={13} />{label}</> : children
  const appliedVariant = isCreate && variant === 'secondary' ? 'primary' : variant
  return <button type={type} className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[appliedVariant]} ${className}`} {...props}>{content}</button>
}
