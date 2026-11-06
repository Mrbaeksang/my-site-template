// localStorage에서 존재하지 않는 이미지 경로 정리
export function cleanupInvalidImages() {
  if (typeof window === 'undefined') return

  const keysToCheck = [
    'portfolio-hero-info',
    'portfolio-hero-background',
    'portfolio-about-info',
    'portfolio-about-background',
    'portfolio-projects',
    'portfolio-contact-info'
  ]

  keysToCheck.forEach(key => {
    const data = localStorage.getItem(key)
    if (!data) return

    try {
      const parsed = JSON.parse(data)

      // 이미지 필드 확인 및 정리
      const imageFields = ['profileImage', 'backgroundImage', 'image', 'avatar', 'photo']
      
      imageFields.forEach(field => {
        if (parsed[field] && parsed[field].includes('/uploads/')) {
          // 이미지 존재 여부 확인
          const img = new Image()
          img.onerror = () => {
            // 이미지 로드 실패 시 필드 초기화
            parsed[field] = ''
            localStorage.setItem(key, JSON.stringify(parsed))
            console.log(`Cleaned invalid image from ${key}.${field}`)
          }
          img.src = parsed[field]
        }
      })

      // 배열인 경우 (projects 등)
      if (Array.isArray(parsed)) {
        parsed.forEach((item, index) => {
          imageFields.forEach(field => {
            if (item[field] && item[field].includes('/uploads/')) {
              const img = new Image()
              img.onerror = () => {
                item[field] = ''
                localStorage.setItem(key, JSON.stringify(parsed))
                console.log(`Cleaned invalid image from ${key}[${index}].${field}`)
              }
              img.src = item[field]
            }
          })
        })
      }
    } catch (e) {
      console.error(`Error parsing ${key}:`, e)
    }
  })
}

// 모든 localStorage 데이터 초기화 (개발용)
export function resetAllData() {
  if (typeof window === 'undefined') return
  
  const keys = Object.keys(localStorage).filter(key => key.startsWith('portfolio-'))
  keys.forEach(key => localStorage.removeItem(key))
  console.log('All portfolio data has been reset')
  window.location.reload()
}