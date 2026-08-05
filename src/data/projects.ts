/**
 * projects.ts — Shared project data for the carousel and detail pages.
 */

export interface Project {
  id: string;
  tag: string;
  title: string;
  shortTitle: string;
  gradient: string;
  overview: string;
  technologies: string[];
  features: string[];
  repo: string;
  live: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'edureels',
    tag: '01',
    title: 'EduReels',
    shortTitle: 'EduReels',
    gradient: 'linear-gradient(135deg, #3a471f, #9fbd42)',
    overview:
      'EduReels is an interactive, bite-sized learning platform delivering educational courses through 60-second micro-videos combined with integrated quizzes.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    features: [
      'Auto-advancing 60-second video feeds',
      'Embedded pop-up quizzes',
      'Local progress tracking',
      'Responsive mobile layouts'
    ],
    repo: 'https://github.com',
    live: '#'
  },
  {
    id: 'accident',
    tag: '02',
    title: 'Road Accident Prediction',
    shortTitle: 'Road Accident Prediction',
    gradient: 'linear-gradient(135deg, #465421, #b6d457)',
    overview:
      'An intelligence system modeling historical crash data to forecast road risk probabilities using a Random Forest Classifier.',
    technologies: ['Python', 'scikit-learn', 'pandas'],
    features: [
      'Interactive prediction dashboard',
      '82% hazard detection accuracy',
      'Data preprocessing pipeline',
      'Feature importance charts'
    ],
    repo: 'https://github.com',
    live: '#'
  },
  {
    id: 'attrition',
    tag: '03',
    title: 'Employee Attrition Predictor',
    shortTitle: 'Employee Attrition Predictor',
    gradient: 'linear-gradient(135deg, #2f3a1a, #7c9a2e)',
    overview:
      'An HR dashboard predicting company staff attrition probability using survey scores and business metrics.',
    technologies: ['Python', 'TypeScript', 'Chart.js'],
    features: [
      'Interactive department filter',
      'Individual risk evaluation',
      'Correlation analysis',
      'Clean dashboard visualizations'
    ],
    repo: 'https://github.com',
    live: '#'
  },
  {
    id: 'nlp',
    tag: '04',
    title: 'Research Intelligence Platform',
    shortTitle: 'Research Intelligence',
    gradient: 'linear-gradient(135deg, #3a471f, #9fbd42)',
    overview:
      'A semantic search engine for academic PDFs using pre-trained Transformer embeddings.',
    technologies: ['TypeScript', 'SQLite', 'Transformers.js'],
    features: [
      'Local semantic search',
      'Interactive cluster network',
      'Auto document summaries',
      'Offline database caching'
    ],
    repo: 'https://github.com',
    live: '#'
  },
  {
    id: 'chatbot',
    tag: '05',
    title: 'AI Chat Assistant',
    shortTitle: 'AI Chat Assistant',
    gradient: 'linear-gradient(135deg, #465421, #b6d457)',
    overview:
      'A conversational AI assistant that answers product questions and routes support tickets using a fine-tuned language model.',
    technologies: ['Python', 'PyTorch', 'FastAPI'],
    features: [
      'RAG over product documentation',
      'Intent-based ticket routing',
      'Streaming token responses',
      'Human hand-off escalation'
    ],
    repo: 'https://github.com',
    live: '#'
  },
  {
    id: 'dashboard',
    tag: '06',
    title: 'Data Visualization Dashboard',
    shortTitle: 'Data Viz Dashboard',
    gradient: 'linear-gradient(135deg, #2f3a1a, #7c9a2e)',
    overview:
      'An interactive analytics dashboard visualizing thousands of data points with smooth chart transitions and drill-down views.',
    technologies: ['React', 'D3.js', 'TypeScript'],
    features: [
      'Real-time data streaming',
      'Drill-down chart interactions',
      'Exportable report views',
      'Dark/light theme sync'
    ],
    repo: 'https://github.com',
    live: '#'
  },
  {
    id: 'commerce',
    tag: '07',
    title: 'E-commerce Storefront',
    shortTitle: 'E-commerce Storefront',
    gradient: 'linear-gradient(135deg, #3a471f, #9fbd42)',
    overview:
      'A fast, accessible online storefront with a frictionless checkout flow and instant product search.',
    technologies: ['Next.js', 'PostgreSQL', 'Tailwind CSS'],
    features: [
      'Instant product search',
      'Optimistic cart updates',
      'Stripe checkout integration',
      'Server-rendered product pages'
    ],
    repo: 'https://github.com',
    live: '#'
  }
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id);
}
