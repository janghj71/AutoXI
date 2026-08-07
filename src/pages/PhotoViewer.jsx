import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Mail, Printer, RefreshCw, RotateCcw, RotateCw, Save, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import PopupPageShell from '../components/PopupPageShell'

const CATEGORIES = ['전체', '수리전', '탈착·판금', '도장', '수리완료', '정비', '서류', '차계부첨부']
const DEMO_PHOTOS = [
  { id: 'photo-1', category: '수리전', name: '수리 전면', tone: 'from-slate-500 to-slate-800' },
  { id: 'photo-2', category: '탈착·판금', name: '도어 판금 작업', tone: 'from-blue-500 to-indigo-700' },
  { id: 'photo-3', category: '도장', name: '프론트 범퍼 도장', tone: 'from-amber-400 to-orange-600' },
  { id: 'photo-4', category: '정비', name: '엔진룸 정비', tone: 'from-emerald-500 to-teal-700' },
  { id: 'photo-5', category: '수리완료', name: '수리 완료', tone: 'from-violet-500 to-purple-800' },
]

const PHOTO_VIEWER_CONTEXT_KEY = 'autoXI.photoViewerContext'

function readPhotoContext() {
  try {
    const saved = globalThis.sessionStorage?.getItem(PHOTO_VIEWER_CONTEXT_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function PhotoPlaceholder({ photo }) {
  if (photo.url) {
    return <img src={photo.url} alt={photo.name} className="aspect-[4/3] w-full object-cover" draggable={false} />
  }
  return (
    <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${photo.tone}`}>
      <div className="rounded-full border border-white/40 bg-black/20 px-4 py-2 text-sm font-semibold text-white/90">
        {photo.name}
      </div>
    </div>
  )
}

export default function PhotoViewer() {
  const [context, setContext] = useState(() => readPhotoContext())
  const carNo = context.carNo || '11가1111'
  const estSerial = context.estSerial || '신규'
  const [photos, setPhotos] = useState(DEMO_PHOTOS)
  const [checkedCategories, setCheckedCategories] = useState(new Set(['전체']))
  const [selected, setSelected] = useState(new Set())
  const [printOpen, setPrintOpen] = useState(false)
  const [detailIndex, setDetailIndex] = useState(null)
  const [detailScale, setDetailScale] = useState(1)
  const [detailRotate, setDetailRotate] = useState(0)
  const [detailPan, setDetailPan] = useState({ x: 0, y: 0 })
  const [detailPanning, setDetailPanning] = useState(false)
  const [dragPhotoId, setDragPhotoId] = useState(null)
  const [dragOverPhotoId, setDragOverPhotoId] = useState(null)
  const detailPanStart = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== globalThis.location.origin || event.data?.type !== 'PHOTO_VIEWER_SET_CTX') return
      const next = event.data.payload || {}
      setContext(next)
      try {
        globalThis.sessionStorage?.setItem(PHOTO_VIEWER_CONTEXT_KEY, JSON.stringify(next))
      } catch { /* storage can be unavailable */ }
    }
    globalThis.addEventListener('message', onMessage)
    try {
      if (globalThis.opener && !globalThis.opener.closed) {
        globalThis.opener.postMessage({ type: 'PHOTO_VIEWER_READY' }, globalThis.location.origin)
      }
    } catch { /* opener can be unavailable */ }
    return () => globalThis.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    try {
      globalThis.sessionStorage?.setItem(PHOTO_VIEWER_CONTEXT_KEY, JSON.stringify({ carNo, estSerial }))
      globalThis.history?.replaceState({}, '', '/photo-viewer')
    } catch {
      // 저장소를 사용할 수 없는 환경에서도 화면은 계속 표시합니다.
    }
  }, [carNo, estSerial])

  const visiblePhotos = checkedCategories.has('전체')
    ? photos
    : photos.filter((photo) => checkedCategories.has(photo.category))
  const detailPhoto = detailIndex == null ? null : visiblePhotos[detailIndex]
  const openDetail = (photo) => {
    setDetailIndex(visiblePhotos.findIndex((item) => item.id === photo.id))
    setDetailScale(1)
    setDetailRotate(0)
    setDetailPan({ x: 0, y: 0 })
  }
  const moveDetail = (delta) => {
    if (detailIndex == null) return
    const next = detailIndex + delta
    if (next < 0 || next >= visiblePhotos.length) return
    setDetailIndex(next)
    setDetailScale(1)
    setDetailRotate(0)
    setDetailPan({ x: 0, y: 0 })
  }
  const updateDetailPhoto = (key, value) => {
    if (!detailPhoto) return
    setPhotos((prev) => prev.map((photo) => photo.id === detailPhoto.id ? { ...photo, [key]: value } : photo))
  }
  const downloadDetailPhoto = () => {
    if (!detailPhoto?.url) return
    const link = globalThis.document.createElement('a')
    link.href = detailPhoto.url
    link.download = detailPhoto.name || 'photo.jpg'
    globalThis.document.body.appendChild(link)
    link.click()
    link.remove()
  }
  const zoomByWheel = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const step = event.ctrlKey ? 0.05 : 0.1
    const direction = event.deltaY < 0 ? 1 : -1
    setDetailScale((value) => {
      const next = Math.max(0.3, Math.min(3, Number((value + direction * step).toFixed(2))))
      if (next <= 1) setDetailPan({ x: 0, y: 0 })
      return next
    })
  }
  const startDetailPan = (event) => {
    if (detailScale <= 1) return
    event.preventDefault()
    setDetailPanning(true)
    detailPanStart.current = { x: detailPan.x, y: detailPan.y, mx: event.clientX, my: event.clientY }
  }
  const moveDetailPan = (event) => {
    if (!detailPanning || !detailPanStart.current) return
    setDetailPan({ x: detailPanStart.current.x + event.clientX - detailPanStart.current.mx, y: detailPanStart.current.y + event.clientY - detailPanStart.current.my })
  }
  const endDetailPan = () => {
    setDetailPanning(false)
    detailPanStart.current = null
  }
  const toggleCategory = (value) => {
    setCheckedCategories((prev) => {
      if (value === '전체') return new Set(['전체'])
      const next = new Set(prev)
      next.delete('전체')
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next.size > 0 ? next : new Set(['전체'])
    })
  }
  const togglePhoto = (id, multi) => {
    setSelected((prev) => {
      const next = multi ? new Set(prev) : new Set()
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const movePhoto = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return
    setPhotos((prev) => {
      const fromIndex = prev.findIndex((photo) => photo.id === fromId)
      const toIndex = prev.findIndex((photo) => photo.id === toId)
      if (fromIndex < 0 || toIndex < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }
  const addFiles = (files) => {
    const imageFiles = [...(files || [])].filter((file) => file.type.startsWith('image/'))
    if (!imageFiles.length) return
    const newPhotos = imageFiles.map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      category: [...checkedCategories].find((value) => value !== '전체') || '수리전',
      name: file.name,
      url: globalThis.URL.createObjectURL(file),
      tone: 'from-gray-500 to-gray-800',
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }

  return (
    <PopupPageShell title="사진조회" description={`차량번호: ${carNo}`} onClose={() => globalThis.close?.()} closeWhenOpenerClosed>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-2.5">
        <Button size="sm"><Mail size={14} />메일</Button>
        <div className="relative">
          <Button size="sm" onClick={() => setPrintOpen((prev) => !prev)}><Printer size={14} />인쇄 ▾</Button>
          {printOpen && <div className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {[4, 6, 12].map((count) => <button key={count} type="button" onClick={() => setPrintOpen(false)} className="block w-full px-3 py-2 text-left hover:bg-gray-50">페이지당 {count}장</button>)}
          </div>}
        </div>
        <Button size="sm"><RotateCw size={14} />새로고침</Button>
        <Button size="sm"><Download size={14} />다운로드</Button>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <Button size="sm" disabled={!selected.size}><Trash2 size={14} />선택삭제</Button>
        <span className="text-xs text-gray-500">선택 {selected.size}장</span>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <Button size="sm" variant="primary"><Save size={14} />사진순서 저장</Button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-gray-200 px-5 py-2.5">
        {CATEGORIES.map((item) => <label key={item} className="inline-flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={checkedCategories.has(item)} onChange={() => toggleCategory(item)} className="size-4 accent-green-600" />{item}</label>)}
      </div>

      <div className="shrink-0 px-5 py-3">
        <div className="flex h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-center hover:border-gray-400" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}>
          <div><div className="text-sm font-medium">사진을 드래그하거나 클릭하여 추가하세요</div><div className="mt-1 text-xs text-gray-500">JPG/JPEG/PNG, 다중 선택 가능</div></div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 pb-5">
        {visiblePhotos.length === 0 ? <div className="py-12 text-center text-sm text-gray-400">사진이 없습니다.</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visiblePhotos.map((photo) => <div key={photo.id} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', photo.id); setDragPhotoId(photo.id) }} onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); setDragOverPhotoId(photo.id) }} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); movePhoto(dragPhotoId || event.dataTransfer.getData('text/plain'), photo.id); setDragPhotoId(null); setDragOverPhotoId(null) }} onDragEnd={() => { setDragPhotoId(null); setDragOverPhotoId(null) }} onClick={(event) => togglePhoto(photo.id, event.ctrlKey || event.metaKey)} onDoubleClick={() => openDetail(photo)} className={`relative overflow-hidden rounded-md border bg-white ${selected.has(photo.id) ? 'border-gray-800 ring-2 ring-gray-800' : dragOverPhotoId === photo.id ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'} ${dragPhotoId === photo.id ? 'opacity-50' : ''}`}>
            <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{photo.category}</span>
            <button type="button" aria-label={`${photo.name} 삭제`} onClick={(event) => { event.stopPropagation(); setPhotos((prev) => prev.filter((item) => item.id !== photo.id)); setSelected((prev) => { const next = new Set(prev); next.delete(photo.id); return next }) }} className="absolute right-2 top-2 z-10 inline-flex size-7 items-center justify-center rounded-md border border-gray-200 bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            <PhotoPlaceholder photo={photo} />
            <div className="truncate px-2 py-2 text-xs text-gray-700" title={photo.name}>{photo.name}</div>
          </div>)}
        </div>}
      </div>

      <footer className="flex shrink-0 items-center border-t border-gray-200 bg-gray-50 px-5 py-2.5 text-xs text-gray-500">
        Ctrl(또는 ⌘) 클릭으로 다중 선택 / 드래그로 썸네일 순서 변경
      </footer>

      {detailPhoto && <Modal
        title={<span><span className="text-lg font-semibold">{carNo}</span><span className="ml-2 text-sm font-normal text-gray-500">- {detailIndex + 1} / {visiblePhotos.length}</span></span>}
        onClose={() => setDetailIndex(null)}
        closeOnBackdrop
        width="max-w-[800px]"
        footer={<div className="flex min-w-0 w-full items-center gap-3">
          <div className="min-w-0 flex-1 truncate text-xs text-gray-500" title={detailPhoto.name}>{detailPhoto.name}</div>
          <div className="flex shrink-0 gap-2">
            <Button onClick={() => setDetailIndex(null)}><X size={14} />닫기</Button>
            <Button variant="primary" onClick={() => setDetailIndex(null)}><Save size={14} />저장</Button>
          </div>
        </div>}
      >
        <div className="max-h-[calc(100vh-145px)] overflow-hidden">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
            <Button size="sm" onClick={() => setDetailScale((value) => Math.min(3, Number((value + 0.1).toFixed(2))))}><ZoomIn size={14} />확대</Button>
            <Button size="sm" onClick={() => setDetailScale((value) => { const next = Math.max(0.3, Number((value - 0.1).toFixed(2))); if (next <= 1) setDetailPan({ x: 0, y: 0 }); return next })}><ZoomOut size={14} />축소</Button>
            <Button size="sm" onClick={() => setDetailRotate((value) => value - 90)}><RotateCcw size={14} />좌회전</Button>
            <Button size="sm" onClick={() => setDetailRotate((value) => value + 90)}><RotateCw size={14} />우회전</Button>
            <Button size="sm" onClick={() => { setDetailScale(1); setDetailRotate(0); setDetailPan({ x: 0, y: 0 }) }}><RefreshCw size={14} />초기화</Button>
            <Button size="sm" onClick={downloadDetailPhoto} disabled={!detailPhoto.url}><Download size={14} />다운로드</Button>
          </div>
          <div className="min-h-0 overflow-auto p-4">
            <div className={`relative flex h-[min(40vh,420px)] min-h-[280px] items-center justify-center overflow-hidden rounded-md bg-gray-100 ${detailScale > 1 ? (detailPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`} onWheel={zoomByWheel} onMouseDown={startDetailPan} onMouseMove={moveDetailPan} onMouseUp={endDetailPan} onMouseLeave={endDetailPan}>
              <button
                type="button"
                aria-label="이전 사진"
                onClick={() => moveDetail(-1)}
                disabled={detailIndex <= 0}
                className={`absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/85 text-gray-700 shadow-sm backdrop-blur ${detailIndex <= 0 ? 'cursor-not-allowed opacity-40' : 'hover:bg-white'}`}
              >
                <ChevronLeft size={22} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label="다음 사진"
                onClick={() => moveDetail(1)}
                disabled={detailIndex >= visiblePhotos.length - 1}
                className={`absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/85 text-gray-700 shadow-sm backdrop-blur ${detailIndex >= visiblePhotos.length - 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-white'}`}
              >
                <ChevronRight size={22} strokeWidth={2.25} />
              </button>
              {detailPhoto.url ? <img
                src={detailPhoto.url}
                alt={detailPhoto.name}
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain select-none"
                style={{ transform: `translate(${detailPan.x}px, ${detailPan.y}px) scale(${detailScale}) rotate(${detailRotate}deg)`, transformOrigin: 'center center' }}
              /> : <div className="max-h-full max-w-full origin-center" style={{ transform: `translate(${detailPan.x}px, ${detailPan.y}px) scale(${detailScale}) rotate(${detailRotate}deg)` }}><PhotoPlaceholder photo={detailPhoto} /></div>}
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <div className="text-sm font-semibold text-gray-700">사진분류<div className="mt-1 flex flex-wrap gap-1.5">{CATEGORIES.filter((item) => item !== '전체').map((item) => <button key={item} type="button" onClick={() => updateDetailPhoto('category', item)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${detailPhoto.category === item ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>{item}</button>)}</div></div>
              <label className="text-sm font-semibold text-gray-700">메모<textarea value={detailPhoto.memo || ''} onChange={(event) => updateDetailPhoto('memo', event.target.value)} placeholder="메모를 입력하세요" className="mt-1 h-16 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-green-500" /></label>
            </div>
          </div>
        </div>
      </Modal>}
    </PopupPageShell>
  )
}
