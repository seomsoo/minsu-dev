'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { PAWN } from '@/lib/piece-paths';
import { lastReadStore } from '@/lib/series-progress';

export type SeriesLogRow =
  | {
      type: 'post';
      slug: string;
      number: string;
      title: string;
      date: string;
    }
  | { type: 'stage'; stage: number; title: string; isFirst: boolean };

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export function SeriesLog({ rows }: { rows: SeriesLogRow[] }) {
  const router = useRouter();
  const posts = rows.filter((row) => row.type === 'post');
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLAnchorElement>());
  // 폰: 이 방문자가 마지막으로 읽은 글 칸에 서 있다가(읽은 적이 없으면 없다),
  // 가리킨 글의 칸으로 메인 라인을 따라 미끄러져 간다
  const list = useRef<HTMLDivElement>(null);
  const pawn = useRef<HTMLSpanElement>(null);
  const nodes = useRef(new Map<string, HTMLSpanElement>());
  const lastRead = useSyncExternalStore(
    lastReadStore.subscribe,
    lastReadStore.getSnapshot,
    lastReadStore.getServerSnapshot,
  );
  const resting = posts.some((post) => post.slug === lastRead)
    ? lastRead
    : null;
  const target = active ?? resting;

  useLayoutEffect(() => {
    const place = () => {
      const node = target ? nodes.current.get(target) : undefined;
      const ol = list.current;
      const piece = pawn.current;
      if (!ol || !piece) return;
      if (!node) {
        // 갈 칸이 없으면 숨긴다. 다음에 나타날 때는 그 칸에 바로 선다
        piece.style.visibility = 'hidden';
        return;
      }
      const box = node.getBoundingClientRect();
      const origin = ol.getBoundingClientRect();
      const left = box.left - origin.left;
      const top = box.top - origin.top;
      // 처음 놓일 때는 미끄러지지 않고 바로 그 칸에 선다
      const first = piece.style.visibility !== 'visible';
      if (first) piece.style.transition = 'none';
      piece.style.transform = `translate(${left}px, ${top}px)`;
      piece.style.visibility = 'visible';
      if (first) {
        void piece.offsetHeight; // 위치를 먼저 확정한 뒤 애니메이션을 되살린다
        piece.style.transition = '';
      }
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [target, rows]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;

      const down = event.key === 'j' || event.key === 'ArrowDown';
      const up = event.key === 'k' || event.key === 'ArrowUp';

      if (down || up) {
        event.preventDefault();
        const index = posts.findIndex((post) => post.slug === active);
        const nextIndex =
          index === -1
            ? 0
            : Math.min(posts.length - 1, Math.max(0, index + (down ? 1 : -1)));
        const node = refs.current.get(posts[nextIndex].slug);
        node?.focus({ preventScroll: true });
        node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        setActive(posts[nextIndex].slug);
      } else if (event.key === 'Enter' && active) {
        router.push(`/blog/${active}`);
      } else if (event.key === 'Escape') {
        setActive(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [posts, active, router]);

  // 단계마다 묶는다: 단계 제목은 맨 왼쪽 끝에서 시작하고, 글 줄들은 세로선 오른쪽에 들여 쓴다
  type PostRow = Extract<SeriesLogRow, { type: 'post' }>;
  const groups: { stage: number; title: string; posts: PostRow[] }[] = [];
  for (const row of rows) {
    if (row.type === 'stage') {
      groups.push({ stage: row.stage, title: row.title, posts: [] });
    } else {
      groups.at(-1)?.posts.push(row);
    }
  }

  // 노드(칸)는 글 순서대로 흑백이 번갈아 간다 (단계가 바뀌어도 이어서 센다)
  let square = 0;

  return (
    <div
      ref={list}
      className="relative text-sm"
      onMouseLeave={() => setActive(null)}
    >
      {/* 폰: 메인 라인 위를 미끄러져 다닌다 */}
      <span
        ref={pawn}
        aria-hidden
        style={{ visibility: 'hidden' }}
        className="pointer-events-none absolute top-0 left-0 z-20 flex h-[3.25rem] w-6 items-center justify-center transition-transform duration-300 ease-out motion-reduce:transition-none"
      >
        <svg
          viewBox="0 0 24 24"
          className="text-text-primary bg-background size-6 py-0.5"
          fill="currentColor"
        >
          <path d={PAWN} />
        </svg>
      </span>
      {groups.map((group, index) => (
        <section key={group.stage} className={index === 0 ? '' : 'pt-10'}>
          <h2 className="pb-2 text-base leading-snug font-bold break-keep md:text-lg">
            {group.title}
          </h2>
          <ol className="relative">
            {group.posts.map((row) => {
              const strong = square++ % 2 === 0;
              const isActive = active === row.slug;
              return (
                <li
                  key={row.slug}
                  className="relative grid grid-cols-[24px_1fr] gap-3"
                >
                  <Line className="inset-y-0" />
                  <span
                    ref={(node) => {
                      if (node) nodes.current.set(row.slug, node);
                      else nodes.current.delete(row.slug);
                    }}
                    className="relative z-10 flex h-[3.25rem] items-center justify-center"
                  >
                    <span
                      aria-hidden
                      className={`border-text-primary size-2.5 border ${
                        strong ? 'bg-text-primary' : 'bg-background'
                      }`}
                    />
                  </span>
                  <Link
                    ref={(node) => {
                      if (node) refs.current.set(row.slug, node);
                      else refs.current.delete(row.slug);
                    }}
                    href={`/blog/${row.slug}`}
                    onMouseEnter={() => setActive(row.slug)}
                    onFocus={() => setActive(row.slug)}
                    className={`-mx-2 flex min-h-[3.25rem] items-center gap-3 rounded-sm px-2 transition-colors outline-none ${
                      isActive ? 'bg-text-primary/5' : ''
                    }`}
                  >
                    <span className="text-text-secondary w-10 shrink-0 text-xs whitespace-nowrap tabular-nums">
                      {row.number}
                    </span>
                    <span className="line-clamp-2 flex-1 leading-snug md:text-base">
                      {row.title}
                    </span>
                    <time
                      className={`text-text-secondary hidden shrink-0 text-xs tabular-nums transition-opacity duration-200 sm:block ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {row.date}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

/** 메인 라인: 노드 사이를 잇는 얇은 세로선 */
function Line({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`bg-text-secondary/30 absolute left-[11.5px] w-px ${className}`}
    />
  );
}
