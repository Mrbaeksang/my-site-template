import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedDevRequest } from '@/lib/dev-api'
import { isIdentifier } from '@/lib/dev-request-policy'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedDevRequest(request)
  if (rejected) return rejected

  try {
    const { component, field, value } = await request.json()

    if (!isIdentifier(field)) {
      return NextResponse.json(
        { error: '필드 이름이 올바르지 않습니다' },
        { status: 400 }
      )
    }
    
    // 📁 수정 가능한 컴포넌트 파일들
    const componentFiles: Record<string, string> = {
      'hero': 'components/hero.tsx',
      'about': 'components/about.tsx',
      'projects': 'components/projects.tsx',
      'contact': 'components/contact.tsx',
      'footer': 'components/footer.tsx',
      'header': 'components/header.tsx',
      'navbar': 'components/navbar.tsx'
    }
    
    const fileName = componentFiles[component]
    if (!fileName) {
      return NextResponse.json(
        { error: '허용되지 않은 컴포넌트입니다' },
        { status: 400 }
      )
    }
    
    // 파일 읽기
    const filePath = path.join(process.cwd(), fileName)
    let content = await fs.readFile(filePath, 'utf-8')
    
    // 값 포맷팅
    let formattedValue: string
    if (typeof value === 'string') {
      // 문자열 값 이스케이프 처리
      const escaped = value.replace(/\\/g, '\\\\')
                          .replace(/"/g, '\\"')
                          .replace(/\n/g, '\\n')
                          .replace(/\r/g, '\\r')
                          .replace(/\t/g, '\\t')
      formattedValue = `"${escaped}"`
    } else if (Array.isArray(value)) {
      formattedValue = JSON.stringify(value)
    } else if (typeof value === 'object' && value !== null) {
      formattedValue = JSON.stringify(value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      formattedValue = String(value)
    } else {
      formattedValue = 'null'
    }
    
    // const 변수 패턴 찾기 - 배열이나 객체를 포함한 전체 선언
    const constPattern = new RegExp(
      `(const\\s+${field}\\s*=\\s*)([\\s\\S]*?)(?=\\n\\s*(?:const|let|var|function|export|import|//|/\\*|\\n\\s*$))`,
      'g'
    )
    
    // defaultInfo 객체 내부 필드 패턴
    const fieldPattern = new RegExp(
      `(^\\s*${field}:\\s*)([^,\\n}]+)(,?)`,
      'gm'
    )
    
    // 먼저 const 변수로 선언되어 있는지 확인
    if (content.includes(`const ${field} =`)) {
      // const 변수 전체를 새 값으로 교체
      const startIndex = content.indexOf(`const ${field} =`)
      if (startIndex !== -1) {
        // 다음 const, let, var, function 등을 찾아서 끝 위치 결정
        const afterStart = startIndex + `const ${field} =`.length
        let endIndex = content.length
        
        // 다음 최상위 선언을 찾기
        const nextPatterns = [
          /\nconst\s+/g,
          /\nlet\s+/g,
          /\nvar\s+/g,
          /\nfunction\s+/g,
          /\nexport\s+/g,
          /\nimport\s+/g,
          /\n\/\/ /g,
          /\n\/\*/g,
          /\n\s*\n(?=\s*const|\s*let|\s*var|\s*function)/g
        ]
        
        for (const pattern of nextPatterns) {
          pattern.lastIndex = afterStart
          const match = pattern.exec(content)
          if (match && match.index < endIndex) {
            endIndex = match.index
          }
        }
        
        // 교체
        content = content.substring(0, startIndex) + 
                  `const ${field} = ${formattedValue}` + 
                  content.substring(endIndex)
      }
    }
    // 그다음 객체 필드로 존재하는지 확인
    else if (fieldPattern.test(content)) {
      content = content.replace(fieldPattern, (match, prefix, oldValue, comma) => {
        return `${prefix}${formattedValue}${comma || ''}`
      })
    }
    // 둘 다 없으면 defaultInfo 객체 안에 추가
    else {
      const defaultInfoPattern = /const\s+default\w+\s*=\s*\{/
      const match = content.match(defaultInfoPattern)
      
      if (match) {
        const insertIndex = match.index! + match[0].length
        const insertion = `\n    ${field}: ${formattedValue},`
        content = content.slice(0, insertIndex) + insertion + content.slice(insertIndex)
      } else {
        return NextResponse.json(
          { error: 'defaultInfo 객체를 찾을 수 없습니다' },
          { status: 400 }
        )
      }
    }
    
    // 파일 저장
    await fs.writeFile(filePath, content, 'utf-8')
    
    console.log(`✅ ${fileName}의 ${field} 필드가 업데이트되었습니다`)
    
    return NextResponse.json({ 
      success: true,
      message: '필드가 성공적으로 저장되었습니다'
    })
    
  } catch (error) {
    console.error('필드 저장 오류:', error)
    return NextResponse.json(
      { error: '필드 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}