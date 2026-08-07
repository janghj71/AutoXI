import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { GripVertical } from 'lucide-react'

/**
 * FixedHeadTable (EST2026 이식, AutoXI 초록 테마로 재배색)
 * - 헤더 영역에 스크롤바가 보이지 않게: header table / body table 분리
 * - colgroup로 컬럼폭 % 고정
 * - body만 세로 스크롤
 * - draggable + onReorder: 행을 마우스로 끌어 순서 변경 (AutoXI 전용 추가 기능)
 *
 * columns: [{ key, title, width, align, className, headerClassName, render }]
 *   - width: "12%" 같은 퍼센트 문자열 권장
 *   - align: "left" | "right" | "center"
 * rows: 배열
 */
export default function FixedHeadTable({
  columns,
  rows,
  rowSize = 'md',
  rowKey = (row, idx) => idx,
  height = 200, // body 영역 높이(px)
  className = '',
  headerClassName = '',
  headerGroups = [], // [{ title, keys: ['col1', 'col2'] }] — 지정 시 2단 그룹 헤더
  bodyClassName = '',
  tableTextClass = 'text-sm',
  emptyText = '데이터가 없습니다.',
  onRowClick,
  onRowDoubleClick,
  getRowProps, //  row별 이벤트/속성 주입
  selectedKey,
  selectedKeys, // Set<any> — 멀티선택 키 집합
  getRowClassName,
  expandedKey,
  expandedRowRender,
  bodyScrollRef, // 외부에서 body scroll div 접근용

  rowSelectedClass = '!bg-green-50 hover:!bg-green-50',
  rowHoverClass = 'hover:!bg-gray-50',
  gutterSelectedClass = '!bg-green-50',
  gutterHoverClass = '!bg-gray-50',
  wheelSelect = true, // 휠로 선택이동 사용 여부
  wheelSelectStep = 1,
  rowRenderer,
  enableHorizontalScroll = false,
  getGutterRowClass, // (key) => className — 행별 gutter 배경색 (optional)
  onHeaderClick,

  // AutoXI 추가: 드래그로 행 순서 변경
  draggable = false,
  onReorder,
  dragColumnWidth = '32px',
  dragCellClassName = '',
  showMultiSelectInDragColumn = false,
  multiSelectionRowHighlight = true,
}) {
  const headWrapRef = useRef(null)
  const bodyWrapRef = useRef(null)

  const [gutterW, setGutterW] = useState(0)
  const [hoverKey, setHoverKey] = useState(null)
  const overlayRef = useRef(null)
  const rowRefs = useRef(new Map())
  const [rowBoxes, setRowBoxes] = useState([])
  const [dragIndex, setDragIndex] = useState(null)

  const gripCol = draggable ? [{ key: '__grip', width: dragColumnWidth }] : []
  const displayColumns = [...gripCol, ...columns]
  const hasGroupedHeader = headerGroups.length > 0
  const groupByKey = new Map(headerGroups.flatMap((group) => group.keys.map((key) => [key, group])))

  const colgroup = useMemo(() => {
    return (
      <colgroup>
        {displayColumns.map((c) => (
          <col key={c.key} style={{ width: c.width }} />
        ))}
      </colgroup>
    )
  }, [displayColumns])

  const minTableWidth = useMemo(() => {
    if (!enableHorizontalScroll) return undefined
    let total = 0
    for (const c of displayColumns) {
      const w = String(c?.width ?? '').trim()
      if (!w.endsWith('px')) return undefined
      const n = parseFloat(w)
      if (!Number.isFinite(n)) return undefined
      total += n
    }
    return total > 0 ? `${total}px` : undefined
  }, [displayColumns, enableHorizontalScroll])

  const tdBase = rowSize === 'sm' ? 'px-3 py-0 h-8 leading-8 align-middle' : 'px-3 py-2 align-middle'

  const thBase = rowSize === 'sm' ? '[&>th]:px-3 [&>th]:py-1.5' : '[&>th]:px-3 [&>th]:py-2'

  useEffect(() => {
    const el = bodyWrapRef.current
    if (!el) return

    const nativeW = measureNativeScrollbarW()

    const calc = () => {
      // stable gutter는 "스크롤바 없어도" nativeW 만큼 확보한다고 보고 사용 gutter=15
      setGutterW(nativeW > 0 ? nativeW : 15)
    }

    calc()

    const ro = new ResizeObserver(calc)
    ro.observe(el)
    window.addEventListener('resize', calc)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', calc)
    }
  }, [])

  // 실제 데이터 row의 top/height를 측정해서 gutter 오버레이를 정확히 맞춘다.
  useEffect(() => {
    const wrap = bodyWrapRef.current
    if (!wrap) return

    let raf = 0
    const measure = () => {
      raf = 0
      if (!wrap) return

      const next = []
      for (let i = 0; i < rows.length; i++) {
        const key = rowKey(rows[i], i)
        const tr = rowRefs.current.get(key)
        if (!tr) continue
        const h = Math.round(tr.getBoundingClientRect().height)
        // offsetTop은 "확장 row(tr)"가 중간에 끼어도 누적 높이가 반영됨
        const top = tr.offsetTop
        next.push({ key, top, height: h })
      }
      setRowBoxes(next)
    }

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    schedule()

    // tbody 높이/구조가 변할 수 있음(InlineActions 열림, 드롭다운 등)
    const tbody = wrap.querySelector('tbody')
    const ro = new ResizeObserver(schedule)
    if (tbody) ro.observe(tbody)

    const mo = new MutationObserver(schedule)
    if (tbody) mo.observe(tbody, { childList: true, subtree: true, attributes: true })

    window.addEventListener('resize', schedule)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      ro.disconnect()
      mo.disconnect()
    }
  }, [rows, columns, expandedKey, selectedKey, rowKey])

  // 가로 스크롤 동기화
  const onBodyScroll = () => {
    const body = bodyWrapRef.current
    const head = headWrapRef.current
    if (!body || !head) return
    head.scrollLeft = body.scrollLeft
    // gutter 오버레이를 scrollTop만큼 같이 움직이게
    if (overlayRef.current) {
      overlayRef.current.style.transform = `translateY(${-body.scrollTop}px)`
    }
  }

  const thAlign = (align) => (align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left')

  const tdAlign = (align) =>
    align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : 'text-left'

  const measureNativeScrollbarW = () => {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.top = '-9999px'
    div.style.width = '100px'
    div.style.height = '100px'
    div.style.overflow = 'scroll' // 강제로 스크롤바
    document.body.appendChild(div)

    const w = div.offsetWidth - div.clientWidth // 환경별 실제 폭(overlay scrollbar면 0)
    document.body.removeChild(div)
    return w > 0 ? w : 0
  }

  const lastWheelAtRef = useRef(0)

  const handleWheelSelect = useCallback(
    (e) => {
      if (!wheelSelect) return
      if (!rows || rows.length === 0) return
      if (selectedKey == null) return
      if (!onRowClick) return

      // 너무 민감하게 연속 이동되는 것 방지(트랙패드 포함)
      const now = Date.now()
      if (now - lastWheelAtRef.current < 40) return
      lastWheelAtRef.current = now

      // 스크롤 대신 선택 이동
      e.preventDefault()
      e.stopPropagation()

      const curIdx = rows.findIndex((r, i) => rowKey(r, i) === selectedKey)
      const dir = e.deltaY > 0 ? 1 : -1
      const step = Math.max(1, Number(wheelSelectStep) || 1)

      let nextIdx = curIdx >= 0 ? curIdx + dir * step : 0
      if (nextIdx < 0) nextIdx = 0
      if (nextIdx > rows.length - 1) nextIdx = rows.length - 1

      const nextRow = rows[nextIdx]
      if (!nextRow) return

      onRowClick(nextRow, nextIdx)

      // 선택한 행이 보이도록 스크롤
      const nextKey = rowKey(nextRow, nextIdx)
      const tr = rowRefs.current.get(nextKey)
      if (tr) {
        tr.scrollIntoView({ block: 'nearest' })
      }
    },
    [wheelSelect, rows, selectedKey, onRowClick, rowKey, wheelSelectStep],
  )

  // enableHorizontalScroll 해제 시 헤더/바디 scrollLeft 리셋 — 정렬 틀어짐 방지
  useEffect(() => {
    if (!enableHorizontalScroll) {
      if (bodyWrapRef.current) bodyWrapRef.current.scrollLeft = 0
      if (headWrapRef.current) headWrapRef.current.scrollLeft = 0
    }
  }, [enableHorizontalScroll])

  // wheelSelect: passive:false로 wheel 이벤트를 직접 연결 (preventDefault 가능)
  useEffect(() => {
    const el = bodyWrapRef.current
    if (!el) return
    if (!wheelSelect) return

    el.addEventListener('wheel', handleWheelSelect, { passive: false })
    return () => el.removeEventListener('wheel', handleWheelSelect)
  }, [wheelSelect, handleWheelSelect])

  // selectedKey / expandedKey 변경 시 스크롤 조정
  useEffect(() => {
    if (selectedKey == null) return

    // double-rAF: 1번째는 React 렌더 확정, 2번째는 레이아웃(확장 tr) 완료 보장
    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const tr = rowRefs.current.get(selectedKey)
        if (!tr) return
        const container = bodyWrapRef.current
        if (!container) return

        // expandedKey === selectedKey 이면 바로 다음 <tr>(인라인 액션 행)도 포함
        const expandedTr = expandedKey === selectedKey ? tr.nextElementSibling : null
        const bottomEl = expandedTr || tr

        const contRect = container.getBoundingClientRect()
        const trRect = tr.getBoundingClientRect()
        const botRect = bottomEl.getBoundingClientRect()

        if (botRect.bottom > contRect.bottom) {
          // 하단이 잘림 → 딱 맞게 스크롤 (여유 4px)
          container.scrollTop += botRect.bottom - contRect.bottom + 4
        } else if (trRect.top < contRect.top) {
          // 상단이 잘림 → row 상단이 보이게 스크롤 (여유 4px)
          container.scrollTop += trRect.top - contRect.top - 4
        }
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [selectedKey, expandedKey])

  // getRowClassName이 bg/hover:bg를 리턴해도 선택/hover 우선순위가 깨지지 않게 제거
  const stripBgClasses = (cls) => {
    if (!cls) return ''
    return String(cls)
      .split(/\s+/)
      .filter(Boolean)
      .filter((c) => {
        // tailwind 배경류 제거 (중요: hover 포함)
        return !/^(?:!?(?:hover:|active:|focus:)?bg-)/.test(c)
      })
      .join(' ')
  }

  const onDragEnterRow = (i) => {
    if (dragIndex === null || dragIndex === i) return
    const next = [...rows]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    onReorder?.(next)
    setDragIndex(i)
  }

  return (
    <div className={'min-h-0 h-full flex flex-col ' + className}>
      {/* Header (스크롤바 없음, paddingRight로 폭 보정) */}
      <div
        ref={headWrapRef}
        className={'overflow-hidden bg-gray-100 border-b border-gray-200 ' + headerClassName}
        style={{ paddingRight: gutterW }}
      >
        <table className="w-full table-fixed text-sm" style={{ minWidth: minTableWidth }}>
          {colgroup}
          <thead className="text-gray-600">
            {hasGroupedHeader ? (
              <>
                <tr className={`${thBase} [&>th]:border-b [&>th]:border-gray-200 [&>th]:font-semibold [&>th]:whitespace-nowrap`}>
                  {draggable && <th rowSpan={2}></th>}
                  {columns.map((column) => {
                    const group = groupByKey.get(column.key)
                    if (group && group.keys[0] !== column.key) return null
                    if (group) {
                      return <th key={group.title} colSpan={group.keys.length} className="text-center">{group.title}</th>
                    }
                    return (
                    <th key={column.key} rowSpan={2} className={[thAlign(column.align), column.headerClassName || '', 'align-middle'].join(' ')} title={typeof column.title === 'string' ? column.title : undefined}>
                        {column.title}
                      </th>
                    )
                  })}
                </tr>
                <tr className={`${thBase} [&>th]:border-b [&>th]:border-gray-200 [&>th]:font-semibold [&>th]:whitespace-nowrap [&>th]:truncate`}>
                  {columns.filter((column) => groupByKey.has(column.key)).map((column) => (
                    <th key={column.key} className={[thAlign(column.align), column.headerClassName || ''].join(' ')} title={typeof column.title === 'string' ? column.title : undefined}>
                      {column.title}
                    </th>
                  ))}
                </tr>
              </>
            ) : (
              <tr
                className={`
                  [&>th]:border-b [&>th]:border-gray-200
                  ${thBase}
                  [&>th]:font-semibold
                  [&>th]:whitespace-nowrap [&>th]:truncate
                `}
              >
                {draggable && <th></th>}
                {columns.map((c) => (
                    <th key={c.key} onClick={() => onHeaderClick?.(c.key)} className={[thAlign(c.align), c.headerClassName || '', onHeaderClick ? 'cursor-pointer' : ''].join(' ')} title={typeof c.title === 'string' ? c.title : undefined}>
                    {c.title}
                  </th>
                ))}
              </tr>
            )}
          </thead>
        </table>
      </div>

      {/* Body (여기만 세로 스크롤) */}
      <div
        ref={(el) => {
          bodyWrapRef.current = el
          if (typeof bodyScrollRef === 'function') bodyScrollRef(el)
          else if (bodyScrollRef && 'current' in bodyScrollRef) bodyScrollRef.current = el
        }}
        onScroll={onBodyScroll}
        onWheel={handleWheelSelect}
        className={
          'overflow-y-auto min-h-0 flex-1 relative ' +
          (enableHorizontalScroll ? 'overflow-x-auto ' : 'overflow-x-hidden ') +
          bodyClassName
        }
        style={{
          height: height ?? undefined,
          scrollbarGutter: 'stable',
        }}
      >
        <table className={'w-full table-fixed ' + tableTextClass} style={{ minWidth: minTableWidth }}>
          {colgroup}
          <tbody className="text-gray-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length} className="px-4 py-6 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const key = rowKey(row, idx)
                const rowProps = getRowProps ? getRowProps(row, idx) || {} : {}
                const isSel = selectedKey != null && key === selectedKey
                const isMarkedSelected = selectedKeys != null && selectedKeys.has(key)
                const isMultiSel = !isSel && isMarkedSelected
                const isExpanded = expandedKey != null && key === expandedKey
                const isDragging = draggable && dragIndex === idx

                const rawCustom = getRowClassName ? getRowClassName(row, idx) : ''
                let customClass = stripBgClasses(rawCustom)
                let effectiveHoverClass = rowHoverClass

                if (rawCustom && typeof rawCustom === 'object' && !Array.isArray(rawCustom)) {
                  const { className: cn, allowBg, hoverClass } = rawCustom
                  customClass = allowBg ? cn || '' : stripBgClasses(cn || '')
                  if (!isSel && hoverClass !== undefined) effectiveHoverClass = hoverClass
                }

                // tr ref를 rowRefs에 등록 (측정/overlay에 필수)
                const rowRef = (el) => {
                  if (el) rowRefs.current.set(key, el)
                  else rowRefs.current.delete(key)
                }

                const dragProps = draggable
                  ? {
                      draggable: true,
                      onDragStart: () => setDragIndex(idx),
                      onDragEnter: () => onDragEnterRow(idx),
                      onDragOver: (e) => e.preventDefault(),
                      onDragEnd: () => setDragIndex(null),
                    }
                  : {}

                // 기본 tr props (커스텀 rowRenderer에서도 그대로 써야 동작 동일)
                const trProps = {
                  ...rowProps,
                  ...dragProps,
                  ref: rowRef,
                  onClick: (e) => onRowClick?.(row, idx, e),
                  onDoubleClick: (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onRowDoubleClick?.(row, idx)
                  },
                  onMouseEnter: () => setHoverKey(key),
                  onMouseLeave: () => setHoverKey(null),
                  className: [
                    'select-none',
                    draggable ? 'cursor-grab' : '',
                    'border-b border-gray-100',
                    isDragging ? 'opacity-40' : (isSel || (multiSelectionRowHighlight && isMultiSel)) ? rowSelectedClass : effectiveHoverClass,
                    customClass,
                    rowProps?.className || '',
                  ].join(' '),
                }

                const cells = [
                  draggable && (
                    <td key="__grip" className={`${tdBase} ${dragCellClassName} text-gray-300`}>
                      {showMultiSelectInDragColumn && isMarkedSelected
                        ? <span aria-label="선택됨" className="inline-flex w-full items-center justify-center text-sm font-semibold text-green-600">✓</span>
                        : <GripVertical size={14} />}
                    </td>
                  ),
                  ...columns.map((c) => {
                    const val = row[c.key]
                    const content = c.render ? c.render(val, row, idx) : val
                    const tdOverflowClass = c.noTruncate ? 'whitespace-nowrap' : 'whitespace-nowrap truncate'
                    const cellClassName = typeof c.cellClassName === 'function' ? c.cellClassName(row, idx) : c.className || ''
                    return (
                      <td
                        key={c.key}
                        className={[`${tdBase} ${tdOverflowClass}`, tdAlign(c.align), cellClassName].join(' ')}
                      >
                        {content}
                      </td>
                    )
                  }),
                ]

                const defaultRow = <tr {...trProps}>{cells}</tr>

                return (
                  <React.Fragment key={key}>
                    {rowRenderer
                      ? rowRenderer({ row, idx, key, isSel, isExpanded, trProps, rowRef, cells, defaultRow })
                      : defaultRow}

                    {expandedRowRender && isExpanded && (
                      <tr className="border-b border-gray-100 bg-white">
                        <td colSpan={displayColumns.length} className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          {expandedRowRender(row, idx)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>

        {/* gutter 오버레이: body(스크롤 컨테이너)에 absolute로 붙임 */}
        {/* 가로 스크롤 테이블에서는 gutter 레이어가 스크롤된 셀 위를 덮을 수 있다. */}
        {gutterW > 0 && rows.length > 0 && !enableHorizontalScroll && (
          <div
            ref={overlayRef}
            className="absolute top-0 bottom-0 right-0 pointer-events-none z-10"
            style={{ width: gutterW, right: -gutterW }}
          >
            {rowBoxes.map(({ key, top, height: h }) => {
              const isSel = selectedKey != null && key === selectedKey
              const isMultiSel = !isSel && selectedKeys != null && selectedKeys.has(key)
              const isHover = hoverKey != null && key === hoverKey

              const isHighlightedMulti = multiSelectionRowHighlight && isMultiSel
              const gutterCustom = !isSel && !isHighlightedMulti && !isHover && getGutterRowClass ? getGutterRowClass(key) : ''
              return (
                <div
                  key={key}
                  className={[
                    'border-b border-gray-100 box-border',
                    (isSel || isHighlightedMulti) ? gutterSelectedClass : '',
                    !isSel && !isHighlightedMulti && isHover ? gutterHoverClass : '',
                    gutterCustom,
                  ].join(' ')}
                  style={{ position: 'absolute', top, height: h, left: 0, right: 0 }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
