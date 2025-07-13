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

  // Placeholder selectMesh function - to be implemented with full logic from legacy
  const selectMesh = (mesh: THREE.Mesh | null, playSound?: boolean) => {
    selectedRef.current = mesh;
    // TODO: Implement full selection logic from legacy GameShelf
    if (playSound) {
      SoundManager.playUISelect();
    }
  };

  // Connect to shelf controls with BackgroundContainer integration
  const { startHold, stopHold } = useShelfControls({
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

  // Basic THREE.js setup so we can see the BackgroundContainer working
  useEffect(() => {
    if (!container.current) return;

    // Create basic THREE.js scene
    scene.current = new THREE.Scene();
    camera.current = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    renderer.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    const containerEl = container.current;
    renderer.current.setSize(containerEl.clientWidth, containerEl.clientHeight);
    renderer.current.setClearColor(0x000000, 0); // Transparent background
    containerEl.appendChild(renderer.current.domElement);

    // Create shelf group
    shelf.current = new THREE.Group();
    scene.current.add(shelf.current);

    // Position camera
    camera.current.position.set(0, 2, 8);
    camera.current.lookAt(0, 0, 0);

    // Basic animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.current.render(scene.current, camera.current);
    };
    animate();

    // Size the background container
    if (backgroundRef.current) {
      const width = containerEl.clientWidth * 0.8; // 80% of container width
      const left = containerEl.clientWidth * 0.1;  // Center it
      backgroundRef.current.setSize(width, left);
    }

    return () => {
      if (renderer.current?.domElement?.parentNode) {
        renderer.current.domElement.parentNode.removeChild(renderer.current.domElement);
      }
      renderer.current?.dispose();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!container.current || !renderer.current || !camera.current) return;

    const handleResize = () => {
      const containerEl = container.current!;
      const width = containerEl.clientWidth;
      const height = containerEl.clientHeight;
      
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
