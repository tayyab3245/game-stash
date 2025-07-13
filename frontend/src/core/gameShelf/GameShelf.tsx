// Legacy 3D Game Shelf Component with BackgroundContainer integration
import React, { useEffect, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import SoundManager from '../audio/SoundManager';
import NavigationButton from '../../features/navigation/NavigationButton';
import BackgroundContainer from '../../features/backgroundContainer/BackgroundContainer';
import { BackgroundContainerRef } from '../../features/backgroundContainer/types';
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
} from './constants';
import { useTheme } from '../../features/theme/ThemeContext';
import { clamp, same } from './helpers';
import useShelfControls from './useShelfControls';
import { buildMats3DS } from './materials';

export interface GameShelfProps {
  textures?: string[];
  width?: number | string;
  height?: number | string;
  frontWidthUnits?: number;   
  frontHeightUnits?: number;  
  onSelect?: (idx: number | null) => void;  
  onLongPress?: (idx: number) => void;       
  rows?: 1 | 2 ;            // 1 / 2 / 4 rows
}
  
const GameShelf: React.FC<GameShelfProps> = ({
  textures = [],
  width = '100%',
  height = '100%',
  frontWidthUnits = 12,
  frontHeightUnits = 12,
  onSelect,
  onLongPress,
  rows = 1,
}) => {
  const themeCtx = useTheme();

  // Core refs
  const container = useRef<HTMLDivElement>(null);
  const renderer = useRef<THREE.WebGLRenderer>(null!);
  const scene = useRef<THREE.Scene>(null!);
  const camera = useRef<THREE.PerspectiveCamera>(null!);
  const shelf = useRef<THREE.Group>(null!);
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

  // Animation and layout constants from legacy
  const HOVER_BASE = 0.04;
  const BREATHE_DISTANCE = 0.04;
  const PAN_DAMPING = 0.005;
  const GRID_ANIM_DURATION = 0.5;
  const GRID_ANIM_HEIGHT = 0.4;

  // Track row changes for animation
  const prevRows = useRef<1 | 2>(rows);
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  // Complete selection system from legacy GameShelf
  const selectMesh = (mesh: THREE.Mesh | null, playSound?: boolean) => {
    // Clear old selection
    if (selectedRef.current) {
      const idleScale = LAYOUT[rows].scale;
      selectedRef.current.scale.set(idleScale, idleScale, idleScale);
      selectedRef.current.rotation.y = 0;
      const prevOutline = selectedRef.current.userData.outline as THREE.Object3D;
      if (prevOutline) prevOutline.visible = false;
    }
    
    selectedRef.current = mesh;
    
    if (!mesh) {
      onSelect?.(null);
      return;
    }
    
    // Mark new selection
    const selectedScale = LAYOUT[rows].scale * 1.05; // subtle pop
    mesh.scale.set(selectedScale, selectedScale, selectedScale);
    const outline = mesh.userData.outline as THREE.Object3D;
    if (outline) outline.visible = true;
    
    // Set the target X position for panning
    const targetX = -mesh.position.x;
    shelfTargetX.current = clamp(targetX, bounds.current.min, bounds.current.max);
    
    // Update center index and notify parent
    currentCenterIdx.current = meshes.current.indexOf(mesh);
    
    // Convert mesh index to game index for parent component
    const meshIndex = meshes.current.indexOf(mesh);
    // Only call onSelect for regular games, not add button
    if (!mesh.userData.isAdd && meshIndex < textures.length - 1) {
      onSelect?.(meshIndex); // This is the game index
    }
    
    if (playSound) SoundManager.playUISelect();
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
    renderer.current.setPixelRatio(window.devicePixelRatio);
    
    const containerEl = container.current;
    const width = containerEl.clientWidth;
    const height = containerEl.clientHeight;
    
    // Fix initial aspect ratio
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();
    
    renderer.current.setSize(width, height);
    renderer.current.setClearColor(0x000000, 0); // Transparent background
    containerEl.appendChild(renderer.current.domElement);

    // Create shelf group
    shelf.current = new THREE.Group();
    scene.current.add(shelf.current);

    // Position camera properly
    camera.current.position.set(0, 0, 8);
    camera.current.lookAt(0, 0, 0);

    // Attach pointer and keyboard controls
    const cleanupControls = attach();

    // Basic animation loop with proper legacy animations
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.current.getElapsedTime();
      
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
          }
        }
      });

      // 1b. Animate outline during grid transitions (critical for selector tracking)
      meshes.current.forEach((m) => {
        if (!m.userData.isAdd && m.userData.outline) {
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
            }
          }
        }
      });

      // 2. Hover Animation (guarded to not run during transition)
      meshes.current.forEach(m => {
        if (m.userData.gridAnimation?.isTransitioning) return; // Skip if transitioning
        const ph = m.userData.ph as number;
        m.position.y = (m.userData.homeY || 0) +
          Math.sin(t * 1.2 + ph) * (HOVER_BASE * LAYOUT[rows].scale);
      });

      // 3. Selector Breathing Animation
      if (selectedRef.current && selectedRef.current.userData.outline) {
        const g = selectedRef.current.userData.outline as THREE.Group;
        const pulse = 1 + Math.sin(t * 4.8) * BREATHE_DISTANCE;
        g.scale.set(pulse, pulse, pulse);
      }

      // 4. Smooth Shelf Panning
      if (shelf.current) {
        const currentX = shelf.current.position.x;
        const targetX = shelfTargetX.current;
        const diff = targetX - currentX;
        if (Math.abs(diff) > 0.001) {
          shelf.current.position.x += diff * PAN_DAMPING;
        } else {
          shelf.current.position.x = targetX;
        }
      }
      
      renderer.current.render(scene.current, camera.current);
    };
    animate();

    // Size the background container
    if (backgroundRef.current) {
      const bgWidth = width * 0.8;
      const bgLeft = width * 0.1;
      backgroundRef.current.setSize(bgWidth, bgLeft);
    }

    return () => {
      cleanupControls(); // Clean up pointer and keyboard controls
      if (renderer.current?.domElement?.parentNode) {
        renderer.current.domElement.parentNode.removeChild(renderer.current.domElement);
      }
      renderer.current?.dispose();
    };
  }, []);

  // Handle window resize with proper aspect ratio
  useEffect(() => {
    if (!container.current || !renderer.current || !camera.current) return;

    const handleResize = () => {
      const containerEl = container.current!;
      const width = containerEl.clientWidth;
      const height = containerEl.clientHeight;
      
      // Fix aspect ratio calculation
      camera.current.aspect = width / height;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(width, height);
      
      // Update background size
      if (backgroundRef.current) {
        const bgWidth = width * 0.8;
        const bgLeft = width * 0.1;
        backgroundRef.current.setSize(bgWidth, bgLeft);
      }
    };

    // Call resize immediately to fix initial stretching
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mesh creation and texture loading effect (from legacy GameShelf)
  useEffect(() => {
    if (!renderer.current || !shelf.current) return;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

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
      
      const boxW = FRONT_3DS * scale * WIDTH_FACTOR * mul;
      const boxH = boxW * PANEL_RATIO;
      const boxD = SPINE_3DS * scale * DEPTH_FACTOR * mul;
      
      const isAdd = url === ADD_MARKER;
      const bevelRadius = Math.min(boxW, boxH) * 0.02;
      
      let mesh = meshes.current[i];
      
      if (!mesh) {
        // Create new mesh
        const geo = isAdd
          ? new RoundedBoxGeometry(boxW * 0.8, boxW * 0.8, boxD * 0.02, 8, bevelRadius)
          : new RoundedBoxGeometry(boxW, boxH, boxD, 16, bevelRadius);
        
        mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        mesh.userData.isAdd = isAdd;
        mesh.userData.ph = Math.random() * Math.PI * 2;
        shelf.current.add(mesh);
        meshes.current[i] = mesh;
        
        // Add outline for non-add meshes
        if (!isAdd) {
          attachOutline(mesh, boxW, boxH, boxD);
        }
      }
      
      // Load texture for non-add meshes
      if (!isAdd && mesh.userData.url !== url) {
        loader.load(
          url,
          (tex) => {
            mesh!.material = buildMats3DS(tex, renderer.current);
            mesh!.userData.url = url;
          },
          undefined,
          (error) => {
            console.warn('Texture loading failed:', url, error);
            // Use fallback gray material
            mesh!.material = new THREE.MeshBasicMaterial({ color: 0x444444 });
          }
        );
      } else if (isAdd && !mesh.userData.plusBuilt) {
        // Create "+" symbol for add button
        const invisible = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        });
        mesh.material = Array(6).fill(invisible);
        
        // Add plus sign geometry
        const barT = boxW * 0.10;
        const barL = boxW * 0.46;
        const barD = boxD * 0.35;
        const r = barT * 0.9;
        
        const barGeoH = new RoundedBoxGeometry(barL, barT, barD, 6, r);
        const barGeoV = new RoundedBoxGeometry(barT, barL, barD, 6, r);
        const barMat = new THREE.MeshBasicMaterial({ color: 0xffbe32 });
        
        const barH = new THREE.Mesh(barGeoH, barMat);
        const barV = new THREE.Mesh(barGeoV, barMat);
        const plusGrp = new THREE.Group();
        plusGrp.userData.isPlus = true;
        plusGrp.add(barH);
        plusGrp.add(barV);
        
        barH.position.z = barV.position.z = boxD * 0.55;
        mesh.add(plusGrp);
        mesh.userData.plusBuilt = true;
      }
      
      // Store dimensions
      mesh.userData.actualWidth = boxW;
      mesh.userData.actualHeight = boxH;
      mesh.userData.actualDepth = isAdd ? boxD * 0.1 : boxD;
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
    
    // Use legacy spacing configuration
    const cfg = LAYOUT[rows];
    const gapX = itemW * cfg.gapX;
    const gapY = itemH * cfg.gapY;
    const padTop = itemH * cfg.padTop;
    const padBottom = itemH * cfg.padBottom;
    const padLeft = itemW * cfg.padLeft;
    const padRight = itemW * cfg.padRight;

    const cols = Math.ceil(all.length / rows);
    layoutInfo.current.cols = cols;
    const rowW = cols * itemW + (cols - 1) * gapX + padLeft + padRight;
    
    // Calculate bounds for panning
    bounds.current.min = -((cols - 1) / 2) * (itemW + gapX) - padLeft;
    bounds.current.max = ((cols - 1) / 2) * (itemW + gapX) + padRight;
    
    // Check for row switch to trigger animation
    const rowSwitch = prevRows.current !== rows;
    prevRows.current = rows;
    
    const layoutTargets = all.map((m, i) => {
      let r: number, c: number;
      
      // Critical: Use legacy sorting logic
      if (rows === 2) {
        // For 2 rows, sort into columns first (column-major: 1,3,5 on top, 2,4,6 on bottom)
        c = Math.floor(i / rows);
        r = i % rows;
      } else {
        // For 1 row, use standard row-major sorting
        r = Math.floor(i / cols);
        c = i % cols;
      }
      
      const xOffset = (padLeft - padRight) / 2;
      const x = (c - (cols - 1) / 2) * (itemW + gapX) + xOffset;
      const yOffset = (padTop - padBottom) / 2;
      const y = ((rows - 1) / 2 - r) * (itemH + gapY) - yOffset;
      
      return {
        position: new THREE.Vector3(x, y, 0),
        scale: new THREE.Vector3(LAYOUT[rows].scale, LAYOUT[rows].scale, LAYOUT[rows].scale),
      };
    });
    
    if (rowSwitch) {
      // If the rows changed, trigger the choreographed animation
      const t = clock.current.getElapsedTime();
      all.forEach((m, i) => {
        m.userData.gridAnimation = {
          isTransitioning: true,
          startTime: t,
          startPos: m.position.clone(),
          endPos: layoutTargets[i].position,
          startScale: m.scale.clone(),
          endScale: layoutTargets[i].scale,
          direction: (i % 2 === 0) ? 1 : -1, // Alternating up/down motion
        };
        if (!m.userData.isAdd && m.userData.outline) {
          const outlineGroup = m.userData.outline as THREE.Group;
          outlineGroup.userData.gridAnimation = {
            isTransitioning: true,
            startTime: t,
            startPos: outlineGroup.position.clone(),
            endPos: new THREE.Vector3(layoutTargets[i].position.x, layoutTargets[i].position.y, (m.userData.actualDepth as number) / 2 + 0.01),
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
        if (!m.userData.isAdd && m.userData.outline) {
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

    // Update camera position for current layout
    camera.current.position.z = BOX_H * (rows === 1 ? 4.0 : 6.8);
    
    // Auto-select first playable game if none selected
    if (!selectedRef.current && all.length > 0) {
      const firstPlayable = all.find(m => !m.userData.isAdd);
      if (firstPlayable) {
        selectMesh(firstPlayable, false);
      }
    }

  }, [textures, rows, frontWidthUnits, frontHeightUnits]);

  // Selector bracket system from legacy GameShelf
  const attachOutline = (
    mesh: THREE.Mesh,
    boxW: number,
    boxH: number,
    boxD: number,
    colour = 0xffc14d,
  ) => {
    if (mesh.userData.outline) return;

    const group = new THREE.Group();
    const SELECTOR_SCALE = 0.22;   // Overall size of the brackets
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
    const padding = SELECTOR_PADDING + thick;

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
      {/* BackgroundContainer replaces the old shell div */}
      <BackgroundContainer ref={backgroundRef} />
      
      {/* Navigation buttons with proper controls integration */}
      <NavigationButton
        direction="left"
        onMouseDown={() => startHold({ x: -1, y: 0 })}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        size={72}
      />
      <NavigationButton
        direction="right"
        onMouseDown={() => startHold({ x: 1, y: 0 })}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        size={72}
      />
    </div>
  );
};

export default GameShelf;
