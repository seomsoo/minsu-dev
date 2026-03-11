'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface TocItem {
  id: string;
  text: string;
  depth: number;
}

const subscribe = () => () => {};

let cachedItems: TocItem[] = [];
let cachedIds = '';

function getSnapshot(): TocItem[] {
  const headings = Array.from(
    document.querySelectorAll('.prose h2, .prose h3'),
  );
  const ids = headings.map((h) => h.id).join(',');

  if (ids !== cachedIds) {
    cachedIds = ids;
    cachedItems = headings.map((el) => ({
      id: el.id,
      text: el.textContent || '',
      depth: el.tagName === 'H2' ? 2 : 3,
    }));
  }

  return cachedItems;
}

const emptyItems: TocItem[] = [];
const getServerSnapshot = () => emptyItems;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? 'auto' : 'smooth';

export const TableOfContents = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState('');
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!activeId || !listRef.current) return;
    listRef.current
      .querySelector(`a[href="#${CSS.escape(activeId)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
  }, [activeId]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              next.add(entry.target.id);
            } else {
              next.delete(entry.target.id);
            }
          });

          const firstVisible = items.find((item) => next.has(item.id));
          if (firstVisible) setActiveId(firstVisible.id);

          return next;
        });
      },
      { rootMargin: '0px 0px -20% 0px', threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const isHighlighted = (id: string) =>
    visibleIds.has(id) || activeId === id;

  return (
    <nav
      aria-label="목차"
      className="hidden xl:fixed xl:top-24 xl:block xl:w-64"
      style={{ left: 'calc(50% + 26rem)' }}
    >
      <ol
        ref={listRef}
        className="max-h-[calc(100vh-8rem)] overflow-y-auto [scrollbar-width:none]"
      >
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? 'pl-4' : ''}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: scrollBehavior(),
                });
              }}
              className={`block border-l-2 py-1 pl-3 font-mono text-[0.8125rem] transition-colors ${
                activeId === item.id ? 'border-text-primary' : 'border-transparent'
              } ${
                isHighlighted(item.id)
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
