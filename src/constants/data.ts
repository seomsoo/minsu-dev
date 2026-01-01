import type { Project } from '@/types';

export const PROFILE = {
  name: '서민수',
  nameEn: 'Minsu Seo',
  position: 'Frontend Developer',
  motto: 'Win or Learn.',
  email: 'usnimoes@gmail.com',
  github: 'https://github.com/seomsoo',
};

export const PROJECTS: Project[] = [
  {
    name: '포트폴리오 웹사이트',
    link: 'https://seominsu.dev',
    github: 'https://github.com/minsu/portfolio',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Motion'],
    date: '2024.12',
    descriptions: [
      '미니멀한 디자인과 ASCII 아트를 활용한 개인 포트폴리오',
      'Motion을 활용한 부드러운 스크롤 애니메이션 구현',
      '반응형 디자인 및 웹 접근성 고려',
      '미니멀한 디자인과 ASCII 아트를 활용한 개인 포트폴리오',
      'Motion을 활용한 부드러운 스크롤 애니메이션 구현',
      '반응형 디자인 및 웹 접근성 고려',
      '미니멀한 디자인과 ASCII 아트를 활용한 개인 포트폴리오',
      'Motion을 활용한 부드러운 스크롤 애니메이션 구현',
      '반응형 디자인 및 웹 접근성 고려',
    ],
  },
  {
    name: '할 일 관리 앱',
    github: 'https://github.com/minsu/todo-app',
    tags: ['React', 'TypeScript', 'Zustand', 'dnd-kit'],
    date: '2024.10',
    descriptions: [
      '드래그 앤 드롭 기반 칸반 보드 형태의 투두 앱',
      'Zustand를 활용한 전역 상태 관리',
      '로컬 스토리지를 활용한 데이터 영속성 구현',
    ],
  },
  {
    name: '날씨 대시보드',
    link: 'https://weather.minsu.dev',
    github: 'https://github.com/minsu/weather-dashboard',
    tags: ['React', 'Chart.js', 'REST API'],
    date: '2024.08',
    descriptions: [
      'OpenWeather API를 활용한 날씨 정보 대시보드',
      'Chart.js를 활용한 시각적인 날씨 차트 구현',
      'Geolocation API를 활용한 위치 기반 날씨 조회',
    ],
  },
];
