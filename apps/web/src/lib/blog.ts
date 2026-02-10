import { posts } from '#site/content';

export function getAllPosts() {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug && post.published);
}

export function getPostsByCategory(category: string) {
  return getAllPosts().filter((post) => post.category === category);
}
