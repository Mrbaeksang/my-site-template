import assert from "node:assert/strict"
import { test } from "node:test"
import {
  isSafePathSegment,
  isTrustedDevRequest,
  uploadFileName,
} from "./dev-request-policy.ts"

test("같은 출처의 loopback 요청만 신뢰한다", () => {
  assert.equal(isTrustedDevRequest("localhost:3000", "http://localhost:3000"), true)
  assert.equal(isTrustedDevRequest("127.0.0.1:3000", "http://127.0.0.1:3000"), true)
  assert.equal(isTrustedDevRequest("[::1]:3000", "http://[::1]:3000"), true)
})

test("외부 출처, 비 loopback, Origin 없는 요청을 거부한다", () => {
  assert.equal(isTrustedDevRequest("localhost:3000", "https://evil.example"), false)
  assert.equal(isTrustedDevRequest("evil.example", "http://evil.example"), false)
  assert.equal(isTrustedDevRequest("192.168.0.5:3000", "http://192.168.0.5:3000"), false)
  assert.equal(isTrustedDevRequest("localhost:3000", "http://localhost:4000"), false)
  assert.equal(isTrustedDevRequest("localhost:3000", null), false)
  assert.equal(isTrustedDevRequest("localhost:3000", "not a url"), false)
})

test("uploads 밖으로 나가는 경로를 거부한다", () => {
  assert.equal(uploadFileName("/uploads/hero-profile-1.png"), "hero-profile-1.png")
  assert.equal(uploadFileName("/uploads/../../package.json"), null)
  assert.equal(uploadFileName("/uploads/..\\..\\package.json"), null)
  assert.equal(uploadFileName("/uploads/"), null)
  assert.equal(uploadFileName("/etc/passwd"), null)
})

test("purpose에 쓸 수 없는 경로 조각을 거부한다", () => {
  assert.equal(isSafePathSegment("project-0"), true)
  assert.equal(isSafePathSegment("hero-background"), true)
  assert.equal(isSafePathSegment("../../escaped"), false)
  assert.equal(isSafePathSegment(".."), false)
  assert.equal(isSafePathSegment(""), false)
})
