"use client"

import { useEffect } from "react"
import { defaultConfig } from "@/lib/site-config"

export function SiteTitle() {
  useEffect(() => {
    // 항상 파일의 defaultConfig.siteTitle 값을 사용
    document.title = defaultConfig.siteTitle

    // localStorage도 파일 값으로 동기화
    localStorage.setItem('portfolio-site-title', defaultConfig.siteTitle)
    
    // storage 이벤트 리스너 (다른 탭에서 변경시)
    const handleStorageChange = () => {
      const savedTitle = localStorage.getItem('portfolio-site-title')
      if (savedTitle) {
        document.title = savedTitle
      } else {
        document.title = defaultConfig.siteTitle
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  return null
}