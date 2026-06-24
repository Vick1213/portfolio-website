# THE EXPLODED RIG — portfolio relaunch plan

Reimagine the portfolio as an **interactive exploded-view PC build**. Instead of a flat silicon die,
the screen shows a high-end PC whose components are pulled apart in mid-air — a premium product
teardown you can orbit, pan, zoom, and pull open. Each component is a district that hosts the
projects (and skills) that belong to it.

**The story it tells:** a career as a PC build that escalates — you start with the *motherboard*
(the ML + game-dev foundations), add a *CPU* (production full-stack systems), fill the *RAM/storage*
(fast modules + data), wire the *PSU/network* (client delivery + ops), and finally drop in a **GPU you
designed yourself** (the custom AI-accelerator silicon). The crown jewel isn't a bought card — it's
his own chip.

This is a **scene + data rework**, not a from-scratch rebuild: the interaction layer shipped in the
board-explorer pass (drag-pan/scroll-zoom camera, fly-to-focus, hover callouts, minimap, DOM panels,
FOUNDRY lighting) transfers almost wholesale. The new work is the 3D PC geometry, an
explode/assemble system, and re-tagging the projects onto PC components.

---

## 0. Locked decisions

- **Scope:** the Exploded Rig **replaces** the silicon-die scene (it becomes the only 3D experience).
  The `ProjectPanel`/resume/mobile-fallback paths stay; the die-specific scene meshes are retired.
- **First impression:** **explore-first** — land already explorable; a single one-shot
  assemble→explode "bloom" plays once on power-on (skippable; **static under reduced motion**). No
  forced cutscene.
- **Art direction:** **high realism** — detailed, recognizable components (heatsink fins, fan blades,
  GPU shroud + backplate, RAM heat-spreaders, capacitors, PSU cable harness, PCIe fingers). All built
  from procedural Three.js geometry (NO new deps / no external model assets). Perf budget enforced via
  instancing, modest poly counts, capped DPR, single-frame env, and tuned shadow resolution.

---

## 1. Component taxonomy (every project + its skills)

Seven districts. The three the user anchored — Motherboard, CPU, GPU — plus four to place the rest.

### ⬛ MOTHERBOARD — "The Foundation" (ML + Game Dev)
*The board everything mounts to — where it all started, 2022–2024.*
- **Projects:** PowerGrader (hackathon, featured) · Crypto-News Sentiment (Doc2Vec+LSTM) · ASL Detector (CV) ·
  CNN Image Classifier · Data-Science Final Project · Epic Store — FPS Co-Op (Unreal Engine 5) ·
  ML Notebooks collection (Drive).
- **Skills:** Deep learning (CNN / LSTM / sequence models) · NLP & text embeddings · Computer vision ·
  Python / Jupyter / Pandas · Data analysis · Unreal Engine 5 + C++ game dev · Rapid prototyping.

### ⬛ CPU — "Core Systems" (production full-stack brains)
*The general-purpose compute doing the heavy logic — the apps that stay online.*
- **Projects:** ProductivityAI (featured) · MarketPlace multi-tenant e-commerce (featured) ·
  Market Terminal (real-time Next.js + FastAPI) · StoryboardAI — AWS-Native Rebuild (cloud architecture).
- **Skills:** Next.js (App Router 14/15) · React 18/19 · TypeScript · Node/Express · Prisma · PostgreSQL ·
  Multi-tenant / subdomain architecture · RBAC / NextAuth / OAuth · Real-time (WebSocket) ·
  AWS CDK / serverless (Lambda, AppSync, Step Functions) · DynamoDB + Aurora/pgvector ·
  Bedrock/Claude orchestration · System design.

### ⬛ GPU — "Custom AI-Accelerator Card" (the showpiece)
*The hero. Not a card he bought — a card he designed: from-scratch AI-inference silicon.*
- **Projects / sub-parts:** AiToChip — Neural MAX & Neural 1 accelerators (featured) ·
  Velocity Silicon — the company commercializing it (Inference1 site).
  Render as a real card: the **GPU die = AiToChip**, the **VRAM modules = Neural MAX (datacenter) + Neural 1
  (edge) tapeouts**, the **shroud/branding = Velocity Silicon**.
