"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { AccessibleProjectList } from "@/components/accessibility/AccessibleProjectList";
import { WebGLFallback } from "@/components/neural/WebGLFallback";
import type { PulseEvent } from "@/components/neural/PulseSystem";
import { HeroOverlay } from "@/components/ui/HeroOverlay";
import {
  Navigation,
  type SectionId,
} from "@/components/ui/Navigation";
import { ProjectNodes } from "@/components/ui/ProjectNodes";
import { ProjectPanel } from "@/components/ui/ProjectPanel";
import { SectionPanel } from "@/components/ui/SectionPanel";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  breadthFirstPaths,
  findNearestGraphPoint,
  getActiveNeuralProfile,
  pathsForProject,
  type Uv,
} from "@/data/neuralProfiles";
import {
  projectById,
  type ProjectId,
} from "@/data/projects";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { viewportToSourceUv } from "@/lib/coverUv";
import {
  detectQualityTier,
  type QualityTier,
} from "@/lib/qualityTier";

const NeuralScene = dynamic(
  () => import("@/components/neural/NeuralScene"),
  { ssr: false, loading: () => null },
);

const profile = getActiveNeuralProfile();

export function PortfolioExperience() {
  const { viewport, layout } = useResponsiveLayout(profile);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [qualityTier, setQualityTier] = useState<QualityTier>("static");
  const [pageVisible, setPageVisible] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectId>();
  const [hoveredProject, setHoveredProject] = useState<ProjectId>();
  const [activeSection, setActiveSection] = useState<SectionId>();
  const [pulseEvent, setPulseEvent] = useState<PulseEvent>();
  const pointerRef = useRef({ x: 0, y: 0 });
  const pulseCounter = useRef(0);
  const projectReturnFocus = useRef<HTMLButtonElement | null>(null);
  const sectionReturnFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const detectionFrame = window.requestAnimationFrame(() => {
      setQualityTier(detectQualityTier());
    });
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.cancelAnimationFrame(detectionFrame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const sendPulse = useCallback(
    (edgeIds: string[], towardProject?: ProjectId) => {
      pulseCounter.current += 1;
      setPulseEvent({
        id: pulseCounter.current,
        edgeIds,
        towardProject,
      });
    },
    [],
  );

  useEffect(() => {
    if (
      prefersReducedMotion ||
      qualityTier === "static" ||
      !pageVisible ||
      layout.pulsePaths.length === 0
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      const index = pulseCounter.current % layout.pulsePaths.length;
      sendPulse([layout.pulsePaths[index].id]);
    }, qualityTier === "low" ? 3900 : qualityTier === "medium" ? 3600 : 3100);
    return () => window.clearInterval(interval);
  }, [
    layout.pulsePaths,
    pageVisible,
    prefersReducedMotion,
    qualityTier,
    sendPulse,
  ]);

  const handleHover = (id?: ProjectId) => {
    setHoveredProject(id);
    if (id && !prefersReducedMotion) {
      sendPulse(pathsForProject(layout, id, 2), id);
    }
  };

  const handleProject = (id: ProjectId, trigger: HTMLButtonElement) => {
    projectReturnFocus.current = trigger;
    setSelectedProject(id);
    setHoveredProject(id);
    sendPulse(pathsForProject(layout, id, 3), id);
  };

  const handleSectionProject = (
    id: ProjectId,
    trigger: HTMLButtonElement,
  ) => {
    setActiveSection(undefined);
    window.setTimeout(() => handleProject(id, trigger), 0);
  };

  const handleEmptyPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const viewportUv: Uv = [
      (event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height,
    ];
    const sourceUv = viewportToSourceUv(
      viewportUv,
      profile.image.aspect,
      bounds.width / bounds.height,
    );
    const point = findNearestGraphPoint(layout, sourceUv);
    sendPulse(
      breadthFirstPaths(
        layout,
        point.id,
        viewport.mobile || qualityTier === "low" ? 3 : 5,
      ),
    );
  };

  const focusUv = selectedProject
    ? layout.projectAnchors[selectedProject]
    : hoveredProject
      ? layout.projectAnchors[hoveredProject]
      : undefined;
  const highlightedEdgeIds = hoveredProject
    ? pathsForProject(layout, hoveredProject, 3)
    : selectedProject
      ? pathsForProject(layout, selectedProject, 3)
      : [];

  return (
    <main
      className="portfolio-shell"
      data-neural-profile={profile.id}
      data-quality-tier={qualityTier}
      data-motion={prefersReducedMotion ? "reduced" : "full"}
      data-neural-renderer={viewport.mobile ? "static" : qualityTier}
    >
      <WebGLFallback label="A dense monochrome microscopy field of interconnected neurons." />
      <div className="webgl-layer" aria-hidden="true">
        {!viewport.mobile && qualityTier !== "static" && pageVisible ? (
          <NeuralScene
            profile={profile}
            layout={layout}
            pointerRef={pointerRef}
            focusUv={focusUv}
            pulseEvent={pulseEvent}
            reducedMotion={prefersReducedMotion}
            qualityTier={qualityTier}
            highlightedEdgeIds={highlightedEdgeIds}
          />
        ) : null}
      </div>
      <div
        className="neural-hit-surface"
        aria-hidden="true"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          pointerRef.current.x =
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          pointerRef.current.y =
            -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
        }}
        onPointerLeave={() => {
          pointerRef.current.x = 0;
          pointerRef.current.y = 0;
        }}
        onPointerUp={handleEmptyPointer}
      />
      <Navigation
        onHome={() => {
          setActiveSection(undefined);
          setSelectedProject(undefined);
        }}
        onSection={(section, trigger) => {
          sectionReturnFocus.current = trigger;
          setSelectedProject(undefined);
          setActiveSection(section);
        }}
      />
      <HeroOverlay />
      <ProjectNodes
        profile={profile}
        layout={layout}
        viewport={viewport}
        selectedId={selectedProject}
        onActivate={handleProject}
        onHover={handleHover}
      />
      <SocialLinks />
      <AccessibleProjectList />
      <ProjectPanel
        project={
          selectedProject ? projectById[selectedProject] : undefined
        }
        returnFocusRef={projectReturnFocus}
        onClose={() => {
          setSelectedProject(undefined);
          setHoveredProject(undefined);
        }}
      />
      <SectionPanel
        section={activeSection}
        returnFocusRef={sectionReturnFocus}
        onClose={() => setActiveSection(undefined)}
        onProject={handleSectionProject}
      />
    </main>
  );
}
