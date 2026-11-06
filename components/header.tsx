"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Home, User, Briefcase, Mail, Settings, Heart, Star, Camera, Music, Book, Coffee, Rocket, Plus, X, type LucideIcon } from "lucide-react"
import { NavBar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useInlineEditor } from "@/contexts/inline-editor-context"
import { defaultConfig } from "@/lib/site-config"

// 아이콘 매핑 객체
const ICON_MAP = {
  Home,
  User,
  Briefcase,
  Mail,
  Settings,
  Heart,
  Star,
  Camera,
  Music,
  Book,
  Coffee,
  Rocket
}


function setDocumentTitle(title: string) {
  document.title = title
}

export function Header() {
  const { getData, saveData, isEditMode, saveToFile, saveFieldToFile } = useInlineEditor()
  
  // defaultConfig의 아이콘을 컴포넌트로 변환한 상태로 초기화
  const [navConfig, setNavConfig] = useState({
    ...defaultConfig,
    items: defaultConfig.items.map(item => ({
      ...item,
      icon: typeof item.icon === 'string' 
        ? (ICON_MAP[item.icon as keyof typeof ICON_MAP] || Home)
        : item.icon
    }))
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [siteTitle, setSiteTitle] = useState(defaultConfig.siteTitle)
  const [siteDescription, setSiteDescription] = useState(defaultConfig.siteDescription)
  
  // localStorage에서 데이터 로드
  useEffect(() => {
    // 사이트 제목 복원 - site-title.tsx와 같은 키 사용
    const savedTitle = localStorage.getItem('portfolio-site-title')
    if (savedTitle) {
      setSiteTitle(savedTitle)
      document.title = savedTitle
    } else {
      // 현재 document.title을 기본값으로 사용
      setSiteTitle(document.title)
    }
    
    const savedData = getData('nav-config') as { 
      logo?: string; 
      logoImage?: string; 
      showNavBar?: boolean; 
      showThemeToggle?: boolean; 
      items?: Array<{ name: string; url: string; icon: string; show: boolean }> 
    } | null
    if (savedData && savedData.items) {
      // 아이콘 복원
      const restoredItems = savedData.items.map((item) => {
        let iconComponent = Home // 기본값
        
        // 문자열로 저장된 아이콘 이름을 컴포넌트로 변환
        if (typeof item.icon === 'string' && ICON_MAP[item.icon as keyof typeof ICON_MAP]) {
          iconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP]
        }
        
        return {
          ...item,
          icon: iconComponent
        }
      })
      
      setNavConfig({ 
        ...defaultConfig, 
        ...savedData,
        items: restoredItems
      })
    }
  }, [])
  
  const updateNavConfig = (key: string, value: string | boolean | typeof navConfig.items) => {
    const newConfig = { ...navConfig, [key]: value }
    setNavConfig(newConfig)
    
    // 사이트 제목과 디스크립션 업데이트
    if (key === 'siteTitle' && typeof value === 'string') {
      setSiteTitle(value)
      setDocumentTitle(value)
      localStorage.setItem('portfolio-site-title', value)
    }

    if (key === 'siteDescription' && typeof value === 'string') {
      setSiteDescription(value)
      localStorage.setItem('portfolio-site-description', value)
    }
    
    // 저장할 때 아이콘을 문자열로 변환
    const configToSave: { 
      logo?: string; 
      logoImage?: string; 
      showNavBar?: boolean; 
      showThemeToggle?: boolean; 
      items?: Array<{ name: string; url: string; icon: string | LucideIcon; show: boolean }> 
    } = { ...newConfig }
    if (configToSave.items) {
      configToSave.items = newConfig.items.map((item) => {
        const iconName = Object.keys(ICON_MAP).find(key => ICON_MAP[key as keyof typeof ICON_MAP] === item.icon) || 'Home'
        return {
          ...item,
          icon: iconName
        }
      })
    }
    saveData('nav-config', configToSave)
  }
  
  const updateMenuItem = (index: number, field: string, value: string | boolean | LucideIcon) => {
    const newItems = [...navConfig.items]
    newItems[index] = { ...newItems[index], [field]: value }
    updateNavConfig('items', newItems)
  }
  
  const addMenuItem = () => {
    const newItems = [...navConfig.items]
    newItems.push({
      name: "새 메뉴",
      url: "#new",
      icon: Home,
      show: true
    })
    updateNavConfig('items', newItems)
  }
  
  const removeMenuItem = (index: number) => {
    const newItems = navConfig.items.filter((_, i) => i !== index)
    updateNavConfig('items', newItems)
  }
  
  // 실제로 표시할 메뉴만 필터링하고 아이콘 문자열을 컴포넌트로 변환
  const activeItems = navConfig.items
    .filter(item => item.show)
    .map(item => {
      // icon이 이미 컴포넌트인 경우 그대로 사용
      if (typeof item.icon !== 'string') {
        return item
      }
      // 문자열인 경우 컴포넌트로 변환
      return {
        ...item,
        icon: ICON_MAP[item.icon as keyof typeof ICON_MAP] || Home
      }
    })
  
  // 네비게이션 바를 표시하지 않음
  if (!navConfig.showNavBar) {
    return navConfig.showThemeToggle ? (
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
    ) : null
  }
  
  return (
    <>
      {/* Navigation Bar */}
      <NavBar 
        items={activeItems} 
        logo={navConfig.logo}
        logoImage={navConfig.logoImage}
        isEditMode={isEditMode}
        onEditMenu={() => setShowEditModal(true)}
      />
      
      {/* Theme Toggle - Fixed Position */}
      {navConfig.showThemeToggle && (
        <div className="fixed top-20 right-6 md:top-6 md:right-6 z-50">
          <ThemeToggle />
        </div>
      )}
      
      {/* Edit Modal */}
      {showEditModal && isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">사이트 설정</h3>
            
            {/* Site Title */}
            <div className="mb-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-3">사이트 제목 설정</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">브라우저 탭 제목</label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => {
                      setSiteTitle(e.target.value)
                      setDocumentTitle(e.target.value)
                      updateNavConfig('siteTitle', e.target.value)
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="나의 포트폴리오"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">사이트 설명</label>
                  <input
                    type="text"
                    value={siteDescription}
                    onChange={(e) => {
                      setSiteDescription(e.target.value)
                      updateNavConfig('siteDescription', e.target.value)
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="창의적인 아이디어로 웹 경험을 디자인합니다."
                  />
                </div>
              </div>
            </div>
            
            {/* Logo Settings */}
            <div className="mb-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-3">네비바 로고 설정</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">로고 텍스트</label>
                  <input
                    type="text"
                    value={navConfig.logo}
                    onChange={(e) => updateNavConfig('logo', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="나의 포트폴리오"
                  />
                </div>
              </div>
            </div>
            
            {/* Menu Items - 홈, 소개, 프로젝트, 연락처만 이름 변경 가능 */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">메뉴 이름 변경</h4>
              <div className="space-y-3">
                {navConfig.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground w-20">
                      {index === 0 ? '홈' : index === 1 ? '소개' : index === 2 ? '프로젝트' : '연락처'}
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 border rounded bg-background"
                      placeholder="메뉴 이름"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                닫기
              </button>
              <button
                onClick={async () => {
                  // 아이콘을 문자열로 변환한 설정 객체 생성
                  const configToSave = {
                    ...navConfig,
                    siteTitle: siteTitle, // 실제 입력된 siteTitle 변수 사용
                    siteDescription: siteDescription, // 실제 입력된 siteDescription 변수 사용
                    items: navConfig.items.map((item) => ({
                      ...item,
                      icon: typeof item.icon === 'string'
                        ? item.icon
                        : Object.keys(ICON_MAP).find(key => ICON_MAP[key as keyof typeof ICON_MAP] === item.icon) || 'Home'
                    }))
                  }

                  // 다른 컴포넌트들처럼 간단하게 한 번에 저장
                  const success = await saveToFile('header', 'Config', configToSave)

                  if (success) {
                    saveData('nav-config', configToSave)
                    localStorage.setItem('portfolio-site-title', siteTitle)
                    localStorage.setItem('portfolio-site-description', siteDescription)
                    document.title = siteTitle // 저장 후 document.title 다시 설정
                    alert('✅ 네비게이션 설정이 파일에 저장되었습니다!')
                    setShowEditModal(false)
                  } else {
                    alert('❌ 파일 저장에 실패했습니다.')
                  }
                }}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
              >
                📁 파일에 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
