export type QualityTier = "high" | "medium" | "low" | "static";

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export function detectQualityTier(): QualityTier {
  if (typeof window === "undefined") return "static";

  const navigatorWithMemory = navigator as NavigatorWithMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigatorWithMemory.deviceMemory || 4;
  const mobile = window.matchMedia("(max-width: 720px)").matches;

  if (!canUseWebGL()) return "static";
  if (mobile && (cores <= 4 || memory <= 4)) return "low";
  if (mobile || cores <= 6 || memory <= 6) return "medium";
  return "high";
}

export function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}
