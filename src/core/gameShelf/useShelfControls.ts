import { useRef } from 'react';
import * as THREE from 'three';
import { clamp } from './helpers';
import { LAYOUT, OVERSCROLL_DAMP } from './constants';
import SoundManager from '../audio/SoundManager';
import { BackgroundContainerRef } from '../../features/backgroundContainer/types';

export interface ShelfControlParams {
  container: React.RefObject<HTMLDivElement | null>;
  camera: React.RefObject<THREE.PerspectiveCamera>;
  scene: React.RefObject<THREE.Scene>;
  shelf: React.RefObject<THREE.Group>;
  meshes: React.MutableRefObject<THREE.Mesh[]>;
  selectedRef: React.MutableRefObject<THREE.Mesh | null>;
  backgroundRef: React.RefObject<BackgroundContainerRef | null>;
  pxPerWorld: React.MutableRefObject<number>;
  revealWorld: React.MutableRefObject<number>;
  bounds: React.MutableRefObject<{ min: number; max: number }>;
  currentCenterIdx: React.MutableRefObject<number | null>;
  rows: 1 | 2;
  selectMesh: (mesh: THREE.Mesh | null, playSound?: boolean, navigationDirection?: 'left' | 'right' | 'up' | 'down' | null) => void;
  onSelect?: (idx: number | null) => void;
  onLongPress?: (idx: number) => void;
  hasPlayedBackground: React.MutableRefObject<boolean>;
  layoutInfo: React.RefObject<{ cols: number }>;
}

