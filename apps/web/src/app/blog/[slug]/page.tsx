import type { Metadata } from 'next';
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
      <article className="py-5">
        <header className="mb-10">
          <h1 className="text-2xl font-bold md:text-3xl">{post.title}</h1>
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
      <Comments />
      <TableOfContents />
    </>
  );
}
