"use client";

import { useState, useRef, useEffect } from "react";
import { Bold, Italic, Type, List, ListOrdered, CheckSquare, Link as LinkIcon, Image as ImageIcon, Smile, Code as CodeIcon, AlignLeft, AlignCenter, AlignRight, RotateCcw, RotateCw, Star, Video } from "lucide-react";

export default function Toolbar({ editor, openModal }) {
  const toolbarRef = useRef(null);
  const [position, setPosition] = useState({ top: 10, left: 10 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [updateCounter, setUpdateCounter] = useState(0); // force re-render

  const [headingDropdown, setHeadingDropdown] = useState(false);
  const headingLevels = [1, 2, 3, 4, 5, 6];

  // ---------------- Drag Handlers ----------------
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only left click
    const rect = toolbarRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
    e.preventDefault();
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({ top: e.clientY - offset.y, left: e.clientX - offset.x });
  };
  const handleMouseUp = () => dragging && setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  // ---------------- Force re-render on selection / update ----------------
  useEffect(() => {
    if (!editor) return;
    const forceUpdate = () => setUpdateCounter((prev) => prev + 1);
    editor.on("selectionUpdate", forceUpdate);
    editor.on("update", forceUpdate);
    return () => {
      editor.off("selectionUpdate", forceUpdate);
      editor.off("update", forceUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({ label, icon, action, isActive }) => {
    const handleClick = () => {
      action();
      setUpdateCounter((prev) => prev + 1); // immediately re-render
    };
    return (
      <button
        onClick={handleClick}
        title={label}
        className={`p-2 rounded hover:bg-slate-200 transition text-black ${
          isActive ? "bg-slate-300 font-semibold" : ""
        }`}
      >
        {icon || label}
      </button>
    );
  };

  // current heading at cursor
  const currentHeading = headingLevels.find((lvl) =>
    editor.isActive("heading", { level: lvl })
  );

  return (
    <div
      ref={toolbarRef}
      className="absolute bg-white shadow-lg border rounded flex gap-1 flex-wrap select-none z-50"
      style={{ top: position.top, left: position.left }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="px-2 py-1 bg-slate-200 cursor-move rounded-l flex items-center justify-center text-black font-bold"
        style={{ userSelect: "none" }}
      >
        ☰
      </div>

      {/* Formatting */}
      <ToolbarButton
        icon={<Bold size={18} />}
        label="Bold"
        action={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      />
      <ToolbarButton
        icon={<Italic size={18} />}
        label="Italic"
        action={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      />
      <ToolbarButton
        icon={<Type size={18} />}
        label="Underline"
        action={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
      />
      <ToolbarButton
        icon={<Star size={18} />}
        label="Highlight"
        action={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
      />

      {/* Heading Dropdown */}
      <div className="relative">
        <button
          onClick={() => setHeadingDropdown(!headingDropdown)}
          className={`p-2 rounded hover:bg-slate-200 text-black flex items-center gap-1 ${
            currentHeading ? "bg-slate-300 font-semibold" : ""
          }`}
        >
          {currentHeading ? `H${currentHeading}` : "H"} ▼
        </button>
        {headingDropdown && (
          <div className="absolute top-full mt-1 bg-white border rounded shadow-lg z-50">
            {headingLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  if (editor.isActive("heading", { level: lvl })) {
                    editor.chain().focus().setParagraph().run(); // deselect heading
                  } else {
                    editor.chain().focus().toggleHeading({ level: lvl }).run();
                  }
                  setHeadingDropdown(false);
                  setUpdateCounter((prev) => prev + 1); // immediately update toolbar
                }}
                className={`block px-4 py-1 w-full text-left text-black hover:bg-slate-200 ${
                  editor.isActive("heading", { level: lvl })
                    ? "bg-slate-300 font-semibold"
                    : ""
                }`}
              >
                H{lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lists */}
      <ToolbarButton
        icon={<List size={18} />}
        label="Bullet List"
        action={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      />
      <ToolbarButton
        icon={<ListOrdered size={18} />}
        label="Ordered List"
        action={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      />
      <ToolbarButton
        icon={<CheckSquare size={18} />}
        label="Task List"
        action={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
      />

      {/* Link / Image / Emoji / YouTube */}
      <ToolbarButton
        icon={<LinkIcon size={18} />}
        label="Link"
        action={() => openModal("link")}
      />
      <ToolbarButton
        icon={<ImageIcon size={18} />}
        label="Image"
        action={() => openModal("image")}
      />
      <ToolbarButton
        icon={<Video size={18} />}
        label="YouTube"
        action={() => openModal("youtube")}
      />
      <ToolbarButton
        icon={<Smile size={18} />}
        label="Emoji"
        action={() => openModal("emoji")}
      />

      {/* Code Block */}
      <ToolbarButton
        icon={<CodeIcon size={18} />}
        label="Code Block"
        action={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
      />

      {/* Alignment */}
      <ToolbarButton
        icon={<AlignLeft size={18} />}
        label="Left"
        action={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
      />
      <ToolbarButton
        icon={<AlignCenter size={18} />}
        label="Center"
        action={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
      />
      <ToolbarButton
        icon={<AlignRight size={18} />}
        label="Right"
        action={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
      />

      {/* Undo / Redo */}
      <ToolbarButton
        icon={<RotateCcw size={18} />}
        label="Undo"
        action={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={<RotateCw size={18} />}
        label="Redo"
        action={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
