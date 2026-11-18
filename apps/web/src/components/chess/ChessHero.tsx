'use client';

import { MeshReflectorMaterial } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ColorTextureLoader, useGeometry } from './assets';
import { asset } from './constants';
import { Game } from './Game';

/**
 * 휴대폰·태블릿(손가락 입력). 반사·그림자 품질을 낮춰 가볍게 그린다 (화면 해상도는 선명함이 먼저라 그대로).
 * 반사는 장면을 한 번 더 그리고 흐리게 하는 무거운 효과라 차이가 크다
 */
const LITE =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;

function Board() {
  const geometry = useGeometry('board');
  const map = useLoader(ColorTextureLoader, asset('textures/board.webp'));
  // 반사 재질은 메시의 로컬 +Z를 반사면의 법선으로 본다.
  // 판은 +Y가 위라서, 형상을 미리 돌려 두고 메시를 반대로 돌려 원위치시킨다
  const reflectorGeometry = useMemo(
    () => geometry.clone().rotateX(Math.PI / 2),
    [geometry],
  );
  return (
    <mesh geometry={reflectorGeometry} rotation-x={-Math.PI / 2} receiveShadow>
      {/* Mac 체스처럼 광택 있는 판에 말이 은은하게 비친다 */}
      <MeshReflectorMaterial
        map={map}
        // 검은 칠 나무처럼 광택을 줘서 테두리가 옆 조명을 받아 배경과 구별되게
        roughness={0.28}
        metalness={0}
        mirror={0.35}
        blur={LITE ? [210, 70] : [420, 140]}
        resolution={LITE ? 512 : 1024}
        mixBlur={1}
        mixStrength={0.9}
        mixContrast={1}
        depthScale={0}
      />
    </mesh>
  );
}

type Fit = {
  /** 가로 화면에서 판이 차지할 화면 폭의 비율 */
  width: number;
  /** 세로 화면(모바일)에서 판이 차지할 화면 폭의 비율 */
  portraitWidth: number;
  /** 기울어진 판과 말이 넘지 않을 화면 높이의 비율 */
  height: number;
  /**
   * 그 각도에서 본 판(말 포함)의 세로 절반 크기. 위에서 내려다볼수록 판의 깊이가
   * 정면으로 보여서 커진다
   */
  depth: number;
};

/**
 * 대기: 타이포(minsu, seo)가 숨 쉴 자리를 남기도록 작게.
 * 노트북처럼 가로로 넓고 세로가 낮은 화면에서는 높이 기준이 판 크기를 정한다.
 */
const IDLE_FIT: Fit = {
  width: 0.46,
  portraitWidth: 0.9,
  height: 0.5,
  depth: 4.4,
};
/** 대국: 타이포가 흐려지니 크게. 단 위·아래가 잘리지 않게 */
const PLAY_FIT: Fit = {
  width: 0.62,
  portraitWidth: 0.98,
  height: 0.9,
  depth: 5.6,
};

/** 화면 비율에 맞춰 판이 정해진 비율만큼 보이도록 카메라 거리를 정한다 */
function fitDistance(fov: number, aspect: number, fit: Fit) {
  const vHalf = THREE.MathUtils.degToRad(fov / 2);
  const hHalf = Math.atan(Math.tan(vHalf) * aspect);
  // 판은 테두리 포함 한 변 10
  const widthShare = aspect < 1 ? fit.portraitWidth : fit.width;
  const byWidth = 5.4 / (Math.tan(hHalf) * widthShare);
  const byHeight = fit.depth / (Math.tan(vHalf) * fit.height);
  return Math.max(byWidth, byHeight);
}

// 대기: 비스듬히. 대국: 더 위에서 내려다보며 가까이 (마우스를 아래로 내렸을 때 기우는 방향)
const IDLE_DIRECTION = new THREE.Vector3(0, 1.1, 1).normalize();
const PLAY_DIRECTION = new THREE.Vector3(0, 2.1, 1).normalize();

