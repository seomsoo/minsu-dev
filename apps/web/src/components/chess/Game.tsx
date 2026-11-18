'use client';

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Chess, type Move, type Square } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePieceGeometries, usePieceMaterials } from './assets';
import {
  FILES,
  START,
  positionToSquare,
  squareToPosition,
  type Piece,
} from './constants';
import type { ChosenMove } from './engine';
import { applyMove } from './moves';
import { Shatter } from './Shatter';
import { playCapture, playMove, unlockSound } from './sound';

/** 방문자는 백, 컴퓨터는 흑 */
const HUMAN = 'w';
/** 컴퓨터가 너무 빨리 두면 어색하다. 계산이 빨리 끝나도 이만큼(ms)은 생각하는 척한다 */
const MIN_THINK = 600;

/** 고른 말이 떠오르는 높이 */
const LIFT = 0.3;
/** 이긴 킹을 비추는 핀 조명의 세기 */
const SPOT_INTENSITY = 5;
/** 끌고 다닐 때의 높이 */
const DRAG_HEIGHT = 0.45;
/** 이만큼(px) 움직여야 클릭이 아니라 끌기로 본다 */
const DRAG_THRESHOLD = 6;

type Drag = {
  id: string;
  from: string;
  x: number;
  y: number;
  moved: boolean;
  wasSelected: boolean;
};

/**
 * 대기 중에는 판을 누르면 다가가기만 한다(onEnter). 다가간 뒤(active)에만 말을 둘 수 있고,
 * 판 바깥을 누르거나 Esc를 누르면 물러난다(onExit). 두던 판은 그대로 남는다.
 */
