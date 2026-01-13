import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    ...(isProduction && {
      sitemap: 'https://seominsu.dev/sitemap.xml',
    }),
  };
}
