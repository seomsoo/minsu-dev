import type { Metadata } from 'next';
import { WHY_SERIES } from '@/lib/blog-series';
import { getPostsByMaybeCategory, getSeriesPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog/PostCard';
import { SeriesCard } from '@/components/blog/SeriesCard';

export const metadata: Metadata = {
  title: 'Blog',
  description: '서민수 프론트엔드 기술 블로그',
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const posts = getPostsByMaybeCategory(category);

  const seriesPosts = getSeriesPosts(WHY_SERIES.id);

  return (
    <div className="flex flex-col">
      {(!category || category === 'frontend') && seriesPosts.length > 0 && (
        <SeriesCard href={WHY_SERIES.href} title={WHY_SERIES.title} />
      )}
      {posts.length === 0 ? (
        <p className="text-text-secondary">아직 작성된 글이 없습니다.</p>
      ) : (
        posts.map((post) => <PostCard key={post.slug} post={post} />)
      )}
    </div>
  );
}
