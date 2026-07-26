"use client";

import { useEffect, useState } from "react";

import type { NeuralProfile } from "@/data/neuralProfiles";

const desktopViewport = { width: 1440, height: 900, mobile: false };

export function useResponsiveLayout(profile: NeuralProfile) {
  const [viewport, setViewport] = useState(desktopViewport);

  useEffect(() => {
    const update = () =>
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        mobile: window.innerWidth < 720,
      });

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    viewport,
    layout: viewport.mobile ? profile.mobile : profile.desktop,
  };
}
