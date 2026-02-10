'use client';

import { type ReactElement, useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';

interface MDXContentProps {
  code: string;
}

export const MDXContent = ({ code }: MDXContentProps) => {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default({}) as ReactElement;
  }, [code]);
};
