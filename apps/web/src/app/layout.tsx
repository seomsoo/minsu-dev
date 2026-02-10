import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { MotionProvider } from '@/components/MotionProvider';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

const jetbrainsMono = localFont({
  src: [
    {
      path: '../../public/fonts/JetBrainsMono-Regular.woff2',
      weight: '400',
    },
    {
      path: '../../public/fonts/JetBrainsMono-SemiBold.woff2',
      weight: '600',
    },
    {
      path: '../../public/fonts/JetBrainsMono-Bold.woff2',
      weight: '700',
    },
  ],
  display: 'swap',
  variable: '--font-jetbrains',
});

const SITE_NAME = '서민수 | Frontend Developer';
const SITE_DESCRIPTION =
  'React, Next.js, TypeScript 기반 프론트엔드 개발자 서민수입니다.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s | 서민수',
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
  },
  keywords: [
    '프론트엔드 개발자',
    'Frontend Developer',
    '서민수',
    'Minsu Seo',
    'React',
    'Next.js',
    'TypeScript',
    '프론트엔드 포트폴리오',
    '웹 개발자',
    '기술 블로그',
    'tech blog',
  ],
  authors: [{ name: '서민수', url: SITE_URL }],
  creator: '서민수',
  publisher: '서민수',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '서민수 포트폴리오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: '#f5f5f5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${jetbrainsMono.variable}`}
    >
      <body className={`${pretendard.className} antialiased`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
