import type { Metadata } from 'next';
import type { Post } from '#site/content';
import { SITE_URL } from '@/lib/constants';

const AUTHOR = {
  name: '서민수',
  url: SITE_URL,
};

export function getBlogPostUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function getBlogPostOgImageUrl(slug: string): string {
  return `${SITE_URL}/api/og?slug=${encodeURIComponent(slug)}`;
}

export function createBlogPostMetadata(post: Post): Metadata {
  const url = getBlogPostUrl(post.slug);
  const imageUrl = getBlogPostOgImageUrl(post.slug);

  return {
    title: post.title,
    description: post.description,
    authors: [AUTHOR],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [imageUrl],
    },
  };
}

export function createBlogPostJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      ...AUTHOR,
    },
    url: getBlogPostUrl(post.slug),
    keywords: post.tags,
  };
}
