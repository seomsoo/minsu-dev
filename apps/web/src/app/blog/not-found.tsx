import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center font-mono">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-text-secondary mt-">존재하지 않는 글입니다.</p>
      <Link
        href="/blog"
        className="hover:text-text-primary mt-6 text-sm underline transition-colors"
      >
        블로그로 돌아가기
      </Link>
    </main>
  );
}
