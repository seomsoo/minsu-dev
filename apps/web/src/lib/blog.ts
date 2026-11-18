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

export function getSeriesPosts(series: string) {
  return getAllPosts()
    .filter((post) => post.series === series)
    .sort(
      (a, b) =>
        (a.seriesStage ?? 0) - (b.seriesStage ?? 0) ||
        (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0) ||
        a.slug.localeCompare(b.slug),
    );
}

export function getSeriesNavigation(slug: string) {
  const post = getPostBySlug(slug);
  if (!post?.series) return undefined;
  const seriesPosts = getSeriesPosts(post.series);
  const index = seriesPosts.findIndex((item) => item.slug === slug);
  return {
    position: index + 1,
    total: seriesPosts.length,
    previous: seriesPosts[index - 1],
    next: seriesPosts[index + 1],
  };
}
