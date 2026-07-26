"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

import type { Project, ProjectId } from "@/data/projects";

interface ProjectPanelProps {
  project?: Project;
  returnFocusRef: React.MutableRefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

export function ProjectPanel({
  project,
  returnFocusRef,
  onClose,
}: ProjectPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => closeRef.current?.focus());
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

  const close = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    onClose();
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  return (
    <dialog
      ref={dialogRef}
      className="portfolio-dialog project-dialog"
      aria-labelledby={project ? `project-${project.id}-title` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      {project ? (
        <motion.article
          className="dialog-surface"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="panel-heading">
            <div>
              <p>{project.category}</p>
              <h2 id={`project-${project.id}-title`}>{project.title}</h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="close-button"
              onClick={close}
              aria-label={`Close ${project.title}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p className="panel-summary">{project.summary}</p>
          <dl className="project-details">
            <div>
              <dt>Problem</dt>
              <dd>{project.problem}</dd>
            </div>
            <div>
              <dt>Approach</dt>
              <dd>{project.approach}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
          </dl>
          <ul className="technology-list" aria-label="Technologies">
            {project.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
          <div className="panel-actions">
            {project.githubUrl ? (
              <a
                className="primary-action"
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                View GitHub <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            <button
              type="button"
              className="secondary-action"
              disabled
              title="Case study planned for Phase 2"
            >
              Case study · Phase 2
            </button>
          </div>
        </motion.article>
      ) : null}
    </dialog>
  );
}

export type ProjectSelectionHandler = (
  id: ProjectId,
  trigger: HTMLButtonElement,
) => void;
