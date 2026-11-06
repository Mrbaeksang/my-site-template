import { NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'
import { defaultConfig } from '@/lib/site-config'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // uploads 폴더에서 hero-profile로 시작하는 이미지 찾기
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      const profileImage = files.find(file => 
        file.startsWith('hero-profile') && 
        (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.webp'))
      )
      
      if (profileImage) {
        const imagePath = path.join(uploadsDir, profileImage)
        const imageBuffer = fs.readFileSync(imagePath)
        
        // 이미지 타입 결정
        const ext = path.extname(profileImage).toLowerCase()
        const contentType = 
          ext === '.png' ? 'image/png' :
          ext === '.webp' ? 'image/webp' :
          'image/jpeg'
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }
    }
    
    // 프로필 이미지가 없으면 사이트 제목으로 PNG 생성 (SNS 미리보기는 SVG를 지원하지 않는 경우가 많다)
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#fafafa",
          fontSize: 72,
          padding: 80,
          textAlign: "center",
        }}
      >
        {defaultConfig.siteTitle}
      </div>,
      { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=3600' } },
    )
  } catch (error) {
    console.error('OG 이미지 생성 실패:', error)
    return NextResponse.json({ error: 'Failed to generate OG image' }, { status: 500 })
  }
}