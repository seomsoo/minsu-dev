'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BLOG_CATEGORIES } from '@/lib/blog-categories';

const CATEGORIES = [{ label: 'all', value: '' }, ...BLOG_CATEGORIES];

/** 흐려지는 끝의 폭(px). 휴대폰에서는 페이지 좌우 여백(24px)과 같다 */
const FADE = 24;

/**
 * 카테고리 줄. 넘치면 옆으로 밀어서 본다 (Linear 블로그 방식).
 * 스크롤 막대는 숨기고, 잘린 쪽 끝만 흐리게 해서 옆에 더 있다는 걸 보여 준다.
 * 휴대폰에서는 화면 양 끝까지 넓힌다.
 */
export const CategoryFilter = () => {
  const searchParams = useSearchParams();
  const current = searchParams.get('category') ?? '';
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
    };
    // 고른 카테고리가 보이도록 가로로만 맞춘다 (페이지가 위아래로 움직이지 않게)
    const active = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      const left =
        active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
      el.scrollLeft = Math.max(0, left);
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [current]);

  const mask = `linear-gradient(to right, ${
    edges.left ? 'transparent' : 'black'
  }, black ${FADE}px, black calc(100% - ${FADE}px), ${
    edges.right ? 'transparent' : 'black'
  })`;

  return (
    <div
      ref={scroller}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <nav
        aria-label="카테고리"
        className="flex w-max items-center gap-3 font-mono text-sm whitespace-nowrap"
      >
        {CATEGORIES.map((cat, index) => (
          <span key={cat.value} className="flex items-center gap-3">
            {index > 0 && (
              <span className="text-border" aria-hidden>
                |
              </span>
            )}
            <Link
              href={cat.value ? `/blog?category=${cat.value}` : '/blog'}
              aria-current={current === cat.value ? 'page' : undefined}
              className={`transition-colors ${
                current === cat.value
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat.label}
            </Link>
          </span>
        ))}
      </nav>
    </div>
  );
};
