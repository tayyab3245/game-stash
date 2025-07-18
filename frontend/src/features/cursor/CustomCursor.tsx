import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../theme';
import './CustomCursor.css';

export interface CustomCursorProps {
  enabled?: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ enabled = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0, angle: 0, stretch: 1, scale: 1 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [buttonBounds, setButtonBounds] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
    borderRadius: string;
  } | null>(null);
  
  // Track the current button element to detect switches
  const currentButton = useRef<Element | null>(null);
  const transitionState = useRef<'normal' | 'shrinking' | 'growing'>('normal');
  const clickMultiplier = useRef(1.0); // Multiplier for click contraction
  const currentClickMultiplier = useRef(1.0); // Current animated click multiplier
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
  const scaleStiffness = 0.03; // Much slower for more visible scaling transitions

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
      // Use slower stiffness during button transitions for smoother morphing
      const currentStiffness = transitionState.current === 'shrinking' || transitionState.current === 'growing' 
        ? scaleStiffness * 0.3 // Much slower during transitions
        : scaleStiffness;
      
      currentScale.current += (targetScale.current - currentScale.current) * currentStiffness;
      
      // Smooth click multiplier animation
      currentClickMultiplier.current += (clickMultiplier.current - currentClickMultiplier.current) * 0.15;
      
      // Apply click contraction multiplier
      const finalScale = currentScale.current * currentClickMultiplier.current;
      
      // Cap the final scale to prevent it from becoming too large during transitions
      const maxAllowedScale = 4.0; // Maximum scale to prevent visual bugs
      const cappedFinalScale = Math.min(finalScale, maxAllowedScale);

      // Enhanced morphing logic for more stretch
      const speed = Math.sqrt(velocity.current.x**2 + velocity.current.y**2);
      const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);
      const stretch = Math.min(1 + speed * 0.25, 2.0); // Increased from 0.1 and 1.2 for more dramatic stretch

      // Update position state for React
      setPosition({
        x: ringPos.current.x,
        y: ringPos.current.y,
        angle: angle + 90,
        stretch: stretch * cappedFinalScale,
        scale: cappedFinalScale
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const updateCursorPosition = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      // Always contract by 20% regardless of current state
      clickMultiplier.current = 0.8;
    };

    const handleMouseUp = () => {
      setIsClicking(false);
      // Always return to full size
      clickMultiplier.current = 1.0;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target || typeof target.closest !== 'function') return;
      
      // Check if we're in a command bar area - if so, ignore
      const commandBarParent = target.closest('[style*="display: flex"], .command-bar, .toolbar');
      if (commandBarParent) {
        const rect = commandBarParent.getBoundingClientRect();
        // If it's a wide horizontal element, it's likely a command bar
        if (rect.width > 300 && rect.width / rect.height > 4) {
          setIsHovering(false);
          setButtonBounds(null);
          targetScale.current = 1.0;
          return;
        }
      }
      
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
        // Check if we're switching to a different button
        const isDifferentButton = currentButton.current && currentButton.current !== isInteractive;
        
        if (isDifferentButton && currentButton.current) {
          // Check distance between buttons to prevent rapid transitions
          const oldRect = currentButton.current.getBoundingClientRect();
          const newRect = isInteractive.getBoundingClientRect();
          
          // Calculate distance between button centers
          const oldCenterX = oldRect.left + oldRect.width / 2;
          const oldCenterY = oldRect.top + oldRect.height / 2;
          const newCenterX = newRect.left + newRect.width / 2;
          const newCenterY = newRect.top + newRect.height / 2;
          const distance = Math.sqrt((newCenterX - oldCenterX) ** 2 + (newCenterY - oldCenterY) ** 2);
          
          // Minimum distance threshold - if buttons are too close, just switch directly
          const minDistanceForTransition = 80; // pixels
          
          if (distance < minDistanceForTransition) {
            // Buttons are close - direct switch without shrink animation
            transitionState.current = 'normal';
            currentButton.current = isInteractive;
            
            const rect = isInteractive.getBoundingClientRect();
            setButtonBounds({
              width: rect.width,
              height: rect.height,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              borderRadius: getComputedStyle(isInteractive).borderRadius || '8px'
            } as any);
            
            const scaleX = (rect.width + 8) / 40;
            const scaleY = (rect.height + 8) / 40;
            const avgScale = Math.max(scaleX, scaleY, 1.5);
            targetScale.current = isClicking ? avgScale * 0.8 : avgScale;
          } else {
            // Buttons are far apart - use shrink-grow transition
            transitionState.current = 'shrinking';
            currentButton.current = null; // Clear current button during transition
            targetScale.current = 1.0; // Shrink to normal first
            setButtonBounds(null); // Remove current button bounds
            
            // Store the new button data for later
            setTimeout(() => {
              if (transitionState.current === 'shrinking') {
                transitionState.current = 'growing';
                currentButton.current = isInteractive;
                
                const rect = isInteractive.getBoundingClientRect();
                setButtonBounds({
                  width: rect.width,
                  height: rect.height,
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                  borderRadius: getComputedStyle(isInteractive).borderRadius || '8px'
                } as any);
                
                const scaleX = (rect.width + 8) / 40;
                const scaleY = (rect.height + 8) / 40;
                const avgScale = Math.max(scaleX, scaleY, 1.5);
                targetScale.current = isClicking ? avgScale * 0.8 : avgScale;
                
                // Complete transition after scaling is done
                setTimeout(() => {
                  transitionState.current = 'normal';
                }, 400);
              }
            }, 500); // Much longer delay for more visible shrink
          }
        } else {
          // Same button or first button - normal behavior
          transitionState.current = 'normal';
          currentButton.current = isInteractive;
          setIsHovering(true);
          
          const rect = isInteractive.getBoundingClientRect();
          setButtonBounds({
            width: rect.width,
            height: rect.height,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            borderRadius: getComputedStyle(isInteractive).borderRadius || '8px'
          } as any);
          
          const scaleX = (rect.width + 8) / 40;
          const scaleY = (rect.height + 8) / 40;
          const avgScale = Math.max(scaleX, scaleY, 1.5);
          targetScale.current = isClicking ? avgScale * 0.8 : avgScale;
        }
        
        setIsHovering(true);
      } else {
        setIsHovering(false);
        setButtonBounds(null);
        // Immediately reset scale instead of animating down from large scale
        targetScale.current = 1.0;
        currentScale.current = 1.0; // Force immediate reset to prevent large unmorphing
        currentButton.current = null;
        transitionState.current = 'normal';
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setButtonBounds(null);
      // Immediately reset scale instead of animating down from large scale
      targetScale.current = 1.0;
      currentScale.current = 1.0; // Force immediate reset to prevent large unmorphing
      currentButton.current = null;
      transitionState.current = 'normal';
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
      {/* Physics-based Ring Cursor with button eating effect */}
      <div
        className={`physics-ring-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''} ${buttonBounds ? 'eating-button' : ''}`}
        style={{
          left: `${buttonBounds ? buttonBounds.x : position.x}px`,
          top: `${buttonBounds ? buttonBounds.y : position.y}px`,
          width: buttonBounds ? `${buttonBounds.width + 8}px` : '40px',
          height: buttonBounds ? `${buttonBounds.height + 8}px` : '40px',
          borderRadius: buttonBounds ? buttonBounds.borderRadius : '50%',
          transform: buttonBounds 
            ? `translate(-50%, -50%) scale(1)` 
            : `translate(-50%, -50%) rotate(${position.angle || 0}deg) scaleY(${position.stretch || 1}) scaleX(${position.scale || 1})`,
          ['--cursor-angle' as any]: buttonBounds ? '0deg' : `${position.angle || 0}deg`, // No rotation when eating buttons
        }}
      />
    </div>
  );
};

export default CustomCursor;
