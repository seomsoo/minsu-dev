import { Suspense } from 'react';
import { TopNav } from '@/components/ui/TopNav';
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
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 py-5 font-mono">
        {/* 휴대폰: blog. 아래 줄에 카테고리. 데스크탑: 오른쪽에, 넘치면 옆으로 밀어서 본다 */}
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <Link href={'/blog'} className="shrink-0 text-xl font-bold">
            blog.
          </Link>
          <div className="min-w-0">
            <Suspense>
              <CategoryFilter />
            </Suspense>
          </div>
        </div>
        {children}
      </div>

      <ScrollToTop />
    </main>
  );
}
