'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="맨 위로 스크롤"
          className="border-border text-text-secondary hover:text-text-primary fixed right-6 bottom-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border bg-transparent text-sm font-bold transition-colors"
        >
          ↑
        </m.button>
      )}
    </AnimatePresence>
  );
};
