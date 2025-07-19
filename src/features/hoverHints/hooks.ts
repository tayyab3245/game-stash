import { useState, useEffect } from 'react';

/**
 * Hook to calculate screen position for a 3D object
 * Useful for positioning hover hints relative to game covers
 */
export const useGamePosition = (
  gameElement: HTMLElement | null,
  isSelected: boolean
) => {
  const [position, setPosition] = useState<{ x: number; y: number } | undefined>();

  useEffect(() => {
    if (!gameElement || !isSelected) {
      setPosition(undefined);
      return;
    }

    const updatePosition = () => {
      const rect = gameElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setPosition({ x: centerX, y: centerY });
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    // For 3D animations, we might want to check position more frequently
    const interval = setInterval(updatePosition, 100);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      clearInterval(interval);
    };
  }, [gameElement, isSelected]);

  return position;
};
