import Link from 'next/link';

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    date: string;
    description: string;
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
      className="group border-border block border-b py-5 transition-colors hover:bg-black/2"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-semibold md:text-lg">{post.title}</h2>
        <time className="text-text-secondary shrink-0 text-xs">
          {formattedDate}
        </time>
      </div>
      <p className="text-text-secondary mt-1 text-sm">{post.description}</p>
    </Link>
  );
};
