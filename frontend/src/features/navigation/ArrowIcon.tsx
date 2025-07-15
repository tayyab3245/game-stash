// Arrow SVG icon component with rounded, well-scaled paths
import React from 'react';

interface ArrowIconProps {
  direction: 'left' | 'right';
  size?: number;
  color?: string;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ 
  direction, 
  size = 40, // Increased default size
  color = 'currentColor' 
}) => {
  const isLeft = direction === 'left';
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={isLeft 
          ? "M15.5 5L9 12L15.5 19" 
          : "M8.5 5L15 12L8.5 19"
        }
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default ArrowIcon;
