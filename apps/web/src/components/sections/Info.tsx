'use client';

import { m } from 'motion/react';
import { AUTHOR, PROJECTS } from '@/content/resume';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-20px' },
};

export const Info = () => {
  return (
    <div className="bg-background px-6 py-10 pb-20">
      <div className="mx-auto font-mono md:max-w-300 md:pt-8 2xl:max-w-11/12 2xl:pt-20">
        <m.div
          {...fadeInUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="border-border grid grid-cols-2 border-b pb-2 text-xs font-semibold md:text-base lg:grid-cols-4 2xl:text-lg"
        >
          <div>name.</div>
          <div>role.</div>
          <div className="hidden lg:block">motto.</div>
          <div className="hidden lg:block">contact.</div>
        </m.div>

        <m.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="grid grid-cols-2 pt-2 pb-6 md:py-6 lg:grid-cols-4"
        >
          <div>
            <h1 className="text-lg font-bold md:text-xl 2xl:text-2xl">
              {AUTHOR.name}
            </h1>
            <div className="text-text-secondary text-sm md:text-base 2xl:text-lg">
              {AUTHOR.nameEn}
            </div>
          </div>
          <div className="text-sm md:text-base 2xl:text-lg">
            {AUTHOR.position}
          </div>
          <div className="hidden text-sm md:text-base lg:block 2xl:text-lg">
            {AUTHOR.motto}
          </div>
          <div className="hidden flex-col gap-1 text-sm md:text-base lg:flex 2xl:text-lg">
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
        </m.div>

        <m.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="border-border grid grid-cols-2 border-b pt-5 pb-2 text-xs font-semibold md:text-base lg:hidden"
        >
          <div>motto.</div>
          <div>contact.</div>
        </m.div>

        <m.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2 pt-2 pb-6 md:py-6 md:pb-14 lg:hidden"
        >
          <div className="text-sm md:text-base">{AUTHOR.motto}</div>
          <div className="flex flex-col gap-1 text-sm md:text-base">
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
        </m.div>

        <m.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="border-border border-b pt-2 pb-2 md:pt-12"
        >
          <h2 className="text-xs font-semibold md:text-base 2xl:text-lg">
            projects.
          </h2>
        </m.div>

        {PROJECTS.map((project, index) => (
          <m.div
            key={project.name}
            {...fadeInUp}
            transition={{
              duration: 0.2,
              delay: 0.15 + index * 0.1,
              ease: 'easeOut',
            }}
            className="border-border grid grid-cols-1 gap-4 border-b py-5 transition-colors hover:bg-black/2 md:py-6 lg:grid-cols-[1fr_2fr] lg:gap-0"
          >
            <div>
              <div className="flex items-center gap-2 font-semibold md:text-lg 2xl:text-xl">
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
                    className="text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="GitHub 저장소"
                  >
                    ↗
                  </a>
                )}
              </div>
              <div className="text-text-secondary text-xs font-medium md:text-sm">
                {project.date}
              </div>
              <p className="text-text-secondary mt-2 text-sm font-medium md:text-sm 2xl:text-base">
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
          </m.div>
        ))}
      </div>
    </div>
  );
};
