'use client';

import RigModel from './RigModel';
import Hotspots from './Hotspots';
import PowerButton from '../PowerButton';

/**
 * THE EXPLODED RIG scene, driven by a real, fully-modeled gaming PC (the user's
 * `CUSTOM GAMING PC.blend`, converted to a Draco GLB at build time). The model is
 * sliced into 7 named groups (RIG_mobo … RIG_io); RigModel lerps each chunk from
 * its assembled rest pose to a teardown offset by the global explodeTarget and
 * publishes each group's live world center. Hotspots anchor clickable datasheet
 * pills to those centers for hover callouts + per-component navigation.
 */
export default function RigScene() {
  return (
    <group>
      <RigModel />
      <Hotspots />
      <PowerButton />
    </group>
  );
}
