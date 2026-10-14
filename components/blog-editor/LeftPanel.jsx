import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor } from "@tiptap/react";
import { TextSelection, NodeSelection } from "@tiptap/pm/state";
import { ChevronRight, ChevronDown, FileText, Type, List, Image, Video, Code, Table, ChevronsRight, Trash2, Eye, EyeOff, Palette, Wand2, X, CheckCircle2 } from "lucide-react";

// ----------------------------------------
// ১. ইউটিলিটি ফাংশন (Display Name এবং Icon)
// ----------------------------------------

const getDisplayName = (node) => {
  const nodeType = node.type?.name || node.type;
  let textContent = node.textContent?.trim() || "";

  const MAX_CHARS = 20;
  if (textContent.length > MAX_CHARS)
    return textContent.substring(0, MAX_CHARS).trim() + "...";
  if (textContent.length > 0) return textContent;

  if (node.content) {
    let text = "";
    const extractText = (content) => {
      if (!content) return;
      if (Array.isArray(content)) content.forEach(extractText);
      else if (content.text) text += content.text + " ";
      else if (content.content) extractText(content.content);
    };
    extractText(node.content);
    textContent = text.trim();
    if (textContent.length > MAX_CHARS)
      return textContent.substring(0, MAX_CHARS).trim() + "...";
    if (textContent.length > 0) return textContent;
  }

  switch (nodeType) {
    case "heading":
      return `Heading ${node.attrs?.level || 1}`;
    case "paragraph":
      return "Empty Paragraph";
    case "image":
      return "Image Block";
    case "youtube":
      return "YouTube Embed";
    case "codeBlock":
      return "Code Block";
    case "table":
      return "Table Block";
    case "bulletList":
    case "orderedList":
    case "taskList":
      return "List Block";
    case "container":
      return "Container";
    case "section":
      return "Section";
    default:
      return `[${nodeType}]`;
  }
};

const getNodeIcon = (nodeName, level) => {
  switch (nodeName) {
    case "heading":
      return (
        <span className="text-[10px] font-bold text-purple-600 px-[4px] py-[1px] bg-purple-50 rounded border border-purple-200 tracking-wider">
          H{level || 1}
        </span>
      );
    case "paragraph":
      return <FileText size={14} className="text-slate-600" />;
    case "image":
      return <Image size={14} className="text-green-600" />;
    case "youtube":
      return <Video size={14} className="text-red-600" />;
    case "codeBlock":
      return <Code size={14} className="text-yellow-600" />;
    case "table":
      return <Table size={14} className="text-blue-600" />;
    case "bulletList":
    case "orderedList":
    case "taskList":
      return <List size={14} className="text-indigo-600" />;
    default:
      return <ChevronsRight size={14} className="text-slate-400" />;
  }
};

const COLORS = [
  "#000000", "#ef4444", "#f97316", "#eab308", 
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
];

// ----------------------------------------
// ২. LeftPanel কম্পোনেন্ট
// ----------------------------------------

