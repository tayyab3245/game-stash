// 3D Game Shelf: covers and the panel they sit on live in one group that scrolls past a still camera
import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import SoundManager from '../audio/SoundManager';
import NavigationButton from '../../features/navigation/NavigationButton';
import { BackgroundContainerRef } from '../../features/backgroundContainer/types';
import { HoverHintManager } from '../../features/hoverHints';
import {
  ADD_MARKER,
  FULL_H_3DS,
  SPINE_3DS,
  FRONT_3DS,
  HEIGHT_RATIO_3DS,
  WIDTH_FACTOR,
  DEPTH_FACTOR,
  PANEL_RATIO,
  LAYOUT,
  SELECTOR,
  ShelfRows,
  SHELF_VIEWPORT,
} from './constants';
import { useTheme } from '../../features/theme/ThemeContext';
import { clamp, same } from './helpers';
import useShelfControls from './useShelfControls';
import { buildMats3DS, loadCoverTexture } from './materials';
import { buildPanelMesh, disposePanelMesh, getEmptySlotTexture, getShadowTexture, makeDecalMesh, SHADOW_SPREAD } from './panel';

export interface GameShelfProps {
  textures?: string[];
  width?: number | string;
  height?: number | string;
  frontWidthUnits?: number;   
  frontHeightUnits?: number;  
  onSelect?: (idx: number | null) => void;  
  onLongPress?: (idx: number) => void;       
  onAddSelected?: () => void;   // the "+" slot was reached with the arrows (it's never a game index)
  rows?: ShelfRows;        // 1 / 2 / 3
  showHints?: boolean;
  forceShowHints?: boolean;
  onHintsChange?: (show: boolean) => void;
  onMovementChange?: (isMoving: boolean) => void; // Track when shelf/games are moving
}
  
