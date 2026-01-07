import type { ReactNode } from 'react';

export interface Project {
  name: string;
  link?: string;
  github: string;
  summary: string;
  date: string;
  descriptions: ReactNode[];
}
