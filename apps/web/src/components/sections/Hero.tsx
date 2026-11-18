'use client';

import { m } from 'motion/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';

const LINKS = [
  { href: '/about', label: 'about' },
  { href: '/blog', label: 'blog' },
];

const ChessHero = dynamic(() => import('../chess/ChessHero'), { ssr: false });

export const Hero = () => {
  // 대국이 시작되면 거대한 타이포는 배경처럼 흐려지고 판에 시선이 모인다
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  // 판과 말을 다 불러오면 판과 그 아래 줄이 함께 서서히 나타난다 (갑자기 튀어나오지 않게)
  const [boardReady, setBoardReady] = useState(false);
  const onBoardReady = useCallback(() => setBoardReady(true), []);
  // 3D가 안 뜨는 기기(WebGL 미지원 등)에서도 메뉴는 보여야 한다. 기다리다 기본 자리에 띄운다
  useEffect(() => {
    const timer = window.setTimeout(() => setBoardReady(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);
  const caption = useRef<HTMLDivElement>(null);
  const placeCaption = (top: number) => {
    const el = caption.current;
    if (!el) return;
    el.style.top = `${top}px`;
  };

  return (
    <section className="relative h-screen overflow-hidden font-sans">
      <div className="absolute top-5 right-3 z-20">
        <ThemeToggle />
      </div>
      <m.div
        className={`relative z-10 flex h-full flex-col justify-between transition-opacity duration-700 ${
          playing ? 'opacity-25' : 'opacity-100'
        }`}
      >
        <m.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1
            style={{ letterSpacing: '-0.1em' }}
            className="text-text-primary -mt-[0.1em] -ml-[0.06em] text-[32vw] leading-none font-extrabold md:text-[17vw]"
          >
            minsu
          </h1>
        </m.div>

        <m.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="self-end"
        >
          <span
            style={{ letterSpacing: '-0.1em' }}
            className="text-text-primary mr-3 -mb-[0.14em] block text-[36vw] leading-none font-extrabold md:text-[18vw]"
          >
            seo
          </span>
        </m.div>
      </m.div>

      {/* 판은 거대한 타이포 앞, 메뉴 뒤에 놓인다 */}
      <div
        className={`absolute inset-0 z-[15] transition-opacity duration-1000 ease-out ${
          boardReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChessHero
          onPlayingChange={setPlaying}
          onStatus={setStatus}
          onCaptionTop={placeCaption}
          onReady={onBoardReady}
        />
      </div>

      {/*
        체스 책의 판 그림 아래 설명 줄처럼 판 바로 밑에 한 줄을 둔다.
        평소에는 메뉴, 판에 다가가 두는 동안에는 대국 상태(White to move 등).
        세로 위치는 판이 그려진 자리를 따라 ChessHero가 정한다. 그 전에는 화면 아래쪽에 숨겨 둔다
      */}
      <div
        ref={caption}
        style={{ top: '78%', visibility: boardReady ? 'visible' : 'hidden' }}
        className={`pointer-events-none absolute right-0 left-0 z-20 grid justify-items-center transition-opacity duration-1000 ease-out ${
          boardReady ? 'opacity-100' : 'opacity-0'
        } font-mono text-sm sm:text-base 2xl:text-[1vw]`}
      >
        <nav
          aria-label="메인 메뉴"
          className={`col-start-1 row-start-1 flex gap-8 transition-opacity duration-500 ${
            playing ? 'opacity-0' : 'pointer-events-auto opacity-100'
          }`}
        >
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              tabIndex={playing ? -1 : undefined}
              // 밑줄이 왼쪽에서 오른쪽으로 그어진다
              className="text-text-secondary hover:text-text-primary bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[color,background-size] duration-300 hover:bg-[length:100%_1px]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p
          aria-live="polite"
          className={`text-text-secondary col-start-1 row-start-1 transition-opacity duration-500 ${
            playing && status ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {status}
        </p>
      </div>
    </section>
  );
};
