import Link from 'next/link';
import { PAWN_PARTS, PAWN_VIEWBOX } from './pawn-figure';

/**
 * 블로그 목록 위의 시리즈 입구.
 * 오른쪽은 폰 분해도: 기술을 뜯어 안을 들여다보는 시리즈라는 뜻을 도면 한 장으로 보여 준다.
 */
export function SeriesCard({ href, title }: { href: string; title: string }) {
  return (
    // 오른쪽 칸은 도면 전용 (Linear의 FIG 칸처럼 가는 세로선으로 나눈다). 휴대폰에서는 나누지 않는다
    <Link
      href={href}
      className="group border-border hover:border-text-primary/30 mb-10 grid grid-cols-[1fr_auto] border transition-colors duration-500 md:grid-cols-[1fr_13rem]"
    >
      {/* 이름표와 제목을 한 덩어리로 세로 가운데 */}
      <div className="flex min-w-0 flex-col justify-center p-6 md:p-8">
        <p className="text-text-secondary font-mono text-xs">series</p>
        <h2 className="mt-2 text-lg font-semibold md:text-2xl">{title}</h2>
      </div>
      <div className="md:border-border flex items-center justify-center pr-5 md:border-l md:py-5 md:pr-0">
        <PawnFigure />
      </div>
    </Link>
  );
}

/*
 * 폰 분해도 (Linear의 FIG 도면처럼 가는 선으로 그린 입체 도면)
 * - 처음 보일 때: 벌어져 있던 받침·몸통·목 장식·머리가 한 번 조립된다 (휴대폰에서도 보인다)
 * - 마우스를 올리면: 축을 따라 벌어지고 가운데에 점선 중심축이 드러난다. "뜯어서 들여다본다"는 시리즈의 뜻
 * 각 부품은 배경색으로 채워 그려서 위 부품이 뒤의 선을 가린다.
 */
function PawnFigure() {
  return (
    <svg
      viewBox={PAWN_VIEWBOX}
      aria-hidden
      className="text-text-primary h-28 w-auto shrink-0 md:h-44"
    >
      {PAWN_PARTS.map((part, i) => (
        <g
          key={i}
          style={{ ['--lift' as string]: `${-part.lift}px` }}
          className="translate-y-0 [animation:pawn-assemble_1000ms_cubic-bezier(.22,1,.36,1)_250ms_backwards] [transition:translate_500ms_cubic-bezier(.22,1,.36,1)] group-hover:translate-y-(--lift) motion-reduce:animate-none motion-reduce:transition-none"
        >
          <path d={part.fill} className="fill-background" />
          {part.lines.map((d, j) => (
            <path
              key={j}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.6}
              strokeWidth={1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      ))}
      {/* 조립 축: 벌어졌을 때만 부품들을 꿰뚫는 점선 중심축 (도면의 중심선) */}
      <line
        x1={0}
        x2={0}
        y1={PAWN_PARTS[0].top.y - PAWN_PARTS[0].lift}
        y2={
          PAWN_PARTS[PAWN_PARTS.length - 1].bottom.y -
          PAWN_PARTS[PAWN_PARTS.length - 1].lift
        }
        stroke="currentColor"
        strokeOpacity={0.45}
        strokeDasharray="2 2.5"
        vectorEffect="non-scaling-stroke"
        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-150"
      />
    </svg>
  );
}
