import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 개발 중에만 보이는 Next.js 표시. 홈 아래 왼쪽 메뉴를 가리지 않게 옮긴다
  devIndicators: { position: 'bottom-right' },
  async headers() {
    return [
      {
        source: '/:path(giscus-.*\\.css)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://giscus.app',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
