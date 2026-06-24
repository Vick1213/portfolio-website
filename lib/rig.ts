import { Vector3 } from 'three';
import type { Project } from './types';
import { allProjects } from './portfolio';

/**
 * THE EXPLODED RIG — PC-component taxonomy layered over the existing project data.
 *
 * This is a DERIVED view: it maps each project id → a PC component and ships the
 * per-component metadata (label, accent, exploded/installed transforms, skills).
 * The underlying `Project` shape and `zone` field are untouched, so the resume /
 * mobile-fallback paths (which group by `zone`) keep working unchanged.
 *
 * Coordinate frame: the motherboard is a vertical plane in X (width) × Y (height)
 * facing +Z (toward the viewer). Components mount onto/in front of it. Each part
 * has an INSTALLED pose (assembled tower) and an EXPLODED pose (teardown); the
 * scene lerps between them by a global explodeT ∈ [0,1].
 */

export type PCComponent = 'mobo' | 'cpu' | 'gpu' | 'ram' | 'storage' | 'psu' | 'io';

export interface PCComponentMeta {
  id: PCComponent;
  label: string; // "Motherboard"
  role: string; // short tag, e.g. "Foundation · ML + Game Dev"
  blurb: string; // one-line description
  accent: string; // hex
  installedPos: [number, number, number]; // assembled tower position
  explodedPos: [number, number, number]; // teardown position
  rotation: [number, number, number]; // radians
  size: [number, number, number]; // bounding-box hint for the part mesh
  skills: string[];
}

// id → component. Every tile + non-tile project is covered (33 total).
const RIG_MAP: Record<string, PCComponent> = {
  // GPU — the custom AI-accelerator card (the showpiece)
  aitochip: 'gpu',
  inference1: 'gpu', // Velocity Silicon — the company/shroud

  // MOTHERBOARD — ML + Game Dev foundations
  powergrader: 'mobo',
  'crypto-news-sentiment': 'mobo',
  'asl-detector': 'mobo',
  'cnn-classifier': 'mobo',
  'final-project-data': 'mobo',
  'epic-store-fps': 'mobo',

  // CPU — core production full-stack systems
  productivityai: 'cpu',
  'platforms-starter-kit': 'cpu',
  'market-terminal': 'cpu',
  'storyboardai-aws': 'cpu',

  // RAM — fast SPA / mobile modules
  coffeeapp: 'ram',
  'proposal-generator-ai': 'ram',
  'proposal-generator': 'ram',
  personalwebsite: 'ram',
  'klusterai-website': 'ram',
  storyboardai: 'ram',
  'demoapp-flutter': 'ram',
  hr_chatbot: 'ram',

  // STORAGE — data & pipelines
  'all-leads-foc': 'storage',
  'kensridge-data-platform': 'storage',
  socialscapescraper: 'storage',

  // PSU + NIC — client delivery & ops
  'kensridge-partners': 'psu',
  'kensridge-base44-app': 'psu',
  'kensridge-app': 'psu',
  quantumnreach: 'psu',
  odyssey: 'psu',
  router: 'psu',

  // EXPANSION / I-O — coursework & fundamentals
  'assignment4-services': 'io',
  cse445xml: 'io',
  'provided-code': 'io',
  'provided-code-tests': 'io',
};

