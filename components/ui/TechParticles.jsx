"use client";
import React, { useEffect, useRef } from 'react';

export default function TechParticles({ scatterOnly = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;
    let particles = [];
    
    // Brand Colors: Circuit Cyan, Trust Blue, White
    const colors = ['#22C7E8', '#1D5FD1', '#FFFFFF', '#FFFFFF', '#22C7E8'];

    let targets = [];
    
    const initTargets = () => {
        // Create an offscreen canvas to render the text and read pixels
        const offscreen = document.createElement('canvas');
        const oCtx = offscreen.getContext('2d', { willReadFrequently: true });
        
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        
        oCtx.fillStyle = "white";
        
        let containerWidth = canvas.width;
        let centerX = canvas.width / 2;
        
        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            let leftSpace = 0;
            let rightSpace = 0;
            const px6 = 24;
            const px4 = 16;
            const gap = 30;
            
            const maxW = 1800;
            const margin = Math.max(0, (w - maxW) / 2);
            
            if (w >= 1280) { // xl
                leftSpace = margin + px6 + 80 + gap;
                rightSpace = margin + px6 + 300 + gap;
            } else if (w >= 1024) { // lg
                leftSpace = margin + px6 + 80 + gap;
                rightSpace = margin + px6;
            } else if (w >= 640) { // sm
                leftSpace = margin + px4;
                rightSpace = margin + px4;
            }
            
            containerWidth = w - leftSpace - rightSpace;
            centerX = leftSpace + (containerWidth / 2);
        }

        // Responsive font size relative to the main container width
        const fontSize = Math.min(containerWidth / 3.5, 220);
        oCtx.font = `bold ${fontSize}px "Inter", -apple-system, sans-serif`;
        oCtx.textAlign = "center";
        oCtx.textBaseline = "middle";
        
        const textY = typeof window !== 'undefined' ? (window.innerHeight * 0.50) : (canvas.height * 0.5);
        
        // Measure text chunks to map X coordinates to specific letters
        oCtx.textAlign = "left";
        const textStr = "Codalina";
        const totalWidth = oCtx.measureText(textStr).width;
        const textStartX = centerX - (totalWidth / 2);
        
        const letterWidths = [];
        for (let i = 1; i <= textStr.length; i++) {
            letterWidths.push(oCtx.measureText(textStr.substring(0, i)).width);
        }
        
        // Draw centered for particle generation
        oCtx.textAlign = "center";
        oCtx.fillText(textStr, centerX, textY);
        
        if (typeof window !== 'undefined') {
            // Text baseline is slightly below the center. We add 38% of font size to get the exact physical bottom of the letters.
            const floorPosition = textY + (fontSize * 0.38);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('floor-position', { detail: { 
                    y: floorPosition, 
                    x: centerX,
                    textWidth: totalWidth
                } }));
            }, 50);
        }
        
        const imageData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imageData.data;
        
        targets = [];
        // Sample pixels (smaller step = denser text, more particles)
        const step = window.innerWidth < 768 ? 3 : 3; 
        
        for (let y = 0; y < offscreen.height; y += step) {
            for (let x = 0; x < offscreen.width; x += step) {
                const alpha = data[((y * offscreen.width + x) * 4) + 3];
                if (alpha > 128) {
                    // Determine which letter this pixel belongs to based on X coordinate
                    let charIndex = 0;
                    for (let i = 0; i < textStr.length; i++) {
                        if (x <= textStartX + letterWidths[i]) {
                            charIndex = i;
                            break;
                        }
                    }
                    
                    // Assign formation sequence group (1: a/i, 2: o/n, 3: C/d/l)
                    let formationGroup = 3;
                    if (charIndex === 3 || charIndex === 5 || charIndex === 7) {
                        formationGroup = 1; // 'a', 'i', 'a'
                    } else if (charIndex === 1 || charIndex === 6) {
                        formationGroup = 2; // 'o', 'n'
                    }
                    
                    targets.push({
                        x: x + (Math.random() - 0.5) * 2, // Slight jitter for organic look
                        y: y + (Math.random() - 0.5) * 2,
                        group: formationGroup
                    });
                }
            }
        }
        
        // Shuffle targets so particles map randomly
        targets.sort(() => Math.random() - 0.5);
    };

    const initParticles = () => {
      if (!scatterOnly) {
        initTargets();
      } else {
        // Just create generic targets if needed, though they won't be used
        targets = Array(600).fill(0).map(() => ({
          x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 1000,
          y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 500,
          group: 0
        }));
      }

      particles = [];
      // 85% text particles + 15% ambient background particles for depth after formation
      const backgroundCount = Math.floor(targets.length * 0.15);
      const particleCount = scatterOnly ? 800 : targets.length + backgroundCount; 
      
      let centerX = canvas.width / 2;
      if (typeof window !== 'undefined') {
          const w = window.innerWidth;
          let leftSpace = 0; let rightSpace = 0;
          const px6 = 24; const px4 = 16; const gap = 30;
          const maxW = 1800; const margin = Math.max(0, (w - maxW) / 2);
          if (w >= 1280) { leftSpace = margin + px6 + 80 + gap; rightSpace = margin + px6 + 300 + gap; } 
          else if (w >= 1024) { leftSpace = margin + px6 + 80 + gap; rightSpace = margin + px6; } 
          else if (w >= 640) { leftSpace = margin + px4; rightSpace = margin + px4; }
          centerX = leftSpace + ((w - leftSpace - rightSpace) / 2);
      }
      const textY = typeof window !== 'undefined' ? (window.innerHeight * 0.50) : (canvas.height * 0.5);

      for (let i = 0; i < particleCount; i++) {
        const isTextParticle = i < targets.length;
        
        // Spawn exactly at the center for a Big Bang effect
        const angle = Math.random() * Math.PI * 2;
        const burstPower = Math.random() * 60 + 15; // Massive outward burst for wider scattering
        
        // If scatterOnly, spawn them randomly across the screen initially instead of bursting from center
        const startX = scatterOnly ? Math.random() * canvas.width : centerX + (Math.random() - 0.5) * 10;
        const startY = scatterOnly ? Math.random() * canvas.height : textY + (Math.random() - 0.5) * 10;

        particles.push({
          x: startX,
          y: startY,
          vx: scatterOnly ? (Math.random() - 0.5) * 2 : Math.cos(angle) * burstPower,
          vy: scatterOnly ? (Math.random() - 0.5) * 2 : Math.sin(angle) * burstPower,
          targetX: isTextParticle && !scatterOnly ? targets[i].x : Math.random() * canvas.width,
          targetY: isTextParticle && !scatterOnly ? targets[i].y : Math.random() * canvas.height,
          formationGroup: isTextParticle && !scatterOnly ? targets[i].group : 0,
          isTextParticle: isTextParticle && !scatterOnly,
          // Make bubbles even smaller as requested
          radius: isTextParticle ? (Math.random() * 0.8 + 0.4) : (Math.random() * 0.6 + 0.3),
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.8 + 0.2,
          speedY: (Math.random() - 0.4) * 0.4,
          speedX: (Math.random() - 0.4) * 0.4,
          ease: Math.random() * 0.1 + 0.05 // FAST magnetic snap for formation
        });
      }
    };

    let phase = 'scattered';
    let scatterTime = 0;
    let lastTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.offsetWidth;
          canvas.height = parent.offsetHeight;
      } else {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      }
      initParticles();
      phase = 'scattered';
      scatterTime = 0;
      lastTime = performance.now();
    };

    const draw = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      scatterTime += deltaTime;
      
      particles.forEach(p => {
        let shouldForm = false;
        
        // Sequenced formation timing based on group
        if (p.isTextParticle) {
            if (p.formationGroup === 1 && scatterTime > 1500) shouldForm = true; // a, i, a
            if (p.formationGroup === 2 && scatterTime > 2500) shouldForm = true; // o, n
            if (p.formationGroup === 3 && scatterTime > 3500) shouldForm = true; // C, d, l
        }
        
        if (!shouldForm) {
            // Apply friction to the initial big bang burst
            p.vx *= 0.92;
            p.vy *= 0.92;
            
            // Move particle using burst velocity + base gentle float
            p.x += p.vx + p.speedX;
            p.y += p.vy + p.speedY;
            
            // Keep them on screen if they fly too far
            if (p.y < -50) p.y = canvas.height + 50;
            if (p.y > canvas.height + 50) p.y = -50;
            if (p.x < -50) p.x = canvas.width + 50;
            if (p.x > canvas.width + 50) p.x = -50;
        } else {
            // Move smoothly towards text target
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.x += dx * p.ease;
            p.y += dy * p.ease;
            
            // Add a tiny bit of organic hover float even when formed
            p.y += Math.sin(scatterTime / 3000 + p.x) * 0.02;
        }

        // Twinkle effect
        if (Math.random() < 0.01) {
            p.opacity = Math.random() * 0.8 + 0.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
        resize();
    });
    if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
    }
    
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
