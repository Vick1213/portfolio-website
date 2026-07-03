'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { skillCategories } from '@/lib/portfolio';

/**
 * SkillConstellation — a deterministic SVG "mind-map" of the skill categories,
 * shown on desktop as a creative flourish above the plain-text skills listing.
 *
 * The whole graph is decorative (`aria-hidden`): the readable content lives in
 * the text listing rendered elsewhere in the section. Layout is computed once in
 * useMemo from index-based geometry only (no Math.random, no runtime physics),
 * so the server and client render byte-identical markup.
 *
 * Layout strategy (tuned against the real data in lib/portfolio.ts):
 *  - A central hub with 8 category nodes on an ellipse around it.
 *  - Each category "owns" a 45° sector; its skills fan outward on 1–2 arcs.
 *  - Only ADVANCED skills carry a text label; intermediate skills are small
 *    dots with a <title> tooltip. Advanced labels are decluttered vertically
 *    per category (min 26px gap) so no two labels overlap — the nudge is tiny
 *    (< 4px in practice) because the fan already separates them well.
 */

// ---- canvas ----
const VBW = 1000;
const VBH = 620;
const HUBX = 500;
const HUBY = 310;

// ---- tuned layout constants (see collision check in commit notes) ----
const RX = 336; // category ellipse radii
const RY = 176;
const START_DEG = -112.5; // angle of category 0 (screen deg, 0 = east, +y down)
const RADV = 92; // base radius of the labeled (advanced) ring
const ADV_ZIG = 34; // radius zig-zag between consecutive advanced nodes
const RINT = 58; // base radius of the intermediate (dot) ring
const INT_ZIG = 16;
const SPA = 32; // advanced fan half-angle (deg)
const SPI = 22; // intermediate fan half-angle (deg)
const LABEL_OFF = 9; // px the label sits beyond its node, along the fan angle
const LABEL_GAP = 26; // min vertical spacing between advanced labels in a category
const CHARW = 6.35; // ~advance width of 11px JetBrains Mono, for edge-fit clamping
const PAD = 8; // canvas padding for label bounding boxes
const NODE_MARGIN = 14; // keep skill nodes this far inside the canvas
const D2R = Math.PI / 180;

const PALETTE = ['#0d9488', '#4f46e5', '#a21caf', '#b45309'];
const INK = '#16181d';
const LABEL_FILL = '#4c5560';
const INT_FILL = '#9aa0aa';
const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";

type Anchor = 'start' | 'middle' | 'end';

interface SkillNode {
  label: string;
  advanced: boolean;
  x: number;
  y: number;
  lx: number;
  ly: number;
  anchor: Anchor;
}

interface CatNode {
  name: string;
  color: string;
  x: number;
  y: number;
  skills: SkillNode[];
}

// Max radius from (cx,cy) along angle `a` before the point leaves the canvas margin.
function rMax(cx: number, cy: number, a: number): number {
  const c = Math.cos(a);
  const s = Math.sin(a);
  let r = Infinity;
  if (c > 1e-6) r = Math.min(r, (VBW - NODE_MARGIN - cx) / c);
  if (c < -1e-6) r = Math.min(r, (NODE_MARGIN - cx) / c);
  if (s > 1e-6) r = Math.min(r, (VBH - NODE_MARGIN - cy) / s);
  if (s < -1e-6) r = Math.min(r, (NODE_MARGIN - cy) / s);
  return r;
}

// Symmetric fractions in [-1, 1] for k items (single item -> centered).
function spreadFracs(k: number): number[] {
  if (k <= 1) return [0];
  const out: number[] = [];
  for (let i = 0; i < k; i++) out.push((i / (k - 1) - 0.5) * 2);
  return out;
}

interface Placed {
  label: string;
  advanced: boolean;
  x: number;
  y: number;
  angle: number;
}

function placeRing(
  cx: number,
  cy: number,
  outDir: number,
  items: { label: string; advanced: boolean }[],
  baseR: number,
  zig: number,
  spreadDeg: number
): Placed[] {
  const fr = spreadFracs(items.length);
  return items.map((it, k) => {
    const angle = outDir + fr[k] * spreadDeg * D2R;
    let r = baseR + (k % 2 ? zig : 0);
    const rm = rMax(cx, cy, angle) - 2;
    if (r > rm) r = rm;
    return { label: it.label, advanced: it.advanced, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle };
  });
}

