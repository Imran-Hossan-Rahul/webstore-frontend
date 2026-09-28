import React from 'react';

export default function TechnicalBackground({ variant = 'grid-dark', className = '' }) {
  if (variant === 'grid-dark') {
    return (
      <div className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-50 md:opacity-100 ${className}`}>
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)'
          }}
        />
        {/* Tiny geometric intersection markers */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 199, 232, 0.2) 1px, transparent 0)`,
            backgroundSize: '144px 144px', // Every 3rd grid intersection
            backgroundPosition: '-1px -1px', 
            maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 80%)'
          }}
        />
      </div>
    );
  }

  if (variant === 'dots-light') {
    return (
      <div className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-50 md:opacity-100 ${className}`}>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(11, 37, 69, 0.04) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at top, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 40%, transparent 80%)'
          }}
        />
      </div>
    );
  }

  if (variant === 'grid-light') {
    return (
      <div className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-50 md:opacity-100 ${className}`}>
        {/* Subtle grid pattern for light sections */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(11, 37, 69, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(11, 37, 69, 0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'linear-gradient(to bottom, black 10%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 90%)'
          }}
        />
      </div>
    );
  }

  return null;
}