function CameraRig({ playing }: { playing: boolean }) {
  const { camera, size, invalidate } = useThree();
  const progress = useRef(0);
  const poses = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const idleDistance = fitDistance(cam.fov, aspect, IDLE_FIT);
    const playDistance = fitDistance(cam.fov, aspect, PLAY_FIT);
    return {
      idle: IDLE_DIRECTION.clone().multiplyScalar(idleDistance),
      play: PLAY_DIRECTION.clone().multiplyScalar(playDistance),
      idleTarget: new THREE.Vector3(0, 0, 0.4),
      playTarget: new THREE.Vector3(0, 0, 0.15),
    };
  }, [camera, size]);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => invalidate(), [playing, poses, invalidate]);

  useFrame((_, delta) => {
    const goal = playing ? 1 : 0;
    const ease = 1 - Math.exp(-delta * 3);
    progress.current += (goal - progress.current) * ease;
    if (Math.abs(goal - progress.current) < 1e-4) progress.current = goal;
    // 부드럽게 출발하고 멈추도록 smoothstep
    const t = THREE.MathUtils.smoothstep(progress.current, 0, 1);
    camera.position.lerpVectors(poses.idle, poses.play, t);
    lookAt.lerpVectors(poses.idleTarget, poses.playTarget, t);
    camera.lookAt(lookAt);
    if (progress.current !== goal) invalidate();
  });
  return null;
}

/** 기울기 센서 값(도)이 이만큼 바뀌면 마우스를 화면 끝까지 옮긴 만큼 기운다 */
const GYRO_RANGE = 20;
/** 스스로 흔들릴 때의 크기 (마우스를 화면 끝까지 옮긴 것을 1로) */
const SWAY = 0.45;

/**
 * 판이 살짝 기운다. 대국 중에는 정면으로 돌아와 고정된다.
 * - 마우스: 커서를 따라 기운다
 * - 손가락 기기: 손가락은 닿아 있을 때만 위치가 있어 따라가면 어색하다. 대신 숨 쉬듯 천천히
 *   저절로 흔들리고, 기울기 센서를 허락 없이 쓸 수 있으면(안드로이드) 폰을 기울이는 대로 따라온다
 */
function Tilt({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  /** 기울기 센서가 값을 보내오고 있는지. 그러면 저절로 흔들리기는 멈춘다 */
  const gyro = useRef(false);
  /** 판이 화면에 보이는지. 안 보이면 흔들기를 멈춰 배터리를 아낀다 */
  const onScreen = useRef(true);
  const [reduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const { invalidate, gl } = useThree();

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (event.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [invalidate, reduceMotion]);

  // 기울기 센서. 아이폰은 허락 창이 필요해서(requestPermission) 쓰지 않는다
  useEffect(() => {
    if (reduceMotion || !LITE) return;
    const Orientation = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & { requestPermission?: unknown })
      | undefined;
    if (!Orientation || typeof Orientation.requestPermission === 'function') {
      return;
    }
    // 폰을 들고 있는 자세를 기준으로 삼고, 그 기준은 천천히 지금 자세를 따라간다.
    // 그래서 기울이면 판이 따라 기울었다가, 그 자세로 들고 있으면 서서히 가운데로 돌아온다
    let base: { x: number; y: number } | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      const angle = screen.orientation?.angle ?? 0;
      // 가로로 돌려 들면 좌우·앞뒤 축이 바뀐다
      const x =
        angle === 90 ? event.beta : angle === 270 ? -event.beta : event.gamma;
      const y =
        angle === 90 ? -event.gamma : angle === 270 ? event.gamma : event.beta;
      base ??= { x, y };
      base.x += (x - base.x) * 0.005;
      base.y += (y - base.y) * 0.005;
      const clamp = (v: number) => THREE.MathUtils.clamp(v, -1, 1);
      target.current.x = clamp((x - base.x) / GYRO_RANGE);
      target.current.y = clamp((y - base.y) / GYRO_RANGE);
      gyro.current = true;
      invalidate();
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [invalidate, reduceMotion]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      onScreen.current = entry.isIntersecting;
      invalidate();
    });
    observer.observe(gl.domElement);
    return () => observer.disconnect();
  }, [gl, invalidate]);

  useEffect(() => invalidate(), [locked, invalidate]);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    // 손가락 기기에서 센서가 없으면 숨 쉬듯 천천히 (주기가 다른 두 물결을 겹쳐 반복이 덜 보이게)
    const sway = LITE && !gyro.current && !reduceMotion && !locked;
    if (sway && onScreen.current) {
      const t = clock.elapsedTime;
      target.current.x = Math.sin(t * 0.42) * SWAY;
      target.current.y = Math.sin(t * 0.29 + 1.3) * SWAY * 0.8;
    }
    const ease = 1 - Math.exp(-delta * (sway ? 2 : 4));
    const ty = locked ? 0 : target.current.x * 0.12;
    const tx = locked ? 0 : target.current.y * 0.05;
    g.rotation.y += (ty - g.rotation.y) * ease;
    g.rotation.x += (tx - g.rotation.x) * ease;
    if (
      (sway && onScreen.current) ||
      Math.abs(ty - g.rotation.y) > 1e-4 ||
      Math.abs(tx - g.rotation.x) > 1e-4
    ) {
      invalidate();
    }
  });

  return <group ref={group}>{children}</group>;
}

