"use client";

import type { NetworkLayout, NeuralProfile } from "@/data/neuralProfiles";
import { projects, type ProjectId } from "@/data/projects";
import { sourceUvToViewport } from "@/lib/coverUv";

interface ProjectNodesProps {
  profile: NeuralProfile;
  layout: NetworkLayout;
  viewport: { width: number; height: number };
  selectedId?: ProjectId;
  onActivate: (id: ProjectId, trigger: HTMLButtonElement) => void;
  onHover: (id?: ProjectId) => void;
}

export function ProjectNodes({
  profile,
  layout,
  viewport,
  selectedId,
  onActivate,
  onHover,
}: ProjectNodesProps) {
  const viewportAspect = viewport.width / viewport.height;

  return (
    <div className="project-node-layer" aria-label="Interactive project neurons">
      {projects.map((project, index) => {
        const uv = layout.projectAnchors[project.id];
        const position = sourceUvToViewport(
          uv,
          profile.image.aspect,
          viewportAspect,
        );

        return (
          <button
            key={project.id}
            type="button"
            className="project-node"
            data-project-id={project.id}
            data-selected={selectedId === project.id ? "true" : "false"}
            aria-label={`Open project: ${project.title}`}
            style={{
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
              display: position.visible ? undefined : "none",
              "--node-index": index,
            } as React.CSSProperties}
            onPointerEnter={() => onHover(project.id)}
            onPointerLeave={() => onHover(undefined)}
            onFocus={() => onHover(project.id)}
            onBlur={() => onHover(undefined)}
            onClick={(event) => onActivate(project.id, event.currentTarget)}
          >
            <span className="node-halo" aria-hidden="true" />
            <span className="node-core" aria-hidden="true" />
            <span className="project-node-label">
              <span>{project.title}</span>
              <small>{project.category}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
