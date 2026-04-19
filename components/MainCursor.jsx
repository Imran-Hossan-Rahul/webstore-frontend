"use client";

import React, { useEffect, useRef, useState } from "react";

const SmoothCursor = ({ smoothness = 0.1, offset = 3 }) => {
  const cursorRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX + offset, y: e.clientY + offset };
    };

    window.addEventListener("mousemove", onMouseMove);

    // Smooth animation
    const animate = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * smoothness;
      pos.current.y += (mouse.current.y - pos.current.y) * smoothness;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      requestAnimationFrame(animate);
    };
    animate();

    // Hover detection
    const hoverChecker = () => {
      const el = document.elementFromPoint(
        mouse.current.x - offset,
        mouse.current.y - offset
      );
      if (el) {
        const style = window.getComputedStyle(el);
        setHovering(style.cursor === "pointer");
      }
      requestAnimationFrame(hoverChecker);
    };
    hoverChecker();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [smoothness, offset]);

  return (
    <div
      ref={cursorRef}
      className={`smooth-cursor ${hovering ? "hovering" : ""}`}
    >
      {hovering && <div className="arrow" />}
    </div>
  );
};

export default SmoothCursor;