export default function useShelfControls(opts: ShelfControlParams) {
  const holdTid = useRef<number | null>(null);
  // holdDir now tracks x and y movement
  const holdDir = useRef<{ x: -1 | 0 | 1; y: -1 | 0 | 1 }>({ x: 0, y: 0 });

  /* Fixed-Selector Navigation with smooth animation: Games scroll underneath a centered selector */
  const STEP = () => {
    const playable = opts.meshes.current.filter(m => !m.userData.isAdd);
    if (!playable.length) return;

    const cols = opts.layoutInfo.current.cols;
    const rows = opts.rows;
    if (cols === 0) return; // Grid not ready

    const curIdx = playable.findIndex(m => m === opts.selectedRef.current);
    const current = curIdx === -1 ? 0 : curIdx;
    const dir = holdDir.current;
    let nextIdx = current;

    // Handle navigation based on the current layout
    if (rows === 2) {
      // 2-Row (Column-Major) Navigation - FIXED VERSION
      const curCol = Math.floor(current / rows);
      const curRow = current % rows;
      console.log(`2-Row Navigation: current=${current}, curCol=${curCol}, curRow=${curRow}, dir=${JSON.stringify(dir)}, totalCols=${cols}`);
      
      if (dir.x === 1) { // Right (next column)
        const nextCol = curCol + 1;
        if (nextCol < cols) {
          nextIdx = nextCol * rows + curRow; // Same row, next column
        }
      } else if (dir.x === -1) { // Left (previous column)  
        const prevCol = curCol - 1;
        if (prevCol >= 0) {
          nextIdx = prevCol * rows + curRow; // Same row, previous column
        }
      } else if (dir.y === 1) { // Down (next row in same column)
        const nextRow = curRow + 1;
        if (nextRow < rows) {
          nextIdx = curCol * rows + nextRow; // Next row, same column
        }
      } else if (dir.y === -1) { // Up (previous row in same column)
        const prevRow = curRow - 1;
        if (prevRow >= 0) {
          nextIdx = curCol * rows + prevRow; // Previous row, same column
        }
      }
    } else {
      // 1-Row (Row-Major) Navigation
      console.log(`1-Row Navigation: current=${current}, dir=${JSON.stringify(dir)}`);
      if (dir.x === 1) { // Right (next game)
        nextIdx = current + 1;
      } else if (dir.x === -1) { // Left (previous game)
        nextIdx = current - 1;
      }
    }

    // Make sure the new index is within the valid range of playable items
    nextIdx = clamp(nextIdx, 0, playable.length - 1);
    console.log(`Navigation: ${current} → ${nextIdx} (clamped to 0-${playable.length - 1})`);

    if (nextIdx !== current) {
      // Select the new game - this will trigger smooth animation via selectMesh
      const newGame = playable[nextIdx];
      
      // Determine navigation direction
      let navigationDirection: 'left' | 'right' | 'up' | 'down' | null = null;
      if (dir.x === 1) navigationDirection = 'right';
      else if (dir.x === -1) navigationDirection = 'left';
      else if (dir.y === 1) navigationDirection = 'down';
      else if (dir.y === -1) navigationDirection = 'up';
      
      opts.selectMesh(newGame, true, navigationDirection);
      
      // Update current center index
      opts.currentCenterIdx.current = opts.meshes.current.indexOf(newGame);
    }
  };

  const startHold = (dir: { x: -1 | 0 | 1; y: -1 | 0 | 1 }) => {
    if (holdTid.current !== null) clearInterval(holdTid.current);
    holdDir.current = dir;
    STEP();
    holdTid.current = window.setInterval(STEP, 260) as unknown as number;
  };

  const stopHold = () => {
    if (holdTid.current !== null) {
      clearInterval(holdTid.current);
      holdTid.current = null;
    }
  };

  // Auto-centering functionality removed to fix button navigation

  const registerKeyboard = () => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Pass direction vectors to startHold
      if (e.code === 'ArrowLeft') startHold({ x: -1, y: 0 });
      else if (e.code === 'ArrowRight') startHold({ x: 1, y: 0 });
      else if (e.code === 'ArrowUp') startHold({ x: 0, y: -1 });
      else if (e.code === 'ArrowDown') startHold({ x: 0, y: 1 });
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        stopHold();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  };

  const registerPointer = () => {
    if (!opts.container.current) return () => {};

    const canvas = opts.container.current;
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let mode: 'rotate' | 'pan' | null = null;
    let lastX = 0;
    let longTid: number | null = null;
    let moved = false;

    const clearSelect = () => opts.selectMesh(null, false, null);

    // Auto-centering functionality removed to fix button navigation

    const cancelLong = () => {
      if (longTid !== null) {
        clearTimeout(longTid);
        longTid = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      moved = false;
      lastX = e.clientX;
      cancelLong();
      if (mode === 'rotate' && opts.selectedRef.current && !opts.selectedRef.current.userData.isAdd) {
        opts.selectedRef.current.rotation.y = 0;
      }

      if (!opts.hasPlayedBackground.current) {
        SoundManager.playBackground();
        opts.hasPlayedBackground.current = true;
      }

      if (!(e.target as HTMLElement).closest('canvas')) {
        mode = 'pan';
        return;
      }

      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(pointer, opts.camera.current);

      const rawHit = ray.intersectObjects(opts.scene.current.children, true)[0]?.object;
      let hit: THREE.Mesh | null = null;
      if (rawHit) {
        let cur: THREE.Object3D | null = rawHit;
        while (cur && !opts.meshes.current.includes(cur as THREE.Mesh)) {
          cur = cur.parent;
        }
        if (cur && opts.meshes.current.includes(cur as THREE.Mesh)) {
          hit = cur as THREE.Mesh;
        }
      }

      if (hit && (hit as any).userData.isAdd) {
        opts.onSelect?.(-1);
        SoundManager.playUISelect();
        mode = null;
        return;
      }

      if (hit) {
        // Only call selectMesh if it's a different game (avoid false positive on rotation)
        if (hit !== opts.selectedRef.current) {
          opts.selectMesh(hit, true, null); // New game selected
        }
        mode = 'rotate';

        longTid = window.setTimeout(() => {
          longTid = null;
          if (!moved && hit) opts.onLongPress?.(opts.meshes.current.indexOf(hit));
        }, 700);
      } else {
        // Only deselect if we're clicking in the canvas area (not on UI elements)
        // This prevents the command bar from hiding when clicking UI buttons
        const clickedInCanvas = (e.target as HTMLElement).closest('canvas');
        if (clickedInCanvas) {
          // Clicked in canvas but didn't hit a game - only deselect in certain cases
          if (opts.rows !== 1 || !opts.selectedRef.current) {
            clearSelect();
          }
          mode = 'pan';
        } else {
          // Clicked outside canvas (on UI) - don't change selection, just set mode
          mode = opts.selectedRef.current ? 'rotate' : 'pan';
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (Math.abs(dx) > 4) moved = true;
      if (moved) cancelLong();

      if (mode === 'rotate' && opts.selectedRef.current && !opts.selectedRef.current.userData.isAdd) {
        opts.selectedRef.current.rotation.y += dx * 0.012;
      } else if (mode === 'pan') {
        const newShelfX = opts.shelf.current.position.x + dx * 0.015;
        // Left-anchored scrolling: can only scroll left (negative), not right (positive)
        const clampedX = clamp(newShelfX, opts.bounds.current.min, 0);
        opts.shelf.current.position.x = clampedX;

        // Make the background follow the shelf
        if (opts.backgroundRef.current) {
          opts.backgroundRef.current.setPosition(clampedX * opts.pxPerWorld.current);
        }

        // Auto-selection during panning removed to fix navigation
      }
    };

    const onPointerUp = () => {
      dragging = false;
      cancelLong();
      
      // Auto-selection after panning removed to fix navigation
    };

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';

    const uiFilter = (e: PointerEvent) => !(e.target as HTMLElement)?.closest('[data-ui="true"]');
    const safeDown = (e: PointerEvent) => {
      if (uiFilter(e)) {
        dragging = true;
        moved = false;
        lastX = e.clientX;
        onPointerDown(e);
      }
    };
    const safeMove = (e: PointerEvent) => {
      if (uiFilter(e) && dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;

        if (mode === 'rotate' && opts.selectedRef.current) {
          opts.selectedRef.current.rotation.y += dx * 0.012;
          moved = true;
        } else {
          onPointerMove(e);
        }
      }
    };
    const safeUp = (e: PointerEvent) => {
      if (uiFilter(e)) {
        dragging = false;
        onPointerUp();
      }
    };

    window.addEventListener('pointerdown', safeDown);
    window.addEventListener('pointermove', safeMove);
    window.addEventListener('pointerup', safeUp);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointerdown', safeDown);
      window.removeEventListener('pointermove', safeMove);
      window.removeEventListener('pointerup', safeUp);
    };
  };

  const attach = () => {
    const cleanPtr = registerPointer();
    const cleanKey = registerKeyboard();
    return () => {
      cleanPtr();
      cleanKey();
      stopHold();
    };
  };

  return { startHold, stopHold, attach };
}