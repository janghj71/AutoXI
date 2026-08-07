/**
 * 공용 새 창 열기 유틸리티.
 * 창 중앙 배치, 동일한 window name 재사용, 초기 postMessage 재전송을 지원합니다.
 */
export function openCenteredWindow(url, name, width = 800, height = 600, options = {}) {
  const fullUrl = /^[a-z][a-z\d+\-.]*:/i.test(url) ? url : `${globalThis.location.origin}${url}`
  const left = Math.round(globalThis.screenX + (globalThis.outerWidth - width) / 2)
  const top = Math.round(globalThis.screenY + (globalThis.outerHeight - height) / 2)
  const { windowFeatures = {}, postMessage } = options
  const features = Object.entries({ width, height, left, top, scrollbars: 'yes', resizable: 'yes', ...windowFeatures })
    .map(([key, value]) => `${key}=${value}`)
    .join(',')
  const win = globalThis.open(fullUrl, name, features)
  if (!win) return null

  try { win.focus() } catch { /* popup focus can be blocked */ }

  if (postMessage?.type) {
    const targetOrigin = postMessage.targetOrigin || globalThis.location.origin
    const intervals = postMessage.intervals || [0, 200, 600, 1200]
    intervals.slice(0, postMessage.attempts || intervals.length).forEach((delay) => {
      globalThis.setTimeout(() => {
        try {
          if (!win.closed) win.postMessage({ type: postMessage.type, payload: postMessage.payload }, targetOrigin)
        } catch { /* popup may have closed */ }
      }, delay)
    })
  }

  return win
}
