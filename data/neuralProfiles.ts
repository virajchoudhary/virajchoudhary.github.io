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
    "transparent-dr": [0.523333, 0.239496],
    quantvision: [0.586667, 0.457983],
    "double-heston": [0.895, 0.256303],
    "dbt-guidance": [0.358333, 0.455882],
    "traffic-analyzer": [0.306667, 0.632353],
    "neural-linguistic-suite": [0.681667, 0.764706],
  },
  [
    { id: "od-a", uv: [0.596667, 0.386555] },
    { id: "od-b", uv: [0.666667, 0.407563] },
    { id: "od-c", uv: [0.501667, 0.537815] },
    { id: "od-d", uv: [0.393333, 0.745798] },
    { id: "od-e", uv: [0.675, 0.686975] },
    { id: "od-f", uv: [0.901667, 0.615546] },
    { id: "od-g", uv: [0.94, 0.502101] },
  ],
  [
    ["od-1", "transparent-dr", "od-a", [0.543333, 0.304622], [0.573333, 0.355042]],
    ["od-2", "od-a", "quantvision", [0.593333, 0.415966]],
    ["od-3", "quantvision", "od-c", [0.561667, 0.487395], [0.533333, 0.512605]],
    ["od-4", "od-c", "dbt-guidance", [0.461667, 0.512605], [0.41, 0.47479]],
    ["od-5", "dbt-guidance", "traffic-analyzer", [0.336667, 0.523109], [0.321667, 0.584034]],
    ["od-6", "traffic-analyzer", "od-d", [0.325, 0.678571], [0.361667, 0.716387]],
    ["od-7", "od-d", "neural-linguistic-suite", [0.468333, 0.777311], [0.558333, 0.735294], [0.636667, 0.745798]],
    ["od-8", "quantvision", "od-b", [0.615, 0.436975], [0.638333, 0.422269]],
    ["od-9", "od-b", "double-heston", [0.716667, 0.344538], [0.8, 0.298319], [0.866667, 0.273109]],
    ["od-10", "double-heston", "od-g", [0.916667, 0.323529], [0.945, 0.409664]],
    ["od-11", "od-g", "od-f", [0.943333, 0.552521], [0.921667, 0.596639]],
    ["od-12", "od-f", "neural-linguistic-suite", [0.853333, 0.661765], [0.783333, 0.69958], [0.716667, 0.731092]],
    ["od-13", "quantvision", "od-e", [0.625, 0.516807], [0.65, 0.602941]],
    ["od-14", "od-e", "neural-linguistic-suite", [0.68, 0.722689]],
    ["od-15", "od-c", "od-e", [0.553333, 0.569328], [0.61, 0.621849]],
  ],
);

const originalMobile = makeLayout(
  {
    "transparent-dr": [0.596667, 0.386555],
    quantvision: [0.586667, 0.457983],
    "double-heston": [0.501667, 0.537815],
    "dbt-guidance": [0.358333, 0.455882],
    "traffic-analyzer": [0.393333, 0.745798],
    "neural-linguistic-suite": [0.513333, 0.943277],
  },
  [
    { id: "om-a", uv: [0.523333, 0.239496] },
    { id: "om-b", uv: [0.666667, 0.407563] },
    { id: "om-d", uv: [0.306667, 0.632353] },
    { id: "om-e", uv: [0.681667, 0.764706] },
  ],
  [
    ["om-1", "om-a", "transparent-dr", [0.543333, 0.304622], [0.573333, 0.355042]],
    ["om-2", "transparent-dr", "quantvision", [0.593333, 0.415966]],
    ["om-3", "quantvision", "double-heston", [0.561667, 0.487395], [0.533333, 0.512605]],
    ["om-4", "double-heston", "dbt-guidance", [0.461667, 0.512605], [0.41, 0.47479]],
    ["om-5", "dbt-guidance", "om-d", [0.336667, 0.523109], [0.321667, 0.584034]],
    ["om-6", "om-d", "traffic-analyzer", [0.325, 0.678571], [0.361667, 0.716387]],
    ["om-7", "traffic-analyzer", "neural-linguistic-suite", [0.43, 0.81], [0.49, 0.89]],
    ["om-8", "transparent-dr", "om-b", [0.615, 0.436975], [0.638333, 0.422269]],
    ["om-9", "om-b", "double-heston", [0.62, 0.43], [0.56, 0.49]],
    ["om-10", "double-heston", "om-e", [0.58, 0.58], [0.64, 0.65]],
    ["om-11", "om-e", "neural-linguistic-suite", [0.64, 0.82], [0.56, 0.9]],
    ["om-12", "om-e", "traffic-analyzer", [0.58, 0.78], [0.48, 0.76]],
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
    "transparent-dr": [0.4306, 0.3348],
    quantvision: [0.5706, 0.4283],
    "double-heston": [0.5419, 0.5197],
    "dbt-guidance": [0.4749, 0.5569],
    "traffic-analyzer": [0.5478, 0.661],
    "neural-linguistic-suite": [0.4019, 0.7864],
  },
  [
    { id: "pm-a", uv: [0.4689, 0.2519] },
    { id: "pm-b", uv: [0.5054, 0.3847] },
    { id: "pm-c", uv: [0.491, 0.4899] },
    { id: "pm-d", uv: [0.5108, 0.6089] },
    { id: "pm-e", uv: [0.509, 0.695] },
    { id: "pm-f", uv: [0.4444, 0.7365] },
  ],
  [
    ["pm-1", "pm-a", "transparent-dr", [0.45, 0.29]],
    ["pm-2", "transparent-dr", "pm-b", [0.46, 0.36]],
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
    image: { width: 3840, height: 3046, aspect: 3840 / 3046 },
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
