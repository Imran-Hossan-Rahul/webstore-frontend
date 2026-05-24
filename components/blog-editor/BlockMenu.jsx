import React, { useState, useEffect, useRef } from 'react';
import { Copy, Trash2, Eye, EyeOff } from 'lucide-react';

export const BlockMenu = ({ editor }) => {
  const [menuState, setMenuState] = useState({
    visible: false,
    top: 0,
    left: 0,
    nodePos: null, // Track position of the node to optimize updates
    isHidden: false,
  });
  
  const menuRef = useRef(null);
  const isHoveringMenu = useRef(false);

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e) => {
      if (isHoveringMenu.current) return;

      const view = editor.view;
      // 1. Use Tiptap's posAtCoords to find exactly what's under the mouse
      const posResult = view.posAtCoords({ left: e.clientX, top: e.clientY });
      
      if (!posResult || !posResult.pos) {
         setMenuState(prev => prev.visible ? { ...prev, visible: false } : prev);
         return;
      }

      // 2. Resolve the node at this position
      const { pos } = posResult;
      const $pos = view.state.doc.resolve(pos);
      
      // 3. Find the actionable block node (Paragraph, Heading, etc.)
      // We traverse depth-first, looking for a valid block that isn't the main Doc or a Section/Container wrapper
      let targetNode = null;
      let targetPos = -1;

      // Depth 0 is doc. We want the deepest block that is NOT a layout wrapper if possible.
      // Or rather, we want the block holding the text.
      for (let d = $pos.depth; d > 0; d--) {
          const node = $pos.node(d);
          // Skip layout wrappers if we are deep inside
          if (node.type.name === 'doc' || node.type.name === 'container') continue;
          
          // If we hit a Section, we usually want the child within it (unless we are clicking the section padding?)
          // But posAtCoords usually hits text or block content.
          // If the node at this depth is a Section, look deeper. 
          // But since loop is Top-Down or Bottom-Up? d=$pos.depth is DEEPEST.
          
          // If deepest node is text, it's not a block. Tiptap $pos.node(d) returns the BLOCK at that depth.
          // e.g. Depth 2 = Paragraph, Depth 1 = Section.
          
          if (node.type.name === 'section') {
              // If we are pointing strictly at a section (maybe padding), do we show menu?
              // User specifically complained about "Duplicate section".
              // So we prefer the CHILD of the section.
              // If we are at depth 1 (Section) and there is no depth 2, then we are selecting Section.
              if (d === $pos.depth) {
                   // Only node is section? Okay.
                   targetNode = node;
                   targetPos = $pos.before(d);
              }
              continue; // Prefer child if available (which we would have seen at d > 1?)
              // Wait, loop starts at Deepest.
              // If Deepest is Paragraph (d=2), we see Paragraph first.
              // We should PICK Paragraph.
          }
          
          targetNode = node;
          targetPos = $pos.before(d);
          break; // Found our deepest Block
      }

      if (!targetNode || targetPos === -1) {
          setMenuState(prev => prev.visible ? { ...prev, visible: false } : prev);
          return;
      }

      // 4. Get DOM for specific node to position menu
      const domNode = view.nodeDOM(targetPos);
      if (!domNode || !(domNode instanceof HTMLElement)) {
          // Fallback for nodes that don't have direct DOM mapping or are text nodes (shouldn't happen with nodeDOM of block)
          // Try finding by generic coords?
          setMenuState(prev => prev.visible ? { ...prev, visible: false } : prev);
          return;
      }

      const rect = domNode.getBoundingClientRect();
      const editorRect = view.dom.getBoundingClientRect();
      
      // Update check: Don't re-render if we are on the same node
      // But verify Y coordinate proximity to ensure we aren't "stuck" if mouse moved far away 
      // (Though posAtCoords handles that).
      
      // Calculate position relative to editor container (handling scroll)
      // Check if mouse is roughly aligned Y-wise
      if (e.clientY < rect.top - 10 || e.clientY > rect.bottom + 10) {
           setMenuState(prev => prev.visible ? { ...prev, visible: false } : prev);
           return;
      }
      
      // Position logic
      const sidebarWidth = 240; // Approx LeftPanel width if fixed, but better to rely on View
      // Actually, we want it relative to the BLOCK.
      // e.clientX is global.
      // We want menu to appear to the LEFT of the block.
      
      // Find the relative positioned container
      const editorContainer = view.dom.closest('.editor-container');
      if (!editorContainer) {
          setMenuState(prev => prev.visible ? { ...prev, visible: false } : prev);
          return;
      }

      const containerRect = editorContainer.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top + editorContainer.scrollTop;
      
      // Calculate how far the text block is from the container's left edge
      // and position the menu 80px to the left of that block.
      const blockLeftOffset = rect.left - containerRect.left;
      
      const newNodeState = {
          visible: true,
          top: relativeTop,
          left: blockLeftOffset - 80, // Sit precisely 80px left of the text block
          nodePos: targetPos,
          isHidden: targetNode.attrs.isHidden || false
      };

      setMenuState(prev => {
          if (prev.nodePos === newNodeState.nodePos && prev.visible && prev.isHidden === newNodeState.isHidden) {
              return prev; // No change
          }
          return newNodeState;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [editor]);

  const handleDuplicate = () => {
    if (!editor || !menuState.nodePos) return;
    const { nodePos } = menuState;
    const node = editor.state.doc.nodeAt(nodePos);
    if (node) {
        editor.chain().focus().insertContentAt(nodePos + node.nodeSize, node.toJSON()).run();
    }
  };

  const handleDelete = () => {
    if (!editor || !menuState.nodePos) return;
    const { nodePos } = menuState;
    // Safely select the node and delete it, which works better for complex block nodes
    editor.chain().focus().setNodeSelection(nodePos).deleteSelection().run();
    isHoveringMenu.current = false; // Add this line to fix the frozen hover state bug
    setMenuState(prev => ({ ...prev, visible: false }));
  };

  const handleToggleHide = () => {
    if (!editor || !menuState.nodePos) return;
    const { nodePos } = menuState;
    const node = editor.state.doc.nodeAt(nodePos);
    
    const isHidden = node.attrs.isHidden || false;
    
    // Toggle
    // Note: Use nodePos explicitly to target THIS node
    editor.chain()
          .focus()
          .command(({ tr }) => {
              tr.setNodeMarkup(nodePos, undefined, { ...node.attrs, isHidden: !isHidden });
              return true;
          })
          .run();
          
     // Update local state immediately for responsiveness
     setMenuState(prev => ({ ...prev, isHidden: !isHidden }));
  };

  if (!menuState.visible) return null;

  return (
    <div
      ref={menuRef}
      onMouseEnter={() => { isHoveringMenu.current = true; }}
      onMouseLeave={() => { isHoveringMenu.current = false; }}
      style={{
        position: 'absolute',
        top: menuState.top,
        left: menuState.left,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        paddingRight: '15px', // Bridge gap
        height: '28px',
      }}
      className="block-menu-wrapper"
    >
      <div className="flex bg-white shadow-sm border rounded overflow-hidden">
        <button 
            onClick={handleDuplicate}
            className="p-1 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors border-r"
            title="Duplicate Block"
        >
            <Copy size={14} />
        </button>
        <button 
            onClick={handleToggleHide}
            className={`p-1 hover:bg-yellow-50 transition-colors border-r ${menuState.isHidden ? 'text-orange-500 bg-orange-50' : 'text-slate-500 hover:text-orange-600'}`}
            title={menuState.isHidden ? "Unhide Block" : "Hide Block"}
        >
            {menuState.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button 
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="Delete Block"
        >
            <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
