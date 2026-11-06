"use client"

import { useState } from "react"
import { Save, Check, AlertCircle } from "lucide-react"
import { useInlineEditor } from "@/contexts/inline-editor-context"

export function GlobalSaveButton() {
  const { isEditMode, saveToFile, getData } = useInlineEditor()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState("")
  
  if (!isEditMode) return null
  
  const handleSaveAll = async () => {
    setIsSaving(true)
    setSaveStatus('saving')
    setMessage("저장 중...")
    
    const components = [
      { name: 'hero', section: 'Info' },
      { name: 'hero', section: 'SocialLinks', dataKey: 'hero-social-links' },
      { name: 'about', section: 'Info' },
      { name: 'projects', section: 'Info' },
      { name: 'contact', section: 'Info' },
      { name: 'contact', section: 'SocialLinks', dataKey: 'contact-social-links' },
      { name: 'footer', section: 'Info' },
      { name: 'header', section: 'Config' }
    ]
    
    let successCount = 0
    const failedComponents: string[] = []
    
    for (const comp of components) {
      const dataKey = comp.dataKey || (comp.name === 'header' ? 'nav-config' : `${comp.name}-info`)
      const data = getData(dataKey)
      
      if (data) {
        try {
          const success = await saveToFile(comp.name, comp.section, data)
          if (success) {
            successCount++
          } else {
            failedComponents.push(comp.name)
          }
        } catch (error) {
          console.error(`${comp.name} 저장 실패:`, error)
          failedComponents.push(comp.name)
        }
      }
    }
    
    if (failedComponents.length === 0) {
      setSaveStatus('success')
      setMessage(`✅ 모든 변경사항이 저장되었습니다 (${successCount}개 컴포넌트)`)
      setTimeout(() => {
        setSaveStatus('idle')
        setMessage("")
      }, 3000)
    } else {
      setSaveStatus('error')
      setMessage(`⚠️ 일부 저장 실패: ${failedComponents.join(', ')}`)
      setTimeout(() => {
        setSaveStatus('idle')
        setMessage("")
      }, 5000)
    }
    
    setIsSaving(false)
  }
  
  return (
    <div className="fixed bottom-20 right-4 z-[9998] flex flex-col items-end gap-2">
      <button
        onClick={handleSaveAll}
        disabled={isSaving}
        className={`
          p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${saveStatus === 'success' ? 'bg-green-600' : 
            saveStatus === 'error' ? 'bg-red-600' : 
            'bg-blue-600'} 
          text-white
        `}
        title="모든 변경사항을 파일에 저장"
      >
        {saveStatus === 'success' ? (
          <Check className="h-5 w-5" />
        ) : saveStatus === 'error' ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <Save className="h-5 w-5" />
        )}
      </button>
      
      {message && (
        <div className={`
          px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs
          ${saveStatus === 'success' ? 'bg-green-100 text-green-800' : 
            saveStatus === 'error' ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'}
        `}>
          {message}
        </div>
      )}
    </div>
  )
}