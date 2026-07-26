import type { Uv } from "@/data/neuralProfiles";

export interface ViewportPoint {
  x: number;
  y: number;
  visible: boolean;
}

export function sourceUvToViewport(
  uv: Uv,
  imageAspect: number,
  viewportAspect: number,
): ViewportPoint {
  let x = uv[0];
  let y = uv[1];

  if (viewportAspect > imageAspect) {
    const visibleHeight = imageAspect / viewportAspect;
    const crop = (1 - visibleHeight) / 2;
    y = (uv[1] - crop) / visibleHeight;
  } else {
    const visibleWidth = viewportAspect / imageAspect;
    const crop = (1 - visibleWidth) / 2;
    x = (uv[0] - crop) / visibleWidth;
  }

  return {
    x,
    y,
    visible: x >= 0 && x <= 1 && y >= 0 && y <= 1,
  };
}

export function viewportToSourceUv(
  point: Uv,
  imageAspect: number,
  viewportAspect: number,
): Uv {
  let [x, y] = point;

  if (viewportAspect > imageAspect) {
    const visibleHeight = imageAspect / viewportAspect;
    const crop = (1 - visibleHeight) / 2;
    y = crop + y * visibleHeight;
  } else {
    const visibleWidth = viewportAspect / imageAspect;
    const crop = (1 - visibleWidth) / 2;
    x = crop + x * visibleWidth;
  }

  return [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))];
}
