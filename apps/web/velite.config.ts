import { defineConfig, defineCollection, s } from 'velite';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { BLOG_CATEGORY_VALUES } from './src/lib/blog-categories';
import { WHY_SERIES, isSeriesStage } from './src/lib/blog-series';

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('posts'),
      date: s.isodate(),
      description: s.string().max(300),
      category: s.enum(BLOG_CATEGORY_VALUES),
      tags: s.array(s.string()).default([]),
      series: s.literal(WHY_SERIES.id).optional(),
      seriesStage: s
        .number()
        .int()
        .refine(isSeriesStage, {
          message:
            'blog-series.ts의 stages에 없는 단계입니다. 단계를 시작할 때 제목을 추가하세요.',
        })
        .optional(),
      seriesOrder: s.number().int().min(0).max(999).optional(),
      published: s.boolean().default(true),
      body: s.mdx(),
    })
    .refine(
      (post) => {
        const fields = [post.series, post.seriesStage, post.seriesOrder];
        return (
          fields.every((value) => value === undefined) ||
          fields.every((value) => value !== undefined)
        );
      },
      { message: 'series, seriesStage, seriesOrder는 함께 지정해야 합니다.' },
    ),
});

export default defineConfig({
  root: '../../content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'min-light',
            dark: 'github-dark',
          },

          keepBackground: false,
        },
      ],
    ],
  },
});
