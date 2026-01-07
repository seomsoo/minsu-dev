'use client';

import { motion } from 'motion/react';
import { HeroAscii } from '../ui/HeroAscii';

export const Hero = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      <motion.div className="relative z-10 flex h-full flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1
            style={{ letterSpacing: '-0.1em' }}
            className="-ml-[0.06em] -mt-[0.1em] text-[32vw] font-extrabold leading-none text-text-primary md:text-[17vw]"
          >
            minsu
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="self-end"
        >
          <h1
            style={{ letterSpacing: '-0.1em' }}
            className="-mb-[0.14em] mr-3 text-[36vw]  font-extrabold leading-none text-text-primary md:text-[18vw]"
          >
            seo
          </h1>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <HeroAscii />
      </div>
    </section>
  );
};
