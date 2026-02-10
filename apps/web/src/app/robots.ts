import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

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
      sitemap: `${SITE_URL}/sitemap.xml`,
    }),
  };
}
