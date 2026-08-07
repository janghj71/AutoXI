const POSTCODE_SCRIPT_ID = 'kakao-postcode-script'
const POSTCODE_SCRIPT_URL = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let scriptPromise

function getPostcodeConstructor() {
  return window.kakao?.Postcode ?? window.daum?.Postcode
}

function loadPostcodeScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('우편번호 검색은 브라우저에서만 사용할 수 있습니다.'))
  }

  if (getPostcodeConstructor()) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(POSTCODE_SCRIPT_ID)
    const script = existingScript ?? document.createElement('script')

    const handleLoad = () => {
      if (getPostcodeConstructor()) {
        resolve()
        return
      }

      scriptPromise = undefined
      reject(new Error('우편번호 검색 서비스를 불러오지 못했습니다.'))
    }
    const handleError = () => {
      scriptPromise = undefined
      reject(new Error('우편번호 검색 서비스를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.'))
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.id = POSTCODE_SCRIPT_ID
      script.src = POSTCODE_SCRIPT_URL
      script.async = true
      document.head.appendChild(script)
    }
  })

  return scriptPromise
}

/**
 * 카카오 우편번호 검색 팝업을 열고 선택된 주소를 반환합니다.
 * 팝업을 주소 선택 없이 닫으면 null을 반환합니다.
 */
export async function openPostcodeSearch() {
  await loadPostcodeScript()

  const Postcode = getPostcodeConstructor()

  return new Promise((resolve) => {
    let completed = false
    const postcode = new Postcode({
      oncomplete(data) {
        completed = true
        resolve({
          zonecode: data.zonecode,
          address: data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          buildingName: data.buildingName,
          raw: data,
        })
      },
      onclose() {
        if (!completed) resolve(null)
      },
    })

    postcode.open()
  })
}
