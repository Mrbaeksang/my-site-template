import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { applyContentUpdate, ContentUpdateError } from "./content-update.ts"

const base = () => ({
  site: { siteTitle: "제목", items: [] },
  hero: { info: { name: "이름", title: "직함" }, socialLinks: [{ name: "a" }] },
})

test("객체는 기존 필드를 유지하며 합친다", () => {
  const next = applyContentUpdate(base(), "hero", "Info", { name: "새 이름" }) as ReturnType<typeof base>
  assert.deepEqual(next.hero.info, { name: "새 이름", title: "직함" })
})

test("입력 내용을 직접 바꾸지 않는다", () => {
  const content = base()
  applyContentUpdate(content, "hero", "Info", { name: "새 이름" })
  assert.equal(content.hero.info.name, "이름")
})

test("소셜 링크 배열은 통째로 바꾼다", () => {
  const next = applyContentUpdate(base(), "hero", "SocialLinks", []) as ReturnType<typeof base>
  assert.deepEqual(next.hero.socialLinks, [])
})

test("헤더 설정은 site에 저장한다", () => {
  const next = applyContentUpdate(base(), "header", "Config", { siteTitle: "새 제목" }) as ReturnType<typeof base>
  assert.equal(next.site.siteTitle, "새 제목")
})

test("section을 생략하면 Info로 처리한다", () => {
  const next = applyContentUpdate(base(), "hero", undefined, { name: "새 이름" }) as ReturnType<typeof base>
  assert.equal(next.hero.info.name, "새 이름")
})

test("허용되지 않은 위치와 잘못된 형식을 거부한다", () => {
  for (const [component, section, data] of [
    ["constructor", "Info", {}],
    ["__proto__", "Info", {}],
    ["hero", "Config", {}],
    ["hero", "Info", []],
    ["hero", "Info", null],
    ["hero", "SocialLinks", {}],
  ]) {
    assert.throws(() => applyContentUpdate(base(), component, section, data), ContentUpdateError)
  }
})

test("프로토타입 오염 키를 거부한다", () => {
  const data = JSON.parse('{"a":[{"__proto__":{"polluted":true}}]}')
  assert.throws(() => applyContentUpdate(base(), "hero", "Info", data), ContentUpdateError)
  assert.equal(({} as Record<string, unknown>).polluted, undefined)
})

test("너무 큰 데이터를 거부한다", () => {
  assert.throws(
    () => applyContentUpdate(base(), "hero", "Info", { name: "x".repeat(1024 * 1024 + 1) }),
    ContentUpdateError,
  )
})

test("저장소의 site.json이 화면에 필요한 구조를 갖춘다", () => {
  const content = JSON.parse(readFileSync("content/site.json", "utf8"))
  assert.equal(typeof content.site.siteTitle, "string")
  assert.ok(Array.isArray(content.site.items))
  assert.ok(Array.isArray(content.hero.socialLinks))
  assert.ok(Array.isArray(content.about.info.experienceCards))
  assert.ok(Array.isArray(content.about.info.skills))
  assert.ok(Array.isArray(content.about.info.story))
  assert.ok(Array.isArray(content.about.info.hobbies))
  assert.ok(Array.isArray(content.projects.info.projects))
  assert.ok(Array.isArray(content.contact.info.qrContent))
  assert.ok(Array.isArray(content.contact.socialLinks))
  assert.equal(typeof content.footer.info.showFooter, "boolean")
})
