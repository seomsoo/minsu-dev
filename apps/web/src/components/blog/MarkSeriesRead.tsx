'use client';

import { useEffect } from 'react';
import { markSeriesRead } from '@/lib/series-progress';

/** 시리즈 글을 열면 그 글을 "마지막으로 읽은 글"로 기억한다 */
export function MarkSeriesRead({ slug }: { slug: string }) {
  useEffect(() => markSeriesRead(slug), [slug]);
  return null;
}
