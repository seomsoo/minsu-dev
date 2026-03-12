'use client';

import { useTheme } from 'next-themes';
import Giscus from '@giscus/react';
import { useMounted } from '@/hooks/useMounted';
import { SITE_URL } from '@/lib/constants';

export const Comments = () => {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  if (!mounted) return null;

  return (
    <section className="border-border mt-16 border-t pt-8 pb-16">
      <Giscus
        key={resolvedTheme}
        repo="seomsoo/minsu-dev"
        repoId="R_kgDOQwk_7Q"
        category="Comments"
        categoryId="DIC_kwDOQwk_7c4C4LHb"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={
          SITE_URL.includes('localhost')
            ? resolvedTheme === 'dark'
              ? 'transparent_dark'
              : 'light'
            : `${SITE_URL}/${resolvedTheme === 'dark' ? 'giscus-dark.css' : 'giscus-light.css'}`
        }
        lang="ko"
      />
    </section>
  );
};
