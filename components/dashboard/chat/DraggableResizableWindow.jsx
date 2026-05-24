"use client";

import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DraggableResizableWindow({ 
  children, 
  initialWidth = 900, 
  initialHeight = 600, 
  minWidth = 320, 
  minHeight = 400,
  storageKey = "chat_window_state" 
}) {
  const windowRef = useRef(null);
  
  // Use refs instead of state for O(1) rendering performance. 
  // Bypassing React state during drag/resize prevents expensive Virtual DOM reconciliations.
  const position = useRef({ x: 0, y: 0 });
  const size = useRef({ width: initialWidth, height: initialHeight });
  
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeDirection = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });

  // Persist state to localStorage on drag/resize end
  const persistState = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        x: position.current.x,
        y: position.current.y,
        width: size.current.width,
        height: size.current.height,
      }));
    } catch (_) {}
  };

  // Only render on patron side
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On mount: restore from localStorage, or default to centered
  useEffect(() => {
    if (!mounted || !windowRef.current) return;

    let startX, startY, startWidth, startHeight;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        startWidth = Math.max(minWidth, Math.min(parsed.width, window.innerWidth));
        startHeight = Math.max(minHeight, Math.min(parsed.height, window.innerHeight));
        startX = Math.max(0, Math.min(parsed.x, window.innerWidth - startWidth));
        startY = Math.max(0, Math.min(parsed.y, window.innerHeight - startHeight));
      } else {
        // First visit: center with large default size
        startWidth = Math.min(initialWidth, window.innerWidth - 80);
        startHeight = Math.min(initialHeight, window.innerHeight - 80);
        startX = Math.max(0, (window.innerWidth - startWidth) / 2);
        startY = Math.max(0, (window.innerHeight - startHeight) / 2);
      }
    } catch (_) {
      startWidth = initialWidth;
      startHeight = initialHeight;
      startX = Math.max(0, (window.innerWidth - initialWidth) / 2);
      startY = Math.max(0, (window.innerHeight - initialHeight) / 2);
    }

    position.current = { x: startX, y: startY };
    size.current = { width: startWidth, height: startHeight };

    windowRef.current.style.transform = `translate(${startX}px, ${startY}px)`;
    windowRef.current.style.width = `${startWidth}px`;
    windowRef.current.style.height = `${startHeight}px`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!windowRef.current) return;

      if (isDragging.current) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        
        let newX = initialPos.current.x + deltaX;
        let newY = initialPos.current.y + deltaY;

        // Keep within window bounds
        if (typeof window !== "undefined") {
          newX = Math.max(0, Math.min(newX, window.innerWidth - size.current.width));
          newY = Math.max(0, Math.min(newY, window.innerHeight - size.current.height));
        }

        position.current = { x: newX, y: newY };
        // O(1) direct DOM mutation
        windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;

      } else if (isResizing.current) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        
        let newWidth = initialSize.current.width;
        let newHeight = initialSize.current.height;
        let newX = initialPos.current.x;
        let newY = initialPos.current.y;

        const dir = resizeDirection.current;

        if (dir.includes('e')) newWidth = Math.max(minWidth, initialSize.current.width + deltaX);
        if (dir.includes('s')) newHeight = Math.max(minHeight, initialSize.current.height + deltaY);
        
        if (dir.includes('w')) {
          const possibleWidth = initialSize.current.width - deltaX;
          if (possibleWidth >= minWidth) {
            newWidth = possibleWidth;
            newX = initialPos.current.x + deltaX;
          } else {
            newWidth = minWidth;
            newX = initialPos.current.x + (initialSize.current.width - minWidth);
          }
        }
        if (dir.includes('n')) {
          const possibleHeight = initialSize.current.height - deltaY;
          if (possibleHeight >= minHeight) {
            newHeight = possibleHeight;
            newY = initialPos.current.y + deltaY;
          } else {
            newHeight = minHeight;
            newY = initialPos.current.y + (initialSize.current.height - minHeight);
          }
        }

        size.current = { width: newWidth, height: newHeight };
        position.current = { x: newX, y: newY };
        
        // O(1) direct DOM mutation
        windowRef.current.style.width = `${newWidth}px`;
        windowRef.current.style.height = `${newHeight}px`;
        windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };

    const handleMouseUp = () => {
      const wasActive = isDragging.current || isResizing.current;
      isDragging.current = false;
      isResizing.current = false;
      resizeDirection.current = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      // Persist the final state only if we actually moved or resized
      if (wasActive) persistState();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [minWidth, minHeight]);

  const handleDragStart = (e) => {
    if (e.target.classList.contains('resize-handle')) return;

    const interactiveElements = ['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT'];
    const isInteractive = e.target.closest(interactiveElements.join(',')) || e.target.closest('.no-drag');
    const isScrollbarClick = e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight;

    if (!isInteractive && !isScrollbarClick) {
      isDragging.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialPos.current = { ...position.current };
      document.body.style.userSelect = 'none';
    }
  };

  const handleResizeStart = (e, dir) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    resizeDirection.current = dir;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position.current };
    initialSize.current = { ...size.current };
    document.body.style.userSelect = 'none';
    
    if (dir === 'e' || dir === 'w') document.body.style.cursor = 'ew-resize';
    else if (dir === 's' || dir === 'n') document.body.style.cursor = 'ns-resize';
    else if (dir === 'se' || dir === 'nw') document.body.style.cursor = 'nwse-resize';
    else if (dir === 'sw' || dir === 'ne') document.body.style.cursor = 'nesw-resize';
  };

  if (!mounted) return null;

  const content = (
    <div
      ref={windowRef}
      className="fixed shadow-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col z-[9999]"
      style={{
        left: 0,
        top: 0,
        willChange: 'transform, width, height'
      }}
      onMouseDown={handleDragStart}
    >
      <div className="flex-1 flex overflow-hidden relative rounded-2xl">
        {children}
      </div>

      {/* Resize handles */}
      <div className="resize-handle absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'e')} />
      <div className="resize-handle absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'w')} />
      <div className="resize-handle absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className="resize-handle absolute left-0 right-0 top-0 h-2 cursor-ns-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'n')} />
      
      {/* Corners */}
      <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'se')} />
      <div className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      <div className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-nesw-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
      <div className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-600 transition-colors z-[10000]" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
    </div>
  );

  return createPortal(content, document.body);
}
