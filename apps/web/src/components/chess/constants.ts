/**
 * 판과 말 모델·텍스처는 Apple Chess.app 소스에서 변환했다.
 * 출처와 라이선스: public/chess/LICENSE.txt
 * 스킨은 Mac 체스의 나무 스킨을 블로그의 흑백 톤으로 다시 칠한 것.
 * 에셋을 다시 만드는 방법: scripts/chess/README.md
 */

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Piece = {
  id: string;
  type: PieceType;
  color: Color;
  square: string;
  captured?: boolean;
};

const BASE = '/chess';
/** 에셋을 다시 만들면 올린다. 주소가 바뀌어야 브라우저가 예전 파일을 캐시에서 꺼내지 않는다 */
const ASSET_VERSION = 3;
export const asset = (path: string) => `${BASE}/${path}?v=${ASSET_VERSION}`;

export const NAMES: Record<PieceType, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};
export const TYPES = Object.keys(NAMES) as PieceType[];
export const modelUrl = (name: string) => asset(`${name}.glb`);

export const FILES = 'abcdefgh';
const BACK_RANK: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

export const START: Piece[] = [
  ...BACK_RANK.flatMap((type, f) => [
    { id: `w${type}${f}`, type, color: 'w' as const, square: `${FILES[f]}1` },
    { id: `b${type}${f}`, type, color: 'b' as const, square: `${FILES[f]}8` },
  ]),
  ...[...FILES].flatMap((file, f) => [
    {
      id: `wp${f}`,
      type: 'p' as const,
      color: 'w' as const,
      square: `${file}2`,
    },
    {
      id: `bp${f}`,
      type: 'p' as const,
      color: 'b' as const,
      square: `${file}7`,
    },
  ]),
];

/** 'e4' → 판 위 좌표 [x, z]. 칸 한 변 = 1, 백이 카메라 쪽(+z) */
export function squareToPosition(square: string): [number, number] {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]) - 1;
  return [file - 3.5, 3.5 - rank];
}

/** 판 위 좌표 → 'e4'. 판 밖이면 null */
export function positionToSquare(x: number, z: number): string | null {
  const file = Math.floor(x + 4);
  const rank = Math.floor(4 - z);
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${FILES[file]}${rank + 1}`;
}
