import type { Metadata } from 'next';
import { getAllPosts, getPostsByCategory } from '@/lib/blog';
import { PostCard } from '@/components/blog/PostCard';

export const metadata: Metadata = {
  title: 'Blog',
  description: '프론트엔드 개발에 대한 기술 블로그',
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const posts = category ? getPostsByCategory(category) : getAllPosts();

  if (posts.length === 0) {
    return <p className="text-text-secondary mt-8">아직 작성된 글이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
