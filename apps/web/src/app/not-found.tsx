import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center font-mono">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-text-secondary mt-4">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="hover:text-text-primary mt-6 text-sm underline transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
