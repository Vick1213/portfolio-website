# Plan: "Silicon Die" 3D Portfolio — Concrete, Collision-Free Build Spec

## Context

Saatvik wants a creative 3D Three.js personal site showcasing his projects/experience.
All content already exists, fully written, in `resume_portfolio.xml` (33 projects + skills + profile).
The repo is a bare Next.js scaffold: only `package.json`, `.gitignore`, and the XML exist — **no app code yet**.

The concept and stack are **locked** (decided in prior Q&A):
- **Concept:** Silicon-die / chip world. A camera flies over a glowing chip; each project is a
  "compute tile" grouped into 4 career **zones**: Silicon (hardware) → Web → Client → ML roots.
- **Stack:** Next.js 15 (App Router) + React Three Fiber + drei + postprocessing + GSAP + Lenis + Zustand + Tailwind v4.
- **Goal:** recruiter-first. The 3D is the hook, but there is always a fast, readable **resume/list path**
  and a **mobile / no-WebGL fallback**. Reduced-motion is respected.

**Why this rewrite of the earlier plan:** the previous plan was directionally right but left too many
decisions to the executor (which project → which zone/grid/accent, world coordinates, exact component
APIs, config contents). This version **freezes every contract and every data value** so that several
small-model (Sonnet/Haiku) workflow agents can each take one task and execute it in isolation with
**zero shared-file edits and zero design decisions**.

---

## Execution model (3 phases)

- **Phase A — Foundation (1 agent, runs ALONE first).** Writes all configs + all `lib/*` contracts.
  Nothing else may start until A is committed. After A, the contracts are **frozen** — Phase B/C import
  them and must never edit them.
- **Phase B — Features (5 agents, fully parallel).** Each agent owns a **disjoint set of files** (see the
  File Ownership Matrix). An agent may only create files it owns; it imports from `lib/*` and reads this
  spec for sibling component prop shapes. **No agent edits a file owned by another agent.**
- **Phase C — Glue + run (1 agent, after all B agents).** Writes `app/page.tsx` + `components/Experience.tsx`,
  installs deps, and fixes only build/type errors.

### File Ownership Matrix (the anti-collision contract)