/**
 * 반사용 환경광. 외부 HDR 없이 빛나는 판(조명판) 몇 장을 둘러 세우고, 그 장면을 한 번 찍어
 * 주변 풍경으로 쓴다. 광택 있는 말·판에 비치는 하이라이트가 여기서 나온다.
 * (drei의 Environment·Lightformer와 같은 방식. drei 것은 HDR·EXR 로더까지 번들에 끌고 와서 직접 만든다)
 */
type Former = {
  intensity: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number];
};
const FORMERS: Former[] = [
  // 위: 큰 소프트박스
  {
    intensity: 1.6,
    position: [0, 7, 1],
    rotation: [-Math.PI / 2, 0, 0],
    scale: [12, 7],
  },
  // 왼쪽·오른쪽: 세로로 긴 스트립 조명. 말 옆면에 긴 하이라이트를 만든다
  {
    intensity: 3.2,
    position: [-7, 3, 1],
    rotation: [0, Math.PI / 2, 0],
    scale: [2, 8],
  },
  {
    intensity: 2,
    position: [7, 3, -1],
    rotation: [0, -Math.PI / 2, 0],
    scale: [2, 8],
  },
  // 뒤 위: 넓고 은은한 판. 광택 있는 판·테두리에 비쳐 결이 드러나고 배경과 구별된다
  {
    intensity: 0.9,
    position: [0, 7, -9],
    rotation: [Math.PI / 6, 0, 0],
    scale: [18, 7],
  },
  // 뒤: 윤곽을 살리는 림 조명
  { intensity: 1.5, position: [0, 3, -8], scale: [10, 2] },
];

function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const target = useMemo(() => {
    const studio = new THREE.Scene();
    const plane = new THREE.PlaneGeometry();
    const materials: THREE.Material[] = [];
    for (const former of FORMERS) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 1).multiplyScalar(former.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(plane, material);
      mesh.position.set(...former.position);
      if (former.rotation) mesh.rotation.set(...former.rotation);
      mesh.scale.set(former.scale[0], former.scale[1], 1);
      studio.add(mesh);
    }
    const cube = new THREE.WebGLCubeRenderTarget(256, {
      type: THREE.HalfFloatType,
    });
    new THREE.CubeCamera(1, 1000, cube).update(gl, studio);
    plane.dispose();
    materials.forEach((material) => material.dispose());
    return cube;
  }, [gl]);
  // 여기서 dispose하지 않는다. 개발 모드(StrictMode)는 effect를 한 번 정리했다 다시 실행하는데,
  // useMemo 값은 그대로라 정리 때 지운 텍스처를 계속 쓰게 되어 반사·광택이 사라진다.
  // 캔버스가 사라질 때 WebGL 컨텍스트째 정리되므로 따로 지울 필요가 없다

  // 장면(scene)의 environment로 붙는다
  return <primitive object={target.texture} attach="environment" />;
}

/** 대국이 끝나면 판 전체를 이 비율까지 어둡게 한다 (이긴 킹만 핀 조명을 받는다) */
const DIMMED = 0.18;

