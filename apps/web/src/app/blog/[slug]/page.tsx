import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { MDXContent } from '@/components/blog/MDXContent';

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

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="py-5">
      <header className="mb-10">
        <h2 className="text-2xl font-bold md:text-3xl">{post.title}</h2>
        <div className='flex items-center justify-between'>  {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-text-secondary text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )} <time className="text-text-secondary mt-2 block text-xs sm:text-sm min-w-20 text-nowrap">
          {new Date(post.date).toLocaleDateString('ko-KR')}
        </time></div>
       
      
      </header>
      <div className="prose">
        <MDXContent code={post.body} />
      </div>
    </article>
  );
}
