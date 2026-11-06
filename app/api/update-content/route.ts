import fs from "node:fs/promises"
import path from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { rejectUntrustedDevRequest } from "@/lib/dev-api"
import { applyContentUpdate, ContentUpdateError } from "@/lib/content-update"

const CONTENT_PATH = path.join(process.cwd(), "content", "site.json")

export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedDevRequest(request)
  if (rejected) return rejected

  try {
    const { component, section, data } = await request.json()
    const content = JSON.parse(await fs.readFile(CONTENT_PATH, "utf-8"))
    const next = applyContentUpdate(content, component, section, data)

    // 저장 중 실패해도 기존 파일이 깨지지 않도록 임시 파일을 쓴 뒤 교체한다.
    const tempPath = `${CONTENT_PATH}.${process.pid}.tmp`
    await fs.writeFile(tempPath, `${JSON.stringify(next, null, 2)}\n`, "utf-8")
    await fs.rename(tempPath, CONTENT_PATH)

    return NextResponse.json({ success: true, message: "파일이 성공적으로 저장되었습니다" })
  } catch (error) {
    if (error instanceof ContentUpdateError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "요청 또는 content/site.json의 JSON 형식이 올바르지 않습니다" }, { status: 400 })
    }
    console.error("내용 저장 오류:", error)
    return NextResponse.json({ error: "저장하지 못했습니다. 터미널의 오류를 확인하세요" }, { status: 500 })
  }
}
