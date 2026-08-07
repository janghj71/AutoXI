import { useRef, useState } from 'react'

/**
 * 인감 등록 박스
 * - 실제 인감은 원형이라 미리보기 프레임도 원형으로 유지
 * - 이미지를 끌어다 놓거나(drag & drop), 등록 버튼으로 파일을 선택해 등록
 */
export default function SealBox({ label, image }) {
  const [preview, setPreview] = useState(image ?? null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    loadFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-2">{label}</div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`h-28 w-28 mx-auto rounded-full border flex items-center justify-center mb-2 transition-colors ${
          dragging
            ? 'border-green-500 border-2 bg-green-50'
            : preview
              ? 'border-gray-200 bg-white'
              : 'border-dashed border-gray-300 bg-gray-50'
        }`}
      >
        {preview ? (
          <img src={preview} alt={`${label} 미리보기`} className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400 px-3">이미지를 끌어다 놓으세요</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => loadFile(e.target.files?.[0])}
      />

      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs rounded-md border border-green-600 bg-green-50 text-green-700 px-2.5 py-1 hover:bg-green-100"
        >
          등록
        </button>
        <button
          onClick={() => setPreview(null)}
          className="text-xs rounded-md border border-gray-300 text-gray-700 px-2.5 py-1 hover:bg-gray-50"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
