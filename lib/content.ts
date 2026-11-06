import rawContent from "@/content/site.json"

export interface SocialLink {
  name: string
  icon: string
  url: string
}

export interface BackgroundInfo {
  image: string
  video: string
  color: string
  opacity: number
}

export interface SiteContent {
  site: {
    logo: string
    logoImage: string
    showNavBar: boolean
    showThemeToggle: boolean
    items: { name: string; url: string; icon: string; show: boolean }[]
    siteTitle: string
    siteDescription: string
  }
  hero: {
    info: {
      greeting: string
      name: string
      title: string
      description: string
      profileImage: string
      backgroundImage: string
      backgroundVideo: string
      backgroundOpacity: number
      projectButton: string
      background: BackgroundInfo
    }
    socialLinks: SocialLink[]
  }
  about: {
    info: {
      title: string
      subtitle: string
      background: BackgroundInfo
      experienceCards: { icon: string; title: string; period: string; description: string }[]
      skills: { icon: string; title: string; description: string }[]
      storyTitle: string
      story: string[]
      storyImage: string
      hobbies: string[]
    }
  }
  projects: {
    info: {
      title: string
      subtitle: string
      initialDisplay: number
      loadMoreCount: number
      background: BackgroundInfo
      projects: { image: string; video?: string; title: string; description: string }[]
    }
  }
  contact: {
    info: {
      name: string
      title: string
      company: string
      experience: string
      phone: string
      email: string
      website: string
      location: string
      workTime: string
      responseTime: string
      sectionTitle: string
      sectionSubtitle: string
      qrTitle: string
      qrSubtitle: string
      bottomMessage: string
      bottomSubMessage: string
      qrContent: string[]
      profileEmoji: string
      background: BackgroundInfo
    }
    socialLinks: SocialLink[]
  }
  footer: {
    info: {
      showFooter: boolean
      name: string
      description: string
      showQuickLinks: boolean
      quickLinksTitle: string
      showContactInfo: boolean
      contactTitle: string
      phone: string
      email: string
      location: string
      copyright: string
      showMadeWith: boolean
      madeWithLocation: string
      showTemplateCredit: boolean
      templateCreator: { name: string; youtube: string; website: string; email: string }
      showScrollTop: boolean
    }
  }
}

// 저장된 내용이 달라도 사용자의 빌드가 깨지지 않도록 JSON 추론 타입과 분리한다.
// 저장소의 site.json 구조는 lib/content-update.test.ts가 검사한다.
export const siteContent = rawContent as unknown as SiteContent
