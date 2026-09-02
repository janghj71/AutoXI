/**
 * 전화/팩스번호 3분할 입력 (지역번호-국번-번호)
 * value: [tel0, tel1, tel2]
 */
export default function TelField({ value = ['', '', ''], onChange, inputProps = [] }) {
  const setPart = (idx) => (e) => {
    const next = [...value]
    next[idx] = e.target.value
    onChange?.(next)
  }

  const inputClass =
    'min-w-0 w-full text-xs rounded-sm border border-gray-300 px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-green-600/15 focus:border-green-400'

  return (
    <div className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
      <input className={inputClass} value={value[0]} onChange={setPart(0)} maxLength={3} {...inputProps[0]} />
      <span className="text-gray-300">-</span>
      <input className={inputClass} value={value[1]} onChange={setPart(1)} maxLength={4} {...inputProps[1]} />
      <span className="text-gray-300">-</span>
      <input className={inputClass} value={value[2]} onChange={setPart(2)} maxLength={4} {...inputProps[2]} />
    </div>
  )
}