function buildLayout(): CatNode[] {
  return skillCategories.map((cat, i) => {
    const ang = (START_DEG + i * 45) * D2R;
    const cx = HUBX + RX * Math.cos(ang);
    const cy = HUBY + RY * Math.sin(ang);
    const outDir = Math.atan2(cy - HUBY, cx - HUBX);

    const advanced = cat.skills.filter((s) => s.level === 'advanced').map((s) => ({ label: s.label, advanced: true }));
    const intermediate = cat.skills
      .filter((s) => s.level !== 'advanced')
      .map((s) => ({ label: s.label, advanced: false }));

    let advPlaced: Placed[];
    let intPlaced: Placed[];
    if (advanced.length === 0) {
      advPlaced = [];
      const zig = intermediate.length >= 5 ? 32 : 24;
      intPlaced = placeRing(cx, cy, outDir, intermediate, RINT + 20, zig, SPI + 6);
    } else {
      advPlaced = placeRing(cx, cy, outDir, advanced, RADV, ADV_ZIG, SPA);
      intPlaced = placeRing(cx, cy, outDir, intermediate, RINT, INT_ZIG, SPI);
    }

    // Turn placed points into skill nodes with a label anchor point.
    const toNode = (p: Placed): SkillNode => {
      const lx = p.x + LABEL_OFF * Math.cos(p.angle);
      const ly = p.y + LABEL_OFF * Math.sin(p.angle);
      const cosd = Math.cos(p.angle);
      const anchor: Anchor = cosd > 0.3 ? 'start' : cosd < -0.3 ? 'end' : 'middle';
      return { label: p.label, advanced: p.advanced, x: p.x, y: p.y, lx, ly, anchor };
    };

    const advNodes = advPlaced.map(toNode);
    const intNodes = intPlaced.map(toNode);

    // Declutter advanced labels vertically (guarantees no label-on-label overlap),
    // then recenter the stack on its original mean so the nudge stays minimal.
    if (advNodes.length > 1) {
      const original = advNodes.map((n) => n.ly);
      advNodes.sort((a, b) => a.ly - b.ly);
      for (let k = 1; k < advNodes.length; k++) {
        if (advNodes[k].ly - advNodes[k - 1].ly < LABEL_GAP) {
          advNodes[k].ly = advNodes[k - 1].ly + LABEL_GAP;
        }
      }
      const meanOrig = original.reduce((s, v) => s + v, 0) / original.length;
      const meanNew = advNodes.reduce((s, n) => s + n.ly, 0) / advNodes.length;
      const shift = meanOrig - meanNew;
      for (const n of advNodes) n.ly += shift;
    }

    // Clamp label bounding boxes inside the canvas.
    for (const n of [...advNodes, ...intNodes]) {
      const w = n.label.length * CHARW;
      let left = n.anchor === 'start' ? n.lx : n.anchor === 'end' ? n.lx - w : n.lx - w / 2;
      let right = n.anchor === 'start' ? n.lx + w : n.anchor === 'end' ? n.lx : n.lx + w / 2;
      if (left < PAD) {
        const d = PAD - left;
        n.lx += d;
        left += d;
        right += d;
      }
      if (right > VBW - PAD) {
        const d = right - (VBW - PAD);
        n.lx -= d;
      }
    }

    return {
      name: cat.name,
      color: PALETTE[i % PALETTE.length],
      x: cx,
      y: cy,
      skills: [...advNodes, ...intNodes],
    };
  });
}

