"use client";

import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";

import type { Uv } from "@/data/neuralProfiles";

export type NeuralMaskMode = "base" | "branches" | "somas";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uViewportAspect;
  uniform float uMaskMode;
  uniform float uOpacity;
  uniform float uBrightness;
  uniform float uContrast;
  uniform vec2 uOffset;
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

  float luminanceAt(vec2 uv) {
    vec3 color = texture2D(uTexture, uv).rgb;
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 uv = coverUv(vUv) + uOffset;
    vec4 source = texture2D(uTexture, uv);
    float luminance = dot(source.rgb, vec3(0.299, 0.587, 0.114));

    vec2 branchSpread = uTexel * 9.0;
    float branchDensity = (
      luminance +
      luminanceAt(uv + vec2(branchSpread.x, 0.0)) +
      luminanceAt(uv - vec2(branchSpread.x, 0.0)) +
      luminanceAt(uv + vec2(0.0, branchSpread.y)) +
      luminanceAt(uv - vec2(0.0, branchSpread.y))
    ) / 5.0;

    vec2 somaSpread = uTexel * 22.0;
    float somaDensity = (
      branchDensity +
      luminanceAt(uv + vec2(somaSpread.x, somaSpread.y)) +
      luminanceAt(uv + vec2(-somaSpread.x, somaSpread.y)) +
      luminanceAt(uv + vec2(somaSpread.x, -somaSpread.y)) +
      luminanceAt(uv - somaSpread)
    ) / 5.0;

    float mask = 1.0;
    if (uMaskMode > 0.5 && uMaskMode < 1.5) {
      mask =
        smoothstep(0.14, 0.34, branchDensity) *
        smoothstep(0.10, 0.28, luminance);
    } else if (uMaskMode >= 1.5) {
      mask =
        smoothstep(0.16, 0.38, somaDensity) *
        smoothstep(0.48, 0.78, luminance);
    }

    float adjusted = clamp(
      ((luminance - 0.5) * uContrast + 0.5) * uBrightness,
      0.0,
      1.0
    );
    vec3 monochrome = vec3(adjusted);
    if (uMaskMode > 0.5) {
      monochrome *= vec3(0.985, 1.0, 1.012);
    }

    gl_FragColor = vec4(monochrome, source.a * uOpacity * mask);
  }
`;

interface NeuralLayerProps {
  maskMode: NeuralMaskMode;
  imageAspect: number;
  imageSize: readonly [number, number];
  opacity: number;
  brightness: number;
  contrast: number;
  parallaxPixels: number;
  renderOrder: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  focusUv?: Uv;
  reducedMotion: boolean;
}

const maskValues: Record<NeuralMaskMode, number> = {
  base: 0,
  branches: 1,
  somas: 2,
};

export function NeuralLayer({
  maskMode,
  imageAspect,
  imageSize,
  opacity,
  brightness,
  contrast,
  parallaxPixels,
  renderOrder,
  pointerRef,
  focusUv,
  reducedMotion,
}: NeuralLayerProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const sourceTexture = useTexture("/neural-reference.png");
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const anisotropy = useThree((state) =>
    Math.min(8, state.gl.capabilities.getMaxAnisotropy()),
  );
  const texture = useMemo(() => {
    const configuredTexture = sourceTexture.clone();
    configuredTexture.colorSpace = SRGBColorSpace;
    configuredTexture.minFilter = LinearMipmapLinearFilter;
    configuredTexture.magFilter = LinearFilter;
    configuredTexture.anisotropy = anisotropy;
    configuredTexture.generateMipmaps = true;
    configuredTexture.needsUpdate = true;
    return configuredTexture;
  }, [anisotropy, sourceTexture]);
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uImageAspect: { value: imageAspect },
      uViewportAspect: { value: size.width / size.height },
      uMaskMode: { value: maskValues[maskMode] },
      uOpacity: { value: opacity },
      uBrightness: { value: brightness },
      uContrast: { value: contrast },
      uOffset: { value: new Vector2() },
      uTexel: {
        value: new Vector2(1 / imageSize[0], 1 / imageSize[1]),
      },
    }),
    [
      brightness,
      contrast,
      imageAspect,
      imageSize,
      maskMode,
      opacity,
      size.height,
      size.width,
      texture,
    ],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const pointerX = reducedMotion ? 0 : pointerRef.current.x;
    const pointerY = reducedMotion ? 0 : pointerRef.current.y;
    const idleStrength = reducedMotion ? 0 : Math.min(1.2, parallaxPixels * 0.12);
    const focusX = focusUv ? (focusUv[0] - 0.5) * -0.7 : 0;
    const focusY = focusUv ? (focusUv[1] - 0.5) * 0.7 : 0;
    const time = state.clock.elapsedTime;
    const targetPixelX =
      pointerX * parallaxPixels +
      Math.sin(time * 0.11 + renderOrder) * idleStrength +
      focusX;
    const targetPixelY =
      pointerY * parallaxPixels +
      Math.cos(time * 0.09 + renderOrder) * idleStrength +
      focusY;

    const offset = material.uniforms.uOffset.value as Vector2;
    offset.x = MathUtils.damp(
      offset.x,
      targetPixelX / Math.max(1, size.width),
      3.6,
      delta,
    );
    offset.y = MathUtils.damp(
      offset.y,
      -targetPixelY / Math.max(1, size.height),
      3.6,
      delta,
    );
    material.uniforms.uViewportAspect.value = size.width / size.height;
  });

  return (
    <mesh renderOrder={renderOrder}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={maskMode !== "base"}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
