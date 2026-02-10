'use client';

import { useEffect } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';

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

export const MotionProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log(ASCII_LOGO);
  }, []);

  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
};