const LeftPanel = ({ editor, selectedPositions, setSelectedPositions }) => {
  const [flatStructure, setFlatStructure] = useState([]);
  
  // 🆕 Multi-select states (lastSelectedPos is still local)
  const [lastSelectedPos, setLastSelectedPos] = useState(null);
  const [activeEditorPos, setActiveEditorPos] = useState(null); // Tracks the current active block without triggering batch actions
  
  const [openSections, setOpenSections] = useState(new Set());
  const isHoverUpdate = useRef(false);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

  /**
   * ✅ useEffect: Tiptap স্টেট আপডেট ট্র্যাকিং
   */
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      if (isHoverUpdate.current) return;

      const doc = editor.state.doc;
      const { $from } = editor.state.selection;

      // অ্যাকটিভ নোড পজিশন ট্র্যাকিং
      const nearestBlockName = $from.parent.type.name;
      const nearestBlockStartPos = $from.depth > 0 ? $from.before($from.depth) : 0;

      // Only sync with editor's cursor if we aren't in the middle of a manual multi-select in the left panel
      // OR if the user typed in the editor, clear the multi-select and snap to the current block.
      if (!["doc", "container", "section"].includes(nearestBlockName)) {
        setActiveEditorPos(nearestBlockStartPos);
        if (editor.view.hasFocus()) {
            setSelectedPositions((prev) => {
                if (prev.size > 0) return new Set();
                return prev;
            });
        }
      } else {
        setActiveEditorPos(null);
        if (editor.view.hasFocus()) {
            setSelectedPositions(new Set());
        }
      }

      // নোড ট্রাভার্সাল
      const flatList = [];
      let sectionCount = 0;

      doc.descendants((node, pos) => {
        const nodeName = node.type.name;
        const isHidden = node.attrs?.isHidden || false;

        if (nodeName === "container") return;

        if (nodeName === "section") {
          sectionCount++;
          flatList.push({
            type: "section",
            name: `Section ${sectionCount}`,
            id: node.attrs?.id || `sec-temp-${sectionCount}`,
            pos: pos,
            content: [],
          });
          return;
        }

        if (
          flatList.length > 0 &&
          node.isBlock &&
          !["doc", "container", "section", "listItem", "taskItem"].includes(
            nodeName
          )
        ) {
          const currentSection = flatList[flatList.length - 1];

          currentSection.content.push({
            type: nodeName,
            name: getDisplayName(node),
            id: node.attrs?.id,
            pos: pos,
            nodeSize: node.nodeSize,
            isHidden: isHidden, 
            level: node.attrs?.level, 
          });
          return false;
        }
      });

      setFlatStructure(flatList);
    };

    editor.on("update", updateState);
    editor.on("selectionUpdate", updateState);
    updateState();

    return () => {
      editor.off("update", updateState);
      editor.off("selectionUpdate", updateState);
    };
  }, [editor]);

  const handleNodeToggleHide = useCallback(
    (position, currentIsHidden) => {
      if (!editor) return;

      const tr = editor.state.tr.setSelection(
        NodeSelection.create(editor.state.doc, position)
      );
      editor.view.dispatch(tr);
      const selectedNode = editor.state.selection.node;

      if (!selectedNode || !selectedNode.type) return;

      editor
        .chain()
        .focus()
        .updateAttributes(selectedNode.type.name, {
          isHidden: !currentIsHidden,
        })
        .run();
    },
    [editor]
  );

  const handleNodeDelete = useCallback(
    (position, nodeSize) => {
      if (!editor) return;
      const from = position;
      const to = position + nodeSize;
      editor.chain().focus().deleteRange({ from, to }).run();
    },
    [editor]
  );

  const handleNodeHover = useCallback(
    (position, nodeName) => {
      if (!editor) return;

      let targetPos = position + 1;
      const currentSelectionPos = editor.state.selection.from;
      if (currentSelectionPos === targetPos) return;

      let tr = editor.state.tr;
      if (
        ["paragraph", "heading", "bulletList", "orderedList", "taskList"].includes(nodeName)
      ) {
        tr.setSelection(TextSelection.create(editor.state.doc, targetPos));
      } else {
        tr.setSelection(NodeSelection.create(editor.state.doc, position));
      }

      tr.scrollIntoView();
      isHoverUpdate.current = true;
      editor.view.dispatch(tr);

      setTimeout(() => {
        isHoverUpdate.current = false;
      }, 0);
    },
    [editor]
  );

  /**
   * 🚀 handleNodeClick (Multi-Select Support)
   */
  const handleNodeClick = useCallback(
    (e, position, nodeName, id) => {
      if (!editor) return;
      e.stopPropagation();

      setSelectedPositions((prev) => {
        const newSet = new Set(prev);
        
        if (e.ctrlKey || e.metaKey) {
          // Toggle selection
          if (newSet.has(position)) {
            newSet.delete(position);
          } else {
            newSet.add(position);
            setLastSelectedPos(position);
          }
        } else if (e.shiftKey && lastSelectedPos !== null) {
          // Range selection
          const posList = [];
          flatStructure.forEach(sec => sec.content.forEach(c => posList.push(c.pos)));
          const startIdx = posList.indexOf(lastSelectedPos);
          const endIdx = posList.indexOf(position);
          if (startIdx !== -1 && endIdx !== -1) {
            const min = Math.min(startIdx, endIdx);
            const max = Math.max(startIdx, endIdx);
            for (let i = min; i <= max; i++) {
              newSet.add(posList[i]);
            }
          }
        } else {
          // Single select
          newSet.clear();
          newSet.add(position);
          setLastSelectedPos(position);

          let chain = editor.chain().focus();
          if (["paragraph", "heading", "bulletList", "orderedList", "taskList"].includes(nodeName)) {
            const targetPos = position + 1;
            chain = chain.setTextSelection({ from: targetPos, to: targetPos });
          } else {
            chain = chain.setNodeSelection(position);
          }
          chain.scrollIntoView().run();
        }
        return newSet;
      });

      if (id && !e.ctrlKey && !e.shiftKey) {
        setTimeout(() => {
          const domElement = document.querySelector(`[data-id="${id}"]`);
          if (domElement) {
            domElement.style.transition = "outline 0.3s";
            domElement.style.outline = "2px solid #3b82f6";
            domElement.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
              domElement.style.outline = "none";
            }, 1000);
          }
        }, 50);
      }
    },
    [editor, flatStructure, lastSelectedPos]
  );

  // --- Batch Actions ---
  const handleBatchColorChange = (color) => {
    if (!editor || selectedPositions.size === 0) return;
    
    let chain = editor.chain();
    const doc = editor.state.doc;
    
    selectedPositions.forEach(pos => {
      const node = doc.nodeAt(pos);
      if (node && node.isTextblock) {
        const from = pos + 1;
        const to = pos + node.nodeSize - 1;
        if (to > from) {
          chain = chain.setTextSelection({ from, to }).setColor(color);
        }
      }
    });
    
    chain.run();
  };

  const handleBatchDelete = () => {
    if (!editor || selectedPositions.size === 0) return;
    
    let tr = editor.state.tr;
    const doc = editor.state.doc;
    
    // Sort descending to avoid pos shifts
    const sortedPos = Array.from(selectedPositions).sort((a, b) => b - a);
    
    sortedPos.forEach(pos => {
      const node = doc.nodeAt(pos);
      if (node) {
        tr = tr.delete(pos, pos + node.nodeSize);
      }
    });
    
    editor.view.dispatch(tr);
    setSelectedPositions(new Set());
  };

  const handleSelectSimilar = () => {
    if (selectedPositions.size === 0) return;
    
    // Use the first selected item to determine 'similar' criteria
    const firstPos = Array.from(selectedPositions)[0];
    const node = editor.state.doc.nodeAt(firstPos);
    if (!node) return;
    
    const similarType = node.type.name;
    const similarLevel = node.attrs?.level; // specific for headings
    
    setSelectedPositions(prev => {
      const newSet = new Set(prev);
      flatStructure.forEach(sec => sec.content.forEach(c => {
        if (c.type === similarType && c.level === similarLevel) {
          newSet.add(c.pos);
        }
      }));
      return newSet;
    });
  };

  const renderFlatStructure = (flatList) => {
    return flatList.map((section, secIdx) => {
      if (section.type !== "section") return null;

      let innerContent = section.content.map((contentNode, contentIdx) => {
        const isBatchSelected = selectedPositions.has(contentNode.pos);
        const isCursorNode = !isBatchSelected && activeEditorPos === contentNode.pos;
        const isActiveNode = isBatchSelected || isCursorNode;
        const display = contentNode.name;
        const nodeName = contentNode.type;
        const isHidden = contentNode.isHidden;

        let isHeading = display.startsWith("Heading");
        let className = "py-1.5 pl-2 pr-2 text-sm rounded cursor-pointer transition-colors flex items-center gap-2 relative group mt-0.5 select-none";
        
        if (isBatchSelected) {
          // Bold indigo = explicitly selected via left panel click
          className += " bg-indigo-600 font-medium text-white shadow-sm";
          if (!isHeading) className += " pl-6";
        } else if (isCursorNode) {
          // Subtle = just the editor cursor is here, not a manual selection
          className += " bg-indigo-500/10 border border-indigo-200 text-indigo-700";
          if (!isHeading) className += " pl-6";
        } else {
          if (isHeading) className += " font-semibold text-black dark:text-white";
          else className += " text-slate-600 pl-6";
          className += " hover:bg-slate-100";
        }

        if (isHidden) {
          className += " opacity-60 italic text-red-500 border border-dashed border-red-300 bg-red-500/10 hover:bg-red-100";
        }

        return (
          <div
            key={`${secIdx}-${contentIdx}`}
            className={className}
            onClick={(e) => handleNodeClick(e, contentNode.pos, nodeName, contentNode.id)}
            onMouseEnter={() => handleNodeHover(contentNode.pos, nodeName)}
          >
            {isHidden ? (
              <EyeOff size={14} className="text-red-600 shrink-0" />
            ) : (
              <div className={`shrink-0 ${
                isBatchSelected
                  ? "[&>svg]:!text-white [&>span]:!bg-indigo-500 [&>span]:!text-white [&>span]:!border-indigo-400"
                  : isCursorNode
                  ? "[&>svg]:!text-indigo-600 [&>span]:!bg-indigo-100 [&>span]:!text-indigo-700 [&>span]:!border-indigo-300"
                  : ""
              }`}>
                {getNodeIcon(nodeName, contentNode.level)}
              </div>
            )}
            <span className="truncate max-w-[130px]">{display}</span>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeToggleHide(contentNode.pos, isHidden);
                }}
                className={`p-1 rounded transition-opacity ${isHidden ? "hover:bg-green-200" : "hover:bg-yellow-200"} opacity-0 group-hover:opacity-100`}
                title={isHidden ? "Show Block" : "Hide Block"}
              >
                {isHidden ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-yellow-600" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeDelete(contentNode.pos, contentNode.nodeSize);
                }}
                className="p-1 rounded hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Block"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          </div>
        );
      });

      return (
        <div key={`section-block-${secIdx}`} className="mb-4">
          <div className="flex flex-col gap-0.5">{innerContent}</div>
        </div>
      );
    });
  };

  return (
    <div className="w-64 bg-white/10 backdrop-blur-2xl border-r border-white/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full flex flex-col relative flex-shrink-0 z-10">
      <div className="p-4 overflow-y-auto flex-1 pb-24">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          <ChevronDown size={20} className="inline mr-2" />
          Document Structure
        </h2>
        <div className="text-[10px] text-slate-400 mb-4 px-1 leading-tight">
          Tip: Hold <kbd className="bg-slate-100 border rounded px-1">Ctrl</kbd> or <kbd className="bg-slate-100 border rounded px-1">Shift</kbd> to select multiple blocks.
        </div>
        <div className="space-y-1">
          {editor && flatStructure.length > 0 ? (
            renderFlatStructure(flatStructure)
          ) : (
            <p className="text-slate-800 dark:text-slate-300 text-sm">
              Add content to the editor to see the structure.
            </p>
          )}
        </div>
      </div>

      {/* 🆕 Action Bar for Multi-select */}
      {selectedPositions.size > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/70 backdrop-blur-2xl rounded-[20px] shadow-xl border border-brand-navy/[0.08] p-3 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600">
              {selectedPositions.size} block{selectedPositions.size > 1 ? 's' : ''} selected
            </span>
            <button 
              onClick={() => setSelectedPositions(new Set())}
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Batch actions (Color swatches removed as per user request) */}

            <button
              onClick={handleSelectSimilar}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-500/10 px-2 py-1 rounded transition-colors w-full"
            >
              <Wand2 size={12} />
              Select all similar
            </button>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 px-2 py-1 rounded transition-colors w-full"
            >
              <Trash2 size={12} />
              Delete selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
