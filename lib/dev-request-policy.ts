const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"])
const SAFE_PATH_SEGMENT = /^[^./\\:\0][^/\\:\0]*$/
const SAFE_PURPOSE = /^[A-Za-z0-9_-]{1,64}$/
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

export function isSafePurpose(value: string): boolean {
  return SAFE_PURPOSE.test(value)
}

/** 이 purpose로 업로드한 이전 파일인지 판단한다. `hero-background`가 `hero-background-video-1.mp4`를 지우지 않게 한다. */
export function isPreviousUpload(fileName: string, purpose: string): boolean {
  return fileName.startsWith(`${purpose}-`) && /^\d+\.[A-Za-z0-9]+$/.test(fileName.slice(purpose.length + 1))
}

/** 본문을 메모리에 올리기 전에 Content-Length로 크기를 확인한다. */
export function exceedsBodyLimit(contentLength: string | null, maxBytes: number): boolean {
  return Number(contentLength ?? 0) > maxBytes
}

/** `/uploads/<파일명>`에서 파일명을 꺼낸다. 폴더를 벗어나는 경로면 null을 반환한다. */
export function uploadFileName(webPath: string): string | null {
  if (!webPath.startsWith(UPLOADS_PREFIX)) return null
  const name = webPath.slice(UPLOADS_PREFIX.length)
  return isSafePathSegment(name) ? name : null
}
