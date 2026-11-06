const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"])
const SAFE_PATH_SEGMENT = /^[^./\\\0][^/\\\0]*$/
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/
const UPLOADS_PREFIX = "/uploads/"

/** 편집 API는 이 PC의 브라우저에서 같은 출처로 보낸 요청만 허용한다. */
export function isTrustedDevRequest(host: string | null, origin: string | null): boolean {
  if (!host || !origin) return false
  try {
    const url = new URL(origin)
    return url.host === host && LOOPBACK_HOSTNAMES.has(url.hostname)
  } catch {
    return false
  }
}

export function isSafePathSegment(value: string): boolean {
  return SAFE_PATH_SEGMENT.test(value)
}

export function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER.test(value)
}

/** `/uploads/<파일명>`에서 파일명을 꺼낸다. 폴더를 벗어나는 경로면 null을 반환한다. */
export function uploadFileName(webPath: string): string | null {
  if (!webPath.startsWith(UPLOADS_PREFIX)) return null
  const name = webPath.slice(UPLOADS_PREFIX.length)
  return isSafePathSegment(name) ? name : null
}
