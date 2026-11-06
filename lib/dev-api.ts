import { NextRequest, NextResponse } from "next/server"
import { isTrustedDevRequest } from "@/lib/dev-request-policy"

/** 요청을 거부해야 하면 응답을, 허용하면 null을 반환한다. */
export function rejectUntrustedDevRequest(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "개발 모드에서만 사용 가능합니다" }, { status: 403 })
  }
  if (!isTrustedDevRequest(request.headers.get("host"), request.headers.get("origin"))) {
    return NextResponse.json(
      { error: "이 PC의 편집 화면(localhost)에서만 저장할 수 있습니다" },
      { status: 403 },
    )
  }
  return null
}
