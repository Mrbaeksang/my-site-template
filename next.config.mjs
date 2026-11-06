/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 편집 화면의 저장 버튼이 컴포넌트 소스를 다시 쓰므로, 저장된 데이터 모양에 따라
    // 타입이 달라질 수 있다. 사용자의 배포가 막히지 않도록 빌드에서는 검사하지 않고
    // 이 저장소의 CI에서 npm run typecheck로 검사한다.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
