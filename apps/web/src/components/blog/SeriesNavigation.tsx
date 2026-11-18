import Link from 'next/link';
import { getSeriesNavigation } from '@/lib/blog';
import {
  WHY_SERIES,
  formatSeriesNumber,
  stripSeriesPrefix,
} from '@/lib/blog-series';

/**
 * 시리즈 글의 끝. 이전/다음 카드 두 개를 나란히 두지 않고, 다음 글 하나만 아주 크게 쓴다
 * (홈의 거대한 minsu·seo와 같은 결). 이전 글과 목차는 맨 아래 작은 한 줄로 둔다.
 * 마지막 글이면 큰 제목 없이 작은 줄만 남는다.
 */
export function SeriesNavigation({ slug }: { slug: string }) {
  const navigation = getSeriesNavigation(slug);
  if (!navigation) return null;

  const { previous, next } = navigation;
  const number = (post: { seriesStage?: number; seriesOrder?: number }) =>
    formatSeriesNumber(post.seriesStage ?? 0, post.seriesOrder ?? 0);

  return (
    <nav
      aria-label="시리즈 글 이동"
      className="border-border my-16 border-t pt-10"
    >
      {next && (
        <Link href={`/blog/${next.slug}`} className="group block">
          <span className="text-text-secondary font-mono text-xs tabular-nums">
            {number(next)}
          </span>
          <span
            style={{ letterSpacing: '-0.03em' }}
            className="mt-3 block font-sans text-2xl leading-[1.15] font-extrabold break-keep md:text-4xl"
          >
            {/* 올리면 밑줄이 줄마다 왼쪽에서 오른쪽으로 천천히 그어진다 */}
            <span className="bg-[linear-gradient(currentColor,currentColor)] [box-decoration-break:clone] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-700 ease-out group-hover:bg-[length:100%_2px]">
              {stripSeriesPrefix(next.title)}
            </span>
          </span>
        </Link>
      )}

      <div
        className={`text-text-secondary flex items-baseline justify-between gap-6 font-mono text-xs ${
          next ? 'mt-12' : ''
        }`}
      >
        {previous ? (
          <Link
            href={`/blog/${previous.slug}`}
            className="hover:text-text-primary min-w-0 truncate transition-colors"
          >
            <span className="mr-3 tabular-nums">{number(previous)}</span>
            {stripSeriesPrefix(previous.title)}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={WHY_SERIES.href}
          className="hover:text-text-primary shrink-0 transition-colors"
        >
          목차
        </Link>
      </div>
    </nav>
  );
}