const GameShelf: React.FC<GameShelfProps> = ({
  textures = [],
  width = '100%',
  height = '100%',
  frontWidthUnits = 12,
  frontHeightUnits = 12,
  onSelect,
  onLongPress,
  onAddSelected,
  rows = 1,
  showHints = true,
  forceShowHints = false,
  onHintsChange,
  onMovementChange,
}) => {
  const themeCtx = useTheme();

  // Core refs
  const container = useRef<HTMLDivElement>(null);
  const renderer = useRef<THREE.WebGLRenderer>(null!);
  const scene = useRef<THREE.Scene>(null!);
  const camera = useRef<THREE.PerspectiveCamera>(null!);
  const shelf = useRef<THREE.Group>(null!);
  // The panel renders in its own pass underneath the covers (transparent objects always
  // draw after opaque ones, so sharing a scene put it on top). Its group follows the shelf.
  const panelScene = useRef<THREE.Scene>(new THREE.Scene());
  const panelGroup = useRef<THREE.Group>(new THREE.Group());
  // Per-cover slot card + soft shadow, drawn in the panel pass (index-matched to meshes)
  const slotDecor = useRef<{ card: THREE.Mesh | null; shadow: THREE.Mesh | null }[]>([]);
  const meshes = useRef<THREE.Mesh[]>([]);
  const selectedRef = useRef<THREE.Mesh | null>(null);
  const urls = useRef<string[]>([]);
  
  // Background container ref (replaces old shellDiv)
  const backgroundRef = useRef<BackgroundContainerRef>(null);
  
  // Layout and control refs
  const shelfTargetX = useRef<number>(0);
  const layoutInfo = useRef({ cols: 0 });
  const pxPerWorld = useRef<number>(1);
  const revealWorld = useRef<number>(0.5);
  const bounds = useRef({ min: -10, max: 10 });
  const currentCenterIdx = useRef<number | null>(null);
  const hasPlayedBackground = useRef<boolean>(false);
  // Rendered cover width and the panel's left/right edges (shelf-local world units)
  const layoutMetrics = useRef({ itemW: 1, panelLeft: 0, panelRight: 0 });
  const panelRef = useRef<THREE.Mesh | null>(null);
  const cameraTargetZ = useRef(8); // the camera eases toward this (set per layout)

  // Animation and layout constants from legacy
  const BREATHE_DISTANCE = SELECTOR.BREATHE_DISTANCE;
  const PAN_SPEED = SELECTOR.PAN_SPEED;
  const GRID_ANIM_DURATION = SELECTOR.GRID_ANIM_DURATION;
  const GRID_ANIM_HEIGHT = SELECTOR.GRID_ANIM_HEIGHT;

  // Half of the visible width (world units) at the covers' depth
  const viewHalfWidth = () => {
    const cam = camera.current;
    // Uses the layout's target zoom, so scroll bounds are right even while the camera eases
    return Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cameraTargetZ.current * cam.aspect;
  };

  // Scroll range: the panel's left edge sits just inside the screen at the start and its
  // right edge at the end. A panel that fits stays left-aligned, like the Switch home menu.
  const updateBounds = () => {
    if (!camera.current || !renderer.current) return;
    const half = viewHalfWidth();
    const gap = SELECTOR.PANEL_SCREEN_GAP_PX * (2 * half / Math.max(1, renderer.current.domElement.clientWidth));
    const { panelLeft, panelRight } = layoutMetrics.current;
    const max = -half + gap - panelLeft;
    const min = Math.min(max, half - gap - panelRight);
    bounds.current = { min, max };
  };

  // Switch-style follow: keep the selection centred on screen. The scroll bounds (the
  // panel's ends) stop it, so near the start or end the selector walks to the edge instead.
  const scrollIntoView = (mesh: THREE.Mesh) => {
    const x = (mesh.userData.layoutX as number | undefined) ?? mesh.position.x;
    shelfTargetX.current = clamp(-x, bounds.current.min, bounds.current.max);
  };

  // Track row changes for animation
  const prevRows = useRef<ShelfRows>(rows);
  const clock = useRef<THREE.Clock>(new THREE.Clock());
  
  // Movement tracking for command bar visibility
  const commandBarTimer = useRef<number | null>(null);
  
  // State for hover hints
  const [selectedGamePosition, setSelectedGamePosition] = useState<{ x: number; y: number } | undefined>();

  // Fixed-selector selection system with smooth animation
  const selectMesh = (mesh: THREE.Mesh | null, playSound?: boolean, navigationDirection?: 'left' | 'right' | 'up' | 'down' | null) => {
    // Clear hints immediately when navigating
    onHintsChange?.(false);
    setSelectedGamePosition(undefined);
    
    // Notify parent immediately that movement state is changing
    if (commandBarTimer.current) {
      clearTimeout(commandBarTimer.current);
    }
    onMovementChange?.(true); // Hide command bar immediately on selection change
    
    // Clear old selection
    if (selectedRef.current) {
      // Scale will be handled by layout system - no manual scale reset needed
      selectedRef.current.rotation.y = 0;
      const prevOutline = selectedRef.current.userData.outline as THREE.Object3D;
      if (prevOutline) prevOutline.visible = false;
    }
    
    selectedRef.current = mesh;
    
    if (!mesh) {
      onSelect?.(null);
      return;
    }
    
    // Mark new selection (scale will be handled by layout system)
    const outline = mesh.userData.outline as THREE.Object3D;
    if (outline) outline.visible = true;
    
    const currentMeshIndex = meshes.current.indexOf(mesh);
    scrollIntoView(mesh);

    // Update center index and notify parent
    currentCenterIdx.current = currentMeshIndex;
    
    // Convert mesh index to game index for parent component
    // Games report their index; the "+" slot reports separately so it can't become a game
    if (!mesh.userData.isAdd) {
      // The mesh index corresponds directly to the game index since games come first in the array
      onSelect?.(currentMeshIndex); // This is the game index
    } else {
      onAddSelected?.();
    }
    
    if (playSound) SoundManager.playUISelect();

    // Hint position is refreshed by the render loop once the shelf settles

    // Show command bar after a short delay (simple and reliable)
    commandBarTimer.current = window.setTimeout(() => {
      onMovementChange?.(false); // Show command bar
    }, 200); // Quick but smooth timing

    // Reset hints for new selection (after position is updated)
    setTimeout(() => {
      onHintsChange?.(true);
    }, 100);
  };

  // Function to calculate screen position of selected game
  const updateSelectedGamePosition = () => {
    if (!selectedRef.current || !container.current || !camera.current) {
      setSelectedGamePosition(undefined);
      return;
    }

    // Get the world position of the selected mesh
    const worldPosition = new THREE.Vector3();
    selectedRef.current.getWorldPosition(worldPosition);

    // Convert world position to screen coordinates
    const screenPosition = worldPosition.clone();
    screenPosition.project(camera.current);

    // Convert normalized device coordinates to screen pixels
    const rect = renderer.current.domElement.getBoundingClientRect();
    const x = (screenPosition.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (screenPosition.y * -0.5 + 0.5) * rect.height + rect.top;

    setSelectedGamePosition({ x, y });
  };

  // Connect to shelf controls with BackgroundContainer integration
  const { startHold, stopHold, attach } = useShelfControls({
    container,
    camera,
    scene,
    shelf,
    meshes,
    selectedRef,
    backgroundRef, // Now uses BackgroundContainer instead of shellDiv
    pxPerWorld,
    revealWorld,
    bounds,
    shelfTargetX,
    currentCenterIdx,
    rows,
    selectMesh,
    onSelect,
    onLongPress,
    hasPlayedBackground,
    layoutInfo,
  });

  // Basic THREE.js setup and mesh rendering system (from legacy GameShelf)
  useEffect(() => {
    if (!container.current) return;

    // Create basic THREE.js scene
    scene.current = new THREE.Scene();
    camera.current = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    renderer.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Color pipeline setup
    (renderer.current as any).outputColorSpace = THREE.SRGBColorSpace;
    renderer.current.toneMapping = THREE.NoToneMapping;
    renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const containerEl = container.current;
    renderer.current.setClearColor(0x000000, 0); // Transparent background
    const { top, side, radius } = SHELF_VIEWPORT;
    Object.assign(renderer.current.domElement.style, {
      position: 'absolute',
      top: `${top}px`,
      left: `${side}px`,
      display: 'block',
      borderRadius: `0 0 ${radius}px ${radius}px`, // clip covers to the panel's shape
    });
    containerEl.appendChild(renderer.current.domElement);

    // Create shelf group
    shelf.current = new THREE.Group();
    scene.current.add(shelf.current);
    panelScene.current.add(panelGroup.current);
    renderer.current.autoClear = false;

    // Position camera properly
    camera.current.position.set(0, 0, 8);
    camera.current.lookAt(0, 0, 0);

    // Attach pointer and keyboard controls
    const cleanupControls = attach();

    // Keep canvas, camera and scroll bounds in sync with the shelf's grid cell
    const handleResize = () => {
      const width = containerEl.clientWidth - SHELF_VIEWPORT.side * 2;
      const height = containerEl.clientHeight - SHELF_VIEWPORT.top - SHELF_VIEWPORT.bottom;
      if (!width || !height) return;
      camera.current.aspect = width / height;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(width, height);
      updateBounds();
      shelfTargetX.current = clamp(shelfTargetX.current, bounds.current.min, bounds.current.max);
      if (selectedRef.current) scrollIntoView(selectedRef.current);
      updateSelectedGamePosition();
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerEl);

    // Basic animation loop with proper legacy animations
    let frameId = 0;
    let shelfSettled = true;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.current.getDelta(), 0.1);
      const t = clock.current.elapsedTime;
      
      // 1. Grid Transition Animation
      meshes.current.forEach((m) => {
        const anim = m.userData.gridAnimation;
        if (anim?.isTransitioning) {
          const progress = clamp((t - anim.startTime) / GRID_ANIM_DURATION, 0, 1);
          // Create the "up and down" hump using a sine wave
          const hump = anim.direction * Math.sin(progress * Math.PI) * GRID_ANIM_HEIGHT;
          // Animate position and scale
          m.position.lerpVectors(anim.startPos, anim.endPos, progress);
          m.position.y += hump;
          m.scale.lerpVectors(anim.startScale, anim.endScale, progress);
          if (progress === 1) {
            // Animation is done, snap to final state and clean up
            m.position.copy(anim.endPos);
            m.scale.copy(anim.endScale);
            m.userData.homeY = anim.endPos.y; // Update homeY for hover
            delete m.userData.gridAnimation;
            
            // RESTORE SELECTION STATE after grid transition completes
            if (m === selectedRef.current) {
              const outline = m.userData.outline as THREE.Object3D;
              if (outline) {
                outline.visible = true;
              }
              
              // Show command bar after grid transition completes
              if (commandBarTimer.current) {
                clearTimeout(commandBarTimer.current);
              }
              commandBarTimer.current = window.setTimeout(() => {
                onMovementChange?.(false);
              }, 100); // Quick delay after grid transition
            }
          }
        }
      });

      // 1b. Animate outline during grid transitions (critical for selector tracking)
      meshes.current.forEach((m) => {
        if (m.userData.outline) {
          const outlineGroup = m.userData.outline as THREE.Group;
          const anim = outlineGroup.userData.gridAnimation;
          if (anim?.isTransitioning) {
            const progress = clamp((t - anim.startTime) / GRID_ANIM_DURATION, 0, 1);
            const hump = anim.direction * Math.sin(progress * Math.PI) * GRID_ANIM_HEIGHT;
            outlineGroup.position.lerpVectors(anim.startPos, anim.endPos, progress);
            outlineGroup.position.y += hump;
            if (progress === 1) {
              outlineGroup.position.copy(anim.endPos);
              delete outlineGroup.userData.gridAnimation;
              
              // SHOW SELECTED OUTLINE after grid transition completes
              if (m === selectedRef.current) {
                outlineGroup.visible = true;
              }
            }
          }
        }
      });

      // 1c. While covers fly to a new layout, the panel stretches to wrap wherever they
      // actually are (so nothing pokes outside it), then settles on its exact size
      const panel = panelRef.current;
      if (panel?.userData.fit) {
        const { padX, padY, margin, geoW, geoH, centerX } = panel.userData.fit;
        if (meshes.current.some(m => m.userData.gridAnimation)) {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          meshes.current.forEach(m => {
            const hw = ((m.userData.actualWidth as number) * m.scale.x) / 2;
            const hh = ((m.userData.actualHeight as number) * m.scale.y) / 2;
            minX = Math.min(minX, m.position.x - hw); maxX = Math.max(maxX, m.position.x + hw);
            minY = Math.min(minY, m.position.y - hh); maxY = Math.max(maxY, m.position.y + hh);
          });
          panel.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0);
          panel.scale.set((maxX - minX + 2 * (padX + margin)) / geoW, (maxY - minY + 2 * (padY + margin)) / geoH, 1);
        } else if (Math.abs(panel.scale.x - 1) > 1e-4 || Math.abs(panel.scale.y - 1) > 1e-4) {
          const k = 1 - Math.exp(-dt * 12);
          panel.position.x += (centerX - panel.position.x) * k;
          panel.position.y += (0 - panel.position.y) * k;
          panel.scale.x += (1 - panel.scale.x) * k;
          panel.scale.y += (1 - panel.scale.y) * k;
        }
      }

      // 1d. Camera eases to the layout's zoom instead of jumping
      const zDiff = cameraTargetZ.current - camera.current.position.z;
      if (Math.abs(zDiff) > 1e-3) camera.current.position.z += zDiff * (1 - Math.exp(-dt * 7));

      // 2. Hover Animation (guarded to not run during transition)
      meshes.current.forEach(m => {
        if (m.userData.gridAnimation?.isTransitioning) return; // Skip if transitioning
        if (m.userData.isAdd) { m.position.y = m.userData.homeY || 0; return; } // the "+" slot doesn't float
        const ph = m.userData.ph as number;
        m.position.y = (m.userData.homeY || 0) +
          Math.sin(t * 1.2 + ph) * (SELECTOR.HOVER_BASE * LAYOUT[rows].scale);

        // Focus: the selected cover eases toward the camera and grows a touch
        const focus = (m.userData.focus = (m.userData.focus ?? 0) +
          ((m === selectedRef.current ? 1 : 0) - (m.userData.focus ?? 0)) * (1 - Math.exp(-dt * 10)));
        const base = LAYOUT[rows].scale;
        m.scale.setScalar(base * (1 + SELECTOR.FOCUS_GROW * focus));
        m.position.z = focus * (m.userData.actualHeight as number) * base * SELECTOR.FOCUS_FORWARD;
      });

      // 2b. Shadows follow each cover's bob and narrow as it spins; the empty slot stays put
      slotDecor.current.forEach(({ card, shadow }, i) => {
        const m = meshes.current[i];
        if (!m) return;
        const w = (m.userData.actualWidth as number) * m.scale.x;
        const h = (m.userData.actualHeight as number) * m.scale.y;
        if (card) {
          card.position.set(m.position.x, m.position.y, 0);
          card.scale.set(w, h, 1);
        }
        if (shadow) {
          // A lifted (selected) cover is further from the panel: its shadow drops a bit more
          const lift = m.userData.focus ?? 0;
          const turn = Math.max(0.15, Math.abs(Math.cos(m.rotation.y)));
          shadow.position.set(m.position.x, m.position.y - h * (0.022 + 0.03 * lift), 0);
          shadow.scale.set(w * SHADOW_SPREAD * turn * (1 + 0.03 * lift), h * SHADOW_SPREAD * (1 + 0.03 * lift), 1);
        }
      });

      // 3. Selector Breathing Animation
      if (selectedRef.current && selectedRef.current.userData.outline) {
        const sel = selectedRef.current;
        const g = sel.userData.outline as THREE.Group;
        // Brackets breathe, and follow the focused cover forward
        const pulse = (1 + Math.sin(t * 4.8) * BREATHE_DISTANCE) * (1 + SELECTOR.FOCUS_GROW * (sel.userData.focus ?? 0));
        g.scale.set(pulse, pulse, pulse);
        if (!g.userData.gridAnimation) g.position.z = (sel.userData.actualDepth as number) / 2 + 0.01 + sel.position.z;
      }

      // 4. Smooth Shelf Panning: exponential ease, same feel at any frame rate
      if (shelf.current) {
        const diff = shelfTargetX.current - shelf.current.position.x;
        if (Math.abs(diff) > 0.001) {
          shelf.current.position.x += diff * (1 - Math.exp(-dt * PAN_SPEED));
          shelfSettled = false;
        } else {
          shelf.current.position.x = shelfTargetX.current;
          if (!shelfSettled) {
            // Re-anchor the hover hint once, not every frame (avoids a React render per frame)
            shelfSettled = true;
            updateSelectedGamePosition();
          }
        }
      }

      // Panel pass first, then the covers on top
      panelGroup.current.position.copy(shelf.current.position);
      renderer.current.clear();
      renderer.current.render(panelScene.current, camera.current);
      renderer.current.render(scene.current, camera.current);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      cleanupControls(); // Clean up pointer and keyboard controls
      if (commandBarTimer.current) {
        clearTimeout(commandBarTimer.current);
      }
      if (renderer.current?.domElement?.parentNode) {
        renderer.current.domElement.parentNode.removeChild(renderer.current.domElement);
      }
      renderer.current?.dispose();
    };
  }, []);

  // Update hover hint position when window resizes or game changes
  useEffect(() => {
    updateSelectedGamePosition();
  }, [selectedRef.current, rows]);

  // Mesh creation and texture loading effect (from legacy GameShelf)
  useEffect(() => {
    if (!renderer.current || !shelf.current) return;


    // Calculate box dimensions based on props
    const _BASE_W = FRONT_3DS * (frontWidthUnits / FRONT_3DS);
    const _BASE_D = SPINE_3DS * (frontWidthUnits / FRONT_3DS);
    const BOX_W = _BASE_W * WIDTH_FACTOR;
    const BOX_D = _BASE_D * DEPTH_FACTOR;
    const BOX_H = BOX_W * PANEL_RATIO;

    // Layout configuration
    const mul = LAYOUT[rows].scale;
    const itemW = BOX_W * mul;
    const itemH = BOX_H * mul;
    
    // Create or update meshes for each texture
    textures.forEach((url, i) => {
      
      const scaleW = frontWidthUnits / FRONT_3DS;
      const scaleH = frontHeightUnits / (FULL_H_3DS * HEIGHT_RATIO_3DS);
      const scale = Math.min(scaleW, scaleH);
      
      const isAdd = url === ADD_MARKER;
      const coverW = FRONT_3DS * scale * WIDTH_FACTOR * mul;
      // The empty slot is a small square, about 70% of a cover's height
      const boxW = isAdd ? coverW * PANEL_RATIO * 0.7 : coverW;
      const boxH = isAdd ? boxW : coverW * PANEL_RATIO;
      const boxD = SPINE_3DS * scale * DEPTH_FACTOR * mul;
      const bevelRadius = Math.min(boxW, boxH) * 0.02;
      
      let mesh = meshes.current[i];
      
      // Force mesh recreation if the mesh type changed (add -> game or game -> add)
      if (mesh && mesh.userData.isAdd !== isAdd) {
        shelf.current.remove(mesh);
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose());
        } else {
          (mesh.material as any).dispose();
        }
        // Don't set to undefined - just clear the reference to force recreation
        mesh = null as any; // Force recreation without breaking array structure
      }
      
      if (!mesh) {
        // Create new mesh
        const geo = isAdd
          ? new THREE.BoxGeometry(boxW, boxH, boxD * 0.1) // empty slot (invisible hit box)
          : new RoundedBoxGeometry(boxW, boxH, boxD, 16, bevelRadius);
        
        mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        mesh.userData.isAdd = isAdd;
        mesh.userData.ph = Math.random() * Math.PI * 2;
        shelf.current.add(mesh);
        meshes.current[i] = mesh;
        
        // Selector brackets (the empty slot gets them too, like the 3DS)
        attachOutline(mesh, boxW, boxH, boxD, rows);
      }
      
      // Load texture for non-add meshes
      if (!isAdd && mesh.userData.url !== url && mesh.userData.loadingUrl !== url) {
        const target = mesh;
        target.userData.loadingUrl = url; // don't start a second load if this effect re-runs
        loadCoverTexture(url)
          .then((tex) => {
            if (target.userData.loadingUrl !== url) return; // superseded by a newer cover
            target.material = buildMats3DS(tex, renderer.current);
            target.userData.url = url;
            // Upload now (at load time) rather than the first time it scrolls on screen,
            // which used to freeze scrolling while each big cover hit the GPU
            const map = (target.material as THREE.MeshBasicMaterial[]).find(m => m.map)?.map;
            if (map) renderer.current.initTexture(map);
          })
          .catch((error) => {
            console.warn('Texture loading failed:', url, error);
            // Use fallback gray material
            target.material = new THREE.MeshBasicMaterial({ color: 0x444444 });
          });
      } else if (isAdd && !mesh.userData.plusBuilt) {
        // The "+" slot is drawn as a card in the panel pass (see slot decor below);
        // this invisible box just gives it something to click, select and bracket
        mesh.material = new THREE.MeshBasicMaterial({ visible: false });
        mesh.userData.plusBuilt = true;
      }
      
      // Store dimensions
      // Record the size the geometry was actually built with. (Using this layout's boxW here
      // overstated covers by the scale ratio after a layout switch, inflating shadows and gaps.)
      // (Measured from the bounds: RoundedBoxGeometry reports 1×1×1 in .parameters.)
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const size = mesh.geometry.boundingBox!.getSize(new THREE.Vector3());
      mesh.userData.actualWidth = size.x;
      mesh.userData.actualHeight = size.y;
      mesh.userData.actualDepth = size.z;
    });

    // Remove extra meshes
    while (meshes.current.length > textures.length) {
      const m = meshes.current.pop()!;
      shelf.current.remove(m);
      m.geometry.dispose();
      if (Array.isArray(m.material)) {
        m.material.forEach(mat => mat.dispose());
      } else {
        (m.material as any).dispose();
      }
    }

    // Layout meshes using proper legacy logic
    const all = meshes.current;
    
    // Space covers by their rendered size (geometry size × layout scale), so gaps
    // stay even and leave room for the selector brackets
    const cfg = LAYOUT[rows];
    const sample = all.find(m => !m.userData.isAdd);
    const renderedW = ((sample?.userData.actualWidth as number) ?? itemW) * cfg.scale;
    const renderedH = ((sample?.userData.actualHeight as number) ?? itemH) * cfg.scale;
    const stepX = renderedW * (1 + cfg.gapX);
    const stepY = renderedH * (1 + cfg.gapY);

    const cols = Math.ceil(all.length / rows);
    layoutInfo.current.cols = cols;

    // Panel wraps every column and row with a little padding
    const padX = renderedW * SELECTOR.PANEL_PAD[rows].x;
    const padY = renderedH * SELECTOR.PANEL_PAD[rows].y;
    const contentW = (cols - 1) * stepX + renderedW;
    const contentH = (rows - 1) * stepY + renderedH;
    const panelSize = {
      width: contentW + padX * 2,
      height: contentH + padY * 2,
      radius: Math.min(renderedW, renderedH) * 0.2,
    };
    const panelCenterX = ((cols - 1) * stepX) / 2;
    layoutMetrics.current = {
      itemW: renderedW,
      panelLeft: panelCenterX - panelSize.width / 2,
      panelRight: panelCenterX + panelSize.width / 2,
    };

    // Zoom so the panel fills most of the view's height, whatever the layout
    const fovFactor = 2 * Math.tan(THREE.MathUtils.degToRad(camera.current.fov / 2));
    cameraTargetZ.current = panelSize.height / (SELECTOR.PANEL_FILL * fovFactor);
    if (!panelRef.current) camera.current.position.z = cameraTargetZ.current; // first layout: no ease
    updateBounds();

    // Rebuild the panel at its new size. During a layout switch the render loop stretches
    // it around the moving covers (see 1c), using these numbers.
    const oldPanel = panelRef.current;
    const panel = buildPanelMesh(panelSize, themeCtx.mode);
    const panelGeo = (panel.geometry as THREE.PlaneGeometry).parameters;
    panel.position.set(panelCenterX, 0, 0);
    panel.userData.fit = {
      padX, padY,
      margin: (panelGeo.width - panelSize.width) / 2,
      geoW: panelGeo.width,
      geoH: panelGeo.height,
      centerX: panelCenterX,
    };
    if (oldPanel) {
      panelGroup.current.remove(oldPanel);
      disposePanelMesh(oldPanel);
    }
    panelGroup.current.add(panel);
    panelRef.current = panel;

    // Each cover casts a soft shadow onto the panel; the empty slot is pressed into it instead
    slotDecor.current.forEach(({ card, shadow }) => {
      [card, shadow].forEach((d) => {
        if (!d) return;
        panelGroup.current.remove(d);
        (d.material as THREE.Material).dispose();
      });
    });
    const aspect = renderedW / renderedH;
    slotDecor.current = all.map((m) => {
      if (m.userData.isAdd) {
        const card = makeDecalMesh(getEmptySlotTexture(themeCtx.mode), 0);
        panelGroup.current.add(card);
        return { card, shadow: null };
      }
      const shadow = makeDecalMesh(getShadowTexture(themeCtx.mode, aspect), 1);
      panelGroup.current.add(shadow);
      return { card: null, shadow };
    });

    // Check for row switch to trigger animation
    const rowSwitch = prevRows.current !== rows;
    prevRows.current = rows;
    
    // Recreate all selectors when layout changes to apply new SELECTOR_FRAME_SCALE
    if (rowSwitch) {
      all.forEach((mesh) => {
        if (mesh.userData.outline) {
          // Remove old selector
          const oldOutline = mesh.userData.outline as THREE.Group;
          shelf.current.remove(oldOutline);
          oldOutline.clear();
          mesh.userData.outline = null;
          
          // Create new selector with current layout scaling
          const boxW = mesh.userData.actualWidth as number;
          const boxH = mesh.userData.actualHeight as number;
          const boxD = mesh.userData.actualDepth as number;
          attachOutline(mesh, boxW, boxH, boxD, rows);
        }
      });
    }
    
    const layoutTargets = all.map((m, i) => {
      let r: number, c: number;
      
      // Improved layout logic for double row mode
      if (rows > 1) {
        // For 2+ rows, use column-major ordering: fill columns top to bottom
        // This makes the first game appear at top-left (more intuitive)
        c = Math.floor(i / rows); // Column index
        r = i % rows; // Row index (0 = top, 1 = bottom)
      } else {
        // For 1 row, use standard row-major sorting
        r = Math.floor(i / cols);
        c = i % cols;
      }
      
      // Columns extend rightward from x=0; rows are centred vertically
      const x = c * stepX;
      const y = ((rows - 1) / 2 - r) * stepY;
      m.userData.layoutX = x;

      return {
        position: new THREE.Vector3(x, y, 0),
        scale: new THREE.Vector3(LAYOUT[rows].scale, LAYOUT[rows].scale, LAYOUT[rows].scale),
      };
    });
    
    if (rowSwitch) {
      // MORPHING GRID TRANSITION: Animate existing games in-place to reorganize into new layout
      // PRESERVE SELECTION AND VIEW CONTEXT during transition
      const currentShelfX = shelf.current.position.x;
      const selectedGame = selectedRef.current;
      const selectedGameIndex = selectedGame ? all.indexOf(selectedGame) : -1;
      
      // Hide command bar during grid transition
      if (commandBarTimer.current) {
        clearTimeout(commandBarTimer.current);
      }
      onMovementChange?.(true);
      
      
      // Keep the selected game roughly where it was on screen, then make sure it's in view
      if (selectedGame && selectedGameIndex >= 0) {
        const selectedGameCurrentScreenX = selectedGame.position.x + currentShelfX;
        const selectedGameNewPos = layoutTargets[selectedGameIndex].position.x;
        shelfTargetX.current = clamp(selectedGameCurrentScreenX - selectedGameNewPos, bounds.current.min, bounds.current.max);
        scrollIntoView(selectedGame);
      }
      
      // Trigger the choreographed animation from current positions to new layout positions
      const t = clock.current.getElapsedTime();
      all.forEach((m, i) => {
        // Start from exactly where the game currently is (no screen position calculations)
        const currentPos = m.position.clone();
        const currentScale = m.scale.clone();
        
        // End at the new layout position
        const targetPos = layoutTargets[i].position;
        const targetScale = layoutTargets[i].scale;
        
        m.userData.gridAnimation = {
          isTransitioning: true,
          startTime: t,
          startPos: currentPos,
          endPos: targetPos,
          startScale: currentScale,
          endScale: targetScale,
          direction: (i % 2 === 0) ? 1 : -1, // Alternating up/down motion
        };
        
        
        // HIDE SELECTOR during transition - cleaner approach
        if (m.userData.outline) {
          const outlineGroup = m.userData.outline as THREE.Group;
          
          // Hide ALL outlines during grid transition for cleaner animation
          outlineGroup.visible = false;
          
          // Still need to animate outline position but keep it hidden
          outlineGroup.userData.gridAnimation = {
            isTransitioning: true,
            startTime: t,
            startPos: outlineGroup.position.clone(),
            endPos: new THREE.Vector3(targetPos.x, targetPos.y, (m.userData.actualDepth as number) / 2 + 0.01),
            direction: (i % 2 === 0) ? 1 : -1,
          };
        }
      });
      
    } else {
      // Apply positions directly (no animation)
      all.forEach((m, i) => {
        m.position.copy(layoutTargets[i].position);
        m.scale.copy(layoutTargets[i].scale);
        m.userData.homeY = layoutTargets[i].position.y;
        
        // Position outline if it exists
        if (m.userData.outline) {
          const outline = m.userData.outline as THREE.Group;
          outline.position.set(
            layoutTargets[i].position.x, 
            layoutTargets[i].position.y, 
            (m.userData.actualDepth as number) / 2 + 0.01
          );
          outline.visible = selectedRef.current === m;
        }
      });
    }

    // Auto-select the first game and start with the row at its left edge
    if (!selectedRef.current && all.length > 0) {
      const firstPlayable = all.find(m => !m.userData.isAdd);
      if (firstPlayable) {
        shelf.current.position.x = shelfTargetX.current = bounds.current.max;
        selectMesh(firstPlayable, false, null); // Initial selection, no direction
      }
    } else if (!rowSwitch) {
      // Games added/removed: keep the shelf inside the new bounds
      shelfTargetX.current = clamp(shelfTargetX.current, bounds.current.min, bounds.current.max);
    }

  }, [textures, rows, frontWidthUnits, frontHeightUnits, themeCtx.theme.text]);

  // Selector bracket system from legacy GameShelf
  const attachOutline = (
    mesh: THREE.Mesh,
    boxW: number,
    boxH: number,
    boxD: number,
    layoutRows: ShelfRows,
    colour = 0xffc14d,
  ) => {
    if (mesh.userData.outline) return;

    const group = new THREE.Group();
    const SELECTOR_SCALE = 0.22;   // Overall size of the brackets (thickness stays same)
    const SELECTOR_PADDING = 0.05; // Gap between the game cover and the brackets
    const len = Math.min(boxW, boxH) * SELECTOR_SCALE;
    const thick = len * 0.30;
    const cornerRadius = thick;

    const lShape = new THREE.Shape();
    lShape.moveTo(0, len);
    lShape.lineTo(0, cornerRadius);
    lShape.quadraticCurveTo(0, 0, cornerRadius, 0);
    lShape.lineTo(len, 0);
    lShape.lineTo(len, thick);
    lShape.lineTo(cornerRadius, thick);
    lShape.quadraticCurveTo(thick, thick, thick, cornerRadius);
    lShape.lineTo(thick, len);
    lShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: boxD * 0.02,
      bevelEnabled: false,
    };

    const cornerGeo = new THREE.ExtrudeGeometry(lShape, extrudeSettings);
    const mat = new THREE.MeshBasicMaterial({
      color: colour,
      depthTest: false,
    });

    // Store corner data for animation
    group.userData.corners = [];

    // Calculate padded position to frame the cover
    const halfW = boxW / 2;
    const halfH = boxH / 2;
    const padding = (SELECTOR_PADDING + thick) * SELECTOR.SELECTOR_FRAME_SCALE[layoutRows];

    const addCorner = (x: number, y: number, rotation: number) => {
      const corner = new THREE.Mesh(cornerGeo, mat);
      corner.position.set(x, y, 0);
      corner.rotation.z = rotation;
      corner.renderOrder = 1;
      group.add(corner);

      // Store the mesh and its base position for animation
      group.userData.corners.push({
        mesh: corner,
        basePosition: corner.position.clone(),
      });
    };

    // Position corners with padding
    addCorner(-halfW - padding, -halfH - padding, 0);
    addCorner( halfW + padding, -halfH - padding, Math.PI / 2);
    addCorner( halfW + padding,  halfH + padding, Math.PI);
    addCorner(-halfW - padding,  halfH + padding, Math.PI * 1.5);

    group.visible = false;
    shelf.current.add(group);
    mesh.userData.outline = group;
  };

  // Column of the selected game vs. the last game's column (the parent re-renders on every selection)
  const playable = meshes.current; // games plus the "+" slot at the end
  const selectedIdx = selectedRef.current ? playable.indexOf(selectedRef.current) : 0;
  const selectedCol = Math.floor(Math.max(0, selectedIdx) / rows);
  const lastCol = Math.floor(Math.max(0, playable.length - 1) / rows);

  return (
    <div
      ref={container}
      style={{ 
        width, 
        height, 
        position: 'relative', 
        overflow: 'visible', 
        userSelect: 'none', 
        touchAction: 'none', 
        zIndex: 0 
      }}
    >
      
      {/* Navigation buttons with proper controls integration; hidden when there's nothing further that way */}
      <NavigationButton
        direction="left"
        className={selectedCol <= 0 ? 'is-hidden' : ''}
        onMouseDown={() => startHold({ x: -1, y: 0 })}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        size={56}
      />
      <NavigationButton
        direction="right"
        className={selectedCol >= lastCol ? 'is-hidden' : ''}
        onMouseDown={() => startHold({ x: 1, y: 0 })}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        size={56}
      />
      
      {/* Hover Hints for game interaction guidance */}
      <HoverHintManager
        gridMode={rows === 1 ? 'single' : 'double'}
        gameSelected={!!selectedRef.current && !selectedRef.current.userData.isAdd && (showHints || forceShowHints)}
        gamePosition={selectedGamePosition}
        onDismiss={() => onHintsChange?.(false)}
        forceShow={forceShowHints}
      />
      
    </div>
  );
};

export default GameShelf;