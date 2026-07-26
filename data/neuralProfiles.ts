import type { ProjectId } from "@/data/projects";

export type NeuralProfileId = "original" | "public";
export type Uv = readonly [number, number];

export interface GraphPoint {
  id: string;
  uv: Uv;
}

export interface PulsePath {
  id: string;
  from: string;
  to: string;
  controlPoints: Uv[];
}

export interface NetworkLayout {
  projectAnchors: Record<ProjectId, Uv>;
  graphPoints: GraphPoint[];
  adjacency: Record<string, string[]>;
  pulsePaths: PulsePath[];
}

export interface NeuralProfile {
  id: NeuralProfileId;
  image: {
    width: number;
    height: number;
    aspect: number;
  };
  desktop: NetworkLayout;
  mobile: NetworkLayout;
}

type EdgeSpec = readonly [
  id: string,
  from: string,
  to: string,
  ...controlPoints: Uv[],
];

function makeLayout(
  projectAnchors: Record<ProjectId, Uv>,
  decorativePoints: GraphPoint[],
  edges: EdgeSpec[],
): NetworkLayout {
  const graphPoints: GraphPoint[] = [
    ...Object.entries(projectAnchors).map(([id, uv]) => ({ id, uv })),
    ...decorativePoints,
  ];
  const adjacency: Record<string, string[]> = Object.fromEntries(
    graphPoints.map(({ id }) => [id, []]),
  );
  const pulsePaths = edges.map(([id, from, to, ...controlPoints]) => {
    adjacency[from]?.push(to);
    adjacency[to]?.push(from);
    return { id, from, to, controlPoints };
  });

  return { projectAnchors, graphPoints, adjacency, pulsePaths };
}

const originalDesktop = makeLayout(
  {
    "transparent-dr": [0.5233, 0.2353],
    quantvision: [0.585, 0.4601],
    "double-heston": [0.9, 0.2584],
    "dbt-guidance": [0.3583, 0.4559],
    "traffic-analyzer": [0.3067, 0.6324],
    "neural-linguistic-suite": [0.6833, 0.7626],
  },
  [
    { id: "od-a", uv: [0.3783, 0.2248] },
    { id: "od-b", uv: [0.5017, 0.313] },
    { id: "od-c", uv: [0.6783, 0.3193] },
    { id: "od-d", uv: [0.5033, 0.5378] },
    { id: "od-e", uv: [0.675, 0.687] },
    { id: "od-f", uv: [0.395, 0.7458] },
    { id: "od-g", uv: [0.7817, 0.4244] },
    { id: "od-h", uv: [0.2217, 0.3508] },
  ],
  [
    ["od-1", "transparent-dr", "od-a", [0.47, 0.2], [0.42, 0.21]],
    ["od-2", "transparent-dr", "od-b", [0.54, 0.27]],
    ["od-3", "transparent-dr", "od-c", [0.6, 0.2], [0.64, 0.27]],
    ["od-4", "od-a", "dbt-guidance", [0.34, 0.31], [0.36, 0.39]],
    ["od-5", "od-h", "dbt-guidance", [0.27, 0.37]],
    ["od-6", "dbt-guidance", "traffic-analyzer", [0.31, 0.53]],
    ["od-7", "traffic-analyzer", "od-f", [0.33, 0.69]],
    ["od-8", "od-f", "neural-linguistic-suite", [0.49, 0.78], [0.58, 0.73]],
    ["od-9", "neural-linguistic-suite", "od-e", [0.7, 0.72]],
    ["od-10", "od-e", "od-d", [0.59, 0.62]],
    ["od-11", "od-d", "quantvision", [0.55, 0.5]],
    ["od-12", "quantvision", "od-g", [0.68, 0.43], [0.74, 0.45]],
    ["od-13", "od-g", "double-heston", [0.84, 0.35]],
  ],
);

