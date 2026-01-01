'use client';

import { motion } from 'motion/react';
import { PROFILE, PROJECTS } from '@/constants/data';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
};

export const Info = () => {
  return (
    <section
      id="info"
      className="min-h-screen snap-start bg-surface px-6 py-20"
    >
      <div className="mx-auto font-mono">
        {/* Header */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-2 border-b border-border pb-2 text-xs font-semibold lg:grid-cols-4"
        >
          <div>NAME /</div>
          <div>POSITION /</div>
          <div className="hidden lg:block">MOTTO /</div>
          <div className="hidden lg:block">CONTACT /</div>
        </motion.div>

        {/* Profile */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="grid min-h-32 grid-cols-2 border-b border-border py-4 lg:grid-cols-4"
        >
          <div>
            <h1 className="font-bold">{PROFILE.name}</h1>
            <div className="text-sm text-text-secondary">{PROFILE.nameEn}</div>
          </div>
          <div className="text-sm">{PROFILE.position}</div>
          <div className="col-span-2 mt-4 text-sm lg:col-span-1 lg:mt-0">
            {PROFILE.motto}
          </div>
          <div className="col-span-2 mt-2 flex flex-col gap-1 text-sm lg:col-span-1 lg:mt-0">
            <a className="underline" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>
            <a
              className="underline"
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </motion.div>

        {/* Projects Section Header */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="border-b border-border py-4"
        >
          <h2 className="text-xs font-semibold">PROJECTS /</h2>
        </motion.div>

        {/* Projects */}
        {PROJECTS.map((project, index) => (
          <motion.div
            key={project.name}
            {...fadeInUp}
            transition={{
              duration: 0.5,
              delay: 0.25 + index * 0.1,
              ease: 'easeOut',
            }}
            className="grid grid-cols-1 gap-4 border-b border-border py-4 lg:grid-cols-[1fr_2fr] lg:gap-0"
          >
            <div>
              <div className="font-semibold">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-text-secondary no-underline hover:text-text-primary"
                    aria-label="GitHub"
                  >
                    [GitHub]
                  </a>
                )}
              </div>
              <div className="text-xs text-text-secondary">{project.date}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-text-secondary before:content-['#']"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ul className="flex list-inside list-['-'] flex-col gap-y-1.5 text-sm">
              {project.descriptions.map((desc, descIndex) => (
                <li key={descIndex} className="pl-1">
                  {desc}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
