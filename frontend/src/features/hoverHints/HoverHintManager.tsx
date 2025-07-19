import React from 'react';
import { HoverHintManagerProps } from './types';
import HoverHint from './HoverHint';

const HoverHintManager: React.FC<HoverHintManagerProps> = ({
  gridMode,
  gameSelected,
  gamePosition,
  additionalHints = [],
  onDismiss,
  forceShow = false
}) => {
  // Show rotation hint only in single grid mode when a game is selected
  const showRotationHint = gridMode === 'single' && gameSelected && gamePosition;
  
  // Determine delay based on whether it's force-triggered or natural
  const hintDelay = forceShow ? 200 : 3000;

  return (
    <>
      {/* Rotation hint for selected game in single grid mode */}
      {showRotationHint && (
        <HoverHint
          visible={true}
          position={gamePosition}
          type="rotate"
          delay={hintDelay} // Dynamic delay based on trigger source
          autoHide={0} // Don't auto-hide, let it breathe
          onDismiss={onDismiss}
        />
      )}
      
      {/* Additional hints */}
      {additionalHints.map((hint, index) => (
        <HoverHint
          key={index}
          visible={true}
          {...hint}
          onDismiss={onDismiss}
        />
      ))}
    </>
  );
};

export default HoverHintManager;
