"use client";

import { ReactLenis } from 'lenis/react';

export default function SmoothScroller({ children }) {
  return (
    <ReactLenis root options={{ 
      lerp: 0.045, // Lower lerp for heavier, more luxurious smoothing (was 0.08)
      duration: 1.5, 
      smoothWheel: true, 
      smoothTouch: false, 
      wheelMultiplier: 0.85, // Slower scroll speed (was 1.1)
      touchMultiplier: 1.5,
    }}>
      {children}
    </ReactLenis>
  );
}