// Add alpha to a #rrggbb hex.
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function SkillConstellation() {
  const cats = useMemo(buildLayout, []);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="rz-constellation" aria-hidden="true">
      <style>{`
        .rz-constellation { width: 100%; }
        .rz-constellation svg { width: 100%; height: auto; display: block; overflow: visible; }
        .rz-branch { transition: opacity 200ms ease; }
        .rz-branch text { transition: fill 200ms ease, font-weight 200ms ease; }
        .rz-branch line, .rz-branch circle { transition: stroke 200ms ease, fill 200ms ease, opacity 200ms ease; }
        .rz-cat-hit { cursor: pointer; outline: none; }
        .rz-cat-hit:focus-visible .rz-cat-label { text-decoration: underline; }
        @keyframes rz-drift {
          from { transform: translate(0px, 0px); }
          to   { transform: translate(3px, -4px); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .rz-branch { animation: rz-drift var(--rz-dur, 8s) ease-in-out var(--rz-delay, 0s) infinite alternate; }
        }
        @media (max-width: 899px) { .rz-constellation { display: none; } }
        @media print { .rz-constellation { display: none; } }
      `}</style>
      <svg viewBox={`0 0 ${VBW} ${VBH}`} role="presentation" aria-hidden="true" focusable="false">
        {/* hub → category edges + hub marker sit under everything */}
        {cats.map((cat, i) => {
          const isActive = active === cat.name;
          const dim = active !== null && !isActive;
          const branchStyle: CSSProperties = {
            opacity: dim ? 0.22 : 1,
            // stagger the idle drift per branch
            ['--rz-dur' as string]: `${7 + (i % 4) * 0.9}s`,
            ['--rz-delay' as string]: `${-(i * 0.8)}s`,
          };

          const hubEdgeStroke = isActive ? cat.color : 'rgba(22, 24, 29, 0.25)';
          const skillEdgeStroke = isActive ? withAlpha(cat.color, 0.55) : 'rgba(22, 24, 29, 0.14)';

          // Place the category label on the hub-facing (inward) side, always clear
          // of the outward-fanning skills. On the pure side sectors the label runs
          // inward horizontally (so it clears its own diamond); on the top/bottom
          // sectors it sits inward vertically, centered.
          const dxHub = cat.x - HUBX;
          const dyHub = cat.y - HUBY;
          const sideLabel = Math.abs(dxHub) > Math.abs(dyHub);
          const catLabelAnchor: Anchor = sideLabel ? (dxHub > 0 ? 'end' : 'start') : 'middle';
          const catLabelX = sideLabel ? cat.x + (dxHub > 0 ? -14 : 14) : cat.x;
          const catLabelY = sideLabel ? cat.y : cat.y - Math.sign(dyHub) * 16;

          return (
            <g key={cat.name} className="rz-branch" style={branchStyle}>
              {/* hub → category */}
              <line x1={HUBX} y1={HUBY} x2={cat.x} y2={cat.y} stroke={hubEdgeStroke} strokeWidth={1} />

              {/* category → skill edges */}
              {cat.skills.map((s, j) => (
                <line
                  key={`e-${j}`}
                  x1={cat.x}
                  y1={cat.y}
                  x2={s.x}
                  y2={s.y}
                  stroke={skillEdgeStroke}
                  strokeWidth={1}
                />
              ))}

              {/* skill nodes */}
              {cat.skills.map((s, j) =>
                s.advanced ? (
                  <g key={`s-${j}`}>
                    <circle cx={s.x} cy={s.y} r={4} fill={cat.color} />
                    <text
                      x={s.lx}
                      y={s.ly}
                      textAnchor={s.anchor}
                      dominantBaseline="middle"
                      fontFamily={MONO}
                      fontSize={11}
                      fontWeight={isActive ? 600 : 400}
                      fill={isActive ? INK : LABEL_FILL}
                    >
                      {s.label}
                    </text>
                  </g>
                ) : (
                  <circle key={`s-${j}`} cx={s.x} cy={s.y} r={2.5} fill={isActive ? cat.color : INT_FILL}>
                    <title>{s.label}</title>
                  </circle>
                )
              )}

              {/* category node + focusable label */}
              <g
                className="rz-cat-hit"
                tabIndex={0}
                onMouseEnter={() => setActive(cat.name)}
                onMouseLeave={() => setActive((cur) => (cur === cat.name ? null : cur))}
                onFocus={() => setActive(cat.name)}
                onBlur={() => setActive((cur) => (cur === cat.name ? null : cur))}
              >
                <rect
                  x={cat.x - 5.7}
                  y={cat.y - 5.7}
                  width={11.4}
                  height={11.4}
                  fill={cat.color}
                  transform={`rotate(45 ${cat.x} ${cat.y})`}
                />
                <text
                  className="rz-cat-label"
                  x={catLabelX}
                  y={catLabelY}
                  textAnchor={catLabelAnchor}
                  dominantBaseline="middle"
                  fontFamily={MONO}
                  fontSize={11}
                  fontWeight={isActive ? 700 : 600}
                  letterSpacing={0.4}
                  fill={INK}
                >
                  {cat.name.toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}

        {/* central hub */}
        <g>
          <circle cx={HUBX} cy={HUBY} r={12} fill="none" stroke={INK} strokeWidth={1.25} />
          <text
            x={HUBX}
            y={HUBY}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={MONO}
            fontSize={10}
            fontWeight={700}
            letterSpacing={0.5}
            fill={INK}
          >
            SC
          </text>
        </g>
      </svg>
    </div>
  );
}
