import Link from 'next/link';

export const HomeLink = () => {
  return (
    <div className="flex justify-start px-3 pt-5">
      <Link
        href="/"
        className="text-text-secondary hover:text-text-primary font-mono text-base underline transition-colors lg:text-lg"
      >
        home.
      </Link>
    </div>
  );
};
