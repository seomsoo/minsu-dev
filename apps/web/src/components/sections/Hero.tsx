'use client';

import { m } from 'motion/react';
import Link from 'next/link';
import { HeroAscii } from '../ui/HeroAscii';

export const Hero = () => {
  return (
    <section className="relative h-screen overflow-hidden font-sans">
      <m.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-[25%] left-0 z-20 flex flex-col gap-3 font-mono text-lg sm:gap-5 sm:text-xl md:top-[30%] md:gap-8 md:text-2xl 2xl:text-[1.5vw]"
      >
        <Link
          href="/about"
          className="text-text-secondary hover:text-text-primary font-mono underline transition-colors"
        >
          about.
        </Link>
        <Link
          href="/blog"
          className="text-text-secondary hover:text-text-primary font-mono underline transition-colors"
        >
          blog.
        </Link>
      </m.nav>

      <m.div className="relative z-10 flex h-full flex-col justify-between">
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

      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <HeroAscii />
      </div>
    </section>
  );
};
