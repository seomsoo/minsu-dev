import type { Metadata } from 'next';
import { getSeriesPosts } from '@/lib/blog';
import {
  WHY_SERIES,
  formatSeriesNumber,
  getStageTitle,
  stripSeriesPrefix,
} from '@/lib/blog-series';
import { SITE_URL } from '@/lib/constants';
import { SeriesLog, type SeriesLogRow } from '@/components/blog/SeriesLog';

export const metadata: Metadata = {
  title: WHY_SERIES.title,
  description: WHY_SERIES.description,
  alternates: { canonical: `${SITE_URL}${WHY_SERIES.href}` },
};

const formatDate = (date: string) => date.slice(0, 10).replaceAll('-', '.');

export default function WhySeriesPage() {
  const posts = getSeriesPosts(WHY_SERIES.id);
  // 읽는 순서대로 위에서 아래로. 단계 제목이 자기 글들 위에 온다
  const stages = [...new Set(posts.map((post) => post.seriesStage ?? 0))].sort(
    (a, b) => a - b,
  );

  const rows: SeriesLogRow[] = stages.flatMap((stage, index) => [
    {
      type: 'stage' as const,
      stage,
      title: getStageTitle(stage),
      isFirst: index === 0,
    },
    ...posts
      .filter((post) => post.seriesStage === stage)
      .map((post) => ({
        type: 'post' as const,
        slug: post.slug,
        number: formatSeriesNumber(stage, post.seriesOrder ?? 0),
        title: stripSeriesPrefix(post.title),
        date: formatDate(post.date),
      })),
  ]);

  return (
    <div className="pb-8">
      <header className="mb-10">
        <h1 className="text-2xl font-bold md:text-3xl">{WHY_SERIES.title}</h1>
      </header>

      {posts.length === 0 ? (
        <p className="text-text-secondary text-sm">첫 글을 쓰는 중이다.</p>
      ) : (
        <SeriesLog rows={rows} />
      )}
    </div>
  );
}
