import { defineConfig, defineCollection, s } from 'velite';
import rehypePrettyCode from 'rehype-pretty-code';

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s.object({
    title: s.string().max(120),
    slug: s.slug('posts'),
    date: s.isodate(),
    description: s.string().max(300),
    category: s.enum(['thoughts', 'dev']),
    tags: s.array(s.string()).default([]),
    published: s.boolean().default(true),
    body: s.mdx(),
  }),
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
      [
        rehypePrettyCode,
        {
          theme: 'min-light',
          keepBackground: false,
        },
      ],
    ],
  },
});
