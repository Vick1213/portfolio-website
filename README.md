# Saatvik Choudhary — Portfolio

A 3D interactive portfolio rendered on a silicon-die canvas. The viewer navigates between four thematic "zones" (Silicon, Web, Client, ML Roots), each floating in 3D space as a cluster of project tiles. Built with Next.js 15 App Router and React Three Fiber.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| 3D / WebGL | React Three Fiber, @react-three/drei, @react-three/postprocessing |
| Styling | Tailwind CSS 4 |
| Animation | GSAP, Lenis (smooth scroll) |
| State | Zustand |
| Fonts | Inter (sans), JetBrains Mono (mono) via next/font |
| Deployment | Vercel |

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm start      # serve the production build locally
```

Requires Node 20+ and pnpm.

## Architecture

```
app/
  layout.tsx            Root layout — metadata, viewport, fonts
  page.tsx              Single-page entry — mounts the 3D canvas
  opengraph-image.tsx   OG card (1200x630) generated via next/og
  icon.tsx              Favicon (32x32) generated via next/og
  sitemap.ts            /sitemap.xml — homepage entry
  robots.ts             /robots.txt — allow all, link sitemap
  manifest.ts           /manifest.webmanifest — PWA manifest
  globals.css           CSS variables and base resets

components/
  scene/                React Three Fiber scene graph (canvas, zones, tiles, lights, postprocessing)
  ui/                   2D overlay components (nav, HUD, project drawer, skill panel)

lib/
  portfolio.ts          All content data: profile, projects, zones, skill categories
  types.ts              Shared TypeScript types (Profile, Project, Zone, etc.)
```

## Content

All portfolio content (projects, skills, zones) is authored in `lib/portfolio.ts` and originally sourced from `resume_portfolio.xml` at the project root. To add or edit projects, update `lib/portfolio.ts`.

## Deployment

The site is deployed on Vercel. The `metadataBase` URL and sitemap base URL are set to `https://saatvik.dev` — update the `BASE_URL` constant in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` if the domain changes.
