// BackgroundContainer - Adaptive background shell with positioning logic
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { getEnhancedTheme } from '../../core/theme';
import { BackgroundContainerProps, BackgroundContainerRef } from './types';

const BackgroundContainer = forwardRef<BackgroundContainerRef, BackgroundContainerProps>(({
  className = '',
  style = {},
  children,
  ...props
}, ref) => {
  const baseTheme = useTheme();
  const theme = getEnhancedTheme(baseTheme);
  const styles = theme.styles.backgroundContainer;
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose positioning methods to parent components
  useImperativeHandle(ref, () => ({
    setPosition: (x: number) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${x}px)`;
      }
    },
    setSize: (width: number, left: number) => {
      if (containerRef.current) {
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.left = `${left}px`;
      }
    },
    clearTransform: () => {
      if (containerRef.current) {
        containerRef.current.style.transform = '';
      }
    },
    getElement: () => containerRef.current,
  }), []);

  const containerStyle = {
    ...styles.container,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`background-container ${className}`}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
});

BackgroundContainer.displayName = 'BackgroundContainer';

export default BackgroundContainer;
