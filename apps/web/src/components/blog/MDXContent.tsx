'use client';

import { type ReactElement, useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';
import { mdxComponents } from './mdx-components';

interface MDXContentProps {
  code: string;
}

export const MDXContent = ({ code }: MDXContentProps) => {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default({
      components: mdxComponents,
    }) as ReactElement;
  }, [code]);
};
