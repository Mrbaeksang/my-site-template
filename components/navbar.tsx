"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { LucideIcon, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  logo?: string
  logoImage?: string
  isEditMode?: boolean
  onEditMenu?: () => void
}

export function NavBar({ items, className, logo, logoImage, isEditMode, onEditMenu }: NavBarProps) {
  // ==================== 🎨 네비게이션 바 커스텀 가이드 🎨 ====================
  // 
  // 이 컴포넌트는 header.tsx에서 설정합니다!
  // 여기서는 스타일과 동작만 수정 가능합니다.
  // 
  // 📌 커스텀 가능한 부분들:
  // - 네비게이션 바 위치 (상단/하단)
  // - 배경색과 투명도
  // - 애니메이션 효과
  // - 모바일/데스크톱 반응형 동작
  // 
  // ==================================================================
  
  const [activeTab, setActiveTab] = useState(items[0]?.name || '')
  // Removed isMobile state as it was unused

  // Scroll detection for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => item.url.substring(1))
      const currentSection = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      
      if (currentSection) {
        const activeItem = items.find(item => item.url === `#${currentSection}`)
        if (activeItem) {
          setActiveTab(activeItem.name)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [items])

  const scrollToSection = (url: string) => {
    const element = document.querySelector(url)
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: offsetTop - 80, // 네비게이션 바 높이만큼 오프셋
        behavior: "smooth"
      })
    }
  }

  return (
    <div
      className={cn(
        // 🎯 네비게이션 바 위치 설정
        // 모바일과 데스크톱 모두 상단에 고정
        "fixed top-4 inset-x-4 z-50 translate-x-0 md:top-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2",
        className,
      )}
    >
      {/* 네비게이션 바 컨테이너 */}
      <div className={cn(
        // 🎨 네비게이션 바 스타일
        "flex w-full items-center justify-center gap-2 flex-wrap md:w-auto md:flex-nowrap md:gap-3",
        // 배경색: bg-background/80 (80% 불투명도)
        // 테두리: border-border
        // 블러 효과: backdrop-blur-lg
        // 모서리: rounded-full (완전 둥글게)
        // 그림자: shadow-lg
        "bg-background/80 border border-border backdrop-blur-lg py-1 px-2 md:px-4 rounded-full shadow-lg"
      )}>
        {/* 로고 영역 (있을 경우) */}
        {(logo || logoImage) && (
          <div className="flex-shrink-0 px-3 md:px-4 py-1 md:border-r md:border-border/50">
            {logoImage ? (
              <img 
                src={logoImage} 
                alt="Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  // 이미지 로드 실패시 텍스트 로고로 대체
                  e.currentTarget.style.display = 'none'
                  if (logo) {
                    const textLogo = document.createElement('span')
                    textLogo.className = 'font-bold text-foreground'
                    textLogo.textContent = logo
                    e.currentTarget.parentElement?.appendChild(textLogo)
                  }
                }}
              />
            ) : (
              <span className="font-bold text-foreground">{logo}</span>
            )}
          </div>
        )}
        
        {/* 메뉴 아이템들 */}
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          
          // Icon이 유효한 컴포넌트인지 확인 (function 또는 forwardRef)
          const isValidIcon = Icon && (
            typeof Icon === 'function' || 
            (typeof Icon === 'object' && Icon !== null && '$$typeof' in Icon && (Icon as React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>).$$typeof === Symbol.for('react.forward_ref'))
          )
          
          if (!isValidIcon) {
            console.error('Invalid icon for item:', item.name, Icon)
            return null
          }

          return (
            <button
              key={item.name}
              aria-label={item.name}
              onClick={() => {
                setActiveTab(item.name)
                scrollToSection(item.url)
              }}
              className={cn(
                // 🔘 버튼 기본 스타일
                "relative flex flex-shrink-0 items-center justify-center cursor-pointer text-sm font-semibold px-3 md:px-6 py-2 rounded-full transition-colors",
                // 비활성 상태: text-foreground/80
                // 호버 상태: hover:text-primary
                "text-foreground/80 hover:text-primary",
                // 활성 상태: bg-muted text-primary
                isActive && "bg-muted text-primary",
              )}
            >
              {/* 데스크톱: 텍스트 표시 */}
              <span className="hidden md:inline">{item.name}</span>
              {/* 모바일: 아이콘 표시 */}
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {/* 🌟 활성 탭 애니메이션 효과 */}
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  {/* 상단 램프 효과 (빛나는 효과) */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    {/* 글로우 효과들 */}
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
        
        {/* Edit Button */}
        {isEditMode && onEditMenu && (
          <button
            onClick={onEditMenu}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title="메뉴 편집"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}