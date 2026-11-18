export const BLOG_CATEGORIES = [
  { label: 'thoughts', value: 'thoughts' },
  { label: 'dev', value: 'dev' },
  { label: 'frontend', value: 'frontend' },
] as const;

export const BLOG_CATEGORY_VALUES = BLOG_CATEGORIES.map(
  (category) => category.value,
) as [BlogCategory, ...BlogCategory[]];

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]['value'];

export function isBlogCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORY_VALUES.includes(value as BlogCategory);
}

export function getBlogCategoryLabel(category: BlogCategory): string {
  return (
    BLOG_CATEGORIES.find((item) => item.value === category)?.label ?? category
  );
}
