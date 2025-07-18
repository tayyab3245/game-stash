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
  SELECTOR,
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
  const padLeftRef = useRef<number>(0); // Store padLeft for use in selectMesh

  // Animation and layout constants from legacy
  const BREATHE_DISTANCE = SELECTOR.BREATHE_DISTANCE;
  const PAN_DAMPING = SELECTOR.PAN_DAMPING;
  const GRID_ANIM_DURATION = SELECTOR.GRID_ANIM_DURATION;
  const GRID_ANIM_HEIGHT = SELECTOR.GRID_ANIM_HEIGHT;

  // ⚙️ MANUAL STARTING POSITION KNOB ⚙️
  // Adjust this value to move the first game's starting position:
  // 0 = first game at left edge
  // positive values = move games to the right
  // negative values = move games to the left
  const STARTING_POSITION_OFFSET = -20; // 

  // Track row changes for animation
  const prevRows = useRef<1 | 2>(rows);
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  // Fixed-selector selection system with smooth animation
  const selectMesh = (mesh: THREE.Mesh | null, playSound?: boolean, navigationDirection?: 'left' | 'right' | 'up' | 'down' | null) => {
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
    
    // Enhanced auto-centering logic to prevent white space on the left
    const currentMeshIndex = meshes.current.indexOf(mesh);
    const playableGames = meshes.current.filter(m => !m.userData.isAdd);
    const gameIndex = playableGames.indexOf(mesh);
    
    let shouldCenter = true; // Default to centering
    
    // Apply centering logic based on row mode
    if (rows === 1) {
      // Don't center the first two games to prevent white space on the left
      // User requirement: "centrering should take effefct after teh second game object"
      if (gameIndex <= 1) {
        shouldCenter = false;
      }
    } else if (rows === 2) {
      // For double row mode, only allow centering starting from game 6 onwards
      // This prevents any subtle pulling for games 0,1,2,3,4,5 that creates empty space
      if (gameIndex <= 5) {
        shouldCenter = false;
      }
    }
    
    console.log('GameShelf Debug:', {
      gameIndex,
      rows,
      shouldCenter,
      navigationDirection,
      gameName: mesh.userData.game?.name || 'Unknown',
      currentCol: rows === 2 ? Math.floor(gameIndex / rows) : 'N/A',
      meshPositionX: mesh.position.x,
      currentShelfX: shelf.current.position.x,
      willSetTargetTo: shouldCenter ? (-mesh.position.x) : 'no change',
      debugInfo: `Mode: ${rows}-row, Game: ${gameIndex}, Should center: ${shouldCenter}`
    });
    
    if (shouldCenter) {
      // Set target for smooth animation to center the selected game
      const targetX = -mesh.position.x;
      shelfTargetX.current = clamp(targetX, bounds.current.min, bounds.current.max); // Use proper bounds
    } else {
      // Don't center - keep the shelf at its current position
      console.log('Not centering - keeping shelf position at:', shelf.current.position.x);
      // For the first two games, maintain the manual starting position instead of resetting to 0
      const manualStartPosition = -padLeftRef.current + STARTING_POSITION_OFFSET;
      
      // Only reset if we're scrolled past the manual starting position to the left
      if (shelf.current.position.x < manualStartPosition) {
        shelfTargetX.current = manualStartPosition; // Reset to manual starting position
        console.log('Resetting shelf target to manual starting position:', manualStartPosition);
      }
      // Otherwise, keep the current target (don't change shelfTargetX.current)
    }
    
    // Update center index and notify parent
    currentCenterIdx.current = currentMeshIndex;
    
    // Convert mesh index to game index for parent component
    // Only call onSelect for regular games, not add button
    if (!mesh.userData.isAdd) {
      // The mesh index corresponds directly to the game index since games come first in the array
      onSelect?.(currentMeshIndex); // This is the game index
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
            
            // RESTORE SELECTION STATE after grid transition completes
            if (m === selectedRef.current) {
              console.log('🎯 Grid transition complete - restoring selection for game', meshes.current.indexOf(m));
              const outline = m.userData.outline as THREE.Object3D;
              if (outline) {
                outline.visible = true;
                console.log('✅ Selected game outline restored and made visible after grid transition');
              }
            }
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
              
              // SHOW SELECTED OUTLINE after grid transition completes
              if (m === selectedRef.current) {
                outlineGroup.visible = true;
                console.log('🔲 Selected game outline reappeared after grid transition complete');
              }
            }
          }
        }
      });

      // 2. Hover Animation (guarded to not run during transition)
      meshes.current.forEach(m => {
        if (m.userData.gridAnimation?.isTransitioning) return; // Skip if transitioning
        const ph = m.userData.ph as number;
        m.position.y = (m.userData.homeY || 0) +
          Math.sin(t * 1.2 + ph) * (SELECTOR.HOVER_BASE * LAYOUT[rows].scale);
      });

      // 3. Selector Breathing Animation
      if (selectedRef.current && selectedRef.current.userData.outline) {
        const g = selectedRef.current.userData.outline as THREE.Group;
        const pulse = 1 + Math.sin(t * 4.8) * BREATHE_DISTANCE;
        g.scale.set(pulse, pulse, pulse);
      }

      // 4. Smooth Shelf Panning (restored for better UX)
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
          attachOutline(mesh, boxW, boxH, boxD, rows);
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
      } else if (isAdd && (!mesh.userData.plusBuilt || mesh.userData.themeText !== themeCtx.theme.text)) {
        // Create "+" symbol for add button (recreate if theme changed)
        
        // Clear existing plus if it exists
        if (mesh.userData.plusBuilt) {
          const existingPlus = mesh.children.find(child => child.userData.isPlus);
          if (existingPlus) {
            mesh.remove(existingPlus);
          }
        }
        
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
        // Use theme text color: black in light mode, white in dark mode
        const plusColor = themeCtx.theme.text === '#141414' ? 0x000000 : 0xffffff;
        const barMat = new THREE.MeshBasicMaterial({ color: plusColor });
        
        const barH = new THREE.Mesh(barGeoH, barMat);
        const barV = new THREE.Mesh(barGeoV, barMat);
        const plusGrp = new THREE.Group();
        plusGrp.userData.isPlus = true;
        plusGrp.add(barH);
        plusGrp.add(barV);
        
        barH.position.z = barV.position.z = boxD * 0.55;
        mesh.add(plusGrp);
        mesh.userData.plusBuilt = true;
        mesh.userData.themeText = themeCtx.theme.text; // Track current theme
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

    // Store padLeft for use in selectMesh function
    padLeftRef.current = padLeft;

    const cols = Math.ceil(all.length / rows);
    layoutInfo.current.cols = cols;
    const rowW = cols * itemW + (cols - 1) * gapX + padLeft + padRight;
    
    // Calculate bounds for left-anchored scrolling: 
    // - Max bound is -padLeft (first game at left edge)
    // - Min bound allows scrolling left to see all games
    const totalWidth = (cols - 1) * (itemW + gapX);
    bounds.current.min = -totalWidth - padLeft; // Can scroll left to see all games
    bounds.current.max = -padLeft; // First game positioned at left edge
    
    // Check for row switch to trigger animation
    const rowSwitch = prevRows.current !== rows;
    prevRows.current = rows;
    
    // Recreate all selectors when layout changes to apply new SELECTOR_FRAME_SCALE
    if (rowSwitch) {
      all.forEach((mesh) => {
        if (!mesh.userData.isAdd && mesh.userData.outline) {
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
      
      // Critical: Use legacy sorting logic
      if (rows === 2) {
        // For 2 rows, custom pattern: first item goes bottom-left, then alternates top/bottom in subsequent columns
        if (i === 0) {
          // First item: bottom-left (column 0, row 1)
          c = 0;
          r = 1;
        } else {
          // For remaining items: alternate top/bottom in columns starting from column 1
          const adjustedIndex = i - 1; // Adjust for the first item being special
          c = Math.floor(adjustedIndex / 2) + 1; // Start from column 1, increment every 2 items
          r = adjustedIndex % 2; // Alternate between top (0) and bottom (1)
        }
      } else {
        // For 1 row, use standard row-major sorting
        r = Math.floor(i / cols);
        c = i % cols;
      }
      
      // Left-anchored positioning: first column starts at x=0, subsequent columns extend rightward
      const x = c * (itemW + gapX) + padLeft;
      const yOffset = (padTop - padBottom) / 2;
      const y = ((rows - 1) / 2 - r) * (itemH + gapY) - yOffset;
      
      // Debug logging to see the layout
      console.log(`Item ${i} (${m.userData.isAdd ? 'ADD' : 'GAME'}): r=${r}, c=${c}, x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
      
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
      
      console.log('🔄 Starting grid morph transition from', prevRows.current, 'to', rows, 'rows');
      console.log('📌 Selected game index during transition:', selectedGameIndex);
      
      // Calculate where the selected game should end up and adjust shelf to keep it in view
      if (selectedGame && selectedGameIndex >= 0) {
        const selectedGameCurrentScreenX = selectedGame.position.x + currentShelfX;
        const selectedGameNewPos = layoutTargets[selectedGameIndex].position.x;
        
        // Calculate shelf adjustment to keep selected game roughly in the same screen position
        const newShelfX = selectedGameCurrentScreenX - selectedGameNewPos;
        const clampedShelfX = clamp(newShelfX, bounds.current.min, bounds.current.max);
        
        // Update shelf target to maintain view context
        shelfTargetX.current = clampedShelfX;
        
        console.log('📍 Adjusting shelf to maintain selected game view:', {
          selectedGameScreenX: selectedGameCurrentScreenX.toFixed(2),
          selectedGameNewPos: selectedGameNewPos.toFixed(2),
          newShelfTarget: clampedShelfX.toFixed(2)
        });
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
        
        console.log(`🎬 Game ${i} morphing:`, {
          from: { x: currentPos.x.toFixed(2), y: currentPos.y.toFixed(2) },
          to: { x: targetPos.x.toFixed(2), y: targetPos.y.toFixed(2) },
          scaleFrom: currentScale.x.toFixed(3),
          scaleTo: targetScale.x.toFixed(3),
          isSelected: m === selectedGame
        });
        
        // HIDE SELECTOR during transition - cleaner approach
        if (!m.userData.isAdd && m.userData.outline) {
          const outlineGroup = m.userData.outline as THREE.Group;
          
          // Hide ALL outlines during grid transition for cleaner animation
          outlineGroup.visible = false;
          console.log('🔲 Hiding outline during grid transition for game', i);
          
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
      
      // IMPORTANT: Re-establish selection after layout targets are calculated
      // This ensures the selection system knows where the selected game will be
      if (selectedGame && selectedGameIndex >= 0) {
        console.log('🔄 Selection will be restored for game', selectedGameIndex, 'after grid transition completes');
        // Don't show outline during transition - it will reappear when animation finishes
      }
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
    
    // Auto-select first playable game if none selected and set target for smooth animation
    if (!selectedRef.current && all.length > 0) {
      const firstPlayable = all.find(m => !m.userData.isAdd);
      if (firstPlayable) {
        selectMesh(firstPlayable, false, null); // Initial selection, no direction
        
        // 🔧 MANUAL POSITIONING: Use the knob to adjust starting position
        const targetShelfX = -padLeft + STARTING_POSITION_OFFSET;
        shelf.current.position.x = targetShelfX;
        shelfTargetX.current = targetShelfX;
        
        console.log('🔧 Manual positioning with knob:', {
          firstGamePosInShelf: firstPlayable.position.x,
          padLeft: padLeft,
          offset: STARTING_POSITION_OFFSET,
          finalShelfPos: targetShelfX,
          resultingGameScreenPos: firstPlayable.position.x + targetShelfX
        });
      }
    }

  }, [textures, rows, frontWidthUnits, frontHeightUnits, themeCtx.theme.text]);

  // Selector bracket system from legacy GameShelf
  const attachOutline = (
    mesh: THREE.Mesh,
    boxW: number,
    boxH: number,
    boxD: number,
    layoutRows: 1 | 2,
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