const originalMobile = makeLayout(
  {
    "transparent-dr": [0.5017, 0.313],
    quantvision: [0.5933, 0.3845],
    "double-heston": [0.585, 0.4601],
    "dbt-guidance": [0.5033, 0.5378],
    "traffic-analyzer": [0.395, 0.7458],
    "neural-linguistic-suite": [0.5583, 0.7311],
  },
  [
    { id: "om-a", uv: [0.5233, 0.2353] },
    { id: "om-b", uv: [0.6783, 0.3193] },
    { id: "om-c", uv: [0.3583, 0.4559] },
    { id: "om-d", uv: [0.4749, 0.5569] },
    { id: "om-e", uv: [0.5108, 0.6089] },
    { id: "om-f", uv: [0.509, 0.695] },
    { id: "om-g", uv: [0.4444, 0.7365] },
  ],
  [
    ["om-1", "om-a", "transparent-dr", [0.49, 0.27]],
    ["om-2", "transparent-dr", "quantvision", [0.55, 0.34]],
    ["om-3", "quantvision", "om-b", [0.64, 0.34]],
    ["om-4", "quantvision", "double-heston", [0.61, 0.42]],
    ["om-5", "double-heston", "om-c", [0.47, 0.47], [0.41, 0.46]],
    ["om-6", "double-heston", "dbt-guidance", [0.54, 0.5]],
    ["om-7", "dbt-guidance", "om-d", [0.49, 0.55]],
    ["om-8", "om-d", "om-e", [0.5, 0.59]],
    ["om-9", "om-e", "om-f", [0.54, 0.65]],
    ["om-10", "om-f", "neural-linguistic-suite", [0.54, 0.71]],
    ["om-11", "neural-linguistic-suite", "om-g", [0.5, 0.74]],
    ["om-12", "om-g", "traffic-analyzer", [0.42, 0.76]],
  ],
);

const publicDesktop = makeLayout(
  {
    "transparent-dr": [0.4689, 0.2519],
    quantvision: [0.5455, 0.6631],
    "double-heston": [0.9157, 0.3836],
    "dbt-guidance": [0.2398, 0.2678],
    "traffic-analyzer": [0.4013, 0.7896],
    "neural-linguistic-suite": [0.8295, 0.8587],
  },
  [
    { id: "pd-a", uv: [0.3188, 0.1838] },
    { id: "pd-b", uv: [0.57, 0.4283] },
    { id: "pd-c", uv: [0.6926, 0.6281] },
    { id: "pd-d", uv: [0.8361, 0.3921] },
    { id: "pd-e", uv: [0.6471, 0.8385] },
    { id: "pd-f", uv: [0.2584, 0.5813] },
    { id: "pd-g", uv: [0.7524, 0.5537] },
  ],
  [
    ["pd-1", "dbt-guidance", "pd-a", [0.27, 0.22]],
    ["pd-2", "pd-a", "transparent-dr", [0.39, 0.18]],
    ["pd-3", "transparent-dr", "pd-b", [0.52, 0.33]],
    ["pd-4", "pd-b", "quantvision", [0.56, 0.54]],
    ["pd-5", "dbt-guidance", "pd-f", [0.23, 0.43]],
    ["pd-6", "pd-f", "traffic-analyzer", [0.31, 0.69]],
    ["pd-7", "traffic-analyzer", "quantvision", [0.47, 0.74]],
    ["pd-8", "quantvision", "pd-c", [0.61, 0.64]],
    ["pd-9", "pd-c", "pd-g", [0.72, 0.59]],
    ["pd-10", "pd-g", "pd-d", [0.8, 0.48]],
    ["pd-11", "pd-d", "double-heston", [0.88, 0.37]],
    ["pd-12", "pd-c", "pd-e", [0.67, 0.73]],
    ["pd-13", "pd-e", "neural-linguistic-suite", [0.74, 0.86]],
  ],
);

