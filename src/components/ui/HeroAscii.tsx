'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader, TextGeometry } from 'three-stdlib';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';

export const HeroAscii = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const originalGetContext = HTMLCanvasElement.prototype.getContext as any;
    (HTMLCanvasElement.prototype as any).getContext = function (
      this: HTMLCanvasElement,
      type: string,
      options?: any,
    ) {
      if (type === '2d') {
        return originalGetContext.call(this, type, {
          ...options,
          willReadFrequently: true,
        });
      }
      return originalGetContext.call(this, type, options);
    };

    //  Scene & Camera

    const scene = new THREE.Scene();
    const group = new THREE.Group();
    scene.add(group);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, -0.5, 5); // 살짝 아래에서 올려다보기
    camera.lookAt(0, 0, 0);

    //  Renderer & ASCII Effect

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
    });

    const effect = new AsciiEffect(renderer, ' .,:;i1tfLCG08@', {
      invert: false,
    });

    const getResponsiveConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isMobile = width < 768;

      const lighting = isMobile
        ? { ambient: 0.05, main: 2.8, top: 1.2, rim: 0.8 }
        : { ambient: 0.15, main: 1.9, top: 0.8, rim: 0.5 };

      if (width < 480) {
        // 모바일 소형
        return { fontSize: '2px', cameraZ: 3.5, scale: 0.35, lighting };
      } else if (width < 768) {
        // 모바일/태블릿
        return { fontSize: '6px', cameraZ: 4, scale: 0.4, lighting };
      } else if (width <= 1024 && isPortrait) {
        // 태블릿 세로 (아이패드 프로 등)
        return { fontSize: '5px', cameraZ: 4, scale: 0.56, lighting };
      } else if (width < 1024) {
        // 태블릿/소형 데스크탑
        return { fontSize: '6px', cameraZ: 4, scale: 0.75, lighting };
      } else if (width < 1440) {
        // 중형 데스크탑
        return { fontSize: '7px', cameraZ: 5, scale: 1, lighting };
      }
      // 대형 데스크탑
      return { fontSize: '8px', cameraZ: 5, scale: 1, lighting };
    };

    //  Lighting

    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.9);
    mainLight.position.set(4, 4, 6);
    scene.add(mainLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 6, 2);
    scene.add(topLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 0, -6);
    scene.add(rimLight);

    const applyResponsiveConfig = () => {
      const config = getResponsiveConfig();

      // ASCII 해상도
      effect.domElement.style.fontSize = config.fontSize;
      effect.domElement.style.lineHeight = config.fontSize;

      // 카메라 거리
      camera.position.setZ(config.cameraZ);

      // 3D 스케일
      group.scale.setScalar(config.scale);

      // 조명 강도
      ambient.intensity = config.lighting.ambient;
      mainLight.intensity = config.lighting.main;
      topLight.intensity = config.lighting.top;
      rimLight.intensity = config.lighting.rim;
    };

    const resize = () => {
      if (!mountRef.current) return;
      const { width, height } = mountRef.current.getBoundingClientRect();
      effect.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      applyResponsiveConfig();
    };

    mountRef.current.appendChild(effect.domElement);
    applyResponsiveConfig();
    resize();
    window.addEventListener('resize', resize);

    //  3D Text

    const loader = new FontLoader();

    loader.load('/fonts/JetBrainsMono_Bold.typeface.json', (font) => {
      const geometry = new TextGeometry('< />', {
        font,
        size: 1.2,
        height: 0.8,
        curveSegments: 24,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.08,
      });

      geometry.center();

      const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.95,
        metalness: 0.15,
      });

      const textMesh = new THREE.Mesh(geometry, material);
      group.add(textMesh);

      group.rotation.x = 0.15;
      group.rotation.y = -0.1;
    });

    //  Interaction (Mouse + Gyro)

    let targetX = 0;
    let targetY = 0;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 마우스 (데스크탑)
    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 자이로 (모바일) - three-stdlib 패턴
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      targetX = (event.gamma / 45) * 1;
      targetY = ((event.beta - 45) / 45) * 1;
    };

    // 자이로 연결 (three-stdlib DeviceOrientationControls.connect 패턴)
    const connectGyro = () => {
      // iOS 13+ 체크 (window.DeviceOrientationEvent 사용)
      if (
        window.DeviceOrientationEvent !== undefined &&
        typeof (window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
      ) {
        (window.DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
          .requestPermission()
          .then((response) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch((error) => {
            console.error('DeviceOrientation permission error:', error);
          });
      } else {
        // Android, 구형 iOS
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    // 모바일: 터치 시 권한 요청
    if (isMobile) {
      window.addEventListener('touchstart', connectGyro, { once: true });
    }

    let currentX = 0;
    let currentY = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;

      group.rotation.y = -0.1 + currentX * 0.7;
      group.rotation.x = 0.15 + currentY * 0.5;

      effect.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('touchstart', connectGyro);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mountRef.current?.removeChild(effect.domElement);
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
};
