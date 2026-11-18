import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export const TopNav = () => {
  return (
    <div className="flex items-center justify-between px-3 pt-5">
      <Link
        href="/"
        // 홈의 about·blog 링크와 같은 말투: 평소엔 밑줄 없이, 올리면 왼쪽에서 오른쪽으로 그어진다
        className="text-text-secondary hover:text-text-primary bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 font-mono text-sm transition-[color,background-size] duration-300 hover:bg-[length:100%_1px]"
      >
        home.
      </Link>
      <ThemeToggle />
    </div>
  );
};