const publicMobile = makeLayout(
  {
    "transparent-dr": [0.4689, 0.2519],
    quantvision: [0.5706, 0.4283],
    "double-heston": [0.5419, 0.5197],
    "dbt-guidance": [0.4749, 0.5569],
    "traffic-analyzer": [0.5478, 0.661],
    "neural-linguistic-suite": [0.4019, 0.7864],
  },
  [
    { id: "pm-a", uv: [0.4306, 0.3348] },
    { id: "pm-b", uv: [0.5054, 0.3847] },
    { id: "pm-c", uv: [0.491, 0.4899] },
    { id: "pm-d", uv: [0.5108, 0.6089] },
    { id: "pm-e", uv: [0.509, 0.695] },
    { id: "pm-f", uv: [0.4444, 0.7365] },
  ],
  [
    ["pm-1", "transparent-dr", "pm-a", [0.45, 0.29]],
    ["pm-2", "pm-a", "pm-b", [0.46, 0.36]],
    ["pm-3", "pm-b", "quantvision", [0.54, 0.41]],
    ["pm-4", "quantvision", "pm-c", [0.55, 0.46]],
    ["pm-5", "pm-c", "double-heston", [0.52, 0.51]],
    ["pm-6", "double-heston", "dbt-guidance", [0.5, 0.54]],
    ["pm-7", "dbt-guidance", "pm-d", [0.49, 0.59]],
    ["pm-8", "pm-d", "traffic-analyzer", [0.53, 0.63]],
    ["pm-9", "traffic-analyzer", "pm-e", [0.54, 0.68]],
    ["pm-10", "pm-e", "pm-f", [0.48, 0.72]],
    ["pm-11", "pm-f", "neural-linguistic-suite", [0.42, 0.77]],
    ["pm-12", "pm-c", "pm-d", [0.5, 0.55]],
  ],
);

export const neuralProfiles: Record<NeuralProfileId, NeuralProfile> = {
  original: {
    id: "original",
    image: { width: 600, height: 476, aspect: 600 / 476 },
    desktop: originalDesktop,
    mobile: originalMobile,
  },
  public: {
    id: "public",
    image: { width: 1672, height: 941, aspect: 1672 / 941 },
    desktop: publicDesktop,
    mobile: publicMobile,
  },
};

export function getActiveNeuralProfile(): NeuralProfile {
  const value = process.env.NEXT_PUBLIC_NEURAL_PROFILE;
  if (value !== "original" && value !== "public") {
    throw new Error(
      "NEXT_PUBLIC_NEURAL_PROFILE must be set to exactly `original` or `public`. " +
        "Use the provided npm scripts instead of invoking Next.js directly.",
    );
  }
  return neuralProfiles[value];
}

export function findNearestGraphPoint(layout: NetworkLayout, uv: Uv) {
  return layout.graphPoints.reduce(
    (nearest, point) => {
      const distance =
        (point.uv[0] - uv[0]) ** 2 + (point.uv[1] - uv[1]) ** 2;
      return distance < nearest.distance ? { point, distance } : nearest;
    },
    { point: layout.graphPoints[0], distance: Number.POSITIVE_INFINITY },
  ).point;
}

export function breadthFirstPaths(
  layout: NetworkLayout,
  startId: string,
  maximum = 5,
) {
  const visited = new Set([startId]);
  const queue = [startId];
  const paths: string[] = [];

  while (queue.length > 0 && paths.length < maximum) {
    const current = queue.shift()!;
    for (const neighbour of layout.adjacency[current] ?? []) {
      if (visited.has(neighbour)) continue;
      visited.add(neighbour);
      queue.push(neighbour);
      const edge = layout.pulsePaths.find(
        (candidate) =>
          (candidate.from === current && candidate.to === neighbour) ||
          (candidate.to === current && candidate.from === neighbour),
      );
      if (edge) paths.push(edge.id);
      if (paths.length >= maximum) break;
    }
  }

  return paths;
}

export function pathsForProject(
  layout: NetworkLayout,
  projectId: ProjectId,
  maximum = 3,
) {
  return layout.pulsePaths
    .filter((path) => path.from === projectId || path.to === projectId)
    .slice(0, maximum)
    .map((path) => path.id);
}
