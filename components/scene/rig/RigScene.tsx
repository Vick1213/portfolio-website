'use client';

import RigModel from './RigModel';

/**
 * THE EXPLODED RIG scene — now driven by a real, fully-modeled gaming PC (the
 * user's `CUSTOM GAMING PC.blend`, converted to a Draco GLB at build time). The
 * model is sliced into 7 named groups (RIG_mobo … RIG_io); RigModel lerps each
 * chunk from its assembled rest pose to a teardown offset by the global
 * explodeTarget. Labels / hotspots / per-component camera nav land next.
 */
export default function RigScene() {
  return (
    <group>
      <RigModel />
    </group>
  );
}
