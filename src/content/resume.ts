import type { Project } from '@/types';

export const AUTHOR = {
  name: '서민수',
  nameEn: 'Minsu Seo',
  position: 'Frontend Developer',
  motto: 'Win or Learn',
  email: 'usnimoes@gmail.com',
  github: 'https://github.com/seomsoo',
};

export const PROJECTS: Project[] = [
  {
    name: 'UPDO',
    link: 'https://updo.site',
    github: 'https://github.com/Team7-UPDO/Team7_UPDO',
    summary: '성장과 네트워킹을 위한 자기계발 모임 플랫폼',
    date: '2025.10 - 2025.11',
    descriptions: [
      ' SSR Prefetch와 폰트·이미지·번들 최적화를 통해 Lighthouse 성능 99점 달성, 초기 렌더링 성능 개선',
      ' GitHub Actions 기반 CI/CD 파이프라인 구축으로 PR 단계 린트·타입·테스트·빌드 자동 검증',
      ' 의존성 및 빌드 캐싱 전략 적용으로 CI 실행 시간 60% 단축',
      ' Storybook + Chromatic 연동으로 PR 단위 UI 변경 사항을 시각적으로 검증하는 협업 환경 구축',
      ' Jest 테스트를 CI와 연동해 기능 변경 시 문제를 사전에 발견하는 테스트 환경 구축',
      ' Next.js Metadata API와 sitemap/robots 설정으로 Lighthouse SEO 100점 달성',
      ' 접근성을 고려한 시맨틱 HTML 구조 개선을 통해 Lighthouse 접근성 100점 달성',
    ],
  },
  {
    name: '따숨',
    github: 'https://github.com/seomsoo/ddasoom',
    summary:
      '공황 사용자의 훈련 지속과 심리적 안정을 돕는 WebView 기반 훈련·기록 서비스',
    date: '2024.10 - 2024.11',
    descriptions: [
      ' React Native 앱 내 WebView 환경에서 Next.js 기반 웹 프론트엔드 구조 설계 및 구현',
      ' postMessage 기반 양방향 통신으로 진동·음성·GPS 등 네이티브 기능을 사용자 행동 흐름에 연동',
      ' 정신과 전문의 피드백을 반영해 공황 사용자의 심리적 부담을 최소화한 훈련 전반의 UI/UX와 사용자 흐름을 설계하고 인터랙션을 구현',
      ' 삼성 청년 SWㆍAI 아카데미 자율프로젝트 우수상 수상',
    ],
  },
  {
    name: '나의 작은 도서관',
    github: 'https://github.com/seomsoo/NAJACKDO',
    summary: '위치 기반으로 책을 이웃과 대여·반납할 수 있는 도서 공유 서비스',
    date: '2024.08 - 2024.10',
    descriptions: [
      ' UI/UX 설계부터 플로우, 인터랙션 구현까지 프론트엔드 전반을 담당',
      ' AI 도서 인증의 이미지 업로드 → 분석 → 결과 확인 흐름을 단일 UI로 설계해 사용자 실수와 재시도 감소',
      ' 도서 상태에 따른 조건부 인터랙션으로 불가능한 요청을 클라이언트에서 차단해 불필요한 API 호출과 에러 응답을 줄이는 UX 구조 설계',
    ],
  },
];
