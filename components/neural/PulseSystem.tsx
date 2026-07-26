"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from "three";

import type {
  NetworkLayout,
  NeuralProfile,
  Uv,
} from "@/data/neuralProfiles";
import type { ProjectId } from "@/data/projects";
import { sourceUvToViewport } from "@/lib/coverUv";

export interface PulseEvent {
  id: number;
  edgeIds: string[];
  towardProject?: ProjectId;
}

interface PulseSystemProps {
  profile: NeuralProfile;
  layout: NetworkLayout;
  event?: PulseEvent;
  highlightedEdgeIds: string[];
  reducedMotion: boolean;
  pulseLimit: number;
}

interface ActivePulse {
  curve: CatmullRomCurve3;
  startedAt: number;
  duration: number;
  reverse: boolean;
}

const tailOpacity = [1, 0.58, 0.3, 0.14, 0.055];

export function PulseSystem({
  profile,
  layout,
  event,
  highlightedEdgeIds,
  reducedMotion,
  pulseLimit,
}: PulseSystemProps) {
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const meshRefs = useRef<Array<Mesh | null>>([]);
  const activePulses = useRef<Array<ActivePulse | undefined>>([]);

  const geometry = useMemo(() => new SphereGeometry(0.016, 10, 10), []);
  const materials = useMemo(
    () =>
      tailOpacity.map(
        (opacity) =>
          new MeshBasicMaterial({
            color: "#f7fcff",
            transparent: true,
            opacity,
            blending: AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          }),
      ),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    },
    [geometry, materials],
  );

  const pointById = useMemo(
    () => new Map(layout.graphPoints.map((point) => [point.id, point.uv])),
    [layout],
  );

  const curves = useMemo(() => {
    const viewportAspect = size.width / size.height;
    const uvToWorld = (uv: Uv) => {
      const point = sourceUvToViewport(
        uv,
        profile.image.aspect,
        viewportAspect,
      );
      return new Vector3(
        (point.x - 0.5) * viewport.width,
        (0.5 - point.y) * viewport.height,
        0.12,
      );
    };

    return new Map(
      layout.pulsePaths.map((path) => {
        const from = pointById.get(path.from);
        const to = pointById.get(path.to);
        if (!from || !to) {
          throw new Error(`Pulse path ${path.id} references an unknown point.`);
        }
        const points = [from, ...path.controlPoints, to].map(uvToWorld);
        return [path.id, new CatmullRomCurve3(points, false, "catmullrom", 0.45)];
      }),
    );
  }, [
    layout.pulsePaths,
    pointById,
    profile.image.aspect,
    size.height,
    size.width,
    viewport.height,
    viewport.width,
  ]);

  useEffect(() => {
    if (!event || reducedMotion) return;

    const now = performance.now();
    event.edgeIds.slice(0, pulseLimit).forEach((edgeId, index) => {
      const curve = curves.get(edgeId);
      const definition = layout.pulsePaths.find((path) => path.id === edgeId);
      if (!curve || !definition) return;
      const reverse = event.towardProject
        ? definition.from === event.towardProject
        : index % 2 === 1;
      activePulses.current[index] = {
        curve,
        startedAt: now + index * 125,
        duration: 980 + index * 105,
        reverse,
      };
    });
  }, [curves, event, layout.pulsePaths, pulseLimit, reducedMotion]);

  useFrame(() => {
    const now = performance.now();

    for (let pulseIndex = 0; pulseIndex < pulseLimit; pulseIndex += 1) {
      const pulse = activePulses.current[pulseIndex];
      for (let tailIndex = 0; tailIndex < tailOpacity.length; tailIndex += 1) {
        const mesh =
          meshRefs.current[pulseIndex * tailOpacity.length + tailIndex];
        if (!mesh) continue;
        if (!pulse || now < pulse.startedAt) {
          mesh.visible = false;
          continue;
        }

        const progress = (now - pulse.startedAt) / pulse.duration;
        const tailProgress = progress - tailIndex * 0.022;
        if (tailProgress < 0 || tailProgress > 1) {
          mesh.visible = false;
          continue;
        }

        const t = pulse.reverse ? 1 - tailProgress : tailProgress;
        pulse.curve.getPointAt(Math.max(0, Math.min(1, t)), mesh.position);
        const scale = 1 - tailIndex * 0.14;
        mesh.scale.setScalar(scale);
        mesh.visible = true;
      }

      if (pulse && now > pulse.startedAt + pulse.duration + 120) {
        activePulses.current[pulseIndex] = undefined;
      }
    }
  });

  const highlightedEdges = new Set(highlightedEdgeIds);

  return (
    <group>
      {layout.pulsePaths.map((path) => {
        const curve = curves.get(path.id);
        if (!curve) return null;
        return (
          <Line
            key={path.id}
            points={curve.getPoints(36)}
            color="#f2fbff"
            lineWidth={highlightedEdges.has(path.id) ? 0.72 : 0.25}
            transparent
            opacity={highlightedEdges.has(path.id) ? 0.34 : 0}
            depthWrite={false}
            toneMapped={false}
          />
        );
      })}
      {Array.from(
        { length: pulseLimit * tailOpacity.length },
        (_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshRefs.current[index] = mesh;
          }}
          geometry={geometry}
          material={materials[index % tailOpacity.length]}
          visible={false}
          renderOrder={50}
        />
        ),
      )}
    </group>
  );
}
