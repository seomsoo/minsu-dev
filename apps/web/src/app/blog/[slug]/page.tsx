import type { Metadata } from 'next';
import Link from 'next/link';
import {
  WHY_SERIES,
  formatSeriesNumber,
  stripSeriesPrefix,
} from '@/lib/blog-series';
import { SeriesNavigation } from '@/components/blog/SeriesNavigation';
import { MarkSeriesRead } from '@/components/blog/MarkSeriesRead';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import {
  createBlogPostJsonLd,
  createBlogPostMetadata,
} from '@/lib/blog-metadata';
import { MDXContent } from '@/components/blog/MDXContent';
import { Comments } from '@/components/blog/Comments';
import { TableOfContents } from '@/components/blog/TableOfContents';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return createBlogPostMetadata(post);
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBlogPostJsonLd(post)),
        }}
      />
      <article className="pb-5">
        <header className="mb-10">
          {/* 시리즈 이름과 번호만. 누르면 목차로 간다 (단계 제목은 목차에서 본다) */}
          {post.series && post.seriesStage !== undefined && (
            <Link
              href={WHY_SERIES.href}
              className="text-text-secondary hover:text-text-primary mb-3 inline-flex items-baseline gap-3 font-mono text-xs transition-colors"
            >
              {WHY_SERIES.title}
              <span className="tabular-nums">
                {formatSeriesNumber(post.seriesStage, post.seriesOrder ?? 0)}
              </span>
            </Link>
          )}
          {/* 시리즈 번호는 위 시리즈 줄에 따로 보이므로 제목에서는 뗀다 */}
          <h1 className="text-2xl font-bold md:text-3xl">
            {stripSeriesPrefix(post.title)}
          </h1>
          <div className="flex items-center justify-between">
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-text-secondary text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <time className="text-text-secondary mt-2 block min-w-20 text-xs text-nowrap sm:text-sm">
              {new Date(post.date).toLocaleDateString('ko-KR')}
            </time>
          </div>
        </header>
        <div className="prose">
          <MDXContent code={post.body} />
        </div>
      </article>
      {post.series && <MarkSeriesRead slug={post.slug} />}
      <SeriesNavigation slug={post.slug} />
      <Comments />
      <TableOfContents />
    </>
  );
}
