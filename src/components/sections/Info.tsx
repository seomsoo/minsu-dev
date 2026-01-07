'use client';

import { motion } from 'motion/react';
import { AUTHOR, PROJECTS } from '@/content/resume';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-20px' },
};

export const Info = () => {
  return (
    <div
      id="info"
      data-scrollable
      className="h-full overflow-y-auto bg-background px-6 py-10 "
    >
      <div className="mx-auto font-mono  md:pt-8 2xl:pt-20 md:max-w-300 2xl:max-w-11/12">
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-2 border-b border-border pb-2 text-xs  2xl:text-lg font-semibold md:text-base lg:grid-cols-4"
        >
          <div>name.</div>
          <div>role.</div>
          <div className="hidden lg:block">motto.</div>
          <div className="hidden lg:block">contact.</div>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="grid grid-cols-2  pt-2 pb-6 md:py-6 lg:grid-cols-4"
        >
          <div>
            <h1 className="text-lg font-bold md:text-xl 2xl:text-2xl ">
              {AUTHOR.name}
            </h1>
            <div className="text-sm text-text-secondary md:text-base 2xl:text-lg">
              {AUTHOR.nameEn}
            </div>
          </div>
          <div className="text-sm md:text-base 2xl:text-lg">
            {AUTHOR.position}
          </div>
          <div className="hidden text-sm md:text-base 2xl:text-lg lg:block">
            {AUTHOR.motto}
          </div>
          <div className="hidden flex-col gap-1 text-sm md:text-base 2xl:text-lg lg:flex">
            <a className="underline" href={`mailto:${AUTHOR.email}`}>
              {AUTHOR.email}
            </a>
            <a
              className="underline"
              href={AUTHOR.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="grid grid-cols-2 border-b border-border pb-2 pt-5 text-xs font-semibold md:text-base lg:hidden"
        >
          <div>motto.</div>
          <div>contact.</div>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2  pt-2 pb-6 md:py-6 md:pb-14 lg:hidden"
        >
          <div className="text-sm md:text-base">{AUTHOR.motto}</div>
          <div className="flex flex-col gap-1 text-sm md:text-base ">
            <a className="underline" href={`mailto:${AUTHOR.email}`}>
              {AUTHOR.email}
            </a>
            <a
              className="underline"
              href={AUTHOR.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="border-b border-border pb-2 pt-2 md:pt-12 "
        >
          <h2 className="text-xs font-semibold md:text-base  2xl:text-lg">
            projects.
          </h2>
        </motion.div>

        {PROJECTS.map((project, index) => (
          <motion.div
            key={project.name}
            {...fadeInUp}
            transition={{
              duration: 0.2,
              delay: 0.15 + index * 0.1,
              ease: 'easeOut',
            }}
            className=" grid grid-cols-1 gap-4 border-b border-border py-5 transition-colors hover:bg-black/2 md:py-6 lg:grid-cols-[1fr_2fr] lg:gap-0"
          >
            <div>
              <div className="flex items-center gap-2 font-semibold md:text-lg  2xl:text-xl">
                <a
                  href={project.link || project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {project.name}
                </a>
                {project.link && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary transition-colors hover:text-text-primary"
                    aria-label="GitHub 저장소"
                  >
                    ↗
                  </a>
                )}
              </div>
              <div className="text-xs text-text-secondary font-medium md:text-sm">
                {project.date}
              </div>
              <p className="mt-2 text-sm text-text-secondary font-medium md:text-sm 2xl:text-base">
                {project.summary}
              </p>
            </div>
            <ul className="flex list-inside list-['-'] flex-col gap-y-1.5 text-sm md:text-base 2xl:text-lg">
              {project.descriptions.map((desc, descIndex) => (
                <li key={descIndex} className="pl-1">
                  {desc}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
