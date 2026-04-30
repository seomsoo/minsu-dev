import dynamic from 'next/dynamic';

export const mdxComponents = {
  EventLoopStepper: dynamic(() =>
    import('./widgets/EventLoopStepper').then((m) => m.EventLoopStepper),
  ),
};

export type MDXComponents = typeof mdxComponents;
