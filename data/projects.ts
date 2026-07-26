export const projectIds = [
  "transparent-dr",
  "quantvision",
  "double-heston",
  "dbt-guidance",
  "traffic-analyzer",
  "neural-linguistic-suite",
] as const;

export type ProjectId = (typeof projectIds)[number];

export interface Project {
  id: ProjectId;
  title: string;
  category: string;
  summary: string;
  problem: string;
  approach: string;
  status: string;
  technologies: string[];
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: "transparent-dr",
    title: "Transparent DR Screening",
    category: "Healthcare AI · Research",
    summary:
      "Lightweight and explainable diabetic-retinopathy grading using a custom CNN, CBAM and Grad-CAM.",
    problem:
      "Retinal screening models need clinically useful explanations without depending on excessively heavy architectures.",
    approach:
      "A custom attention-based CNN combines channel and spatial attention with visual explanations for four-class grading.",
    status: "Research in progress · Manuscript status being updated.",
    technologies: ["PyTorch", "CNN", "CBAM", "Grad-CAM", "Computer Vision"],
  },
  {
    id: "quantvision",
    title: "QuantVision",
    category: "Quantitative AI · Full-stack",
    summary:
      "Market forecasting, portfolio optimisation, options analysis and algorithmic decision support.",
    problem:
      "Investment research often fragments forecasting, risk construction and options analysis across disconnected tools.",
    approach:
      "A Django and Streamlit platform unifies LSTM forecasting, portfolio models, trading research and automated analysis.",
    status: "Active selected project.",
    technologies: [
      "Django",
      "Streamlit",
      "PyTorch",
      "Celery",
      "Redis",
      "Portfolio Optimisation",
    ],
    githubUrl: "https://github.com/virajchoudhary/stock-predictor-system",
  },
  {
    id: "double-heston",
    title: "Double Heston Neural Option Pricing",
    category: "Quantitative Research · PINNs",
    summary:
      "Comparative ANN, PINN and hybrid physics-data research under the Double Heston model.",
    problem:
      "Double Heston calibration and pricing are computationally demanding, especially when consistency with the governing PDE matters.",
    approach:
      "Compare data-driven networks, physics-informed networks and hybrid objectives against controlled synthetic and market-data studies.",
    status: "Research in progress · No results claimed.",
    technologies: ["PINNs", "Neural PDEs", "Quantitative Finance", "PyTorch"],
  },
  {
    id: "dbt-guidance",
    title: "DBT Awareness and Guidance Platform",
    category: "NLP · AI for social impact",
    summary:
      "Privacy-first multilingual guidance for Aadhaar-linked and DBT-enabled banking awareness.",
    problem:
      "Students can miss scholarship payments when complex banking requirements are difficult to understand or verify safely.",
    approach:
      "A team-built guided experience combines multilingual explanations, official-source retrieval and privacy-first redirects.",
    status: "Team project · Selected prototype.",
    technologies: ["NLP", "RAG", "Gemini", "Multilingual UX", "Privacy"],
  },
  {
    id: "traffic-analyzer",
    title: "Traffic Analyzer",
    category: "Computer Vision",
    summary:
      "YOLOv8 and OpenCV traffic detection, tracking, counting, speed estimation and stopped-vehicle monitoring.",
    problem:
      "Manual traffic-video review is slow and inconsistent for operational measurements such as flow, speed and stoppages.",
    approach:
      "A calibrated video pipeline combines object detection, tracking, regions of interest and event-level monitoring.",
    status: "Selected project.",
    technologies: ["Python", "YOLOv8", "OpenCV", "Tracking"],
    githubUrl: "https://github.com/virajchoudhary/Traffic-Analyzer",
  },
  {
    id: "neural-linguistic-suite",
    title: "Neural Linguistic Suite",
    category: "NLP · Cloud inference",
    summary:
      "Serverless FastAPI translation and summarisation with dynamic hosted-model routing.",
    problem:
      "Useful language services should not require a local GPU or a single fragile hosted-model dependency.",
    approach:
      "A FastAPI layer routes translation and summarisation requests across hosted transformer models with resilient error handling.",
    status: "Selected project.",
    technologies: ["FastAPI", "Hugging Face", "MarianMT", "DistilBART"],
    githubUrl:
      "https://github.com/virajchoudhary/Neural-Linguistic-Suite",
  },
];

export const projectById = Object.fromEntries(
  projects.map((project) => [project.id, project]),
) as Record<ProjectId, Project>;