export const pcComponents: PCComponentMeta[] = [
  {
    id: 'mobo',
    label: 'Motherboard',
    role: 'Foundation · ML + Game Dev',
    blurb: 'The board everything mounts to — where it started (2022–2024).',
    accent: '#fbbf24',
    installedPos: [0, 0, 0],
    explodedPos: [0, 0, -7],
    rotation: [0, 0, 0],
    size: [18, 22, 0.5],
    skills: [
      'Deep learning (CNN / LSTM / sequence models)',
      'NLP & text embeddings',
      'Computer vision',
      'Python / Jupyter / Pandas',
      'Data analysis',
      'Unreal Engine 5 + C++ game dev',
      'Rapid prototyping (hackathons)',
    ],
  },
  {
    id: 'cpu',
    label: 'CPU',
    role: 'Core Systems · Production full-stack',
    blurb: 'The general-purpose brain — production apps that stay online.',
    accent: '#818cf8',
    installedPos: [0, 5, 0.7],
    explodedPos: [0, 9.5, 6.5],
    rotation: [0, 0, 0],
    size: [4.5, 4.5, 0.8],
    skills: [
      'Next.js (App Router 14/15)',
      'React 18/19 · TypeScript',
      'Node / Express · Prisma · PostgreSQL',
      'Multi-tenant / subdomain architecture',
      'RBAC · NextAuth · OAuth',
      'Real-time (WebSocket)',
      'AWS CDK / serverless (Lambda, AppSync, Step Functions)',
      'System design',
    ],
  },
  {
    id: 'gpu',
    label: 'GPU — Custom AI Accelerator',
    role: 'The Showpiece · Silicon he designed',
    blurb: 'Not a card he bought — a card he designed: from-scratch AI-inference ASICs.',
    accent: '#5eead4',
    installedPos: [0, -3.5, 1.4],
    explodedPos: [0, -8.5, 10],
    rotation: [0, 0, 0],
    size: [16, 5, 1.4],
    skills: [
      'Verilog / SystemVerilog RTL',
      'AI-accelerator architecture',
      'Memory hierarchy (HBM3e, SRAM partitioning)',
      'Quantization (INT8/INT4/FP8/MXFP4/NVFP4)',
      'Logic synthesis (Yosys) · Static Timing Analysis',
      'Tcl synthesis / PnR flows',
      'Python RTL codegen',
      'LLM-inference throughput modeling',
    ],
  },
  {
    id: 'ram',
    label: 'RAM',
    role: 'Rapid Modules · Fast web/mobile',
    blurb: 'Small, fast, modular shipping — four sticks of quick builds.',
    accent: '#34d399',
    installedPos: [6.5, 5.5, 0.6],
    explodedPos: [12, 9.5, 5],
    rotation: [0, 0, 0],
    size: [4, 6, 0.6],
    skills: [
      'Frontend SPA (React / Vite / Next)',
      'Tailwind · shadcn/ui',
      'React Native + Expo (cross-platform)',
      'Flutter / Dart',
      'LLM app integration',
      'Vercel · fast iteration',
    ],
  },
  {
    id: 'storage',
    label: 'Storage',
    role: 'Data & Pipelines · NVMe / SSD',
    blurb: 'Where the data lives and moves — pipelines, scraping, time-series.',
    accent: '#38bdf8',
    installedPos: [-6.5, -1, 0.6],
    explodedPos: [-12, -2, 6],
    rotation: [0, 0, 0],
    size: [5, 3, 0.5],
    skills: [
      'Python ETL / data pipelines',
      'Web scraping',
      'DuckDB (time-series) · SQLite (WAL)',
      'PostgreSQL',
      'APScheduler ingestion',
      'OpenAPI type generation',
      'Relational data modeling',
    ],
  },
  {
    id: 'psu',
    label: 'PSU + Network',
    role: 'Client Delivery & Ops · Power + connectivity',
    blurb: 'Powers the build and connects it to clients — delivery and self-hosting.',
    accent: '#f0abfc',
    installedPos: [0, -9.5, 0.6],
    explodedPos: [0, -15.5, 7],
    rotation: [0, 0, 0],
    size: [10, 4, 4],
    skills: [
      'Client delivery',
      'AI app builders (Base44)',
      'Astro static-site perf + SEO',
      'Template customization',
      'Self-hosting OSS · Docker',
      'Redis (Upstash) · Resend email',
      'MDX content',
    ],
  },
  {
    id: 'io',
    label: 'Expansion / I-O',
    role: 'Fundamentals · Coursework',
    blurb: 'The expansion slots where the CS fundamentals were learned.',
    accent: '#94a3b8',
    installedPos: [-8.5, 4.5, 0.5],
    explodedPos: [-13.5, 6.5, -3],
    rotation: [0, 0, 0],
    size: [6, 2.5, 0.4],
    skills: [
      'C++ (data structures & algorithms)',
      'C# / ASP.NET web services',
      'XML / XSD',
      'Makefiles / Shell',
    ],
  },
];

