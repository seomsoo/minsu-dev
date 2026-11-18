'use client';

import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/useMounted';
import { QUEEN } from '@/lib/piece-paths';

const ICON_SIZE = 'block size-6 2xl:size-[max(24px,1.3vw)]';

/** 라이트는 윤곽선만 있는 흰 퀸, 다크는 속이 찬 검은 퀸 */
function Queen({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      // 퀸은 실제 말 비율이라 폭이 좁다. 큰 화면(4K 등)에서는 화면 폭을 따라 커진다
      className={ICON_SIZE}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={QUEEN} />
    </svg>
  );
}

/**
 * 퀸 하나로 켜고 끈다.
 * 처음 온 사람은 기기 설정(system)을 따르고, 누르면 지금 보이는 것의 반대로 바뀌어 기억된다.
 */
export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // 서버에서는 기기 설정을 모르므로 자리만 잡아 두고, 그린 뒤에 아이콘을 보인다
  if (!mounted) return <span className={ICON_SIZE} aria-hidden />;

  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'}
      className="text-text-secondary hover:text-text-primary block cursor-pointer transition-colors"
    >
      <Queen filled={dark} />
    </button>
  );
};
