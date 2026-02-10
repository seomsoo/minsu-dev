import type { Metadata } from 'next';
import { HomeLink } from '@/components/ui/HomeLink';
import { Info } from '@/components/sections/Info';

export const metadata: Metadata = {
  title: 'About',
  description: '프론트엔드 개발자 서민수의 프로필과 프로젝트',
};

export default function AboutPage() {
  return (
    <main className="bg-background min-h-screen">
      <HomeLink />
      <Info />
    </main>
  );
}
