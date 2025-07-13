import React from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = ({ size = 'normal', showTitle = true }) => {
  const sizeClass = size === 'small' ? 'logo-small' : size === 'large' ? 'logo-large' : '';
  
  return (
    <div className={`logo-wrapper ${sizeClass}`}>
      <div className="animated-logo">
        <div className="cart red"></div>
        <div className="cart blue"></div>
        <div className="cart yellow"></div>
      </div>
      {showTitle && <h1 className="logo-title">Game Stash</h1>}
    </div>
  );
};

export default AnimatedLogo;
