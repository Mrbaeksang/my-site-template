"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Phone, Mail, MessageCircle, Instagram, Youtube, Facebook, MapPin, Clock, Globe, Twitter, Send, Linkedin, Edit2, X, Plus, Github, MessageSquare, Twitch, Save } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EditableText } from "@/components/editable/editable-text"
import { EditableBackground } from "@/components/editable/editable-background"
import { useInlineEditor } from "@/contexts/inline-editor-context"

// 사용 가능한 소셜 아이콘 정의
const AVAILABLE_ICONS = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  discord: MessageSquare,
  twitch: Twitch,
  telegram: Send,
  globe: Globe,
  message: MessageCircle,
  mail: Mail
}

export function Contact() {
  const { getData, saveData, isEditMode, saveToFile } = useInlineEditor()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState<number | null>(null)
  
  // 기본 데이터
  const defaultInfo = {
    name: "백개발",
    title: "개발자",
    company: "",
    experience: "3년 경력",
    phone: "010-8767-1264",
    email: "qortkdgus95@gmail.com",
    website: "https://devcom.kr",
    location: "경상남도 진주시",
    workTime: "평일 09:00 - 18:00",
    responseTime: "24시간 이내 응답",
    sectionTitle: "연락처",
    sectionSubtitle: "프로젝트 문의나 협업 제안을 기다리고 있습니다. 편하신 방법으로 연락주세요!",
    qrTitle: "QR 코드로 연락처 저장",
    qrSubtitle: "스캔하면 연락처가 자동으로 저장됩니다",
    bottomMessage: "성장하는 개발자가 되겠습니다",
    bottomSubMessage: "고객님의 성공적인 프로젝트를 위해 최선을 다하겠습니다",
    qrContent: ["name","phone","email","location","website"],
    profileEmoji: "👤",
    background: {"image":"","video":"","color":"","opacity":0.1}
  }
  
  // 소셜 링크 기본값 (배열 형태로 변경)
  const defaultSocialLinks: { name: string; icon: string; url: string }[] = [
    {
      "name": "데브컴",
      "icon": "globe",
      "url": "https://devcom.kr"
    },
    {
      "name": "깃허브",
      "icon": "github",
      "url": "github.com"
    }
  ]
  
  const [contactInfo, setContactInfo] = useState(defaultInfo)
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks)
  const [backgroundData, setBackgroundData] = useState(
    defaultInfo.background
  )
  
  // localStorage에서 데이터 로드
  useEffect(() => {
    const savedData = getData('contact-info') as typeof defaultInfo | null
    if (savedData) {
      setContactInfo({ ...defaultInfo, ...savedData })
      // background 데이터가 있으면 설정
      if (savedData.background) {
        setBackgroundData(savedData.background)
      }
    }
    
    const savedSocial = getData('contact-social-links') as { name: string; icon: string; url: string }[] | null
    if (savedSocial) {
      setSocialLinks(savedSocial)
    }
    
    const savedBg = getData('contact-background') as { image: string; video: string; color: string; opacity: number } | null
    if (savedBg) {
      setBackgroundData(savedBg)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]) // isEditMode가 변경될 때마다 데이터 다시 로드
  
  const updateContactInfo = (key: string, value: string) => {
    const newInfo = { ...contactInfo, [key]: value }
    setContactInfo(newInfo)
    saveData('contact-info', newInfo)
    // 저장 버튼을 누를 때만 파일에 저장
  }
  
  const addSocialLink = () => {
    const newLinks = [...socialLinks]
    newLinks.push({ name: '새 링크', icon: 'globe', url: '' })
    setSocialLinks(newLinks)
    saveData('contact-social-links', newLinks)
    // 소셜 링크는 별도 저장 로직 필요 - 현재는 localStorage만 사용
  }
  
  const updateSocialLink = (index: number, field: 'name' | 'icon' | 'url', value: string) => {
    const newLinks = [...socialLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setSocialLinks(newLinks)
    saveData('contact-social-links', newLinks)
    // 소셜 링크는 별도 저장 로직 필요 - 현재는 localStorage만 사용
  }
  
  const removeSocialLink = (index: number) => {
    const newLinks = socialLinks.filter((_, i) => i !== index)
    setSocialLinks(newLinks)
    saveData('contact-social-links', newLinks)
    // 소셜 링크는 별도 저장 로직 필요 - 현재는 localStorage만 사용
  }

  // QR 코드에 포함할 내용 결정
  const generateVCard = () => {
    const qrContent = contactInfo.qrContent || ['name', 'phone', 'email']
    let vCard = 'BEGIN:VCARD\nVERSION:3.0\n'
    
    // 이름 (필수) - 갤럭시는 TITLE 필드 지원 안 함, 이름에 직책 포함
    if (qrContent.includes('name')) {
      // 갤럭시/안드로이드는 TITLE 필드를 저장하지 않으므로 이름에 직책 포함
      const displayName = contactInfo.title 
        ? `${contactInfo.name} (${contactInfo.title})`
        : contactInfo.name
      
      vCard += `FN:${displayName}\n`
      vCard += `N:${contactInfo.name};;;;\n` // 성/이름 구분용
    }
    
    // 회사명 (갤럭시에서 "직장"으로 표시됨)
    if (qrContent.includes('company') && contactInfo.company) {
      vCard += `ORG:${contactInfo.company}\n`
    }
    // TITLE 필드는 갤럭시에서 지원 안 함 - 이름에 포함시켰으므로 생략
    
    // 전화번호
    if (qrContent.includes('phone')) {
      vCard += `TEL;TYPE=CELL:${contactInfo.phone}\n`
    }
    
    // 이메일
    if (qrContent.includes('email')) {
      vCard += `EMAIL:${contactInfo.email}\n`
    }
    
    // 주소
    if (qrContent.includes('location') && contactInfo.location) {
      vCard += `ADR;TYPE=WORK:;;${contactInfo.location};;;;\n`
    }
    
    // 웹사이트 (일부 기기만 지원)
    if (qrContent.includes('website') && contactInfo.website) {
      vCard += `URL:${contactInfo.website}\n`
    }
    
    // 메모 필드에 SNS 정보 추가 (선택사항)
    const activeSocialLinks = socialLinks.filter(link => link.url)
    if (activeSocialLinks.length > 0) {
      let note = 'SNS:\\n'
      activeSocialLinks.forEach(link => {
        note += `${link.name}: ${link.url}\\n`
      })
      vCard += `NOTE:${note}\n`
    }
    
    vCard += 'END:VCARD'
    return vCard
  }
  
  const vCardString = generateVCard()

  // URL 인코딩 (한글 깨짐 방지)
  const encodedVCard = encodeURIComponent(vCardString.trim())
  
  // QR 코드 이미지 URL (외부 API 사용 - businessCard 프로젝트처럼)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodedVCard}`

  return (
    <EditableBackground
      image={backgroundData.image}
      video={backgroundData.video}
      color={backgroundData.color}
      opacity={backgroundData.opacity}
      onChange={(data) => {
        const newData = { ...backgroundData, ...data }
        setBackgroundData(newData)
        saveData('contact-background', newData)
        
        // contactInfo도 업데이트 (파일 저장을 위해)
        const updatedContactInfo = { ...contactInfo, background: newData }
        setContactInfo(updatedContactInfo)
        saveData('contact-info', updatedContactInfo)
      }}
      storageKey="contact-background"
      className="relative"
    >
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <EditableText
              value={contactInfo.sectionTitle}
              onChange={(value) => updateContactInfo('sectionTitle', value)}
              storageKey="contact-sectionTitle"
            />
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <EditableText
              value={contactInfo.sectionSubtitle}
              onChange={(value) => updateContactInfo('sectionSubtitle', value)}
              storageKey="contact-sectionSubtitle"
              multiline
            />
          </p>
        </div>

        {/* 메인 좌우 분할 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 왼쪽: 연락처 정보 */}
          <div className="space-y-6">
            {/* 프로필 섹션 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">프로필 정보</h3>
              {isEditMode && (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-full transition-colors flex items-center gap-1"
                  title="프로필 편집"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>편집</span>
                </button>
              )}
            </div>
            
            {/* 프로필 카드 */}
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-start gap-6">
                {/* 프로필 이미지 자리 */}
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{contactInfo.profileEmoji || '👤'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {contactInfo.name}
                  </h3>
                  <p className="text-lg text-primary mb-2">
                    {contactInfo.title}
                  </p>
                  <p className="text-muted-foreground">
                    {contactInfo.experience}
                    {contactInfo.responseTime && ` | ${contactInfo.responseTime}`}
                  </p>
                </div>
              </div>
            </Card>

            {/* 주요 연락 수단 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 전화 카드 */}
              <a 
                href={`tel:${contactInfo.phone}`}
                className="group"
              >
                <Card className="p-5 border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">전화</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>

              {/* 이메일 카드 */}
              <a 
                href={`mailto:${contactInfo.email}`}
                className="group"
              >
                <Card className="p-5 border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">이메일</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>

              {/* 위치 카드 */}
              <Card className="p-5 border-0 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">위치</p>
                    <p className="text-sm font-medium text-foreground truncate">
                        {contactInfo.location}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 업무시간 카드 */}
              <Card className="p-5 border-0 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">업무시간</p>
                    <p className="text-sm font-medium text-foreground truncate">
                        {contactInfo.workTime}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 소셜 미디어 섹션 헤더 */}
            <div className="flex items-center justify-between mb-4 mt-8">
              <h3 className="text-lg font-semibold text-foreground">소셜 미디어</h3>
              {isEditMode && (
                <button
                  onClick={() => setShowSocialModal(true)}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-full transition-colors flex items-center gap-1"
                  title="소셜 미디어 편집"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>편집</span>
                </button>
              )}
            </div>
            
            {/* 소셜 미디어 카드 */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex flex-wrap gap-3">
                {/* 활성화된 소셜 링크만 표시 */}
                {socialLinks.map((link, index) => {
                  if (!link.url) return null
                  const Icon = AVAILABLE_ICONS[link.icon as keyof typeof AVAILABLE_ICONS] || Globe
                  const isEmail = link.icon === 'mail' || link.url.startsWith('mailto:')
                  const href = isEmail && !link.url.startsWith('mailto:') ? `mailto:${link.url}` : link.url
                  
                  // 정적 클래스 매핑
                  let bgClass = 'bg-primary/10 hover:bg-primary/20'
                  let iconClass = 'text-primary'
                  
                  switch(link.icon) {
                    case 'message':
                      bgClass = 'bg-yellow-500/10 hover:bg-yellow-500/20'
                      iconClass = 'text-yellow-600'
                      break
                    case 'instagram':
                      bgClass = 'bg-pink-500/10 hover:bg-pink-500/20'
                      iconClass = 'text-pink-600'
                      break
                    case 'youtube':
                      bgClass = 'bg-red-500/10 hover:bg-red-500/20'
                      iconClass = 'text-red-600'
                      break
                    case 'facebook':
                      bgClass = 'bg-blue-600/10 hover:bg-blue-600/20'
                      iconClass = 'text-blue-600'
                      break
                    case 'twitter':
                      bgClass = 'bg-sky-500/10 hover:bg-sky-500/20'
                      iconClass = 'text-sky-600'
                      break
                    case 'linkedin':
                      bgClass = 'bg-blue-700/10 hover:bg-blue-700/20'
                      iconClass = 'text-blue-700'
                      break
                    case 'telegram':
                      bgClass = 'bg-blue-500/10 hover:bg-blue-500/20'
                      iconClass = 'text-blue-500'
                      break
                    case 'github':
                      bgClass = 'bg-gray-700/10 hover:bg-gray-700/20'
                      iconClass = 'text-gray-700'
                      break
                    case 'discord':
                      bgClass = 'bg-purple-500/10 hover:bg-purple-500/20'
                      iconClass = 'text-purple-600'
                      break
                    case 'twitch':
                      bgClass = 'bg-purple-600/10 hover:bg-purple-600/20'
                      iconClass = 'text-purple-700'
                      break
                    case 'mail':
                      bgClass = 'bg-blue-500/10 hover:bg-blue-500/20'
                      iconClass = 'text-blue-600'
                      break
                  }
                  
                  return (
                    <a
                      key={index}
                      href={href}
                      target={isEmail ? undefined : "_blank"}
                      rel={isEmail ? undefined : "noopener noreferrer"}
                      className={`p-3 ${bgClass} rounded-full transition-colors`}
                      aria-label={link.name}
                      title={link.name}
                    >
                      <Icon className={`h-5 w-5 ${iconClass}`} />
                    </a>
                  )
                })}
              </div>
              
              {/* 소셜 링크가 없을 때 표시 */}
              {socialLinks.every(link => !link.url) && (
                <p className="text-sm text-muted-foreground">
                  소셜 미디어 링크를 추가해주세요
                </p>
              )}
            </Card>
          </div>

          {/* 오른쪽: QR 코드 & 추가 정보 */}
          <div className="space-y-6">
            {/* QR 코드 카드 */}
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-card to-muted/20">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-foreground mb-2">
                  QR 코드로 연락처 저장
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {contactInfo.qrContent && contactInfo.qrContent.length > 0 
                    ? '스캔하면 선택한 정보가 연락처로 저장됩니다'
                    : 'QR 코드에 포함할 정보를 선택해주세요'
                  }
                </p>
                {/* QR 설정 버튼 - 중앙 정렬 */}
                {isEditMode && (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-full transition-colors inline-flex items-center gap-1"
                    title="QR 코드 설정"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>QR 설정</span>
                  </button>
                )}
              </div>
              
              {/* QR 코드 이미지 - 자동 업데이트! */}
              <div className="flex justify-center mb-6">
                <Image 
                  src={qrCodeUrl}
                  alt="연락처 QR 코드"
                  width={280}
                  height={280}
                  className="w-[280px] h-[280px]"
                  style={{ imageRendering: 'crisp-edges' }}
                  unoptimized
                />
              </div>
              
              {/* QR 설명 - 선택된 정보에 따라 동적으로 변경 */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground text-center">
                  📱 스캔하면 연락처가 자동 저장됩니다
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  포함된 정보: {
                    contactInfo.qrContent?.map(key => {
                      switch(key) {
                        case 'name': return '이름'
                        case 'phone': return '전화번호'
                        case 'email': return '이메일'
                        case 'title': return '직함'
                        case 'company': return '회사'
                        case 'location': return '위치'
                        case 'website': return '웹사이트'
                        default: return key
                      }
                    }).join(', ') || '없음'
                  }
                </p>
              </div>
            </Card>

          </div>
        </div>

        {/* 하단 메시지 */}
        <div className="mt-16 text-center p-8 bg-primary/5 rounded-2xl">
          <p className="text-lg font-medium text-foreground mb-2">
            <EditableText
              value={contactInfo.bottomMessage}
              onChange={(value) => updateContactInfo('bottomMessage', value)}
              storageKey="contact-bottomMessage"
            />
          </p>
          <p className="text-muted-foreground">
            <EditableText
              value={contactInfo.bottomSubMessage}
              onChange={(value) => updateContactInfo('bottomSubMessage', value)}
              storageKey="contact-bottomSubMessage"
            />
          </p>
        </div>
      </div>
      </section>
      
      {/* 프로필 편집 모달 */}
      {showProfileModal && isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">프로필 정보 편집</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* 기본 정보 */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">기본 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">이름</label>
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) => updateContactInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">직함</label>
                  <input
                    type="text"
                    value={contactInfo.title}
                    onChange={(e) => updateContactInfo('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">회사명 (선택)</label>
                  <input
                    type="text"
                    value={contactInfo.company}
                    onChange={(e) => updateContactInfo('company', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="회사명"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">경력</label>
                  <input
                    type="text"
                    value={contactInfo.experience}
                    onChange={(e) => updateContactInfo('experience', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">프로필 이모지</label>
                  <input
                    type="text"
                    value={contactInfo.profileEmoji}
                    onChange={(e) => updateContactInfo('profileEmoji', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="👤"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">응답 시간</label>
                  <input
                    type="text"
                    value={contactInfo.responseTime}
                    onChange={(e) => updateContactInfo('responseTime', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
            
            {/* 연락처 정보 */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">연락처</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">전화번호</label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => updateContactInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">이메일</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => updateContactInfo('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">위치</label>
                  <input
                    type="text"
                    value={contactInfo.location}
                    onChange={(e) => updateContactInfo('location', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">업무시간</label>
                  <input
                    type="text"
                    value={contactInfo.workTime}
                    onChange={(e) => updateContactInfo('workTime', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">웹사이트</label>
                  <input
                    type="text"
                    value={contactInfo.website || ''}
                    onChange={(e) => updateContactInfo('website', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  // 프로필 정보를 파일로 저장
                  const success = await saveToFile('contact', 'Info', contactInfo)
                  if (success) {
                    console.log('✅ 프로필 정보 저장 완료')
                  }
                  setShowProfileModal(false)
                }}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                저장 & 완료
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 소셜 미디어 편집 모달 - Hero와 동일한 스타일 */}
      {showSocialModal && isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">소셜 링크 편집</h3>
              <button
                onClick={() => {
                  setShowSocialModal(false)
                  setShowIconPicker(null)
                }}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {socialLinks.map((link, index) => {
                const Icon = AVAILABLE_ICONS[link.icon as keyof typeof AVAILABLE_ICONS] || Globe
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {/* 아이콘 미리보기 */}
                    <div className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* 플랫폼 이름 입력 */}
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                      placeholder="플랫폼 이름"
                      className="w-32 px-3 py-2 border rounded-lg bg-background"
                    />
                    
                    {/* 아이콘 선택 버튼 */}
                    <div className="relative">
                      <button
                        onClick={() => setShowIconPicker(showIconPicker === index ? null : index)}
                        className="px-3 py-2 border rounded-lg bg-background hover:bg-muted flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">아이콘 변경</span>
                      </button>
                      
                      {/* 아이콘 선택 드롭다운 */}
                      {showIconPicker === index && (
                        <div className="absolute top-full mt-2 left-0 bg-background border rounded-lg shadow-lg p-2 z-50 w-64 max-h-64 overflow-y-auto">
                          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">소셜 미디어</div>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { value: 'instagram', label: 'Instagram' },
                              { value: 'youtube', label: 'YouTube' },
                              { value: 'facebook', label: 'Facebook' },
                              { value: 'twitter', label: 'Twitter' },
                              { value: 'linkedin', label: 'LinkedIn' },
                              { value: 'github', label: 'GitHub' },
                              { value: 'discord', label: 'Discord' },
                              { value: 'twitch', label: 'Twitch' },
                              { value: 'telegram', label: 'Telegram' },
                              { value: 'message', label: '메시지' },
                              { value: 'mail', label: '이메일' },
                              { value: 'globe', label: '웹사이트' }
                            ].map(({ value, label }) => {
                              const IconOption = AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS]
                              return (
                                <button
                                  key={value}
                                  onClick={() => {
                                    updateSocialLink(index, 'icon', value)
                                    setShowIconPicker(null)
                                  }}
                                  className="p-2 hover:bg-muted rounded-lg flex flex-col items-center gap-1 transition-colors"
                                  title={label}
                                >
                                  <IconOption className="h-5 w-5" />
                                  <span className="text-xs">{label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* URL 입력 */}
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="URL 또는 이메일"
                      className="flex-1 px-3 py-2 border rounded-lg bg-background"
                    />
                    
                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
              
              <button
                onClick={addSocialLink}
                className="w-full py-3 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                소셜 링크 추가
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                💡 팁: 플랫폼 이름을 입력하고, 아이콘을 선택한 후 URL을 입력하세요. 빈 URL은 표시되지 않습니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    // 소셜 링크를 파일로 저장
                    const success = await saveToFile('contact', 'SocialLinks', socialLinks)
                    if (success) {
                      console.log('✅ 소셜 링크 저장 완료')
                    }
                    setShowSocialModal(false)
                    setShowIconPicker(null)
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  저장 & 완료
                </button>
                <button
                  onClick={() => {
                    setShowSocialModal(false)
                    setShowIconPicker(null)
                  }}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* QR 코드 설정 모달 */}
      {showQRModal && isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background border rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">QR 코드 설정</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                QR 코드에 포함할 정보를 선택하세요
              </p>
              
              <div className="space-y-2">
                {[
                  { key: 'name', label: '이름' },
                  { key: 'phone', label: '전화번호' },
                  { key: 'email', label: '이메일' },
                  { key: 'title', label: '직함' },
                  { key: 'company', label: '회사명' },
                  { key: 'location', label: '위치' },
                  { key: 'website', label: '웹사이트' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contactInfo.qrContent?.includes(key) || false}
                      onChange={(e) => {
                        const currentContent = contactInfo.qrContent || []
                        const newContent = e.target.checked
                          ? [...currentContent, key]
                          : currentContent.filter(item => item !== key)
                        updateContactInfo('qrContent', newContent as unknown as string)
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              완료
            </button>
          </div>
        </div>
      )}
    </EditableBackground>
  )
}