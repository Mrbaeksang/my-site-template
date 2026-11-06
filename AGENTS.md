# my-site-template

비개발자용 인라인 편집 포트폴리오 템플릿. Next.js App Router 단일 페이지.

## 명령

- `npm run dev`: `127.0.0.1`에서 개발 서버 실행
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`

## 구조

- `app/page.tsx`: Header, Hero, About, Projects, Contact, Footer 조립
- `content/site.json`: 사이트의 모든 문구와 설정. `lib/content.ts`가 타입을 정의한다
- `lib/site-config.ts`: 사이트 제목·설명·메뉴를 서버 메타데이터와 헤더에 제공
- `components/{hero,about,projects,contact,footer}.tsx`: 섹션 UI
- `components/editable/`: 인라인 편집 컴포넌트
- `contexts/inline-editor-context.tsx`: 편집 모드, localStorage, 파일 저장 요청
- `app/api/update-content`, `upload-*`, `delete-image`: 개발 모드 전용 편집 API
- `lib/content-update.ts`: 저장 요청을 `site.json`에 합치는 순수 함수
- `lib/dev-request-policy.ts`, `lib/dev-api.ts`: 편집 API 접근 정책

## 저장 흐름

1. 편집 내용은 먼저 localStorage(`portfolio-*` 키)에 저장된다.
2. 저장 버튼을 누르면 `update-content`가 `content/site.json`을 갱신한다.
3. 사용자가 commit·push하면 배포에 반영된다.

## 지켜야 할 것

- `site.json`에 필드를 추가하면 `lib/content.ts`의 타입도 함께 고친다. 저장 위치를 추가하려면 `lib/content-update.ts`의 `TARGETS`에 등록한다.
- 편집 API는 `rejectUntrustedDevRequest`를 먼저 통과해야 한다. 사용자 입력을 파일 경로에 넣기 전에 `lib/dev-request-policy.ts`로 검증한다.
- `rejectUntrustedDevRequest`는 브라우저 공격을 막는 검사이고 인증이 아니다. Host와 Origin은 브라우저 밖에서 위조할 수 있으므로 dev 서버를 `127.0.0.1` 밖에 열지 않는다.
- `eslint`는 9.x, `typescript`는 6.0.x에 머문다. ESLint 플러그인과 `typescript-eslint`의 peer 범위가 넓어지면 올린다.
- SNS 아이콘은 `components/brand-icons.tsx`의 `react-icons`를 쓴다. `lucide-react` 1.x에는 브랜드 아이콘이 없다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
