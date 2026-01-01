'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <section
      ref={ref}
      className="relative flex h-screen snap-start flex-col justify-between overflow-hidden"
    >
      <motion.div style={{ opacity, y }} className="flex h-full flex-col">
        {/* Top Left - MINSU */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="self-start"
        >
          <h1
            style={{ letterSpacing: '-0.11em' }}
            className="-ml-[0.06em] -mt-[0.1em] font-mono text-[15vw] font-extrabold leading-none text-text-primary md:text-[12vw]"
          >
            minsu
          </h1>
        </motion.div>

        {/* Center - ASCII 3D Placeholder */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="text-center font-mono text-xs text-text-secondary"
          >
            {/* ASCII 3D will be here */}
          </motion.div>
        </div>

        {/* Bottom Right - SEO */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="self-end"
        >
          <h1
            style={{ letterSpacing: '-0.15em' }}
            className="-mb-[0.15em] mr-8 font-mono text-[15vw] font-extrabold leading-none text-text-primary md:text-[12vw]"
          >
            seo
          </h1>
        </motion.div>
      </motion.div>
    </section>
  );
};
