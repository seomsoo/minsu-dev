'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { label: 'all', value: '' },
  { label: 'thoughts', value: 'thoughts' },
  { label: 'dev', value: 'dev' },
];

export const CategoryFilter = () => {
  const searchParams = useSearchParams();
  const current = searchParams.get('category') ?? '';

  return (
    <nav className="flex items-center gap-3 font-mono text-sm">
      {CATEGORIES.map((cat, index) => (
        <span key={cat.value} className="flex items-center gap-3">
          {index > 0 && (
            <span className="text-border" aria-hidden>
              |
            </span>
          )}
          <Link
            href={cat.value ? `/blog?category=${cat.value}` : '/blog'}
            className={`transition-colors ${
              current === cat.value
                ? 'text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat.label}
          </Link>
        </span>
      ))}
    </nav>
  );
};
