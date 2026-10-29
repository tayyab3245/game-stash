// Shelf panel: the rounded "tray" the games sit on, drawn as a 3D object inside the
// shelf group so it scrolls with the games (camera stays still, like the Switch home menu).
import * as THREE from 'three';

// Mirrors the surface gradient + drop shadow of DARK_UNIFIED / LIGHT_UNIFIED in the theme styles
const PANEL_COLORS = {
  light: { top: '#f8f9fa', bottom: '#e9ecef', shadow: 'rgba(0, 0, 0, 0.12)', rim: 'rgba(255, 255, 255, 0.9)' },
  dark: { top: '#495057', bottom: '#343a40', shadow: 'rgba(0, 0, 0, 0.38)', rim: 'rgba(255, 255, 255, 0.08)' },
} as const;

// Empty-slot and cover-shadow colours. Shadow strength mirrors the UI's own drop
// shadow (standardShadow in the theme styles) so covers feel part of the same interface.
const SLOT_COLORS = {
  light: { well: '#e6e9ec', inner: 'rgba(0, 0, 0, 0.16)', lip: 'rgba(255, 255, 255, 0.9)', shadow: 'rgba(0, 0, 0, 0.2)' },
  dark: { well: '#3a4046', inner: 'rgba(0, 0, 0, 0.5)', lip: 'rgba(255, 255, 255, 0.06)', shadow: 'rgba(0, 0, 0, 0.42)' },
} as const;

const MAX_TEXTURE_PX = 4096;

export interface PanelSize {
  width: number;   // world units
  height: number;
  radius: number;
}

/**
 * Build the panel mesh. The rounded rect, gradient and soft shadow are painted into a
 * canvas sized to this exact panel, so corners stay round however many games there are.
 * It's rendered in a separate pass before the covers and ignores depth, so covers
 * spinning in 3D never clip into it.
 */
export function buildPanelMesh({ width, height, radius }: PanelSize, mode: 'light' | 'dark'): THREE.Mesh {
  const colors = PANEL_COLORS[mode];
  const margin = radius * 0.9; // room for the drop shadow around the panel
  const totalW = width + margin * 2;
  const totalH = height + margin * 2;
  const pxPerUnit = Math.min(48, MAX_TEXTURE_PX / totalW, MAX_TEXTURE_PX / totalH);

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(totalW * pxPerUnit);
  canvas.height = Math.ceil(totalH * pxPerUnit);
  const ctx = canvas.getContext('2d')!;
  const px = (v: number) => v * pxPerUnit;

  const x = px(margin);
  const y = px(margin);
  const w = px(width);
  const h = px(height);
  const r = px(radius);

  // Body with drop shadow
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, colors.top);
  gradient.addColorStop(0.95, colors.bottom);
  ctx.save();
  ctx.shadowColor = colors.shadow;
  ctx.shadowBlur = px(radius * 0.45);
  ctx.shadowOffsetY = px(radius * 0.18);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  // Soft rim light along the top edge, like the CSS inset highlight
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  ctx.strokeStyle = colors.rim;
  ctx.lineWidth = Math.max(2, px(radius * 0.06));
  ctx.beginPath();
  ctx.roundRect(x, y + ctx.lineWidth / 2, w, h, r);
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  (texture as any).colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(totalW, totalH),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }),
  );
  mesh.renderOrder = -1;
  mesh.raycast = () => {}; // clicks pass through to the games
  mesh.userData.isPanel = true;
  return mesh;
}

export function disposePanelMesh(mesh: THREE.Mesh) {
  mesh.geometry.dispose();
  const mat = mesh.material as THREE.MeshBasicMaterial;
  mat.map?.dispose();
  mat.dispose();
}

// ── Slot cards and cover shadows ─────────────────────────────────────────────
// Drawn once per theme/aspect and shared by every slot, then scaled per cover.

const textureCache = new Map<string, THREE.CanvasTexture>();

const cached = (key: string, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number) => {
  let tex = textureCache.get(key);
  if (!tex) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    draw(canvas.getContext('2d')!, w, h);
    tex = new THREE.CanvasTexture(canvas);
    (tex as any).colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    textureCache.set(key, tex);
  }
  return tex;
};

/** Empty slot: a small rounded square pressed into the panel (inner shadow on top,
 *  a faint lip of light along the bottom), like the 3DS's empty game-card slot. */
export function getEmptySlotTexture(mode: 'light' | 'dark'): THREE.CanvasTexture {
  const size = 256;
  return cached(`empty-slot-${mode}`, (ctx) => {
    const c = SLOT_COLORS[mode];
    const pad = 6;
    const r = size * 0.16;
    const shape = () => {
      ctx.beginPath();
      ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, r);
    };
    shape();
    ctx.fillStyle = c.well;
    ctx.fill();
    // Inner shadow: stroke a thick ring outside the shape and let only its shadow fall inside
    ctx.save();
    shape();
    ctx.clip();
    ctx.shadowColor = c.inner;
    ctx.shadowBlur = size * 0.07;
    ctx.shadowOffsetY = size * 0.035;
    ctx.lineWidth = size * 0.2;
    ctx.beginPath();
    ctx.roundRect(pad - size * 0.1, pad - size * 0.1, size - pad * 2 + size * 0.2, size - pad * 2 + size * 0.2, r * 1.6);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.restore();
    // Lip of light along the bottom edge
    ctx.save();
    shape();
    ctx.clip();
    ctx.lineWidth = 4;
    ctx.strokeStyle = c.lip;
    ctx.beginPath();
    ctx.roundRect(pad, pad - 2, size - pad * 2, size - pad * 2, r);
    ctx.stroke();
    ctx.restore();
  }, size, size);
}

/** Soft, blurred drop shadow for a cover; the plane is drawn larger than the cover to fit the blur. */
export const SHADOW_SPREAD = 1.08; // plane size vs cover; the shadow's solid core is exactly the cover's size
export function getShadowTexture(mode: 'light' | 'dark', aspect: number): THREE.CanvasTexture {
  const w = 256;
  const h = Math.round(w / aspect);
  return cached(`shadow-${mode}-${aspect.toFixed(3)}`, (ctx) => {
    const bw = w / SHADOW_SPREAD;
    const bh = h / SHADOW_SPREAD;
    ctx.filter = `blur(${Math.round(w * 0.012)}px)`;
    ctx.fillStyle = SLOT_COLORS[mode].shadow;
    ctx.beginPath();
    ctx.roundRect((w - bw) / 2, (h - bh) / 2, bw, bh, Math.min(bw, bh) * 0.04);
    ctx.fill();
  }, w, h);
}

/** A flat card in the panel pass: depth-free, ordered by renderOrder, ignored by clicks. */
const unitPlane = new THREE.PlaneGeometry(1, 1);
export function makeDecalMesh(map: THREE.Texture, renderOrder: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    unitPlane,
    new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false }),
  );
  mesh.renderOrder = renderOrder;
  mesh.raycast = () => {};
  return mesh;
}
