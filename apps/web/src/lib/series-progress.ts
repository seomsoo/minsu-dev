/**
 * 방문자가 시리즈에서 마지막으로 읽은 글. 로그인 없이 이 브라우저에만 기억한다.
 * 목차에서 폰이 이 글 칸에 서 있다. 저장이 막힌 환경(시크릿 창 등)에서는 기억하지 않는다
 */
const KEY = 'why-series:last-read';
const listeners = new Set<() => void>();

export function markSeriesRead(slug: string) {
  try {
    localStorage.setItem(KEY, slug);
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

export const lastReadStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
  getSnapshot(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  getServerSnapshot: (): string | null => null,
};
