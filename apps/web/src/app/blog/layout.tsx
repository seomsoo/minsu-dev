import { Suspense } from 'react';
import { HomeLink } from '@/components/ui/HomeLink';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import Link from 'next/link';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background min-h-screen">
      <HomeLink />
      <div className="mx-auto max-w-3xl px-6 py-5 font-mono">
        <div className="mb-2 flex items-baseline justify-between">
          <Link href={'/blog'} className="text-xl font-bold">blog.</Link>
          <Suspense>
            <CategoryFilter />
          </Suspense>
        </div>
        {children}
      </div>
      <ScrollToTop />
    </main>
  );
}
