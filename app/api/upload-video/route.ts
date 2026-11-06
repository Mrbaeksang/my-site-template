import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedDevRequest } from '@/lib/dev-api'
import { isSafePathSegment, uploadFileName } from '@/lib/dev-request-policy'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedDevRequest(request)
  if (rejected) return rejected

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = formData.get('purpose') as string || 'general-video'
    const oldPath = formData.get('oldPath') as string || ''
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      )
    }

    if (!isSafePathSegment(purpose)) {
      return NextResponse.json(
        { error: '파일 용도(purpose) 값이 올바르지 않습니다' },
        { status: 400 }
      )
    }

    // 파일 확장자 확인
    const validExtensions = ['.mp4', '.webm', '.ogg']
    const fileExtension = path.extname(file.name).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: '비디오 파일만 업로드 가능합니다 (MP4, WebM)' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 20MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    // 의미있는 파일명 생성 (purpose-timestamp.ext)
    const timestamp = Date.now()
    const uniqueFileName = `${purpose}-${timestamp}${fileExtension}`
    const publicPath = path.join(process.cwd(), 'public', 'uploads')
    
    // uploads 폴더가 없으면 생성
    try {
      await fs.access(publicPath)
    } catch {
      await fs.mkdir(publicPath, { recursive: true })
    }

    // 기존 파일 삭제 (같은 purpose의 이전 파일들 삭제)
    const oldFileName = uploadFileName(oldPath)
    if (oldFileName) {
      try {
        const oldFilePath = path.join(publicPath, oldFileName)
        await fs.unlink(oldFilePath)
        console.log(`🗑️ 기존 비디오 삭제: ${oldPath}`)
      } catch (error) {
        console.log('기존 비디오 삭제 실패 (파일이 없을 수 있음):', error)
      }
    }
    
    // 같은 purpose의 다른 파일들도 삭제
    try {
      const files = await fs.readdir(publicPath)
      for (const existingFile of files) {
        if (existingFile.startsWith(`${purpose}-`) && existingFile !== uniqueFileName) {
          const fileToDelete = path.join(publicPath, existingFile)
          await fs.unlink(fileToDelete)
          console.log(`🗑️ 이전 ${purpose} 비디오 삭제: ${existingFile}`)
        }
      }
    } catch (error) {
      console.log('이전 비디오 정리 중 오류:', error)
    }

    // 파일 저장
    const filePath = path.join(publicPath, uniqueFileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await fs.writeFile(filePath, buffer)
    
    // 웹에서 접근 가능한 경로 반환
    const webPath = `/uploads/${uniqueFileName}`
    
    console.log(`✅ 비디오 업로드 완료: ${webPath}`)
    
    return NextResponse.json({ 
      success: true,
      path: webPath,
      filename: uniqueFileName
    })
    
  } catch (error) {
    console.error('파일 업로드 오류:', error)
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}