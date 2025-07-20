import React from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = ({ size = 'normal', showTitle = true }) => {
  const sizeClass = size === 'small' ? 'logo-small' : size === 'large' ? 'logo-large' : '';
  
  return (
    <div className={`logo-wrapper ${sizeClass}`}>
      <div className="logo-container">
        <div className="assembly-point">
          <div id="red-block" className="block red">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
            <div className="face left-side"></div>
            <div className="face right-side"></div>
          </div>
          <div id="blue-block" className="block blue">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
            <div className="face left-side"></div>
            <div className="face right-side"></div>
          </div>
          <div id="yellow-block" className="block yellow">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
            <div className="face left-side"></div>
            <div className="face right-side"></div>
          </div>
        </div>
      </div>
      {showTitle && <h1 className="logo-title">Game Stash</h1>}
    </div>
  );
};

export default AnimatedLogo;
