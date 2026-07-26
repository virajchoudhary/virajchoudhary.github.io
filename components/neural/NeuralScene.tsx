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
  highlightedEdgeIds: string[];
}

function Scene({
  profile,
  layout,
  pointerRef,
  focusUv,
  pulseEvent,
  reducedMotion,
  qualityTier,
  highlightedEdgeIds,
}: NeuralSceneProps) {
  const imageSize = [profile.image.width, profile.image.height] as const;

  return (
    <>
      <NeuralLayer
        maskMode="base"
        imageAspect={profile.image.aspect}
        imageSize={imageSize}
        opacity={1}
        brightness={1}
        contrast={1.08}
        parallaxPixels={1.5}
        renderOrder={0}
        pointerRef={pointerRef}
        focusUv={focusUv}
        reducedMotion={reducedMotion}
      />
      <NeuralLayer
        maskMode="branches"
        imageAspect={profile.image.aspect}
        imageSize={imageSize}
        opacity={qualityTier === "low" ? 0.18 : 0.3}
        brightness={1.08}
        contrast={1.12}
        parallaxPixels={qualityTier === "low" ? 3 : 4.5}
        renderOrder={1}
        pointerRef={pointerRef}
        focusUv={focusUv}
        reducedMotion={reducedMotion}
      />
      <NeuralLayer
        maskMode="somas"
        imageAspect={profile.image.aspect}
        imageSize={imageSize}
        opacity={qualityTier === "low" ? 0.22 : 0.4}
        brightness={1.12}
        contrast={1.08}
        parallaxPixels={qualityTier === "low" ? 5.5 : 8}
        renderOrder={2}
        pointerRef={pointerRef}
        focusUv={focusUv}
        reducedMotion={reducedMotion}
      />
      <PulseSystem
        profile={profile}
        layout={layout}
        event={pulseEvent}
        highlightedEdgeIds={highlightedEdgeIds}
        reducedMotion={reducedMotion}
        pulseLimit={qualityTier === "high" ? 5 : qualityTier === "medium" ? 3 : 2}
      />
      {qualityTier === "high" && !reducedMotion ? (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.27}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.22}
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
        ? [1, 1.25]
        : 1;

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 100 }}
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: props.qualityTier !== "low",
        powerPreference: "high-performance",
      }}
      frameloop="always"
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
