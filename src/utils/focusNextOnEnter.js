const FOCUSABLE_FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"])',
  'select',
].join(', ')

function isEditableField(element) {
  return !element.disabled && !element.readOnly && element.tabIndex !== -1 && element.getClientRects().length > 0
}

/**
 * 컨테이너에 onKeyDown으로 연결하면 Enter 입력 시 다음 편집 가능한 필드로 이동합니다.
 */
export function focusNextOnEnter(event) {
  if (
    event.key !== 'Enter' ||
    event.shiftKey ||
    event.nativeEvent?.isComposing ||
    event.nativeEvent?.keyCode === 229
  ) {
    return
  }

  const currentField = event.target
  if (!(currentField instanceof HTMLInputElement || currentField instanceof HTMLSelectElement)) return

  const container = event.currentTarget
  const fields = Array.from(container.querySelectorAll(FOCUSABLE_FIELD_SELECTOR)).filter(isEditableField)
  const currentIndex = fields.indexOf(currentField)
  if (currentIndex === -1) return

  // 상위 화면에도 동일 핸들러가 연결된 경우 Enter가 두 번 처리되지 않게 합니다.
  event.stopPropagation()

  const nextField = fields[currentIndex + 1]
  if (!nextField) return

  event.preventDefault()
  nextField.focus()
  if (nextField instanceof HTMLInputElement && typeof nextField.select === 'function') {
    nextField.select()
  }
}
