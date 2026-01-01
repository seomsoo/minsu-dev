'use client';

import { useRef, useState, type ReactNode } from 'react';

interface ScrollContainerProps {
  children: ReactNode;
}

export const ScrollContainer = ({ children }: ScrollContainerProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling || !containerRef.current) return;

    const container = containerRef.current;
    const sectionHeight = window.innerHeight;
    const currentSection = Math.round(container.scrollTop / sectionHeight);

    if (e.deltaY > 0 && currentSection < 1) {
      setIsScrolling(true);
      container.scrollTo({ top: sectionHeight, behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 800);
    } else if (e.deltaY < 0 && currentSection > 0) {
      setIsScrolling(true);
      container.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      className="h-screen snap-y snap-mandatory overflow-y-auto"
    >
      {children}
    </main>
  );
};
