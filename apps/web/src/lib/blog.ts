import { posts } from '#site/content';
import { isBlogCategory, type BlogCategory } from '@/lib/blog-categories';

export function getAllPosts() {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug && post.published);
}

export function getPostsByCategory(category: BlogCategory) {
  return getAllPosts().filter((post) => post.category === category);
}

export function getPostsByMaybeCategory(category: string | undefined) {
  return category && isBlogCategory(category)
    ? getPostsByCategory(category)
    : getAllPosts();
}
