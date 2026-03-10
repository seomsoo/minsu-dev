import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export const TopNav = () => {
  return (
    <div className="flex items-center justify-between px-3 pt-5">
      <Link
        href="/"
        className="text-text-secondary hover:text-text-primary font-mono text-base underline transition-colors lg:text-lg"
      >
        home.
      </Link>
      <ThemeToggle />
    </div>
  );
};
