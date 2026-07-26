"use client";

import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense } from "react";

import type {
  NetworkLayout,
  NeuralProfile,
  Uv,
} from "@/data/neuralProfiles";
import type { QualityTier } from "@/lib/qualityTier";
import { NeuralLayer } from "@/components/neural/NeuralLayer";
import {
  PulseSystem,
  type PulseEvent,
} from "@/components/neural/PulseSystem";

interface NeuralSceneProps {
  profile: NeuralProfile;
  layout: NetworkLayout;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  focusUv?: Uv;
  pulseEvent?: PulseEvent;
  reducedMotion: boolean;
  qualityTier: QualityTier;
}

function Scene({
  profile,
  layout,
  pointerRef,
  focusUv,
  pulseEvent,
  reducedMotion,
  qualityTier,
}: NeuralSceneProps) {
  const imageSize = [profile.image.width, profile.image.height] as const;
  const includeFarLayer = qualityTier !== "low";

  return (
    <>
      {includeFarLayer ? (
        <NeuralLayer
          depth={0.34}
          imageAspect={profile.image.aspect}
          imageSize={imageSize}
          opacity={0.28}
          threshold={-1}
          softness={0.12}
          brightness={0.62}
          blur
          pointerRef={pointerRef}
          focusUv={focusUv}
          reducedMotion={reducedMotion}
        />
      ) : null}
      <NeuralLayer
        depth={0.68}
        imageAspect={profile.image.aspect}
        imageSize={imageSize}
        opacity={0.9}
        threshold={-1}
        softness={0.1}
        brightness={0.98}
        pointerRef={pointerRef}
        focusUv={focusUv}
        reducedMotion={reducedMotion}
      />
      <NeuralLayer
        depth={1}
        imageAspect={profile.image.aspect}
        imageSize={imageSize}
        opacity={qualityTier === "low" ? 0.38 : 0.58}
        threshold={0.52}
        softness={0.26}
        brightness={1.18}
        pointerRef={pointerRef}
        focusUv={focusUv}
        reducedMotion={reducedMotion}
      />
      <PulseSystem
        profile={profile}
        layout={layout}
        event={pulseEvent}
        reducedMotion={reducedMotion}
        pulseLimit={qualityTier === "high" ? 6 : qualityTier === "medium" ? 4 : 2}
      />
      {qualityTier === "high" && !reducedMotion ? (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.48}
            luminanceThreshold={0.72}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
        </EffectComposer>
      ) : null}
      <Preload all />
    </>
  );
}

export default function NeuralScene(props: NeuralSceneProps) {
  const dpr: number | [number, number] =
    props.qualityTier === "high"
      ? [1, 1.6]
      : props.qualityTier === "medium"
        ? [1, 1.3]
        : 1;

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 100 }}
      dpr={dpr}
      gl={{ alpha: true, antialias: props.qualityTier !== "low" }}
      frameloop="always"
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
