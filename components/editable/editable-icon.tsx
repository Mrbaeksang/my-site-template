"use client"

import { useState, useEffect } from 'react'
import { useInlineEditor } from '@/contexts/inline-editor-context'
import * as LucideIcons from 'lucide-react'
import { Edit2, Search } from 'lucide-react'
import * as BrandIcons from '@/components/brand-icons'

const Icons = { ...LucideIcons, ...BrandIcons }

interface EditableIconProps {
  icon: string
  onChange: (icon: string) => void
  className?: string
  size?: number
  storageKey?: string
}

// 자주 사용하는 아이콘들
const popularIcons = [
  'Home', 'User', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock', 'Heart',
  'Star', 'Share2', 'Link', 'Download', 'Upload', 'Search', 'Settings',
  'Instagram', 'Youtube', 'Facebook', 'Twitter', 'Linkedin', 'Github',
  'Globe', 'Camera', 'Image', 'Video', 'Music', 'Mic', 'Book', 'FileText',
  'Briefcase', 'ShoppingBag', 'ShoppingCart', 'CreditCard', 'DollarSign',
  'TrendingUp', 'Award', 'Gift', 'Coffee', 'MessageCircle', 'MessageSquare',
  'Send', 'Bell', 'BellRing', 'Check', 'X', 'Plus', 'Minus', 'ChevronRight',
  'ChevronLeft', 'ChevronDown', 'ChevronUp', 'ArrowRight', 'ArrowLeft',
  'Menu', 'Grid', 'List', 'Filter', 'Trash2', 'Edit', 'Copy', 'Clipboard'
]

export function EditableIcon({ 
  icon, 
  onChange, 
  className = '',
  size = 24,
  storageKey
}: EditableIconProps) {
  const { isEditMode, saveData, getData } = useInlineEditor()
  const [isHovered, setIsHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(icon)

  // 초기값 로드
  useEffect(() => {
    if (storageKey) {
      const saved = getData(storageKey) as string | null
      if (saved) {
        onChange(saved)
        setSelectedIcon(saved)
      }
    }
  }, [storageKey])

  const IconComponent = Icons[icon as keyof typeof Icons] as React.ComponentType<{className?: string; size?: number}>
  const FallbackIcon = Icons.HelpCircle

  const filteredIcons = searchTerm 
    ? popularIcons.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : popularIcons

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName)
    onChange(iconName)
    if (storageKey) {
      saveData(storageKey, iconName)
    }
    setShowPicker(false)
    setSearchTerm('')
  }

  if (!isEditMode) {
    return IconComponent ? <IconComponent className={className} size={size} /> : <FallbackIcon className={className} size={size} />
  }

  return (
    <>
      <div
        className="relative inline-block group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowPicker(true)}
      >
        {IconComponent ? <IconComponent className={className} size={size} /> : <FallbackIcon className={className} size={size} />}
        {isHovered && (
          <div className="absolute -top-1 -right-1 p-0.5 bg-primary rounded-full">
            <Edit2 className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* 아이콘 선택 모달 */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4">아이콘 선택</h3>
            
            {/* 검색 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="아이콘 검색..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                autoFocus
              />
            </div>

            {/* 아이콘 그리드 */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2">
                {filteredIcons.map((iconName) => {
                  const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{className?: string; size?: number}>
                  if (!Icon || typeof Icon !== 'function') return null
                  
                  return (
                    <button
                      key={iconName}
                      onClick={() => handleIconSelect(iconName)}
                      className={`p-3 rounded-lg hover:bg-muted transition-colors ${
                        selectedIcon === iconName ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      title={iconName}
                    >
                      <Icon className="h-6 w-6 mx-auto" />
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setShowPicker(false)
                setSearchTerm('')
              }}
              className="mt-4 w-full py-2 border rounded-lg hover:bg-muted"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </>
  )
}