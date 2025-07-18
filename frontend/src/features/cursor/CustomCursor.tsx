import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../theme';
import './CustomCursor.css';

export interface CustomCursorProps {
  enabled?: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ enabled = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0, angle: 0, stretch: 1, scale: 1 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { theme } = useTheme();
  
  // Physics state refs
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1.0);
  const currentScale = useRef(1.0);
  const animationFrameId = useRef<number | null>(null);

  // Physics parameters - reduced for better accuracy
  const stiffness = 0.05; // Increased from 0.01 for faster response
  const damping = 0.8; // Reduced from 0.95 for less bouncing
  const scaleStiffness = 0.15; // Increased from 0.08 for quicker scaling

  // Set theme attribute on document body for CSS theme selectors
  useEffect(() => {
    if (theme?.mode) {
      document.body.setAttribute('data-theme', theme.mode);
    }
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [theme?.mode]);

  useEffect(() => {
    if (!enabled) return;

    // Physics-based animation loop
    const animate = () => {
      // Positional physics
      const forceX = (mousePos.current.x - ringPos.current.x) * stiffness;
      const forceY = (mousePos.current.y - ringPos.current.y) * stiffness;
      velocity.current.x += forceX;
      velocity.current.y += forceY;
      velocity.current.x *= damping;
      velocity.current.y *= damping;
      ringPos.current.x += velocity.current.x;
      ringPos.current.y += velocity.current.y;

      // Scaling physics for smooth size transitions
      currentScale.current += (targetScale.current - currentScale.current) * scaleStiffness;

      // Enhanced morphing logic for more stretch
      const speed = Math.sqrt(velocity.current.x**2 + velocity.current.y**2);
      const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);
      const stretch = Math.min(1 + speed * 0.25, 2.0); // Increased from 0.1 and 1.2 for more dramatic stretch

      // Update position state for React
      setPosition({
        x: ringPos.current.x,
        y: ringPos.current.y,
        angle: angle + 90,
        stretch: stretch * currentScale.current,
        scale: currentScale.current
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const updateCursorPosition = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      targetScale.current = 0.6; // Contract on click
    };

    const handleMouseUp = () => {
      setIsClicking(false);
      targetScale.current = isHovering ? 0.8 : 1.0; // Relax to normal or hover state
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target || typeof target.closest !== 'function') return;
      
      const isInteractive = target.closest(`
        button, 
        a, 
        [role="button"], 
        .interactive, 
        .clickable,
        .navigation-button,
        .volume-button,
        .grid-button,
        .theme-toggle,
        .command-button,
        input,
        select,
        textarea
      `.replace(/\s+/g, ''));
      
      if (isInteractive) {
        setIsHovering(true);
        targetScale.current = 0.8; // Changed from 0.6 for less dramatic shrinking
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      targetScale.current = 1.0;
    };

    // Function to disable all cursors
    const disableCursors = () => {
      document.body.style.cursor = 'none';
      document.documentElement.style.cursor = 'none';
    };

    // Start animation loop
    animate();

    // Add event listeners with passive flag for better performance
    document.addEventListener('mousemove', updateCursorPosition, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseEnter, { passive: true });
    document.addEventListener('mouseout', handleMouseLeave, { passive: true });

    // Disable cursors
    disableCursors();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      document.body.style.cursor = 'auto';
      document.documentElement.style.cursor = 'auto';
    };
  }, [enabled, isHovering]);

  if (!enabled) return null;

  return (
    <div className="custom-cursor-container">
      {/* Physics-based Ring Cursor with built-in shadow via CSS */}
      <div
        className={`physics-ring-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) rotate(${(position as any).angle || 0}deg) scaleY(${(position as any).stretch || 1}) scaleX(${(position as any).scale || 1})`,
          ['--cursor-angle' as any]: `${(position as any).angle || 0}deg`, // CSS variable for inverse rotation
        }}
      />
    </div>
  );
};

export default CustomCursor;
