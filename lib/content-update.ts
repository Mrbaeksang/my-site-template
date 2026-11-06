const MAX_PAYLOAD_BYTES = 1024 * 1024

type Json = Record<string, unknown>

/** 저장 요청의 (컴포넌트, 섹션)과 site.json 위치의 대응. 여기 없는 조합은 거부한다. */
const TARGETS = new Map<string, { path: string[]; kind: "object" | "array" }>([
  ["header/Config", { path: ["site"], kind: "object" }],
  ["hero/Info", { path: ["hero", "info"], kind: "object" }],
  ["hero/SocialLinks", { path: ["hero", "socialLinks"], kind: "array" }],
  ["about/Info", { path: ["about", "info"], kind: "object" }],
  ["projects/Info", { path: ["projects", "info"], kind: "object" }],
  ["contact/Info", { path: ["contact", "info"], kind: "object" }],
  ["contact/SocialLinks", { path: ["contact", "socialLinks"], kind: "array" }],
  ["footer/Info", { path: ["footer", "info"], kind: "object" }],
])

export class ContentUpdateError extends Error {}

function isPlainObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasForbiddenKey)
  if (!isPlainObject(value)) return false
  return Object.keys(value).some(
    (key) => key === "__proto__" || key === "constructor" || key === "prototype" || hasForbiddenKey(value[key]),
  )
}

/** 저장 내용을 합친 새 site.json 내용을 반환한다. 입력 객체는 바꾸지 않는다. */
export function applyContentUpdate(content: Json, component: unknown, section: unknown, data: unknown): Json {
  const target = TARGETS.get(`${component}/${section ?? "Info"}`)
  if (!target) throw new ContentUpdateError("저장할 수 없는 항목입니다")

  if (target.kind === "array" ? !Array.isArray(data) : !isPlainObject(data)) {
    throw new ContentUpdateError("저장할 데이터 형식이 올바르지 않습니다")
  }
  if (hasForbiddenKey(data)) throw new ContentUpdateError("저장할 데이터에 허용되지 않는 키가 있습니다")
  if (JSON.stringify(data).length > MAX_PAYLOAD_BYTES) {
    throw new ContentUpdateError("저장할 데이터가 너무 큽니다")
  }

  const next = structuredClone(content)
  let parent = next
  for (const key of target.path.slice(0, -1)) {
    parent = parent[key] as Json
  }
  const leaf = target.path[target.path.length - 1]
  // 일부 필드만 보내도 나머지가 사라져 화면이 깨지지 않도록 객체는 합친다.
  parent[leaf] = target.kind === "array" ? data : { ...(parent[leaf] as Json), ...(data as Json) }
  return next
}