export const pcComponentById = Object.fromEntries(
  pcComponents.map((c) => [c.id, c])
) as Record<PCComponent, PCComponentMeta>;

/** Compact labels for the in-scene hotspots, HUD chips, and manifest rows. */
export const COMPONENT_SHORT: Record<PCComponent, string> = {
  mobo: 'MOBO',
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  storage: 'SSD',
  psu: 'PSU',
  io: 'I/O',
};

/** Left-to-right HUD / manifest order (board layout reading order). */
export const COMPONENT_ORDER: PCComponent[] = [
  'mobo',
  'cpu',
  'gpu',
  'ram',
  'storage',
  'psu',
  'io',
];

/**
 * BUILD TOUR order — the career arc told as a build: foundations → core →
 * fast modules → data → power/delivery → the chip he designed (the finale).
 * `io` (coursework) is folded into the Motherboard era and skipped on the tour.
 */
export const COMPONENT_TOUR_ORDER: PCComponent[] = [
  'mobo',
  'cpu',
  'ram',
  'storage',
  'psu',
  'gpu',
];

/**
 * LIVE world-space centers of the 7 RIG_* groups, in scene units. Written every
 * frame by `RigModel` (which knows the real GLB geometry + the current explode
 * amount) and read by the camera-nav helpers + Hotspots. Kept OUT of zustand so
 * the hot path never re-renders React.
 *
 * Seeded from each component's hand-authored `explodedPos` so any consumer that
 * runs before RigModel's first frame still gets a sane (non-NaN) pose; `ready`
 * flips true once RigModel has published real, geometry-derived centers.
 */
export const rigChannel: {
  ready: boolean;
  centers: Record<PCComponent, Vector3>;
  /** Live world-space AABB of the whole rig at the ASSEMBLED rest pose. Written
   *  once by RigModel; used to ground the table floor (Y only). NOTE: X/Z can be
   *  polluted by mislabeled stray geometry, so do NOT anchor UI to it directly. */
  bounds: { min: Vector3; max: Vector3; ready: boolean };
  /** Robust on-case power-button anchor (top-front-center of the MOTHERBOARD box,
   *  which is well-segmented and central) + a size for the glyph. Written once. */
  power: { anchor: Vector3; size: number; ready: boolean };
  /** Robust table-floor placement (case bottom Y + horizontal center X/Z),
   *  derived from the well-segmented components so mislabeled stray geometry
   *  doesn't drag the table down. Written once by RigModel. */
  floor: { y: number; x: number; z: number; ready: boolean };
} = {
  ready: false,
  centers: Object.fromEntries(
    pcComponents.map((c) => [c.id, new Vector3(...c.explodedPos)])
  ) as Record<PCComponent, Vector3>,
  bounds: { min: new Vector3(-8, -10, -4), max: new Vector3(8, 10, 4), ready: false },
  power: { anchor: new Vector3(0, 6, 4), size: 0.4, ready: false },
  floor: { y: -8, x: 0, z: 1, ready: false },
};

/** The PC component a project belongs to (undefined if untagged). */
export function componentOf(projectId: string): PCComponent | undefined {
  return RIG_MAP[projectId];
}

/**
 * Projects mounted on a given component, featured-first then by commit volume —
 * the order the scene lays them out as sub-parts (DIMM sticks, VRAM modules, …).
 */
export function projectsByComponent(id: PCComponent): Project[] {
  return allProjects
    .filter((p) => RIG_MAP[p.id] === id)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.commits - a.commits);
}
