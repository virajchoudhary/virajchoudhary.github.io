const links = [
  {
    label: "GitHub",
    href: "https://github.com/virajchoudhary",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/virajchoudhary/",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:virajc188@gmail.com",
    external: false,
  },
];

export function SocialLinks() {
  return (
    <div className="social-links" aria-label="Professional links">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noreferrer noopener" : undefined}
        >
          {link.label}
          {link.external ? <span aria-hidden="true"> ↗</span> : null}
        </a>
      ))}
    </div>
  );
}
