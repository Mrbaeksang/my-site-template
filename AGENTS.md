# my-site-template

비개발자용 인라인 편집 포트폴리오 템플릿. Next.js App Router 단일 페이지.

## 명령

- `npm run dev`: `127.0.0.1`에서 개발 서버 실행
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`

## 구조

- `app/page.tsx`: Header, Hero, About, Projects, Contact, Footer 조립
- `lib/site-config.ts`: 사이트 제목·설명·메뉴. 서버 메타데이터와 헤더가 함께 사용
- `components/{hero,about,projects,contact,footer}.tsx`: 섹션별 기본값(`defaultInfo` 등)과 UI
- `components/editable/`: 인라인 편집 컴포넌트
- `contexts/inline-editor-context.tsx`: 편집 모드, localStorage, 파일 저장 요청
- `app/api/update-*`, `upload-*`, `delete-image`: 개발 모드 전용 편집 API
- `lib/dev-request-policy.ts`, `lib/dev-api.ts`: 편집 API 접근 정책

## 저장 흐름

1. 편집 내용은 먼저 localStorage(`portfolio-*` 키)에 저장된다.
2. 저장 버튼을 누르면 `update-component`, `update-field`가 소스 파일의 기본값 객체를 다시 쓴다.
3. 사용자가 commit·push하면 배포에 반영된다.

## 지켜야 할 것

- 기본값 객체의 이름(`defaultInfo`, `defaultConfig`, `defaultSocialLinks`)을 바꾸면 저장이 깨진다. 이름을 바꾸려면 API도 함께 수정한다.
- 편집 API는 `rejectUntrustedDevRequest`를 먼저 통과해야 한다. 사용자 입력을 파일 경로나 정규식에 넣기 전에 `lib/dev-request-policy.ts`로 검증한다.
- `typescript.ignoreBuildErrors`는 의도된 설정이다. 저장 기능이 소스 타입을 바꿀 수 있어 사용자 배포를 막지 않으려는 것이다. 타입 검사는 CI에서 한다.
- `eslint`는 9.x, `typescript`는 6.0.x에 머문다. ESLint 플러그인과 `typescript-eslint`의 peer 범위가 넓어지면 올린다.
- SNS 아이콘은 `components/brand-icons.tsx`의 `react-icons`를 쓴다. `lucide-react` 1.x에는 브랜드 아이콘이 없다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
