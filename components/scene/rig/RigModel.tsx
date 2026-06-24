'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Color, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';

import { useUI } from '@/lib/store';
import { rigChannel, type PCComponent } from '@/lib/rig';

const MODEL_URL = '/models/rig.glb';

// The exported GLB is ~5 units tall (Blender scale). Scale it up to fill the
// scene volume the camera/pan-bounds were tuned for.
const RIG_SCALE = 2.6;

// How far the teardown spreads. Each chunk moves out from the build's center by
// (its own offset from center) × this factor — the classic exploded-view law, so
// parts already near the edge travel further and the silhouette opens evenly.
// Kept moderate: large offsets fling chunks off-screen (which black-framed the
// composer in the original tuning), so this is the stable upper end.
const SPREAD = 2.3;

const COMPONENT_IDS: PCComponent[] = ['mobo', 'cpu', 'gpu', 'ram', 'storage', 'psu', 'io'];

export default function RigModel() {
  const { scene } = useGLTF(MODEL_URL);
  const reduced = useUI((s) => s.reduced);
  const explodeTarget = useUI((s) => s.explodeTarget);

  // Clone so HMR / multiple mounts don't share one mutated graph.
  const root = useMemo(() => scene.clone(true), [scene]);

  // Resolve the 7 named groups and precompute, at the ASSEMBLED state, each
  // chunk's root-local bbox CENTER plus its displacement vector
  // = (center − whole-rig center) × SPREAD. `restCenter` is kept intact (it
  // drives the live hotspot world-center each frame); `disp` is the explode push.
  const parts = useMemo(() => {
    const rigCenter = new Box3().setFromObject(root).getCenter(new Vector3());
    const box = new Box3();
    const out: { id: PCComponent; node: Object3D; rest: Vector3; restCenter: Vector3; disp: Vector3 }[] = [];
    for (const id of COMPONENT_IDS) {
      const node = root.getObjectByName(`RIG_${id}`);
      if (!node) continue;
      box.setFromObject(node);
      if (box.isEmpty()) continue;
      const restCenter = box.getCenter(new Vector3());
      const disp = restCenter.clone().sub(rigCenter).multiplyScalar(SPREAD);
      // Keep a sane minimum so a chunk sitting dead-center still separates.
      if (disp.length() < 0.6) disp.setLength(0.6);
      out.push({ id, node, rest: node.position.clone(), restCenter, disp });
    }
    return out;
  }, [root]);

  useEffect(() => {
    root.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, [root]);

  // Collect the rig's LED materials — the RGB fans, the CPU-cooler ring, lit
  // logos: the parts authored to glow, identified by carrying an emissiveMap
  // (their rainbow lives in both the emissive AND the albedo texture, so killing
  // emissiveIntensity alone leaves the lit albedo glowing). For each we remember
  // the authored emissiveIntensity + base color factor. In STANDBY we drive both
  // to ~0 so the PC reads genuinely DEAD; on power-on we ramp them back up — the
  // "lights come on" half of the boot. Case plastic (no emissiveMap) is left lit.
  const leds = useMemo(() => {
    const out: { mat: MeshStandardMaterial; baseEI: number; baseColor: Color }[] = [];
    const seen = new Set<MeshStandardMaterial>();
    root.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const sm = m as MeshStandardMaterial;
        if (!sm || seen.has(sm)) continue;
        const glows = !!sm.emissiveMap || (sm.emissive && sm.emissive.getHex() !== 0 && (sm.emissiveIntensity ?? 0) > 0);
        if (glows) {
          seen.add(sm);
          out.push({ mat: sm, baseEI: sm.emissiveIntensity ?? 1, baseColor: sm.color.clone() });
        }
      }
    });
    return out;
  }, [root]);

  const ledLevel = useRef(0); // 0 = dark (standby), 1 = full glow (powered on)

  // Publish the rig's world-space AABB at the assembled rest pose so the on-case
  // power button can anchor to real geometry (front face, upper area). Computed
  // after the primitive mounts (scale/position applied) on the next frame.
  const boundsDone = useRef(false);

  // Local lerped value — never touches React state per frame.
  const t = useRef(reduced ? 1 : 0);
  const tmp = useRef(new Vector3());
  const tmpC = useRef(new Vector3());

  useEffect(() => {
    if (reduced) t.current = 1;
  }, [reduced]);

  useFrame((_, delta) => {
    // LED glow ramp — dark in standby, eased up on power-on. `reduced` boots lit.
    const live = reduced || !useUI.getState().intro;
    const lk = 1 - Math.exp(-5 * Math.min(delta, 0.05));
    ledLevel.current += ((live ? 1 : 0) - ledLevel.current) * (reduced ? 1 : lk);
    const lvl = ledLevel.current;
    // Standby floor: a hair of glow so the rings read as dormant LEDs, not holes.
    const cl = 0.04 + 0.96 * lvl;
    for (const l of leds) {
      l.mat.emissiveIntensity = l.baseEI * lvl;
      l.mat.color.setRGB(l.baseColor.r * cl, l.baseColor.g * cl, l.baseColor.b * cl);
    }

    // One-shot: capture the whole-rig world AABB while assembled (explode ~0).
    if (!boundsDone.current && t.current < 0.05) {
      // Cull stray geometry: the GLB carries a few mislabeled meshes flung far
      // from the build (floating "squiggle" curves, an off-axis slab). Hide any
      // mesh whose center sits well outside the core cluster — robust median +
      // distance test, so only true outliers vanish and real parts stay.
      const mboxes: { mesh: Object3D; c: Vector3 }[] = [];
      const b1 = new Box3();
      root.traverse((o) => {
        const m = o as Mesh;
        if (!m.isMesh) return;
        b1.setFromObject(m);
        if (b1.isEmpty()) return;
        mboxes.push({ mesh: m, c: b1.getCenter(new Vector3()) });
      });
      if (mboxes.length > 8) {
        const med = (k: 'x' | 'y' | 'z') => {
          const a = mboxes.map((i) => i.c[k]).sort((p, q) => p - q);
          return a[a.length >> 1];
        };
        const mc = new Vector3(med('x'), med('y'), med('z'));
        const ds = mboxes.map((i) => i.c.distanceTo(mc)).sort((a, b) => a - b);
        const medD = ds[ds.length >> 1] || 1;
        const thresh = medD * 4 + 4; // generous: core parts stay, far strays go
        for (const i of mboxes) if (i.c.distanceTo(mc) > thresh) i.mesh.visible = false;
      }

      // Clean AABB from the surviving (visible) meshes only.
      const wb = new Box3();
      let wbFirst = true;
      for (const i of mboxes) {
        if (!i.mesh.visible) continue;
        b1.setFromObject(i.mesh);
        if (b1.isEmpty()) continue;
        if (wbFirst) { wb.copy(b1); wbFirst = false; } else { wb.union(b1); }
      }
      rigChannel.bounds.min.copy(wb.min);
      rigChannel.bounds.max.copy(wb.max);
      rigChannel.bounds.ready = true;

      // Power-button anchor from the MOTHERBOARD box (central + well-segmented,
      // unlike the full AABB which mislabeled RAM geometry can stretch). Top-
      // front-center of the board reads as the case's top I/O power button.
      // Power button = top-front edge of the case, where the I/O + power button
      // live on a real tower. The FRONT is located from the RGB-fan cluster
      // (their centroid sits on the front panel); the TOP is the case's max Y; the
      // horizontal position follows the fans' center. mobo height drives the size.
      const mobo = root.getObjectByName('RIG_mobo');
      const mb = mobo ? new Box3().setFromObject(mobo) : new Box3().copy(rigChannel.bounds as unknown as Box3);
      const fan = new Vector3();
      let n = 0;
      const tmpb = new Box3();
      root.traverse((o) => {
        const me = o as Mesh;
        if (!me.isMesh) return;
        const mm = (Array.isArray(me.material) ? me.material[0] : me.material) as MeshStandardMaterial;
        if (mm && mm.emissiveMap) { tmpb.setFromObject(me); fan.add(tmpb.getCenter(new Vector3())); n++; }
      });
      if (n) fan.multiplyScalar(1 / n);
      rigChannel.power.anchor.set(
        n ? fan.x : mb.getCenter(new Vector3()).x, // horizontal center of the front
        rigChannel.bounds.max.y - 0.2,             // just below the case roof
        (n ? fan.z : mb.max.z) + 0.6,              // front edge, nudged out
      );
      rigChannel.power.size = (mb.max.y - mb.min.y) * 0.045;
      rigChannel.power.ready = true;

      // Robust table floor: case bottom + horizontal center from the WELL-
      // segmented components only (ram/io carry mislabeled stray geometry that
      // would otherwise drag the floor down and detach the contact shadow).
      const CLEAN: PCComponent[] = ['mobo', 'cpu', 'gpu', 'psu', 'storage'];
      const fb = new Box3();
      const cb = new Box3();
      let first = true;
      for (const id of CLEAN) {
        const node = root.getObjectByName(`RIG_${id}`);
        if (!node) continue;
        cb.setFromObject(node);
        if (cb.isEmpty()) continue;
        if (first) { fb.copy(cb); first = false; } else { fb.union(cb); }
      }
      if (!first) {
        const fc = fb.getCenter(new Vector3());
        rigChannel.floor.y = fb.min.y;
        rigChannel.floor.x = fc.x;
        rigChannel.floor.z = fc.z;
        rigChannel.floor.ready = true;
      }
      boundsDone.current = true;
    }

    const target = reduced ? 1 : explodeTarget;
    const k = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    t.current += (target - t.current) * k;
    const e = t.current;
    for (const p of parts) {
      // Move the chunk along its exploded-view axis.
      tmp.current.copy(p.disp).multiplyScalar(e).add(p.rest);
      p.node.position.copy(tmp.current);
      // Publish the LIVE world-space center (root-local center pushed by the same
      // explode amount, then mapped through the root's scale/position) so camera
      // nav + hotspots track the part exactly, exploded or assembled.
      tmpC.current.copy(p.restCenter).addScaledVector(p.disp, e);
      root.localToWorld(tmpC.current);
      rigChannel.centers[p.id].copy(tmpC.current);
    }
    rigChannel.ready = true;
  });

  return <primitive object={root} scale={RIG_SCALE} position={[0, -1, 0]} />;
}

useGLTF.preload(MODEL_URL);