function Lights({ dimmed }: { dimmed: boolean }) {
  const ambient = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const level = useRef(1);
  const { invalidate } = useThree();

  useEffect(() => invalidate(), [dimmed, invalidate]);

  useFrame(({ scene }, delta) => {
    const goal = dimmed ? DIMMED : 1;
    level.current += (goal - level.current) * (1 - Math.exp(-delta * 1.2));
    if (Math.abs(goal - level.current) < 1e-3) level.current = goal;
    if (ambient.current) ambient.current.intensity = 0.2 * level.current;
    if (key.current) key.current.intensity = 1.9 * level.current;
    scene.environmentIntensity = level.current;
    if (level.current !== goal) invalidate();
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.2} />
      <directionalLight
        ref={key}
        // 위에서 바로 내리꽂기보다 비스듬히: 윗면이 하얗게 날아가지 않고 옆면에 음영이 생긴다
        position={[-7, 7, 5]}
        intensity={1.9}
        castShadow
        shadow-mapSize={LITE ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <StudioEnvironment />
    </>
  );
}

/**
 * 체스 책의 판 그림 아래 설명 줄처럼, 판 바로 밑에 붙는 HTML 요소의 세로 위치(px)를 알려 준다.
 * 판 앞쪽 아래 모서리가 화면 어디에 그려지는지 그릴 때마다 계산한다
 */
const CAPTION_GAP = 28;

function CaptionAnchor({
  onCaptionTop,
}: {
  onCaptionTop?: (top: number) => void;
}) {
  const geometry = useGeometry('board');
  const { camera, size } = useThree();
  const edge = useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    return new THREE.Vector3(0, box.min.y, box.max.z);
  }, [geometry]);
  const projected = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!onCaptionTop) return;
    projected.copy(edge).project(camera);
    const y = ((1 - projected.y) / 2) * size.height + CAPTION_GAP;
    // 다가가서 판이 커져도 설명 줄이 화면 밖으로 나가지 않게
    onCaptionTop(Math.min(y, size.height - 40));
  });
  return null;
}

/** Suspense 안에 두면 모델·텍스처를 다 불러온 뒤에야 그려진다. 그 순간을 알린다 */
function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

export type ChessStatus = string | null;

export function ChessHero({
  onPlayingChange,
  onStatus,
  onCaptionTop,
  onReady,
}: {
  onPlayingChange?: (playing: boolean) => void;
  /** 대국 상태 한 줄 (예: White to move). 대기 중에는 null */
  onStatus?: (status: ChessStatus) => void;
  /** 판 아래 설명 줄이 놓일 세로 위치(px). React를 다시 그리지 않도록 요소를 직접 옮기는 데 쓴다 */
  onCaptionTop?: (top: number) => void;
  /** 판과 말을 다 불러와 처음 그릴 수 있게 됐을 때 */
  onReady?: () => void;
}) {
  // 판을 누르면 다가가서 둘 수 있게 되고, 판 바깥을 누르면 물러난다
  const [playing, setPlaying] = useState(false);
  // 대국이 끝나면 조명을 낮추고 이긴 킹만 비춘다
  const [dimmed, setDimmed] = useState(false);
  const setMode = (next: boolean) => {
    setPlaying(next);
    onPlayingChange?.(next);
  };

  return (
    <Canvas
      frameloop="demand"
      shadows="soft"
      dpr={[1, 2]}
      camera={{ fov: 30, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      // 기본 ACES 톤매핑은 흰색을 칙칙하게 눌러서 흑백 대비가 죽는다
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
      }}
      // 판·바닥 어디에도 맞지 않은 곳(화면 위쪽 빈 곳)을 눌러도 물러난다
      onPointerMissed={() => {
        if (playing) setMode(false);
      }}
      style={{
        background: 'transparent',
        // 손가락으로 말을 끌 때 페이지가 대신 스크롤되지 않게, 다가가 있는 동안만 스크롤을 막는다.
        // 대기 중에는 판 위를 쓸어도 페이지가 내려간다
        touchAction: playing ? 'none' : 'auto',
      }}
    >
      <CameraRig playing={playing} />
      <Suspense fallback={null}>
        <Lights dimmed={dimmed} />
        <CaptionAnchor onCaptionTop={onCaptionTop} />
        <Ready onReady={onReady} />
        <Tilt locked={playing}>
          <Board />
          <Game
            active={playing}
            onEnter={() => setMode(true)}
            onExit={() => setMode(false)}
            onSpotlight={setDimmed}
            onStatus={onStatus}
          />
        </Tilt>
      </Suspense>
    </Canvas>
  );
}

export default ChessHero;
