"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import {
  LinearFilter,
  MathUtils,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";

import type { Uv } from "@/data/neuralProfiles";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uImageAspect;
  uniform float uViewportAspect;
  uniform float uOpacity;
  uniform float uThreshold;
  uniform float uSoftness;
  uniform float uBrightness;
  uniform float uDepth;
  uniform float uMotion;
  uniform float uBlur;
  uniform vec2 uPointer;
  uniform vec2 uTexel;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uViewportAspect > uImageAspect) {
      scale.y = uImageAspect / uViewportAspect;
    } else {
      scale.x = uViewportAspect / uImageAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  vec4 sampleTexture(vec2 uv) {
    vec4 base = texture2D(uTexture, uv);
    if (uBlur < 0.5) return base;
    vec2 spread = uTexel * 2.0;
    return (
      base * 0.36 +
      texture2D(uTexture, uv + vec2(spread.x, 0.0)) * 0.16 +
      texture2D(uTexture, uv - vec2(spread.x, 0.0)) * 0.16 +
      texture2D(uTexture, uv + vec2(0.0, spread.y)) * 0.16 +
      texture2D(uTexture, uv - vec2(0.0, spread.y)) * 0.16
    );
  }

  void main() {
    vec2 uv = coverUv(vUv);
    float waveX = sin((uv.y * 6.4) + uTime * 0.08) * 0.00065;
    float waveY = cos((uv.x * 5.7) - uTime * 0.065) * 0.00055;
    vec2 microscopicDrift = vec2(waveX, waveY) * uMotion;
    vec2 pointerDrift = uPointer * (0.00085 * uDepth) * uMotion;
    vec4 texel = sampleTexture(uv + microscopicDrift + pointerDrift);
    float luminance = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
    float mask = uThreshold < 0.0
      ? 1.0
      : smoothstep(uThreshold, uThreshold + uSoftness, luminance);
    vec3 monochrome = vec3(luminance) * uBrightness;
    gl_FragColor = vec4(monochrome, texel.a * uOpacity * mask);
  }
`;

interface NeuralLayerProps {
  depth: number;
  imageAspect: number;
  imageSize: readonly [number, number];
  opacity: number;
  threshold: number;
  softness: number;
  brightness: number;
  blur?: boolean;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  focusUv?: Uv;
  reducedMotion: boolean;
}

export function NeuralLayer({
  depth,
  imageAspect,
  imageSize,
  opacity,
  threshold,
  softness,
  brightness,
  blur = false,
  pointerRef,
  focusUv,
  reducedMotion,
}: NeuralLayerProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const sourceTexture = useTexture("/neural-reference.png");
  const texture = useMemo(() => {
    const configuredTexture = sourceTexture.clone();
    configuredTexture.colorSpace = SRGBColorSpace;
    configuredTexture.minFilter = LinearFilter;
    configuredTexture.magFilter = LinearFilter;
    configuredTexture.needsUpdate = true;
    return configuredTexture;
  }, [sourceTexture]);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uImageAspect: { value: imageAspect },
      uViewportAspect: { value: size.width / size.height },
      uOpacity: { value: opacity },
      uThreshold: { value: threshold },
      uSoftness: { value: softness },
      uBrightness: { value: brightness },
      uDepth: { value: depth },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uBlur: { value: blur ? 1 : 0 },
      uPointer: { value: new Vector2() },
      uTexel: {
        value: new Vector2(1 / imageSize[0], 1 / imageSize[1]),
      },
    }),
    [
      blur,
      brightness,
      depth,
      imageAspect,
      imageSize,
      opacity,
      reducedMotion,
      size.height,
      size.width,
      softness,
      texture,
      threshold,
    ],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    if (!material || !mesh) return;

    const targetX = reducedMotion ? 0 : pointerRef.current.x;
    const targetY = reducedMotion ? 0 : pointerRef.current.y;
    material.uniforms.uPointer.value.x = MathUtils.damp(
      material.uniforms.uPointer.value.x,
      targetX,
      4,
      delta,
    );
    material.uniforms.uPointer.value.y = MathUtils.damp(
      material.uniforms.uPointer.value.y,
      targetY,
      4,
      delta,
    );
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uViewportAspect.value = size.width / size.height;

    const focusX = focusUv ? (0.5 - focusUv[0]) * depth * 0.08 : 0;
    const focusY = focusUv ? (focusUv[1] - 0.5) * depth * 0.06 : 0;
    mesh.position.x = MathUtils.damp(mesh.position.x, focusX, 2.4, delta);
    mesh.position.y = MathUtils.damp(mesh.position.y, focusY, 2.4, delta);
  });

  return (
    <mesh ref={meshRef} renderOrder={Math.round(depth * 10)}>
      <planeGeometry args={[viewport.width * 1.035, viewport.height * 1.035]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