- **Skills:** Verilog / SystemVerilog RTL · AI-accelerator architecture · Memory hierarchy (HBM3e, SRAM
  partitioning) · Quantization (INT8/INT4/FP8/MXFP4/NVFP4) · Logic synthesis (Yosys) · Static Timing
  Analysis · Tcl synthesis/PnR flows · Python RTL codegen · LLM-inference throughput modeling.

### ⬛ RAM — "Rapid Modules" (fast, parallel web/mobile builds)
*Four DIMM sticks — small, fast, modular shipping.*
- **Projects:** CoffeeApp · AI Proposal Generator (+ v1) · Personal Website · Kluster AI site ·
  StoryBoard AI (React Native original) · Flutter/Dart app · HR Chatbot.
- **Skills:** Frontend SPA (React / Vite / Next) · Tailwind · shadcn/ui · React Native + Expo
  (cross-platform iOS/Android/Web) · Flutter / Dart · LLM app integration · Vercel · fast iteration.

### ⬛ STORAGE — "Data & Pipelines" (NVMe / SSD / drive bay)
*Where the data lives and moves.*
- **Projects:** All-Leads-from-FOC (lead pipeline) · Kensridge Data Platform · SocialScape Scraper.
  (Market Terminal's DuckDB/ingest engine cross-referenced here.)
- **Skills:** Python ETL / data pipelines · Web scraping · DuckDB (time-series) · SQLite (WAL) ·
  PostgreSQL · APScheduler ingestion · OpenAPI type generation · relational data modeling.

### ⬛ PSU + NIC — "Client Delivery & Ops" (power + connectivity)
*Powers the build and connects it to the outside world — paid client work and self-hosting.*
- **Projects:** Kensridge Partners site · Kensridge App (Base44) · Kensridge App (early) ·
  QuantumnReach (outreach CRM) · Odyssey (Astro marketing) · Router.so (self-hosted form backend).
- **Skills:** Client delivery · AI app builders (Base44) · Astro static-site perf + SEO ·
  Template customization · Self-hosting OSS · Docker · Redis (Upstash) · Resend email · MDX content.

### ⬛ EXPANSION / I-O — "Fundamentals" (PCIe expansion slots + rear I/O)
*The slots where the CS fundamentals were learned.*
- **Projects:** ASP.NET Web Services (A4) · CSE445 XML · C++ Coursework ×2.
- **Skills:** C++ (data structures & algorithms) · C# / ASP.NET web services · XML / XSD · Makefiles / Shell.

> Judgment calls to confirm: Market Terminal (CPU primary, Storage cross-ref); HR Chatbot (RAM vs PSU);
> StoryBoard AI original RN (RAM) vs its AWS rebuild (CPU). Easy to move.

---

## 2. Visual direction — "exploded teardown"

- A mid-tower PC in **exploded axonometric**: side panel off, parts pulled apart along their install
  axes and floating in formation. Premium "what's inside" product-render feel.
- Reuse the **FOUNDRY** look: dark studio environment, reflective floor, ContactShadows, graded backdrop,
  tamed bloom. Brushed-metal case frame; PCB green/black boards; per-component RGB accent (extend the
  existing 4 zone accents to 7).
- Rough exploded anatomy:
  - **Case / chassis** = translucent wireframe outline enclosing the build (the portfolio shell).
  - **Motherboard** = large back-plane; everything visually mounts to it.
  - **CPU** = chip lifted from its socket, cooler exploded above.
  - **GPU card** = big horizontal card pulled forward from the PCIe slot — the visual hero.
  - **RAM** = 4 DIMM sticks fanned out beside the CPU.
  - **Storage** = M.2 sticks on the board + a 2.5" SSD in a bay.
  - **PSU** = box at the bottom with a cable harness; NIC/expansion cards in the lower slots.
  - **Expansion/I-O** = small cards in remaining slots + the rear I/O panel.
- Each component is labelled (billboarded, FOUNDRY's crisp SDF text) with a leader line, like a teardown
  diagram. Projects appear as the component's realistic sub-parts.

---

## 3. Interaction model (reuse the board-explorer, retuned)

- **Explore:** drag = orbit/pan, scroll = zoom, around the rig (OrbitControls — the fixed one — with
  bounds retuned to the case volume).
- **Hover a component** → datasheet callout: component name + what it represents + its headline skills.
- **Click a component** → fly-to + the component "opens"/highlights; its projects surface as sub-parts.
  Click a sub-part → the existing **ProjectPanel** opens (reused as-is).
- **EXPLODE ⇄ ASSEMBLE** — the signature motion (replaces the old "Tour" as the headline interaction):
  a toggle/slider animates every part between *installed* and *exploded* positions (gsap). On power-on,
  a one-shot assemble→explode "bloom" reveal. **Reduced-motion → static exploded, no auto-animation.**
- **Minimap → "BUILD MANIFEST"**: a parts legend listing the 7 components; click to fly; "you are here"
  highlights the current one.
- **Optional "BUILD TOUR"** (the tour infra, rebranded, OPT-IN only): walks the career arc
  Motherboard → CPU → RAM/Storage → PSU → **GPU** (foundations → systems → the chip he built).
  Skippable; never auto-plays; hidden under reduced motion.

---

## 4. Reuse vs new

**Reuse (retune, don't rewrite):**
- `lib/store.ts` — `camMode`/`flyRequest`/hover/`camReport`/tour scaffolding; rename zone→component.
- `lib/camera.ts` — poses + pan/zoom bounds, re-tuned to the case volume.
- `components/scene/CameraRig.tsx` — the OrbitControls explorer (already fixed).
- `components/ui/ProjectPanel.tsx`, `Hud.tsx` — minor copy/label changes.
- `components/ui/Minimap.tsx` → BuildManifest · `TourOverlay.tsx` → BuildTour.
- `components/scene/{Effects,Lights,Environment}` — the FOUNDRY art direction.
- `MobileFallback` path — untouched (separate code path).

**New:**
- `components/scene/parts/*` — Case, Motherboard, CPU, GPUCard, RAMStick, Storage, PSU, ExpansionCard
  (parameterized meshes); projects laid out as sub-parts.
- Explode/assemble system — each part carries `installedPos` + `explodedPos`; a global `explodeT` (0→1)
  lerps them (gsap-driven, reduced-gated).
- `lib/components.ts` — the 7-component metadata (label, accent, transforms, skills) + project→component
  tagging; `lib/types.ts` gains a `PCComponent` field.

---

## 5. Phased build (collision-free, build-green at each phase)

- **Phase 0 — Data taxonomy.** Add `PCComponent` type; tag all 33 projects + the notebooks collection;
  define component metadata + skill lists. (`lib/types.ts`, `lib/portfolio.ts`, new `lib/components.ts`)
- **Phase 1 — Scene geometry.** Build the exploded PC parts under FOUNDRY lighting; lay projects as
  sub-parts; component labels + leader lines.
- **Phase 2 — Explode/assemble + camera.** `explodeT` system; retune pan/zoom bounds + fly-to a
  component / sub-part.
- **Phase 3 — Interaction.** Hover callouts (component + skills), ProjectPanel wiring, BuildManifest
  minimap, EXPLODE toggle, optional Build Tour.
- **Phase 4 — Skills surfacing.** Each component shows its skill set (callout + panel + per-component
  skills strip).
- **Phase 5 — Verify.** `tsc` + `next build` green; reduced-motion + mobile fallback intact; screenshot.

---

## 6. Risks

- **Geometry & perf** — many parts/draw calls; mitigate with instancing, low-poly modeling, capped DPR,
  reuse of FOUNDRY's single env render.
- **Readability** — an exploded view can read as clutter; lean on labels, leader lines, and the
  explode toggle (assembled = clean overview, exploded = detail).
- **Motion sickness** — gentle explode easing, reduced-gated, no forced camera moves (lesson learned:
  no auto-cutscene; explore-first).
- **Scope** — this is a real scene rebuild; the phased plan keeps each step shippable and green.
- **Mobile** — `MobileFallback` stays the static resume; the 3D rig is desktop-only as today.
