'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { playChip, playCrack } from './sound';

/**
 * 체크메이트된 킹이 깨지는 연출.
 * 1) 잠깐 부르르 떨다가 (예고 동작이 있어야 깨지는 게 실감 난다)
 * 2) 킹 안쪽에 무작위 기준점을 찍고, 표면 삼각형을 가장 가까운 기준점으로 묶어
 *    크기·모양이 제각각인 덩어리로 쪼갠다 (보로노이 방식)
 * 3) 덩어리는 무너지듯 쏟아져 판 위에서 튕기고 미끄러지다 멈춘다.
 * 새 판을 시작하면(reassemble) 조각들이 거꾸로 날아와 다시 붙는다.
 */

/** 덩어리 수. 적을수록 크게 깨진다 */
const CHUNKS = 14;
/** 깨지기 전에 떠는 시간(초) */
const TREMBLE = 0.3;
const GRAVITY = 20;
const BOUNCE = 0.22;
/** 판에 닿아 있는 동안의 미끄럼 마찰 (클수록 빨리 멈춘다) */
const SLIDE_FRICTION = 5;
/** 판 윗면의 범위 (테두리 포함 한 변 10) */
const BOARD_HALF = 5;
/** 다시 붙을 때: 조각 하나가 제자리로 날아오는 시간(초)과 조각 사이 시차 */
const REWIND = 0.85;
const STAGGER = 0.025;
const IDENTITY = new THREE.Quaternion();

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Chunk = {
  geometry: THREE.BufferGeometry;
  center: THREE.Vector3;
  /** 덩어리 중심에서 바닥까지의 대략적인 거리. 판 위에 얹힐 높이 */
  rest: number;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
};

/** 같은 입력에는 같은 값을 내는 의사 난수 (렌더가 매번 같은 결과를 내도록) */
function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildChunks(source: THREE.BufferGeometry): Chunk[] {
  const geometry = source.index ? source.toNonIndexed() : source;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  const triangles = position.count / 3;

  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const height = box.max.y - box.min.y;
  const radius = Math.max(box.max.x, box.max.z);

  // 기준점: 높이는 고르게 나누고, 둘레 방향·반지름은 무작위로
  const seeds = Array.from({ length: CHUNKS }, (_, i) => {
    const y = box.min.y + ((i + seeded(i + 7)) / CHUNKS) * height;
    const angle = seeded(i + 31) * Math.PI * 2;
    const r = seeded(i + 59) * radius * 0.8;
    return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
  });

  const groups = seeds.map(() => [] as number[]);
  const c = new THREE.Vector3();
  for (let t = 0; t < triangles; t++) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) {
      c.x += position.getX(t * 3 + k) / 3;
      c.y += position.getY(t * 3 + k) / 3;
      c.z += position.getZ(t * 3 + k) / 3;
    }
    let nearest = 0;
    let best = Infinity;
    seeds.forEach((seed, i) => {
      const d = seed.distanceToSquared(c);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    groups[nearest].push(t);
  }

  return groups
    .filter((list) => list.length > 0)
    .map((list, index) => {
      const center = new THREE.Vector3();
      for (const t of list) {
        for (let k = 0; k < 3; k++) {
          center.x += position.getX(t * 3 + k);
          center.y += position.getY(t * 3 + k);
          center.z += position.getZ(t * 3 + k);
        }
      }
      center.divideScalar(list.length * 3);

      const pos: number[] = [];
      const nor: number[] = [];
      const tex: number[] = [];
      let extent = 0;
      for (const t of list) {
        for (let k = 0; k < 3; k++) {
          const v = t * 3 + k;
          const x = position.getX(v) - center.x;
          const y = position.getY(v) - center.y;
          const z = position.getZ(v) - center.z;
          pos.push(x, y, z);
          nor.push(normal.getX(v), normal.getY(v), normal.getZ(v));
          if (uv) tex.push(uv.getX(v), uv.getY(v));
          extent = Math.max(extent, Math.hypot(x, y, z));
        }
      }
      const chunk = new THREE.BufferGeometry();
      chunk.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      chunk.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      if (uv)
        chunk.setAttribute('uv', new THREE.Float32BufferAttribute(tex, 2));

      // 무너지듯: 위로는 조금만, 바깥으로 적당히. 높은 덩어리일수록 더 멀리 떨어진다
      const r1 = seeded(index + 1);
      const r2 = seeded(index + 101);
      const r3 = seeded(index + 211);
      const out = new THREE.Vector3(center.x, 0, center.z);
      if (out.lengthSq() < 1e-4) out.set(r1 - 0.5, 0, r2 - 0.5);
      out
        .normalize()
        .multiplyScalar(0.5 + r1 * 0.9 + (center.y / height) * 0.8);
      const velocity = new THREE.Vector3(out.x, 0.4 + r2 * 1.4, out.z);
      const spin = new THREE.Vector3(
        r1 - 0.5,
        r2 - 0.5,
        r3 - 0.5,
      ).multiplyScalar(7);

      return { geometry: chunk, center, rest: extent * 0.4, velocity, spin };
    });
}

type State = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  resting: boolean;
};

