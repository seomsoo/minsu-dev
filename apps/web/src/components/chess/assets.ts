import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  NAMES,
  TYPES,
  asset,
  modelUrl,
  type Color,
  type PieceType,
} from './constants';

/**
 * three.js 기본 로더만 쓴다. drei의 useGLTF·useTexture는 압축 모델 해제기(Draco·KTX2·Meshopt)까지
 * 번들에 끌고 와서, 압축하지 않은 이 모델에는 필요 없는 코드가 커진다
 */

/** 색 텍스처(sRGB). 불러오는 순간 색 공간과 비스듬히 볼 때의 선명도를 맞춘다 */
export class ColorTextureLoader extends THREE.TextureLoader {
  load(
    url: string,
    onLoad?: (texture: THREE.Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ) {
    return super.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        onLoad?.(texture);
      },
      onProgress,
      onError,
    );
  }
}

export function useGeometry(name: string) {
  const { scene } = useLoader(GLTFLoader, modelUrl(name));
  return useMemo(() => {
    let geometry: THREE.BufferGeometry | undefined;
    scene.traverse((child) => {
      if (!geometry && (child as THREE.Mesh).isMesh) {
        geometry = (child as THREE.Mesh).geometry;
      }
    });
    return geometry!;
  }, [scene]);
}

export function usePieceGeometries(): Record<PieceType, THREE.BufferGeometry> {
  return {
    p: useGeometry('pawn'),
    n: useGeometry('knight'),
    b: useGeometry('bishop'),
    r: useGeometry('rook'),
    q: useGeometry('queen'),
    k: useGeometry('king'),
  };
}

/** 말 종류별 굴곡(normal)·음영/거칠기(orm) 맵. 색이 아닌 데이터라 sRGB로 바꾸지 않는다 */
const PIECE_MAP_KEYS = TYPES.flatMap((type) => [
  `${type}-normal`,
  `${type}-orm`,
]);
const PIECE_MAP_URLS = TYPES.flatMap((type) => [
  asset(`textures/${NAMES[type]}-normal.jpg`),
  asset(`textures/${NAMES[type]}-orm.jpg`),
]);

export function usePieceMaterials() {
  const [white, black] = useLoader(ColorTextureLoader, [
    asset('textures/white.jpg'),
    asset('textures/black.jpg'),
  ]);
  const loaded = useLoader(THREE.TextureLoader, PIECE_MAP_URLS);
  const maps = useMemo(
    () => Object.fromEntries(PIECE_MAP_KEYS.map((key, i) => [key, loaded[i]])),
    [loaded],
  );

  return useMemo(() => {
    const materials = {} as Record<`${Color}${PieceType}`, THREE.Material>;
    for (const color of ['w', 'b'] as const) {
      for (const type of TYPES) {
        materials[`${color}${type}`] = new THREE.MeshPhysicalMaterial({
          map: color === 'w' ? white : black,
          normalMap: maps[`${type}-normal`],
          aoMap: maps[`${type}-orm`],
          roughnessMap: maps[`${type}-orm`],
          // Apple 셰이더: roughness = 맵 값 × 0.8
          roughness: 0.8,
          metalness: 0,
          // 칠한 나무처럼 표면에 얇은 광택층을 얹는다
          clearcoat: 0.7,
          clearcoatRoughness: 0.14,
          // 고리 홈·이음매가 갈라져 보이도록 원본 AO와 굴곡을 조금 과장한다
          aoMapIntensity: 1.6,
          normalScale: new THREE.Vector2(1.5, 1.5),
        });
      }
    }
    return materials;
  }, [white, black, maps]);
}

for (const name of [...Object.values(NAMES), 'board']) {
  useLoader.preload(GLTFLoader, modelUrl(name));
}
