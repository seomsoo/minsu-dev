import type { Move } from 'chess.js';
import type { Piece, PieceType } from './constants';

/**
 * chess.js의 수를 화면의 말 목록에 반영한다.
 * 말마다 id가 있어서, 같은 말이 칸 사이를 미끄러지듯 움직이게 할 수 있다.
 */
export function applyMove(pieces: Piece[], move: Move): Piece[] {
  const next = pieces.map((piece) => ({ ...piece }));
  const at = (square: string) =>
    next.find((piece) => !piece.captured && piece.square === square);

  // 잡힌 말: 보통은 도착 칸, 앙파상은 도착 칸 바로 뒤
  if (move.flags.includes('e')) {
    const captured = at(`${move.to[0]}${move.from[1]}`);
    if (captured) captured.captured = true;
  } else if (move.captured) {
    const captured = at(move.to);
    if (captured) captured.captured = true;
  }

  const mover = at(move.from);
  if (mover) {
    mover.square = move.to;
    if (move.promotion) mover.type = move.promotion as PieceType;
  }

  // 캐슬링: 룩도 함께 옮긴다
  const rank = move.from[1];
  if (move.flags.includes('k')) {
    const rook = at(`h${rank}`);
    if (rook) rook.square = `f${rank}`;
  } else if (move.flags.includes('q')) {
    const rook = at(`a${rank}`);
    if (rook) rook.square = `d${rank}`;
  }

  return next;
}
