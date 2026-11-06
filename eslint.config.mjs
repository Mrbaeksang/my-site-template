import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 편집 내용을 마운트 후 localStorage에서 복원하는 구조가 이 규칙에 걸린다.
      // 서버 HTML과 첫 렌더링을 맞추려면 필요한 패턴이라 경고로 둔다.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])
