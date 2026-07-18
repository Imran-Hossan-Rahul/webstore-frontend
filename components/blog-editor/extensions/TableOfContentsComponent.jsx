import React, { useEffect, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export default function TableOfContentsComponent({ editor }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const updateToc = () => {
      if (!editor || !editor.state) return;
      
      const headings = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          headings.push({
            level: node.attrs.level,
            text: node.textContent,
            id: node.attrs.id,
            pos: pos,
          });
        }
      });
      
      setItems(headings);
    };

    updateToc();
    editor.on('update', updateToc);

    return () => {
      editor.off('update', updateToc);
    };
  }, [editor]);

  const handleLinkClick = (e, id, pos) => {
    e.preventDefault();
    const element = document.querySelector(`[data-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const view = editor.view;
      try {
        const coords = view.coordsAtPos(pos);
        window.scrollTo({ top: coords.top - 100, behavior: 'smooth' });
      } catch (err) {
        console.warn('Could not scroll to position', err);
      }
    }
  };

  // Convert flat list of headings to a nested tree structure
  const buildTree = (headings) => {
    const tree = [];
    const stack = [];

    headings.forEach((heading) => {
      const node = { ...heading, children: [] };
      
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        tree.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return tree;
  };

  // Recursively render the tree
  const renderTree = (nodes, isRoot = true) => {
    return (
      <ul className={isRoot ? "columns-1 md:columns-2 gap-x-12" : "ml-3 pl-4 border-l-2 border-gray-200 dark:border-zinc-700/80 relative space-y-1 mt-1"}>
        {nodes.map((node, index) => {
          // Clean text (remove leading "1.1", "1. " if desired, but here we just render exactly what they wrote)
          const displayText = node.text || 'Untitled';
          
          return (
            <li key={`${node.id}-${index}`} className={`relative break-inside-avoid ${isRoot ? 'mb-4' : ''}`}>
              {/* Horizontal line for tree branch */}
              {!isRoot && (
                <span className="absolute top-[14px] -left-4 w-4 h-[2px] bg-gray-200 dark:bg-zinc-700/80"></span>
              )}
              
              <a
                href={`#${node.id}`}
                onClick={(e) => handleLinkClick(e, node.id, node.pos)}
                className={`inline-block py-1 px-2 -mx-2 rounded-md text-[14.5px] transition-all duration-200 ease-in-out max-w-full truncate hover:bg-gray-100 dark:hover:bg-zinc-800/50
                  ${isRoot 
                    ? 'text-gray-900 dark:text-gray-100 font-bold text-[15.5px]' 
                    : 'text-gray-600 dark:text-zinc-400 font-medium hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
                title={displayText}
              >
                {displayText}
              </a>
              
              {/* Render children if any */}
              {node.children.length > 0 && renderTree(node.children, false)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (items.length === 0) {
    return (
      <NodeViewWrapper className="toc-wrapper my-4">
        <div className="p-4 bg-gray-50 dark:bg-[#1C1C1C]/50 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-500 italic text-sm flex items-center justify-center">
          Table of contents (Add headings to populate)
        </div>
      </NodeViewWrapper>
    );
  }

  const treeData = buildTree(items);

  return (
    <NodeViewWrapper className="toc-wrapper my-8" data-drag-handle>
      <div className="p-6 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Table of Contents
        </h3>
        {renderTree(treeData, true)}
      </div>
    </NodeViewWrapper>
  );
}