export function Game({
  active,
  onEnter,
  onExit,
  onSpotlight,
  onStatus,
}: {
  active: boolean;
  onEnter: () => void;
  onExit: () => void;
  /** 대국이 끝나 판 조명을 낮추고 이긴 킹만 비출 때 true */
  onSpotlight: (on: boolean) => void;
  /** 판 아래 설명 줄에 쓸 대국 상태. 체스 책의 판 그림 설명처럼 짧게 */
  onStatus?: (status: string | null) => void;
}) {
  const [chess] = useState(() => new Chess());
  const [pieces, setPieces] = useState<Piece[]>(START);
  const [picked, setSelected] = useState<string | null>(null);
  // 물러나 있는 동안에는 고른 말이 없다 (어떤 경로로 물러나든 말이 떠 있지 않게)
  const selected = active ? picked : null;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  /** 체크메이트로 깨진 킹의 id */
  const [shatteredId, setShatteredId] = useState<string | null>(null);
  /** 이겨서 핀 조명을 받는 킹의 id */
  const [winnerId, setWinnerId] = useState<string | null>(null);
  /** 핀 조명이 켜져 있는지. 물러날 때 꺼진다 */
  const [spotOn, setSpotOn] = useState(false);

  /** 대국이 끝났는지. 끝난 뒤 판을 누르면 새 판이 시작된다 */
  const [finished, setFinished] = useState(false);
  /** 새 판으로 되감는 동안에는 말을 집을 수 없다 */
  const [resetting, setResetting] = useState(false);
  /** 깨진 킹 조각이 다시 모이는 중인지 */
  const [reassembling, setReassembling] = useState(false);

  /** 판마다 바뀌는 번호. 지난 판에 예약해 둔 연출이 새 판에 끼어들지 않게 한다 */
  const round = useRef(0);
  const later = (ms: number, run: () => void) => {
    const scheduled = round.current;
    window.setTimeout(() => {
      if (round.current === scheduled) run();
    }, ms);
  };

  /**
   * 수를 둔 뒤 대국이 끝났으면:
   * 체크메이트 → 둔 말이 내려앉고, 진 쪽 킹이 깨지고, 조명이 이긴 킹에게 모였다가, 물러나며 원래대로
   * 무승부 → 잠깐 뒤 물러난다
   */
  // 방문자에게 말을 거는 말투로 통일한다. 체크메이트되면 둘 차례인 쪽이 진 쪽이다
  const report = () => {
    const mine = chess.turn() === HUMAN;
    if (chess.isCheckmate()) {
      onStatus?.(mine ? 'Checkmate. You lose' : 'Checkmate. You win');
    } else if (chess.isDraw() || chess.isStalemate()) {
      onStatus?.('Draw');
    } else {
      onStatus?.(mine ? 'Your move' : 'Thinking');
    }
  };

  const endIfOver = () => {
    report();
    if (!chess.isGameOver()) return;
    setFinished(true);
    if (!chess.isCheckmate()) {
      later(1500, () => exit());
      return;
    }
    // 킹은 승진·교체가 없어서 처음 id(w|b + k + 4번째 줄)가 끝까지 같다
    const loser = chess.turn();
    const winner = loser === 'w' ? 'b' : 'w';
    later(700, () => setShatteredId(`${loser}k4`));
    later(2400, () => {
      setWinnerId(`${winner}k4`);
      setSpotOn(true);
      onSpotlight(true);
    });
    later(4600, () => {
      exit();
      setSpotOn(false);
      onSpotlight(false);
    });
  };

  /**
   * 새 판: 잡혔던 말은 사라진 자리에서 떠올라, 남은 말과 함께 처음 자리로 미끄러져 돌아간다.
   * 깨진 킹은 조각이 거꾸로 날아와 다시 붙은 뒤 제자리로 간다.
   */
  const restart = () => {
    round.current++;
    request.current++; // 지난 판의 컴퓨터 응수는 버린다
    chess.reset();
    report();
    setFinished(false);
    setWinnerId(null);
    setSpotOn(false);
    onSpotlight(false);
    setResetting(true);

    const broken = pieces.find((piece) => piece.id === shatteredId);
    if (broken) {
      // 깨진 킹은 조각이 다 모일 때까지 그 자리에 둔다
      setPieces(
        START.map((piece) =>
          piece.id === broken.id ? { ...piece, square: broken.square } : piece,
        ),
      );
      setReassembling(true);
    } else {
      setPieces(START);
      later(900, () => setResetting(false));
    }
  };

  const onAssembled = () => {
    playMove(); // 다시 붙은 킹이 판에 딱 놓인다
    setReassembling(false);
    setShatteredId(null);
    setPieces(START);
    later(700, () => setResetting(false));
  };

  const group = useRef<THREE.Group>(null);
  const drag = useRef<Drag | null>(null);
  const dragPoint = useRef(new THREE.Vector3());
  const { camera, gl, invalidate } = useThree();
  const geometries = usePieceGeometries();
  const materials = usePieceMaterials();

  // pieces가 바뀌면(수를 두면) chess의 상태도 바뀌었으므로 다시 계산한다
  const targets = useMemo<Move[]>(
    () =>
      selected
        ? chess.moves({ square: selected as Square, verbose: true })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chess, selected, pieces],
  );

  const select = (square: string | null) => setSelected(square);

  const winnerPosition = useMemo(() => {
    const king = pieces.find((piece) => piece.id === winnerId);
    if (!king) return null;
    const [x, z] = squareToPosition(king.square);
    return [x, 0, z] as [number, number, number];
  }, [pieces, winnerId]);

  const shatteredKing = useMemo(() => {
    const king = pieces.find((piece) => piece.id === shatteredId);
    if (!king) return null;
    const [x, z] = squareToPosition(king.square);
    return {
      color: king.color,
      position: [x, 0, z] as [number, number, number],
    };
  }, [pieces, shatteredId]);

  const enter = () => {
    unlockSound(); // 판을 누른 이 순간에 켜야 브라우저가 소리를 허락한다
    select(null);
    if (finished) restart();
    else report();
    onEnter();
  };

  const exit = () => {
    drag.current = null;
    setDraggingId(null);
    select(null);
    document.body.style.cursor = '';
    onExit();
  };

  // 아이폰 사파리는 손가락을 뗄 때 소리를 허락하는 경우가 많아, 그때도 한 번 더 켠다
  useEffect(() => {
    if (!active) return;
    window.addEventListener('touchend', unlockSound);
    return () => window.removeEventListener('touchend', unlockSound);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const tryMove = (from: string, to: string) => {
    let move: Move;
    try {
      // 승진은 일단 퀸으로 고정
      move = chess.move({ from, to, promotion: 'q' });
    } catch {
      return false;
    }
    unlockSound();
    captureSquare.current = move.captured ? move.to : null;
    setPieces((prev) => applyMove(prev, move));
    select(null);
    endIfOver();
    requestReply();
    return true;
  };

  /** 방금 둔 수가 잡는 수였으면 그 칸. 그 칸에 내려앉는 말은 잡는 소리를 낸다 */
  const captureSquare = useRef<string | null>(null);

  /** 말이 판에 닿는 순간 (애니메이션과 맞춘다). 새 판으로 되돌아가는 말들은 조용히 */
  const onLand = (piece: Piece, moved: boolean) => {
    if (resetting) return;
    if (moved && captureSquare.current === piece.square) {
      captureSquare.current = null;
      playCapture();
    } else {
      playMove(!moved);
    }
  };

  // 컴퓨터의 응수: 백그라운드 스레드(engine.worker.ts)에서 계산한다
  const worker = useRef<Worker | null>(null);
  const request = useRef(0);
  useEffect(() => () => worker.current?.terminate(), []);

  const requestReply = () => {
    if (chess.isGameOver() || chess.turn() === HUMAN) return;
    worker.current ??= new Worker(
      new URL('./engine.worker.ts', import.meta.url),
    );
    const id = ++request.current;
    const startedAt = performance.now();
    worker.current.onmessage = (
      event: MessageEvent<{ id: number; move: ChosenMove | null }>,
    ) => {
      const { move } = event.data;
      if (event.data.id !== request.current || !move) return;
      const wait = Math.max(0, MIN_THINK - (performance.now() - startedAt));
      window.setTimeout(() => {
        const played = chess.move(move);
        captureSquare.current = played.captured ? played.to : null;
        setPieces((prev) => applyMove(prev, played));
        endIfOver();
      }, wait);
    };
    worker.current.postMessage({ id, fen: chess.fen() });
  };

  /** 화면 좌표 → 판(기울어진 그룹) 위의 로컬 좌표 */
  const pointerToBoard = useMemo(() => {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const ray = new THREE.Ray();
    const inverse = new THREE.Matrix4();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    return (clientX: number, clientY: number) => {
      const board = group.current;
      if (!board) return null;
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      inverse.copy(board.matrixWorld).invert();
      ray.copy(raycaster.ray).applyMatrix4(inverse);
      return ray.intersectPlane(plane, hit);
    };
  }, [camera, gl]);

  // 끌기: 말을 누른 뒤의 움직임과 놓기는 창 전체에서 받는다
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      if (
        !current.moved &&
        Math.hypot(event.clientX - current.x, event.clientY - current.y) <
          DRAG_THRESHOLD
      ) {
        return;
      }
      if (!current.moved) {
        current.moved = true;
        setDraggingId(current.id);
        document.body.style.cursor = 'grabbing';
      }
      const point = pointerToBoard(event.clientX, event.clientY);
      if (point) dragPoint.current.copy(point);
      invalidate();
    };

    const onUp = (event: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      drag.current = null;
      document.body.style.cursor = '';
      if (!current.moved) {
        // 이미 골라 둔 말을 다시 누르면 내려놓는다
        if (current.wasSelected) select(null);
        return;
      }
      setDraggingId(null);
      const point = pointerToBoard(event.clientX, event.clientY);
      const square = point && positionToSquare(point.x, point.z);
      if (square && square !== current.from && tryMove(current.from, square)) {
        return;
      }
      // 둘 수 없는 칸이면 제자리로 돌아간다. 고른 상태는 유지해서 칸을 눌러 둘 수 있게 한다
      invalidate();
    };

    // 브라우저가 끌기를 가로채면(스크롤·시스템 제스처) 말을 제자리로 돌린다
    const onCancel = () => {
      if (!drag.current) return;
      drag.current = null;
      document.body.style.cursor = '';
      setDraggingId(null);
      invalidate();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  });

  /**
   * 커서: 마우스가 움직일 때마다 바로 아래에 있는 것(가장 가까운 것)으로 정한다.
   * 칸·테두리·말 사이를 지날 때 들어옴/나감 순서가 엇갈려도 결과가 흔들리지 않는다.
   * 대기 중에는 판 전체가 손가락, 다가간 뒤에는 차례인 쪽 말만 잡기 커서.
   */
  const setCursor = (cursor: string) => {
    if (!drag.current) document.body.style.cursor = cursor;
  };
  const hoverBoard = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setCursor(active ? '' : 'pointer');
  };
  const hoverPiece = (event: ThreeEvent<PointerEvent>, piece: Piece) => {
    event.stopPropagation();
    if (!active) setCursor('pointer');
    else setCursor(isMine(piece) ? 'grab' : '');
  };
  const leave = () => setCursor('');

  /** 지금 집을 수 있는 말: 내 말이고 내 차례일 때 */
  const isMine = (piece: Piece) =>
    !resetting && piece.color === HUMAN && chess.turn() === HUMAN;

  const onPiecePointerDown = (
    event: ThreeEvent<PointerEvent>,
    piece: Piece,
  ) => {
    event.stopPropagation();
    if (!active) {
      enter();
      return;
    }
    if (!isMine(piece)) {
      if (chess.turn() !== HUMAN) return; // 컴퓨터가 생각하는 중
      // 상대 말: 잡을 수 있으면 잡는다
      if (selected && targets.some((move) => move.to === piece.square)) {
        tryMove(selected, piece.square);
      }
      return;
    }
    drag.current = {
      id: piece.id,
      from: piece.square,
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
      moved: false,
      wasSelected: selected === piece.square,
    };
    select(piece.square);
  };

  const onBoardPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!active) {
      enter();
      return;
    }
    const board = group.current;
    if (!board) return;
    const local = board.worldToLocal(event.point.clone());
    const square = positionToSquare(local.x, local.z);
    if (selected && square && targets.some((move) => move.to === square)) {
      tryMove(selected, square);
    } else {
      select(null);
    }
  };

  return (
    <group ref={group}>
      {/* 칸을 누르는 면 */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.003}
        onPointerDown={onBoardPointerDown}
        onPointerMove={hoverBoard}
        onPointerOut={leave}
      >
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* 테두리: 판의 일부. 누르면 고른 말만 내려놓는다 */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.002}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (active) select(null);
          else enter();
        }}
        onPointerMove={hoverBoard}
        onPointerOut={leave}
      >
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* 판 바깥: 누르면 물러난다 */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={-0.01}
        onPointerDown={(event) => {
          if (!active) return;
          event.stopPropagation();
          exit();
        }}
        onPointerMove={(event) => {
          event.stopPropagation();
          setCursor('');
        }}
      >
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Targets moves={targets} />

      {winnerPosition && <Spotlight position={winnerPosition} on={spotOn} />}

      {shatteredKing && (
        <Shatter
          geometry={geometries.k}
          material={materials[`${shatteredKing.color}k`]}
          position={shatteredKing.position}
          rotationY={shatteredKing.color === 'b' ? Math.PI : 0}
          reassemble={reassembling}
          onAssembled={onAssembled}
        />
      )}

      {pieces.map((piece) => (
        <PieceMesh
          key={piece.id}
          piece={piece}
          geometry={geometries[piece.type]}
          material={materials[`${piece.color}${piece.type}`]}
          lifted={selected === piece.square && !piece.captured}
          hidden={piece.id === shatteredId}
          dragging={draggingId === piece.id}
          dragPoint={dragPoint}
          onPointerDown={(event) => onPiecePointerDown(event, piece)}
          onPointerMove={(event) => hoverPiece(event, piece)}
          onPointerOut={leave}
          onLand={onLand}
        />
      ))}
    </group>
  );
}

