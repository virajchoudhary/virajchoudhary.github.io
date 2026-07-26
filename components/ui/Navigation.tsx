"use client";

export type SectionId =
  | "projects"
  | "research"
  | "experience"
  | "about"
  | "contact";

interface NavigationProps {
  onHome: () => void;
  onSection: (section: SectionId, trigger: HTMLButtonElement) => void;
}

const items: Array<{ label: string; section: SectionId }> = [
  { label: "Projects", section: "projects" },
  { label: "Research", section: "research" },
  { label: "Experience", section: "experience" },
  { label: "About", section: "about" },
  { label: "Contact", section: "contact" },
];

export function Navigation({ onHome, onSection }: NavigationProps) {
  return (
    <header className="site-navigation">
      <nav aria-label="Primary navigation">
        <button type="button" onClick={onHome}>
          Home
        </button>
        {items.map((item) => (
          <button
            key={item.section}
            type="button"
            onClick={(event) => onSection(item.section, event.currentTarget)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          disabled
          title="Public resume being prepared"
          aria-label="Resume unavailable: Public resume being prepared"
        >
          Resume
          <span className="nav-status">Preparing</span>
        </button>
      </nav>
    </header>
  );
}
