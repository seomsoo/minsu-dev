import Link from 'next/link';
import type { BlogCategory } from '@/lib/blog-categories';
import { stripSeriesPrefix } from '@/lib/blog-series';

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    date: string;
    description: string;
    category: BlogCategory;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const formattedDate = new Date(post.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group border-border hover:bg-accent/5 block border-b px-2 py-5 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-4">
        {/* 시리즈 번호([Why 0-0])는 시리즈 안(목차·글 머리)에서만 보이고, 목록에서는 뗀다 */}
        <h2 className="font-semibold md:text-lg">
          {stripSeriesPrefix(post.title)}
        </h2>
        <time className="text-text-secondary shrink-0 text-xs">
          {formattedDate}
        </time>
      </div>
      <p className="text-text-secondary mt-1 text-sm">{post.description}</p>
    </Link>
  );
};
