'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const ASCII_LOGO = `
  __  __ _                   ____
 |  \\/  (_)_ __  ___ _   _  / ___|  ___  ___
 | |\\/| | | '_ \\/ __| | | | \\___ \\ / _ \\/ _ \\
 | |  | | | | | \\__ \\ |_| |  ___) |  __/ (_) |
 |_|  |_|_|_| |_|___/\\__,_| |____/ \\___|\\___/

 Frontend Developer | < />

 GitHub: github.com/seomsoo
 Email: usnimoes@gmail.com
`;

interface MotionPagerProps {
  children: ReactNode;
}

export const MotionPager = ({ children }: MotionPagerProps) => {
  const pages = Children.toArray(children);
  const totalPages = pages.length;

  const [page, setPage] = useState(0);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    console.log(
      '%c' + ASCII_LOGO,
      'font-family: monospace; font-size: 12px; color: #245895;',
    );
  }, []);

  // Wheel 이벤트
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isAnimating.current) return;

      // 현재 페이지의 스크롤 가능한 요소 확인
      const currentSection = document.querySelector(
        `[data-page="${page}"]`,
      ) as HTMLElement;
      const scrollableContent = currentSection?.querySelector(
        '[data-scrollable]',
      ) as HTMLElement;

      if (scrollableContent) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableContent;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        const direction = e.deltaY > 0 ? 1 : -1;

        // 스크롤 가능하면 내부 스크롤 허용
        if (
          (direction === -1 && !isAtTop) ||
          (direction === 1 && !isAtBottom)
        ) {
          return; // 내부 스크롤 허용
        }
      }

      e.preventDefault();

      const direction = e.deltaY > 0 ? 1 : -1;

      setPage((prev) => {
        const next = prev + direction;
        if (next < 0 || next >= totalPages) return prev;
        isAnimating.current = true;
        return next;
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [totalPages, page]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (isAnimating.current) return;

      let direction = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        direction = 1;
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        direction = -1;
      }

      if (direction !== 0) {
        setPage((prev) => {
          const next = prev + direction;
          if (next < 0 || next >= totalPages) return prev;
          isAnimating.current = true;
          return next;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [totalPages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating.current) return;

    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const threshold = 50;

    if (Math.abs(deltaY) > threshold) {
      const direction = deltaY > 0 ? 1 : -1;
      setPage((prev) => {
        const next = prev + direction;
        if (next < 0 || next >= totalPages) return prev;
        isAnimating.current = true;
        return next;
      });
    }
  };

  const handleAnimationComplete = () => {
    isAnimating.current = false;
  };

  const goToPage = (targetPage: number) => {
    if (isAnimating.current || targetPage === page) return;
    isAnimating.current = true;
    setPage(targetPage);
  };

  return (
    <main
      className="fixed inset-0 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        animate={{ y: `-${page * 100}vh` }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.8,
          ease: [0.32, 0.72, 0, 1],
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        {pages.map((child, i) => (
          <section
            key={i}
            data-page={i}
            className="h-screen"
            aria-hidden={page !== i}
          >
            {child}
          </section>
        ))}
      </motion.div>

      <nav
        className="fixed right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2"
        aria-label="페이지 네비게이션"
      >
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              page === i
                ? 'scale-125 bg-text-primary'
                : 'bg-text-secondary/30 hover:bg-text-secondary/50'
            }`}
            aria-label={`${i + 1}페이지로 이동`}
            aria-current={page === i ? 'page' : undefined}
          />
        ))}
      </nav>
    </main>
  );
};
