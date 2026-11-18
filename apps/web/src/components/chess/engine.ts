import { Chess, type Move, type PieceSymbol } from 'chess.js';

/**
 * 메인 체스판의 상대. 학습된 모델이 아니라 고전적인 탐색이다.
 * 1) 둘 수 있는 수를 몇 수 앞까지 펼쳐 보고(negamax + 알파베타 가지치기)
 * 2) 끝난 판마다 점수를 매겨(말의 가치 + 칸 위치)
 * 3) 상대도 최선을 둔다고 가정하고 가장 나은 수를 고른다.
 *
 * 다만 일부러 약하게(레이팅 400~600 정도) 둔다: 얕게 보고, 비슷한 수 중에서
 * 확률로 고르고, 가끔은 아무 수나 둔다. 세기는 아래 LEVEL로 조정한다.
 */

export type Level = {
  /** 몇 수 앞까지 보나. 2 = 내 수 + 상대의 바로 다음 응수 */
  depth: number;
  /**
   * 수를 고를 때의 무작위성(센티폰 단위). 클수록 최선이 아닌 수를 자주 둔다.
   * 0이면 항상 최선을 둔다.
   */
  temperature: number;
  /** 이 확률로 점수를 무시하고 아무 수나 둔다 (사람의 실수) */
  blunder: number;
};

export const LEVEL: Level = { depth: 2, temperature: 120, blunder: 0.15 };

const VALUE: Record<PieceSymbol, number> = {
  p: 100,
  n: 300,
  b: 320,
  r: 500,
  q: 900,
  k: 0,
};

const MATE = 100_000;

/** 가운데에 가까울수록 0에 가깝고, 가장자리일수록 커진다 (0~3) */
function edgeDistance(file: number, rank: number) {
  const f = file < 4 ? 3 - file : file - 4;
  const r = rank < 4 ? 3 - rank : rank - 4;
  return Math.max(f, r);
}

/**
 * 칸 위치 보너스. 초보도 아는 정도의 감각만 넣는다:
 * 폰은 앞으로·가운데로, 나이트·비숍은 가운데로, 킹은 집에 머물기.
 * rank는 자기 쪽에서 센 줄 번호(0 = 자기 첫 줄).
 */
function positionBonus(type: PieceSymbol, file: number, rank: number) {
  const center = 3 - edgeDistance(file, rank); // 0~3
  switch (type) {
    case 'p':
      return rank * 6 + (file >= 2 && file <= 5 ? center * 6 : 0);
    case 'n':
      return center * 12 - 15;
    case 'b':
      return center * 6;
    case 'k':
      return rank === 0 ? 10 : -rank * 10;
    default:
      return 0;
  }
}

/** 판 점수. 둘 차례인 쪽 입장에서 + 가 유리 */
export function evaluate(chess: Chess) {
  let score = 0;
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[row][file];
      if (!piece) continue;
      // board()의 row 0은 8번 줄
      const rank = piece.color === 'w' ? 7 - row : row;
      const value = VALUE[piece.type] + positionBonus(piece.type, file, rank);
      score += piece.color === 'w' ? value : -value;
    }
  }
  return chess.turn() === 'w' ? score : -score;
}

/** 잡는 수를 먼저 보면 가지치기가 잘 된다 (싼 말로 비싼 말을 잡는 수부터) */
function ordered(moves: Move[]) {
  return moves.sort((a, b) => {
    const gain = (m: Move) =>
      m.captured ? VALUE[m.captured] * 10 - VALUE[m.piece] : 0;
    return gain(b) - gain(a);
  });
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
): number {
  if (chess.isCheckmate()) return -MATE + ply; // 빨리 지는 쪽이 더 나쁘다
  if (chess.isDraw() || chess.isStalemate()) return 0;
  if (depth === 0) return evaluate(chess);

  let best = -Infinity;
  for (const move of ordered(chess.moves({ verbose: true }))) {
    chess.move(move);
    const score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1);
    chess.undo();
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

/** 가능한 수마다 점수를 매긴다 (둘 차례인 쪽 입장) */
export function scoreMoves(fen: string, depth: number) {
  const chess = new Chess(fen);
  return ordered(chess.moves({ verbose: true })).map((move) => {
    chess.move(move);
    const score = -negamax(chess, depth - 1, -Infinity, Infinity, 1);
    chess.undo();
    return { move, score };
  });
}

export type ChosenMove = { from: string; to: string; promotion?: string };

export function chooseMove(
  fen: string,
  level: Level = LEVEL,
  random: () => number = Math.random,
): ChosenMove | null {
  const scored = scoreMoves(fen, level.depth);
  if (scored.length === 0) return null;

  let pick = scored[0];
  if (random() < level.blunder) {
    // 실수: 점수를 보지 않고 아무 수나
    pick = scored[Math.floor(random() * scored.length)];
  } else if (level.temperature <= 0) {
    pick = scored.reduce((a, b) => (b.score > a.score ? b : a));
  } else {
    // 점수가 높을수록 자주, 하지만 비슷한 수들 사이에서는 고르게 (softmax)
    const top = Math.max(...scored.map((s) => s.score));
    const weights = scored.map((s) =>
      Math.exp((s.score - top) / level.temperature),
    );
    let r = random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < scored.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        pick = scored[i];
        break;
      }
    }
  }

  const { from, to, promotion } = pick.move;
  return { from, to, promotion };
}