/** 갈 수 있는 칸: 빈 칸은 작은 점, 잡을 수 있는 칸은 고리 */
function Targets({ moves }: { moves: Move[] }) {
  const dot = useMemo(() => new THREE.CircleGeometry(0.13, 32), []);
  const ring = useMemo(() => new THREE.RingGeometry(0.4, 0.47, 48), []);
  // 흰 칸에는 어두운 표시, 검은 칸에는 밝은 표시를 써야 둘 다 보인다
  const materials = useMemo(() => {
    const make = (color: string) =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        toneMapped: false,
      });
    return { onLight: make('#1c1c1c'), onDark: make('#e8e6e1') };
  }, []);

  return (
    <group>
      {/* 승진은 같은 칸으로 가는 수가 말 종류별로 4개라, 칸마다 하나만 그린다 */}
      {[...new Map(moves.map((move) => [move.to, move])).values()].map(
        (move) => {
          const [x, z] = squareToPosition(move.to);
          const capture = Boolean(move.captured);
          const file = FILES.indexOf(move.to[0]);
          const rank = Number(move.to[1]) - 1;
          const lightSquare = (file + rank) % 2 === 1; // a1이 검은 칸
          return (
            <mesh
              key={move.to}
              geometry={capture ? ring : dot}
              material={lightSquare ? materials.onLight : materials.onDark}
              position={[x, 0.006, z]}
              rotation-x={-Math.PI / 2}
              renderOrder={1}
            />
          );
        },
      )}
    </group>
  );
}

