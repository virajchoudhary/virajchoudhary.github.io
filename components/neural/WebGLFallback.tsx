interface WebGLFallbackProps {
  label: string;
}

export function WebGLFallback({ label }: WebGLFallbackProps) {
  return (
    <div
      className="neural-static-fallback"
      role="img"
      aria-label={label}
    />
  );
}