| Owner | Files (create only these) |
|---|---|
| **A** | `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `next-env.d.ts` (auto), `app/globals.css`, `app/layout.tsx`, `lib/types.ts`, `lib/portfolio.ts`, `lib/store.ts`, `lib/camera.ts`, `lib/constants.ts` |
| **B1** | `components/scene/ChipDie.tsx`, `components/scene/Traces.tsx`, `components/scene/ProjectTile.tsx`, `components/scene/ZoneLabel.tsx` |
| **B2** | `components/scene/CameraRig.tsx` |
| **B3** | `components/scene/Lights.tsx`, `components/scene/Effects.tsx`, `components/scene/Loader.tsx` |
| **B4** | `components/ui/Hud.tsx`, `components/ui/Intro.tsx`, `components/ui/ProjectPanel.tsx`, `components/ui/ZoneNav.tsx` |
| **B5** | `components/ui/ResumeView.tsx`, `components/ui/MobileFallback.tsx`, `lib/useResponsive.ts` |
| **C** | `components/Experience.tsx`, `app/page.tsx` |

> Rule for every B/C agent: **do not create or modify any file outside your row.** If you think you need a
> shared helper, it already exists in `lib/*` (Phase A) — use it. Every scene/ui file starts with `'use client'`.

---

## Coordinate system (shared mental model — implemented once in `lib/camera.ts`)

- World is XZ-plane; camera looks down/forward. The die is a long slab along **+X**.
- 4 zones sit left→right along X at origins: silicon `-18`, web `-6`, client `+6`, ml `+18` (all `y=0,z=0`).
- Within a zone, a tile at `grid=[col,row]` sits at world `(origin.x + col*TILE_SPACING, 0, row*TILE_SPACING)`.
  `col ∈ {-1,0,1}`, `row ∈ {0,1,2}`. `TILE_SPACING = 2.6`.
- Featured tiles render bigger but occupy the same single grid cell.
- This formula lives **only** in `tilePosition()` in `lib/camera.ts`; `ProjectTile` and `CameraRig` both import it.

---

# PHASE A — FROZEN CONTRACTS (verbatim targets)

### `lib/types.ts`
```ts
export type Zone = 'silicon' | 'web' | 'client' | 'ml';
export type ProjType = 'original' | 'template-based' | 'ai-builder' | 'fork' | 'coursework';

export interface ProjectLinks {
  repo?: string; live?: string; demo?: string; presentation?: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  zone: Zone;
  type: ProjType;
  tile: boolean;                 // true → rendered as a 3D compute tile
  featured: boolean;             // true → larger tile, leads its zone
  grid?: [number, number];       // [col,row]; REQUIRED when tile===true, omit otherwise
  start: string;                 // "YYYY-MM"
  lastActive: string;            // "YYYY-MM"
  status: string;
  months: number;
  primaryLanguage: string;
  commits: number;
  tech: string[];
  skills: string[];
  bullets: string[];
  links: ProjectLinks;
}

export interface ZoneMeta {
  id: Zone;
  label: string;
  blurb: string;
  accent: string;                // hex
  origin: [number, number, number];
}

export interface SkillCategory { name: string; skills: { label: string; level: string }[]; }

export interface Profile {
  name: string; headline: string; email: string;
  github: string; githubAlt: string; languages: string[];
}
```

### `lib/constants.ts`
```ts
export const TILE_SPACING = 2.6;
export const TILE_SIZE = 1.8;          // base tile footprint
export const TILE_SIZE_FEATURED = 2.6; // featured footprint
export const DIE_SIZE: [number, number, number] = [52, 1, 16]; // box geometry
export const DIE_CENTER: [number, number, number] = [0, -0.6, 3];
```

### `lib/portfolio.ts`
Exports `profile: Profile`, `zones: ZoneMeta[]`, `allProjects: Project[]`,
`projects = allProjects.filter(p => p.tile)`, `resumeProjects = allProjects` (XML order),
`skillCategories: SkillCategory[]`.

**`profile`** — from XML `<profile_summary>`:
- `name: 'Saatvik Choudhary'`
- `headline: 'Chip architect & full-stack engineer — from custom AI-accelerator ASICs (Verilog/RTL) to production web, mobile, and data systems.'`
- `email: 'saatvik1213@gmail.com'`
- `github: 'https://github.com/Vick1213'`, `githubAlt: 'https://github.com/saatvik1213'`
- `languages`: array from `<languages_observed>`.

**`zones`** (exactly 4):
| id | label | accent | origin | blurb (source) |
|---|---|---|---|---|
| silicon | "Silicon" | `#5eead4` | `[-18,0,0]` | hardware / chip-design line |
| web | "Web & Full-Stack" | `#818cf8` | `[-6,0,0]` | production web + mobile apps |
| client | "Client & Product" | `#f0abfc` | `[6,0,0]` | client / company sites & platforms |
| ml | "ML Roots" | `#fbbf24` | `[18,0,0]` | earlier ML / data / coursework foundation |

**`allProjects`** — one entry per project below. For each: copy `tagline`, `description`, `tech`,
`skills` (skill text), `bullets` (resume_bullets text), and `links` **verbatim** from the matching
`<project>` in `resume_portfolio.xml`; copy `type`, `status`, `commits`, `primary_language`, `months`,
and `start`/`last_active` (→ `start`/`lastActive`) from its attributes. `zone`, `tile`, `featured`, `grid`
come from this table (authoritative — do not improvise). Keep array order = XML order.

| id (XML) | zone | tile | featured | grid |
|---|---|---|---|---|
| aitochip | silicon | ✓ | ✓ | [0,0] |
| productivityai | web | ✓ | ✓ | [0,0] |
| platforms-starter-kit | web | ✓ | ✓ | [-1,0] |
| market-terminal | web | ✓ | | [1,0] |
| storyboardai | web | ✓ | | [-1,1] |
| storyboardai-aws | web | ✓ | | [0,1] |
| all-leads-foc | web | | | — |
| socialscapescraper | web | ✓ | | [1,1] |
| proposal-generator-ai | web | ✓ | | [-1,2] |
| proposal-generator | web | | | — |
| coffeeapp | web | ✓ | | [0,2] |
| personalwebsite | web | ✓ | | [1,2] |
| inference1 | client | ✓ | ✓ | [0,0] |
| kensridge-base44-app | client | ✓ | | [-1,0] |
| kensridge-data-platform | client | ✓ | | [1,0] |
| kensridge-partners | client | ✓ | | [-1,1] |
| kensridge-app | client | | | — |
| klusterai-website | client | ✓ | | [0,1] |
| hr_chatbot | web | | | — |
| quantumnreach | web | | | — |
| odyssey | web | | | — |
| router | web | | | — |
| final-project-data | ml | | | — |
| assignment4-services | ml | | | — |
| cse445xml | ml | | | — |
| provided-code | ml | | | — |
| provided-code-tests | ml | | | — |
| powergrader | ml | ✓ | ✓ | [0,0] |
| crypto-news-sentiment | ml | ✓ | | [-1,0] |
| asl-detector | ml | ✓ | | [1,0] |
| cnn-classifier | ml | ✓ | | [-1,1] |
| epic-store-fps | ml | ✓ | | [0,1] |
| demoapp-flutter | ml | | | — |

> Result: 5 featured, 20 tiles, 33 total resume entries. Every `tile:true` row has a `grid`; every
> `tile:false` row omits `grid` and `featured:false`. `accent` is **not** stored per-project — components
> derive it from the zone via a `zoneById` lookup (see ZoneLabel/Tile specs).

**`skillCategories`** — transcribe the 8 `<category>` blocks from `<skills_summary>` (name + each
skill's text and `level`). Used only by ResumeView.

Add a tiny helper for downstream: `export const zoneById = Object.fromEntries(zones.map(z => [z.id, z])) as Record<Zone, ZoneMeta>;`

### `lib/store.ts` (Zustand)
```ts
import { create } from 'zustand';
import type { Project, Zone } from './types';

interface UIState {
  intro: boolean;        setIntro: (v: boolean) => void;       // intro/power-on overlay visible
  activeZone: Zone | null; setZone: (z: Zone | null) => void;  // null = overview
  selected: Project | null; select: (p: Project | null) => void;
  view: '3d' | 'list';   setView: (v: '3d' | 'list') => void;  // resume fallback toggle
  reduced: boolean;      setReduced: (v: boolean) => void;     // reduced-motion / low-power
}

export const useUI = create<UIState>((set) => ({
  intro: true,        setIntro: (v) => set({ intro: v }),
  activeZone: null,   setZone: (z) => set({ activeZone: z }),
  selected: null,     select: (p) => set({ selected: p, activeZone: p ? p.zone : null }),
  view: '3d',         setView: (v) => set({ view: v }),
  reduced: false,     setReduced: (v) => set({ reduced: v }),
}));
```

### `lib/camera.ts` (pure; no React/three imports needed beyond types)
```ts
import type { Project, Zone } from './types';
import { zones } from './portfolio';
import { TILE_SPACING } from './constants';

export type CamPose = { pos: [number, number, number]; target: [number, number, number] };

const originOf = (zone: Zone): [number, number, number] =>
  zones.find(z => z.id === zone)!.origin;

export function tilePosition(p: Project): [number, number, number] {
  const o = originOf(p.zone);
  const [col, row] = p.grid ?? [0, 0];
  return [o[0] + col * TILE_SPACING, 0, row * TILE_SPACING];
}

export const overviewCamera: CamPose = { pos: [0, 22, 26], target: [0, 0, 3] };

export function zoneCamera(zone: Zone | null): CamPose {
  if (!zone) return overviewCamera;
  const o = originOf(zone);
  return { pos: [o[0], 10, 14], target: [o[0], 0, 2.6] };
}

export function projectCamera(p: Project): CamPose {
  const t = tilePosition(p);
  return { pos: [t[0], 5, t[2] + 7], target: t };
}
```

### Config files (exact behavior)
- **`next.config.mjs`**: `export default { transpilePackages: ['three'], reactStrictMode: true };`
- **`tsconfig.json`**: standard Next.js 15 strict config with `"paths": { "@/*": ["./*"] }`, `"moduleResolution": "bundler"`, `jsx: "preserve"`, include `next-env.d.ts`, `**/*.ts`, `**/*.tsx`.
- **`postcss.config.mjs`**: `export default { plugins: { '@tailwindcss/postcss': {} } };`
- **`app/globals.css`**: `@import "tailwindcss";` then `:root` CSS vars for the 4 accents
  (`--silicon:#5eead4; --web:#818cf8; --client:#f0abfc; --ml:#fbbf24;`), a near-black bg
  (`--bg:#05060a`), and a mono/sans font pairing. Set `html,body{background:var(--bg);color:#e5e7eb;margin:0;height:100%;overflow:hidden;}`
  (overview locks scroll; ResumeView re-enables via a class).
- **`app/layout.tsx`**: server component. `export const metadata` (title "Saatvik Choudhary — Chip Architect & Full-Stack Engineer", description from headline, OpenGraph). Load `next/font` (e.g. Inter + a mono like JetBrains Mono) → CSS vars. Render `<html lang="en"><body>{children}</body></html>`. Import `./globals.css`.

**Phase A also verifies `package.json`** has the locked deps (already present) and adds an `engines`/`packageManager` note only if missing. Do not downgrade versions.

**Phase A acceptance:** `npx tsc --noEmit` passes for everything in `lib/` (components don't exist yet, so scope the check or accept missing-module errors only from non-lib files). Commit before any B agent starts.

---

# PHASE B — FEATURES (5 parallel agents)

Every component below is a client component (`'use client'` at top). Props interfaces are **frozen** here so
Phase C and sibling components can rely on them. Each agent imports data from `@/lib/portfolio`, state from
`@/lib/store`, helpers from `@/lib/camera`, constants from `@/lib/constants`.

### B1 — Chip scene geometry
Files: `components/scene/ChipDie.tsx`, `Traces.tsx`, `ProjectTile.tsx`, `ZoneLabel.tsx`.

- **`ChipDie`** — `export default function ChipDie()`. A large beveled slab using `DIE_SIZE`/`DIE_CENTER`
  with a dark metallic `meshStandardMaterial`, plus a drei `<Grid>` overlaid on top (subtle emissive grid,
  fade edges) to read as etched silicon. No props.
- **`ProjectTile`** — `export default function ProjectTile({ project }: { project: Project })`.
  Position via `tilePosition(project)`. Beveled box; footprint = `TILE_SIZE_FEATURED` if `featured` else
  `TILE_SIZE`. Emissive accent = `zoneById[project.zone].accent`. On hover: lift `+0.4` y, intensify
  emissive, set cursor pointer, and call `useUI().select` only on click — **hover does not select**.
  On click: `useUI.getState().select(project)`. Use `@react-three/fiber` pointer events + GSAP or
  `useFrame` lerp for the lift.
- **`Traces`** — `export default function Traces()`. Instanced thin emissive lines connecting each zone's
  featured tile to its sibling tiles (circuit traces). Animate a dash/flow offset in `useFrame`, gated:
  if `useUI().reduced` is true, render static (no animation). Derive endpoints from `projects` + `tilePosition`.
- **`ZoneLabel`** — `export default function ZoneLabel({ zone }: { zone: ZoneMeta })`. drei `<Text>`
  floating above the zone origin showing `zone.label` in `zone.accent`. (Phase C maps `zones` → one
  `ZoneLabel` per zone.)

### B2 — Camera + interaction rig
File: `components/scene/CameraRig.tsx`.
- `export default function CameraRig()`. Reads `useUI().activeZone` and `useUI().selected`.
- Compute desired pose: `selected ? projectCamera(selected) : zoneCamera(activeZone)`.
- On change, **GSAP-tween** `camera.position` and a target vector over ~1.2s ease `power3.inOut`; apply
  target via `camera.lookAt` each frame while tweening.
- Idle (overview, nothing selected): slow auto-orbit around `overviewCamera.target` — **disabled when
  `useUI().reduced`**.
- Render a drei `<OrbitControls makeDefault enableDamping />` with constrained polar/azimuth and
  `enabled={activeZone === null && selected === null}` (free look only in overview). Do **not** import
  any scene-geometry files; depend only on `@/lib/camera` + store.

### B3 — Lighting, FX, loader
Files: `components/scene/Lights.tsx`, `Effects.tsx`, `Loader.tsx`.
- **`Lights`** — `export default function Lights()`. Dark scene: low ambient + a key directional + 4 colored
  rim/point lights placed at each zone origin using `zones[i].accent`. No props.
- **`Effects`** — `export default function Effects()`. `<EffectComposer>` from
  `@react-three/postprocessing`: `Bloom` (moderate), subtle `ChromaticAberration`, `Vignette`. **Return
  `null` when `useUI().reduced` is true** (no post-processing on low-power/reduced-motion).
- **`Loader`** — `export default function Loader()`. DOM overlay (fixed, full-screen, on top of canvas)
  using drei `useProgress`; styled as a "BOOTING SILICON…" power-on sequence with a progress bar. This is
  the `<Suspense fallback>` used by Phase C.

### B4 — UI / HUD overlay (DOM on top of canvas)
Files: `components/ui/Hud.tsx`, `Intro.tsx`, `ProjectPanel.tsx`, `ZoneNav.tsx`.
All are absolutely-positioned DOM (Tailwind), pointer-events managed so the canvas stays interactive.
- **`Intro`** — `export default function Intro()`. Full-screen power-on title card: name + headline +
  an **"Enter"** button → `useUI().setIntro(false)`. Hidden when `intro===false`. Respects reduced (skip
  fancy animation, keep button).
- **`Hud`** — `export default function Hud()`. Top bar: left = `profile.name`; center = `<ZoneNav/>`;
  right = a **3D / List** toggle calling `useUI().setView`. Always visible once intro is dismissed.
- **`ZoneNav`** — `export default function ZoneNav()`. Renders a chip per `zones` entry (accent-colored);
  click → `useUI().setZone(zone.id)`; an "Overview" chip → `setZone(null)`. Highlights `activeZone`.
- **`ProjectPanel`** — `export default function ProjectPanel()`. Reads `useUI().selected`; if null, render
  nothing. Else slide-in right panel: type badge (color by `type`), `name`, `tagline`, `description`,
  tech chips, bullet list, and link buttons (`links.repo/live/demo/presentation` — only those present).
  Close button → `useUI().select(null)`. This is the recruiter-readable detail surface (DOM text, not in-canvas).

### B5 — Resume/list view + responsive/fallback
Files: `components/ui/ResumeView.tsx`, `components/ui/MobileFallback.tsx`, `lib/useResponsive.ts`.
- **`useResponsive`** — `export function useResponsive(): { small: boolean; webgl: boolean }`. On mount:
  detect small screen (`matchMedia('(max-width: 768px)')`), WebGL support (try create `webgl`/`experimental-webgl`
  context), and `prefers-reduced-motion` → call `useUI().setReduced(true)` when matched. Re-evaluate on resize.
- **`ResumeView`** — `export default function ResumeView()`. Scrollable, printable, recruiter-friendly page:
  header (name, headline, email, GitHub links), then `resumeProjects` grouped by `zone` (use `zones` order
  and labels), each item showing name, type badge, tagline, tech, and bullets; then a skills section from
  `skillCategories`. Adds an `overflow:auto` wrapper (overrides the body scroll lock). Plain DOM/Tailwind, no canvas.
- **`MobileFallback`** — `export default function MobileFallback()`. Static hero (name + headline +
  a CSS/SVG chip motif, no WebGL) followed by `<ResumeView/>`. Used for small screens / no-WebGL.

---

# PHASE C — Glue + run
Files: `components/Experience.tsx`, `app/page.tsx`.

- **`Experience.tsx`** (`'use client'`): the `<Canvas>` (camera default fov ~45). Inside, mount
  `<Lights/>`, `<ChipDie/>`, `<Traces/>`, one `<ProjectTile project={p}/>` per `projects`, one
  `<ZoneLabel zone={z}/>` per `zones`, `<CameraRig/>`, and `<Effects/>` — all wrapped in
  `<Suspense fallback={null}>` (the DOM `<Loader/>` is rendered by page, driven by `useProgress`).
- **`page.tsx`** (`'use client'`):
  1. `const { small, webgl } = useResponsive(); const view = useUI(s=>s.view);`
  2. If `small || !webgl || view === 'list'` → render `<MobileFallback/>` (or `<ResumeView/>` when only
     `view==='list'` on desktop).
  3. Else render: `<Loader/>` (self-hides), `Experience` via
     `dynamic(() => import('@/components/Experience'), { ssr: false })`, then DOM overlays `<Intro/>`,
     `<Hud/>`, `<ProjectPanel/>`.
- **Lenis**: initialize smooth scroll only inside `ResumeView`/`MobileFallback` scroll containers (not over
  the locked 3D canvas). Skip when `reduced`.
- **Run:** `pnpm install` (lockfile-free ok), then `pnpm build`. Fix **only** type/build errors; do not
  redesign. If build is heavy, a `pnpm dev` smoke + `npx tsc --noEmit` is acceptable evidence.

---

## Agent dispatch instructions (for the implementing session)

1. Create/checkout branch `claude/relaunch-plan-osjiw2` (already current).
2. **Phase A:** one agent, this spec's Phase A section as its full brief. Commit `feat: foundation configs + frozen lib contracts`.
3. **Phase B:** launch B1–B5 **in one message** (parallel). Give each agent: its row from the File
   Ownership Matrix, its task section above, and the frozen `lib/*` signatures. Tell each: "create only your
   files; import everything else from `@/lib/*`; do not edit any lib or sibling file." Commit per task or batch.
4. **Phase C:** one agent after B completes. Commit `feat: wire canvas + responsive entry + build`.
5. Push with `git push -u origin claude/relaunch-plan-osjiw2` (retry w/ backoff on network errors). **No PR** unless asked.

## Verification (end-to-end)
- `npx tsc --noEmit` → no errors.
- `pnpm build` → succeeds (no SSR/window errors — confirms `ssr:false` + `'use client'` are correct).
- `pnpm dev`, then in a browser/Playwright:
  - Intro shows; "Enter" dismisses it.
  - Tiles render across 4 zones; hover lifts a tile; click opens `ProjectPanel` with correct text from XML.
  - ZoneNav chips fly the camera between zones; "Overview" returns and re-enables orbit.
  - 3D/List toggle swaps to `ResumeView`; all 33 projects + skills present and readable.
  - Emulate mobile / disable WebGL → `MobileFallback` renders (no canvas errors).
  - Set OS reduced-motion → no bloom, no auto-orbit, no trace animation; site still fully usable.
- Spot-check 3 projects (one featured, one tile, one resume-only) that name/tagline/bullets/links match `resume_portfolio.xml`.