function PieceMesh({
  piece,
  geometry,
  material,
  lifted,
  dragging,
  hidden,
  dragPoint,
  onPointerDown,
  onPointerMove,
  onPointerOut,
  onLand,
}: {
  piece: Piece;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  lifted: boolean;
  dragging: boolean;
  hidden: boolean;
  dragPoint: React.RefObject<THREE.Vector3>;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: () => void;
  /** 판에 내려앉은 순간. moved: 다른 칸으로 옮겨 왔는지(아니면 들었다 제자리에 놓음) */
  onLand: (piece: Piece, moved: boolean) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  // 소리를 낼 착지를 기다리는 중인지: 'move'(칸을 옮김) | 'settle'(들었다 내려놓음)
  const flight = useRef<'move' | 'settle' | null>(null);
  const last = useRef({ square: piece.square, airborne: false });
  const { invalidate } = useThree();
  // 처음 자리만 prop으로 주고, 이후 이동은 useFrame에서 애니메이션한다
  const [initial] = useState(() => {
    const [x, z] = squareToPosition(piece.square);
    return [x, 0, z] as [number, number, number];
  });

  useEffect(() => invalidate(), [piece, lifted, dragging, hidden, invalidate]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;

    let tx: number;
    let tz: number;
    let ty: number;
    if (dragging) {
      tx = dragPoint.current.x;
      tz = dragPoint.current.z;
      ty = DRAG_HEIGHT;
    } else {
      [tx, tz] = squareToPosition(piece.square);
      ty = piece.captured ? -0.5 : lifted ? LIFT : 0;
    }

    const dx = tx - mesh.position.x;
    const dz = tz - mesh.position.z;
    const travel = Math.hypot(dx, dz);
    // 칸 사이를 옮길 때는 살짝 떠서 이동하고 내려앉는다
    const arc = dragging ? 0 : Math.min(travel, 1.2) * 0.35;
    const k = 1 - Math.exp(-delta * (dragging ? 28 : 11));
    mesh.position.x += dx * k;
    mesh.position.z += dz * k;
    mesh.position.y += (ty + arc - mesh.position.y) * k;

    // 잡힌 말은 판 아래로 가라앉으며 사라진다
    const scaleTarget = piece.captured ? 0.001 : 1;
    mesh.scale.setScalar(mesh.scale.x + (scaleTarget - mesh.scale.x) * k);
    mesh.visible = !hidden && mesh.scale.x > 0.01;

    // 착지 감지: 칸이 바뀌었거나, 들려 있다가 내려오기 시작하면 기다렸다가 닿을 때 소리
    const airborne = dragging || lifted;
    if (piece.square !== last.current.square) flight.current = 'move';
    else if (last.current.airborne && !airborne) flight.current ??= 'settle';
    last.current = { square: piece.square, airborne };
    if (piece.captured || hidden) flight.current = null;
    if (
      flight.current &&
      !airborne &&
      Math.hypot(tx - mesh.position.x, tz - mesh.position.z) < 0.05 &&
      mesh.position.y < 0.03
    ) {
      onLand(piece, flight.current === 'move');
      flight.current = null;
    }

    const settled =
      travel < 1e-3 &&
      Math.abs(ty - mesh.position.y) < 1e-3 &&
      Math.abs(scaleTarget - mesh.scale.x) < 1e-3;
    if (!settled) invalidate();
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={initial}
      // 원본 나이트는 -z(흑 쪽)를 본다. 흑은 백 쪽을 보도록 돌린다
      rotation={[0, piece.color === 'b' ? Math.PI : 0, 0]}
      castShadow
      receiveShadow
      onPointerDown={piece.captured ? undefined : onPointerDown}
      onPointerMove={piece.captured ? undefined : onPointerMove}
      onPointerOut={onPointerOut}
    />
  );
}

/** 이긴 킹 위에 천천히 켜지고, 물러날 때 천천히 꺼지는 핀 조명 */
function Spotlight({
  position,
  on,
}: {
  position: [number, number, number];
  on: boolean;
}) {
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { invalidate } = useThree();

  useEffect(() => invalidate(), [on, invalidate]);

  useFrame((_, delta) => {
    const spot = light.current;
    if (!spot) return;
    const goal = on ? SPOT_INTENSITY : 0;
    spot.intensity += (goal - spot.intensity) * (1 - Math.exp(-delta * 1.4));
    if (Math.abs(goal - spot.intensity) > 0.01) invalidate();
  });

  return (
    <>
      <primitive object={target} position={[position[0], 0.6, position[2]]} />
      <spotLight
        ref={light}
        // 거의 바로 위에서, 살짝 앞쪽에서 비춘다
        position={[position[0] + 0.5, 7, position[2] + 1.4]}
        target={target}
        angle={0.13}
        penumbra={0.85}
        decay={0}
        intensity={0}
        color="#fff3e3"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
    </>
  );
}
