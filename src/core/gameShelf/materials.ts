import * as THREE from 'three';
import { BACK_3DS, SPINE_3DS, FRONT_3DS, FULL_W_3DS } from './constants';

export const buildMats3DS = (
  tex: THREE.Texture,
  renderer: THREE.WebGLRenderer
): THREE.Material[] => {
  // enable mipmaps for smooth minification of small details (like text)
  // mark texture as sRGB so GPU applies proper gamma correction
  (tex as any).colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true; // keep mipmaps for tiny text
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  // force maximum anisotropy – the higher the better for oblique viewing
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;

  const BACK_PX = BACK_3DS; // 1508 px
  const SPINE_PX = SPINE_3DS; //  120 px
  const FRONT_PX = FRONT_3DS; // 1608 px
  const FULL_W = FULL_W_3DS; // 3236 px

  const WIDTH_FACTOR = 0.5;
  const DEPTH_FACTOR = WIDTH_FACTOR;

  const NUDGE_SPINE_PX = 53;
  const NUDGE_BACK_PX = 0;
  const NUDGE_FRONT_PX = 55;

  const SCALED_SPINE_PX = SPINE_PX * (DEPTH_FACTOR / WIDTH_FACTOR);
  const SPINE_LEFT_SHIFT = (SPINE_PX - SCALED_SPINE_PX) / 2 + NUDGE_SPINE_PX;

  const U_SPINE_WIDTH = SCALED_SPINE_PX / FULL_W;
  const U_SPINE_OFFSET = (BACK_PX + SPINE_LEFT_SHIFT) / FULL_W;

  const U_BACK_OFFSET = NUDGE_BACK_PX / FULL_W;
  const U_BACK_WIDTH = BACK_PX / FULL_W;

  const U_FRONT_OFFSET = (BACK_PX + SPINE_PX + NUDGE_FRONT_PX) / FULL_W;
  const U_FRONT_WIDTH = FRONT_PX / FULL_W;

  const slice = (u: number, ur: number, flip = false) => {
    const t2 = tex.clone();
    t2.offset.set(u, 0);
    t2.repeat.set(flip ? -ur : ur, 1);
    if (flip) t2.offset.x += ur;
    return t2;
  };

  const makeMat = (map?: THREE.Texture) =>
    map
      ? new THREE.MeshBasicMaterial({ map })
      : new THREE.MeshBasicMaterial({ color: 0xffffff });

  return [
    makeMat(), // right (empty)
    makeMat(slice(U_SPINE_OFFSET, U_SPINE_WIDTH)), // spine
    makeMat(), // top (empty)
    makeMat(), // bottom (empty)
    makeMat(slice(U_FRONT_OFFSET, U_FRONT_WIDTH)), // front
    makeMat(slice(U_BACK_OFFSET, U_BACK_WIDTH)), // back
  ];
};
// Widest a cover scan needs to be: the front panel is ~half the wrap and is never drawn
// wider than ~1000 device px, so 2560 stays sharp while using a fraction of the GPU memory
// that 6000px+ scans would.
const MAX_COVER_WIDTH = 2560;

/**
 * Fetch and decode a cover off the main thread (createImageBitmap), downscaled to
 * MAX_COVER_WIDTH. EXIF rotation is applied, and the bitmap is pre-flipped because
 * WebGL ignores flipY for ImageBitmaps.
 */
export const loadCoverTexture = async (url: string): Promise<THREE.Texture> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob, {
    resizeWidth: MAX_COVER_WIDTH,   // height follows the aspect ratio
    resizeQuality: 'high',
    imageOrientation: 'flipY',
  });
  const tex = new THREE.Texture(bitmap);
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
};
