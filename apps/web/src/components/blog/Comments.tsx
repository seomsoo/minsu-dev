'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { SITE_URL } from '@/lib/constants';

const getTheme = (resolvedTheme: string | undefined) => {
  const isDark = resolvedTheme === 'dark';
  return `${SITE_URL}/${isDark ? 'giscus-dark.css' : 'giscus-light.css'}`;
};

export const Comments = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const theme = getTheme(resolvedTheme);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.setAttribute('data-repo', 'seomsoo/minsu-dev');
    script.setAttribute('data-repo-id', 'R_kgDOQwk_7Q');
    script.setAttribute('data-category', 'Comments');
    script.setAttribute('data-category-id', 'DIC_kwDOQwk_7c4C4LHb');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', 'ko');

    ref.current.appendChild(script);
  }, [theme]);

  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame',
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      'https://giscus.app',
    );
  }, [theme]);

  return (
    <section className="border-border mt-16 border-t pt-8 pb-16">
      <div ref={ref} />
    </section>
  );
};
