// BackgroundContainer types - positioned shell replacement
import React from 'react';

export interface BackgroundContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface BackgroundContainerRef {
  setPosition: (x: number) => void;
  setSize: (width: number, left: number) => void;
  clearTransform: () => void;
  getElement: () => HTMLDivElement | null;
}
