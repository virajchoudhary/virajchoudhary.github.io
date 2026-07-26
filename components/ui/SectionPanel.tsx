"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

import { projects, type ProjectId } from "@/data/projects";
import type { SectionId } from "@/components/ui/Navigation";
import { SocialLinks } from "@/components/ui/SocialLinks";

interface SectionPanelProps {
  section?: SectionId;
  returnFocusRef: React.MutableRefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onProject: (id: ProjectId, trigger: HTMLButtonElement) => void;
}

const sectionTitles: Record<SectionId, string> = {
  projects: "Selected projects",
  research: "Research",
  experience: "Experience",
  about: "About",
  contact: "Contact",
};

export function SectionPanel({
  section,
  returnFocusRef,
  onClose,
  onProject,
}: SectionPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (section && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => closeRef.current?.focus());
    } else if (!section && dialog.open) {
      dialog.close();
    }
  }, [section]);

  const close = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    onClose();
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  return (
    <dialog
      ref={dialogRef}
      className="portfolio-dialog section-dialog"
      aria-labelledby={section ? `section-${section}-title` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      {section ? (
        <motion.section
          className="dialog-surface"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="panel-heading">
            <div>
              <p>Neural Atlas</p>
              <h2 id={`section-${section}-title`}>
                {sectionTitles[section]}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="close-button"
              onClick={close}
              aria-label={`Close ${sectionTitles[section]}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <SectionContent section={section} onProject={onProject} />
        </motion.section>
      ) : null}
    </dialog>
  );
}

function SectionContent({
  section,
  onProject,
}: {
  section: SectionId;
  onProject: (id: ProjectId, trigger: HTMLButtonElement) => void;
}) {
  if (section === "projects") {
    return (
      <div className="conventional-project-list">
        {projects.map((project) => (
          <button
            type="button"
            key={project.id}
            onClick={(event) => onProject(project.id, event.currentTarget)}
          >
            <span>
              <strong>{project.title}</strong>
              <small>{project.category}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    );
  }

  if (section === "research") {
    return (
      <div className="prose-panel">
        <article>
          <p className="panel-kicker">Healthcare AI</p>
          <h3>Transparent DR Screening</h3>
          <p>
            Attention-based diabetic-retinopathy grading with interpretable
            visual evidence and an emphasis on lighter deployment.
          </p>
          <p className="status-line">
            Research in progress · Manuscript status being updated.
          </p>
        </article>
        <article>
          <p className="panel-kicker">Quantitative research</p>
          <h3>Double Heston Neural Option Pricing</h3>
          <p>
            Comparing data-driven, physics-informed and hybrid neural
            approaches under the Double Heston model.
          </p>
          <p className="status-line">Research in progress · No results claimed.</p>
        </article>
      </div>
    );
  }

  if (section === "experience") {
    return (
      <div className="prose-panel">
        <article>
          <p className="panel-kicker">May 2025 — Present · Mumbai</p>
          <h3>AI/ML Intern · Kotak Mutual Fund</h3>
          <p>
            Building public-safe AI/ML-assisted automation, data-processing and
            analytics workflows for structured mutual-fund information and
            reporting.
          </p>
          <ul>
            <li>Python pipelines for structured financial and Excel inputs.</li>
            <li>Analytics and repeatable report-generation workflows.</li>
            <li>LLM-assisted workflow exploration focused on reducing manual work.</li>
          </ul>
        </article>
        <article>
          <p className="panel-kicker">2023 — 2027</p>
          <h3>B.Tech Artificial Intelligence · NMIMS University</h3>
          <p>Mukesh Patel School of Technology Management &amp; Engineering.</p>
        </article>
      </div>
    );
  }

  if (section === "about") {
    return (
      <div className="prose-panel">
        <p className="large-copy">
          I&apos;m an AI/ML student, researcher and engineer in Mumbai. My work
          sits where model research meets dependable software: healthcare AI,
          quantitative systems, computer vision, NLP and automation.
        </p>
        <p>
          I care about evidence, explainability and taking prototypes far enough
          that another person can genuinely use them.
        </p>
        <button className="secondary-action" type="button" disabled>
          Public resume being prepared
        </button>
      </div>
    );
  }

  return (
    <div className="prose-panel contact-panel">
      <p className="large-copy">
        For research, engineering or collaboration conversations, email is the
        best place to start.
      </p>
      <a className="primary-action" href="mailto:virajc188@gmail.com">
        virajc188@gmail.com
      </a>
      <SocialLinks />
    </div>
  );
}
