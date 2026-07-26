import { projects } from "@/data/projects";

export function AccessibleProjectList() {
  return (
    <section className="sr-only" aria-labelledby="semantic-projects-title">
      <h2 id="semantic-projects-title">Selected projects</h2>
      {projects.map((project) => (
        <article key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.category}</p>
          <p>{project.summary}</p>
          <p>{project.status}</p>
        </article>
      ))}
    </section>
  );
}
