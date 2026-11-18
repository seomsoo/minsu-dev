import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { getPostBySlug } from '@/lib/blog';
import { getBlogCategoryLabel } from '@/lib/blog-categories';

export const runtime = 'edge';

const CACHE_CONTROL =
  'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  const post = slug ? getPostBySlug(slug) : null;

  if (slug && !post) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    });
  }

  const categoryLabel = post ? getBlogCategoryLabel(post.category) : 'blog';
  const dateStr = post ? new Date(post.date).toLocaleDateString('ko-KR') : '';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 80px',
        fontFamily: 'sans-serif',
        backgroundColor: '#f5f5f0',
        color: '#262626',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontSize: '20px',
            color: '#6b6b6b',
            fontWeight: 600,
          }}
        >
          {categoryLabel}
        </span>
        <span style={{ fontSize: '20px', color: '#6b6b6b' }}>{dateStr}</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <h1
          style={{
            fontSize: (post?.title?.length ?? 0) > 30 ? '48px' : '56px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
            wordBreak: 'keep-all',
          }}
        >
          {post?.title ?? 'Blog'}
        </h1>
        {post?.description && (
          <p
            style={{
              fontSize: '24px',
              color: '#6b6b6b',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {post.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '24px', fontWeight: 700 }}>seominsu.dev</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    },
  );
}