export function Shatter({
  geometry,
  material,
  position,
  rotationY,
  reassemble = false,
  onAssembled,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: [number, number, number];
  rotationY: number;
  /** true가 되면 조각들이 날아온 길을 거슬러 원래 자리로 모여 다시 붙는다 */
  reassemble?: boolean;
  onAssembled?: () => void;
}) {
  const chunks = useMemo(() => buildChunks(geometry), [geometry]);
  const maxRest = useMemo(
    () => Math.max(...chunks.map((chunk) => chunk.rest)),
    [chunks],
  );
  // 덩어리는 속이 비어 보이지 않게 양면으로 그린다
  const chunkMaterial = useMemo(() => {
    const clone = material.clone();
    clone.side = THREE.DoubleSide;
    // 모델은 속이 빈 껍데기라 조각 안쪽 면이 보인다. 안쪽 면을 칠하지 않은 생나무 색으로 칠해
    // 속이 꽉 찬 나무가 쪼개진 것처럼 보이게 한다
    clone.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        if (!gl_FrontFacing) {
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.58, 0.53, 0.46), 0.9);
        }`,
      );
    };
    clone.customProgramCacheKey = () => 'shatter-raw-wood';
    return clone;
  }, [material]);

  const whole = useRef<THREE.Mesh>(null);
  const pieces = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const states = useRef<State[] | null>(null);
  const elapsed = useRef(0);
  const rewind = useRef<{
    from: { position: THREE.Vector3; quaternion: THREE.Quaternion }[];
    time: number;
    done: boolean;
  } | null>(null);
  const { invalidate } = useThree();

  useEffect(() => invalidate(), [reassemble, invalidate]);
  // 세로축 회전은 '바깥쪽'·'아래쪽'을 바꾸지 않으므로 물리는 킹의 로컬 좌표에서 계산하고,
  // 판 위인지 판단할 때만 판 기준 좌표로 바꾼다
  const toBoard = useMemo(
    () =>
      new THREE.Matrix4()
        .makeRotationY(rotationY)
        .setPosition(position[0], position[1], position[2]),
    [rotationY, position],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    elapsed.current += delta;

    // 0) 다시 붙기: 지금 자리에서 원래 자리·방향으로, 살짝 호를 그리며 모인다
    if (reassemble) {
      if (whole.current) whole.current.visible = false;
      if (pieces.current) pieces.current.visible = true;
      rewind.current ??= {
        from: meshes.current.map((mesh) => ({
          position: mesh?.position.clone() ?? new THREE.Vector3(),
          quaternion: mesh?.quaternion.clone() ?? new THREE.Quaternion(),
        })),
        time: 0,
        done: false,
      };
      const r = rewind.current;
      if (r.done) return;
      r.time += delta;
      let all = true;
      meshes.current.forEach((mesh, i) => {
        if (!mesh) return;
        mesh.visible = true;
        const t = THREE.MathUtils.clamp((r.time - i * STAGGER) / REWIND, 0, 1);
        if (t < 1) all = false;
        const e = easeInOutCubic(t);
        mesh.position.lerpVectors(r.from[i].position, chunks[i].center, e);
        mesh.position.y += Math.sin(Math.PI * e) * 0.3;
        mesh.quaternion.slerpQuaternions(r.from[i].quaternion, IDENTITY, e);
      });
      invalidate();
      if (all) {
        r.done = true;
        onAssembled?.();
      }
      return;
    }

    // 1) 부르르 떨기
    if (elapsed.current < TREMBLE) {
      const king = whole.current;
      if (king) {
        const strength = 0.012 + (elapsed.current / TREMBLE) * 0.03;
        king.position.set(
          (Math.random() - 0.5) * strength,
          0,
          (Math.random() - 0.5) * strength,
        );
        king.rotation.z = (Math.random() - 0.5) * strength * 2;
      }
      invalidate();
      return;
    }
    if (whole.current) whole.current.visible = false;
    if (pieces.current) pieces.current.visible = true;

    // 2) 깨져서 떨어지기
    if (!states.current) playCrack();
    states.current ??= chunks.map((chunk) => ({
      position: chunk.center.clone(),
      velocity: chunk.velocity.clone(),
      spin: chunk.spin.clone(),
      resting: false,
    }));

    const board = new THREE.Vector3();
    let moving = false;
    states.current.forEach((state, i) => {
      const mesh = meshes.current[i];
      if (!mesh || state.resting) return;
      moving = true;
      const rest = chunks[i].rest;

      state.velocity.y -= GRAVITY * delta;
      state.position.addScaledVector(state.velocity, delta);

      board.copy(state.position).applyMatrix4(toBoard);
      const onBoard =
        Math.abs(board.x) < BOARD_HALF && Math.abs(board.z) < BOARD_HALF;

      if (onBoard && board.y < rest) {
        // 판에 닿음: 얹히고, 튕기고, 미끄러지다 멈춘다
        state.position.y += rest - board.y;
        // 세게 부딪힐 때만 소리 (미끄러지며 살짝 닿는 건 조용히)
        if (state.velocity.y < -1.2) {
          playChip(-state.velocity.y / 8, chunks[i].rest / maxRest);
        }
        if (state.velocity.y < 0) state.velocity.y *= -BOUNCE;
        const slide = Math.exp(-SLIDE_FRICTION * delta);
        state.velocity.x *= slide;
        state.velocity.z *= slide;
        state.spin.multiplyScalar(slide);
        if (state.velocity.length() < 0.08 && state.spin.length() < 0.2) {
          state.resting = true;
        }
      }
      // 판 밖: 떨어져 사라진다
      if (board.y < -3) {
        mesh.visible = false;
        state.resting = true;
      }

      mesh.position.copy(state.position);
      mesh.rotation.x += state.spin.x * delta;
      mesh.rotation.y += state.spin.y * delta;
      mesh.rotation.z += state.spin.z * delta;
    });
    if (moving) invalidate();
  });

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh ref={whole} geometry={geometry} material={material} castShadow />
      <group ref={pieces} visible={false}>
        {chunks.map((chunk, i) => (
          <mesh
            key={i}
            ref={(mesh) => {
              meshes.current[i] = mesh;
            }}
            geometry={chunk.geometry}
            material={chunkMaterial}
            position={chunk.center}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    </group>
  );
}
