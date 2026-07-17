import React, { useState, useRef } from 'react';

export default function ParallaxCard({
  children,
  className = '',
  style = {},
  maxRotation = 6, // maximum tilt angle in degrees
  ...props
}) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Mouse coordinates relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Bounding dimensions
    const width = rect.width;
    const height = rect.height;
    
    // Relative centers
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate rotation:
    // - Y axis movement (up/down) rotates around X axis
    // - X axis movement (left/right) rotates around Y axis
    const rotX = ((centerY - y) / centerY) * maxRotation;
    const rotY = ((x - centerX) / centerX) * maxRotation;

    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 }); // reset tilt
  };

  const tiltStyle = {
    ...style,
    transform: isHovered 
      ? `perspective(1000px) rotateX(${rotate.x.toFixed(2)}deg) rotateY(${rotate.y.toFixed(2)}deg) translateZ(10px)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    transformStyle: 'preserve-3d',
  };

  return (
    <div
      ref={cardRef}
      className={`glass-card ${className}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}
