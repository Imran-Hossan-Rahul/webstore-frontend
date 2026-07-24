// components/codex-editor/Toolbar.jsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Table, Image, Video, Link, AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Undo, Redo, Trash2, FileText, ChevronDown, CheckSquare, CornerDownLeft, CornerDownRight, Mic2, Square, Type, Moon, Sun, Minimize2, Maximize2, Monitor, Palette, Highlighter, Globe, Clock, Zap, Minus, CaseUpper } from "lucide-react";

import { useTheme } from "./ThemeContext";
import AutoSaveIndicator from "./AutoSaveIndicator";

// --- কনস্ট্যান্ট ডেফিনিশনস ---

const HEADING_TYPES = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * ব্লক টাইপ আইকন ম্যাপিং।
 */
const BlockIconsMap = {
  paragraph: FileText,
  bulletList: List,
  orderedList: ListOrdered,
  blockquote: Quote,
  codeBlock: Code,
  taskList: CheckSquare,
  generic: FileText,
};

/**
 * হেডিং টাইপ আইকন ম্যাপিং।
 */
const HeadingIconsMap = {
  paragraph: Type,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
};

// --- ড্রপডাউন এবং অন্যান্য টুলবার কম্পোনেন্ট ---

/**
 * ড্রপডাউন আইটেম কম্পোনেন্ট
 */
const DropdownItem = ({ onClick, title, icon: Icon, textIcon, style }) => (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center space-x-3 transition-colors duration-150"
  >
    {textIcon ? (
      <span className="w-6 text-center text-lg text-slate-500 flex-shrink-0" style={style}>
        {textIcon}
      </span>
    ) : Icon ? (
      <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
    ) : null}
    <span className="truncate text-slate-800" style={style}>{title}</span>
  </button>
);

/**
 * কাস্টম ড্রপডাউন কম্পোনেন্ট
 */
const Dropdown = ({ icon: Icon, title, buttonLabel, colorIndicator, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        className={`px-2 py-1.5 rounded transition-colors flex items-center space-x-1 min-w-[30px] ${
          isOpen ? "bg-slate-200" : "hover:bg-slate-200"
        }`}
        title={title}
        onClick={handleToggle}
      >
        {Icon && !buttonLabel && <Icon className="w-4 h-4 text-slate-700" />}
        {buttonLabel && <span className="text-xs font-medium text-slate-700 ml-1 mr-1 font-sans">{buttonLabel}</span>}
        {colorIndicator && <div className="w-2.5 h-2.5 rounded-full border border-slate-300 ml-0.5" style={{ backgroundColor: colorIndicator === 'transparent' ? '#fff' : colorIndicator }} />}
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-20 mt-1 w-56 origin-top-left bg-white border border-slate-200 rounded-md shadow-lg transition-all duration-100 ease-out max-h-80 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

/**
 * একক টুলবার বাটন কম্পোনেন্ট
 */
const ToolbarButton = ({
  editor,
  command,
  isActive,
  icon: Icon,
  title,
  onClick,
}) => {
  const isCustomAction = !!onClick;

  const canRunCommand = isCustomAction
    ? true
    : editor && editor.can().chain().focus()[command]().run();

  const isDisabled = isCustomAction
    ? !editor || editor.isDestroyed || !editor.isEditable
    : !canRunCommand;

  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={
        onClick ? onClick : () => editor.chain().focus()[command]().run()
      }
      disabled={isDisabled}
      className={`p-1.5 rounded transition-all flex items-center justify-center min-w-[32px] min-h-[32px] ${
        editor && editor.isActive(isActive)
          ? "bg-indigo-100 text-indigo-700 shadow-sm ring-1 ring-indigo-300 ring-inset font-bold"
          : "text-slate-700 hover:bg-slate-200"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

/**
 * কাস্টম মডাল কম্পোনেন্ট
 */
const CustomModal = ({ isOpen, onClose, onInsert, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-96"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-medium mb-4 font-sans text-slate-900">{title}</h3>
        {children}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-slate-200 hover:bg-slate-300"
          >
            বাতিল
          </button>
          <button
            onClick={onInsert}
            className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-blue-600"
          >
            ইনসার্ট
          </button>
        </div>
      </div>
    </div>
  );
};

// --- টূলবার মেইন কম্পোনেন্ট ---
export default function Toolbar({ editor, editorWidth, changeEditorWidth, saveState, lastSaved, openModal, toggleHistory, openAISelector }) {
  // Theme hook
  const { theme, toggleTheme } = useTheme();

  // Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioFile, setAudioFile] = useState(null);

  const [currentBlockType, setCurrentBlockType] = useState("paragraph");
  const [, setTick] = useState(0);

  // --- লজিক: সক্রিয় ব্লক টাইপ নির্ধারণ ফাংশন ---
  const determineActiveBlockType = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) {
        setCurrentBlockType(`h${i}`);
        return;
      }
    }

    if (editor.isActive("bulletList")) {
      setCurrentBlockType("bulletList");
    } else if (editor.isActive("orderedList")) {
      setCurrentBlockType("orderedList");
    } else if (editor.isActive("blockquote")) {
      setCurrentBlockType("blockquote");
    } else if (editor.isActive("codeBlock")) {
      setCurrentBlockType("codeBlock");
    } else if (editor.isActive("taskList")) {
      setCurrentBlockType("taskList");
    } else if (editor.isActive("paragraph")) {
      setCurrentBlockType("paragraph");
    } else {
      setCurrentBlockType("generic");
    }
  }, [editor]);

  // Tiptap এডিটরের ইভেন্ট লিসেনার
  useEffect(() => {
    if (!editor) return;

    determineActiveBlockType();

    const handleTransaction = () => {
      setTick((t) => t + 1);
      determineActiveBlockType();
    };

    editor.on("update", determineActiveBlockType);
    editor.on("selectionUpdate", determineActiveBlockType);
    editor.on("transaction", handleTransaction);

    return () => {
      editor.off("update", determineActiveBlockType);
      editor.off("selectionUpdate", determineActiveBlockType);
      editor.off("transaction", handleTransaction);
    };
  }, [editor, determineActiveBlockType]);

  // --- ফাইল হ্যান্ডলার ফাংশনসমূহ (বাগ ফিক্সড) ---

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImageUrl("");
    } else {
      setImageFile(null);
      if (file) {
        alert(
          "অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (.jpg, .png, ইত্যাদি) নির্বাচন করুন।"
        );
      }
    }
  };

  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl("");
    } else {
      setVideoFile(null);
      if (file) {
        alert("অনুগ্রহ করে একটি সঠিক ভিডিও ফাইল নির্বাচন করুন।");
      }
    }
  };

  const handleAudioFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      setAudioFile(null);
      if (file) {
        alert("অনুগ্রহ করে একটি সঠিক অডিও ফাইল নির্বাচন করুন।");
      }
    }
  };

  // Link Handlers
  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      executeCommand(chain => chain.unsetLink());
      return;
    }
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    setLinkText(selectedText || "");
    setLinkUrl("");
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleFinalLinkInsert = () => {
    if (!editor || !linkUrl) return;
    let finalUrl = linkUrl.trim();

    // HTTP/HTTPS নিশ্চিত করা
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "http://" + finalUrl;
    }

    const { from, to } = editor.state.selection;

    if (from === to || linkText.trim() === "") {
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${finalUrl}" target="_blank">${linkText || finalUrl}</a>`
        )
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: finalUrl, target: "_blank" })
        .run();
    }
    setIsLinkModalOpen(false);
  };

  // Media Handlers (Insert)
  const handleInsertImage = () => {
    if (!editor) return;
    if (imageFile) {
      if (!imageFile) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        editor
          .chain()
          .focus()
          .setImage({ src: reader.result, alt: imageFile.name })
          .run();
      };
      reader.readAsDataURL(imageFile);
    } else if (imageUrl) {
      let finalUrl = imageUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "http://" + finalUrl;
      executeCommand(chain => chain.setImage({ src: finalUrl, alt: "image" }));
    }
    setIsImageModalOpen(false);
  };

  const handleInsertVideo = () => {
    if (!editor) return;
    let finalUrl;

    if (videoFile) {
      if (!videoFile) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        finalUrl = reader.result;
        editor
          .chain()
          .focus()
          .insertContent(
            `<video controls src="${finalUrl}" style="max-width: 100%;"></video>`
          )
          .run();
      };
      reader.readAsDataURL(videoFile);
    } else if (videoUrl) {
      finalUrl = videoUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.includes("youtu")) {
        finalUrl = "http://" + finalUrl;
      }

      if (editor.isActive("youtube")) {
        executeCommand(chain => chain.setYoutubeVideo({ src: finalUrl }));
      } else {
        editor
          .chain()
          .focus()
          .insertContent(
            `<video controls src="${finalUrl}" style="max-width: 100%;"></video>`
          )
          .run();
      }
    }
    setIsVideoModalOpen(false);
  };

  const handleInsertAudio = () => {
    if (!editor || !audioFile) return;
    if (!audioFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      editor
        .chain()
        .focus()
        .insertContent(`<audio controls src="${reader.result}"></audio>`)
        .run();
    };
    reader.readAsDataURL(audioFile);
    setIsAudioModalOpen(false);
  };

  if (!editor) return null;

  const ActiveBlockIcon = BlockIconsMap[currentBlockType] || FileText;
  const ActiveHeadingIcon = HeadingIconsMap[currentBlockType] || Type;

  return (
    <div className="bg-white p-2 border-b border-slate-200 flex flex-wrap gap-1">
      {/* -------------------------------------------------
      // PRIMARY BLOCK CONTROLS: Block Types & Headings 
      // ------------------------------------------------- */}


      <div className="flex items-center gap-0.5 bg-slate-50/60 p-0.5 rounded-lg border border-slate-100">
        {/* BLOCK STYLES (Lists, Quotes, etc.) - Block Dropdown */}
        <Dropdown icon={ActiveBlockIcon} title="Insert Block">
          {/* 🔥 দ্বিতীয় ফিক্স: ব্লক থেকে নিশ্চিত প্যারাগ্রাফ পরিবর্তন */}
          <DropdownItem
            onClick={() => {
              // সমস্ত মার্কস এবং নোড পরিষ্কার করে একটি পরিষ্কার প্যারাগ্রাফ সেট করা হলো
              editor
                .chain()
                .focus()
                .unsetAllMarks()
                .clearNodes()
                .setParagraph()
                .run();
            }}
            title="Paragraph/Normal Text"
            icon={FileText}
          />
          {/* 🔥 ফিক্স শেষ */}

          <DropdownItem
            onClick={() => executeCommand(chain => chain.toggleBulletList())}
            title="Bullet List"
            icon={List}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.toggleOrderedList())}
            title="Numbered List"
            icon={ListOrdered}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.toggleTaskList())}
            title="Task List"
            icon={CheckSquare}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.toggleBlockquote())}
            title="Blockquote"
            icon={Quote}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.setCodeBlock())}
            title="Code Block"
            icon={Code}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.setHorizontalRule())}
            title="Divider"
            icon={Minus}
          />
        </Dropdown>

        {/* TEXT FORMAT/HEADINGS (Paragraph & Headings) - Heading Dropdown */}
        <Dropdown icon={ActiveHeadingIcon} title="Headings">
          {/* 🔥 চতুর্থ ফিক্স: হেডিং থেকে নিশ্চিত প্যারাগ্রাফ পরিবর্তন */}
          <DropdownItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .unsetAllMarks()
                .clearNodes()
                .setParagraph()
                .run()
            }
            title="Normal Text"
            icon={Type}
          />
          {/* 🔥 ফিক্স শেষ */}

          <DropdownItem
            onClick={() => {
              executeCommand(chain => chain.toggleHeading({ level: 1 }));
            }}
            title={`Title (H1)`}
            icon={Heading1}
          />

          {/* H2 থেকে H6 লুপ করে তৈরি করা */}
          {[2, 3, 4, 5, 6].map((level) => {
            const IconComponent = HeadingIconsMap[`h${level}`];
            const titleText = `Heading ${level}`;

            return (
              <DropdownItem
                key={level}
                onClick={() => {
                  executeCommand(chain => chain.toggleHeading({ level }));
                }}
                title={titleText}
                icon={IconComponent}
              />
            );
          })}
        </Dropdown>
      </div>

      <span className="border-l border-slate-200 mx-1 h-5 self-center"></span>

      {/* Font Family Dropdown (Moved here & changed icon) */}
      <div className="flex items-center gap-0.5 bg-slate-50/60 p-0.5 rounded-lg border border-slate-100">
      <Dropdown 
        icon={CaseUpper} 
        title="Font Family"
        buttonLabel={(() => {
          const font = editor.getAttributes('textStyle')?.fontFamily;
          if (!font) return "Default";
          return font.replace(/['"]/g, '').split(',')[0].replace(/^\w/, c => c.toUpperCase());
        })()}
      >
        <DropdownItem
          onClick={() => {
            executeCommand(chain => chain.setFontFamily("Inter, sans-serif"));
          }}
          title="Default (Inter)"
          textIcon="Ag"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        {[
          // --- SANS-SERIF ---
          { name: 'Roboto', value: '"Roboto", sans-serif' },
          { name: 'Open Sans', value: '"Open Sans", sans-serif' },
          { name: 'Montserrat', value: '"Montserrat", sans-serif' },
          { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
          { name: 'Outfit', value: '"Outfit", sans-serif' },
          { name: 'Lato', value: '"Lato", sans-serif' },
          { name: 'Poppins', value: '"Poppins", sans-serif' },
          { name: 'Oswald', value: '"Oswald", sans-serif' },
          { name: 'Raleway', value: '"Raleway", sans-serif' },
          { name: 'Nunito', value: '"Nunito", sans-serif' },
          { name: 'Ubuntu', value: '"Ubuntu", sans-serif' },
          { name: 'Inter', value: '"Inter", sans-serif' },
          { name: 'Work Sans', value: '"Work Sans", sans-serif' },
          { name: 'Quicksand', value: '"Quicksand", sans-serif' },
          { name: 'Rubik', value: '"Rubik", sans-serif' },
          { name: 'Karla', value: '"Karla", sans-serif' },
          { name: 'Mukta', value: '"Mukta", sans-serif' },
          { name: 'Josefin Sans', value: '"Josefin Sans", sans-serif' },
          
          // --- SERIF ---
          { name: 'Playfair Display', value: '"Playfair Display", serif' },
          { name: 'Merriweather', value: '"Merriweather", serif' },
          { name: 'Lora', value: '"Lora", serif' },
          { name: 'Charter', value: '"Charter", serif' },
          { name: 'PT Serif', value: '"PT Serif", serif' },
          { name: 'Crimson Text', value: '"Crimson Text", serif' },
          { name: 'Libre Baskerville', value: '"Libre Baskerville", serif' },
          { name: 'EB Garamond', value: '"EB Garamond", serif' },
          { name: 'Bitter', value: '"Bitter", serif' },
          { name: 'Arvo', value: '"Arvo", serif' },
          { name: 'Roboto Slab', value: '"Roboto Slab", serif' },

          // --- DISPLAY / DECORATIVE ---
          { name: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
          { name: 'Righteous', value: '"Righteous", sans-serif' },
          { name: 'Lobster', value: '"Lobster", cursive' },
          { name: 'Anton', value: '"Anton", sans-serif' },
          { name: 'Abril Fatface', value: '"Abril Fatface", serif' },
          { name: 'Comfortaa', value: '"Comfortaa", sans-serif' },

          // --- HANDWRITING / CURSIVE ---
          { name: 'Caveat', value: '"Caveat", cursive' },
          { name: 'Pacifico', value: '"Pacifico", cursive' },
          { name: 'Dancing Script', value: '"Dancing Script", cursive' },
          { name: 'Shadows Into Light', value: '"Shadows Into Light", cursive' },
          { name: 'Indie Flower', value: '"Indie Flower", cursive' },
          { name: 'Permanent Marker', value: '"Permanent Marker", cursive' },
          { name: 'Satisfy', value: '"Satisfy", cursive' },
          { name: 'Great Vibes', value: '"Great Vibes", cursive' },

          // --- MONOSPACE ---
          { name: 'Fira Code', value: '"Fira Code", monospace' },
          { name: 'Inconsolata', value: '"Inconsolata", monospace' },
          { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
          { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
          { name: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace' },
          { name: 'Space Mono', value: '"Space Mono", monospace' },
          { name: 'Ubuntu Mono', value: '"Ubuntu Mono", monospace' },

          // --- BENGALI / SOUTH ASIAN ---
          { name: 'Hind Siliguri (Bengali)', value: '"Hind Siliguri", sans-serif' },
          { name: 'Noto Sans Bengali', value: '"Noto Sans Bengali", sans-serif' },
          { name: 'Galada (Bengali)', value: '"Galada", cursive' },

          // --- CLASSIC WEB SAFE ---
          { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
          { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
          { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
          { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
          { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
          { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
          { name: 'Georgia', value: 'Georgia, serif' },
          { name: 'Garamond', value: 'Garamond, serif' },
          { name: 'Courier New', value: '"Courier New", Courier, monospace' },
          { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
          { name: 'Brush Script', value: '"Brush Script MT", cursive' }
        ].map((font) => (
          <DropdownItem
            key={font.name}
            onClick={() => executeCommand(chain => chain.setFontFamily(font.value))}
            title={font.name}
            textIcon="Ag"
            style={{ fontFamily: font.value }}
          />
        ))}
      </Dropdown>
      </div>
      
      <span className="border-l border-slate-200 mx-1 h-5 self-center"></span>

      {/* -------------------------------------------------
      // MARK STYLES (Bold, Italic, Strike, Code)
      // ------------------------------------------------- */}
      <div className="flex items-center gap-0.5 bg-slate-50/60 p-0.5 rounded-lg border border-slate-100">
        <ToolbarButton
          editor={editor}
          command="toggleBold"
          isActive="bold"
          icon={Bold}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          editor={editor}
          command="toggleItalic"
          isActive="italic"
          icon={Italic}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          editor={editor}
          command="toggleStrike"
          isActive="strike"
          icon={Strikethrough}
          title="Strikethrough (Ctrl+Shift+X)"
        />
        <ToolbarButton
          editor={editor}
          command="toggleCode"
          isActive="code"
          icon={Code}
          title="Code (Ctrl+E)"
        />
      </div>

      <div className="flex items-center gap-0.5 ml-1">

      {/* Font Colors */}
      <Dropdown 
        icon={Palette} 
        title="Text Color"
        colorIndicator={editor.getAttributes('textStyle')?.color || "transparent"}
      >
        <DropdownItem
          onClick={() => executeCommand(chain => chain.unsetColor())}
          title="Default"
          icon={Palette}
        />
        <DropdownItem
          onClick={() => executeCommand(chain => chain.setColor("#ef4444"))}
          title="Red"
          icon={Palette}
          style={{ color: "#ef4444" }}
        />
        <DropdownItem
          onClick={() => executeCommand(chain => chain.setColor("#3b82f6"))}
          title="Blue"
          icon={Palette}
          style={{ color: "#3b82f6" }}
        />
        <DropdownItem
          onClick={() => executeCommand(chain => chain.setColor("#10b981"))}
          title="Green"
          icon={Palette}
          style={{ color: "#10b981" }}
        />
        <DropdownItem
          onClick={() => executeCommand(chain => chain.setColor("#f59e0b"))}
          title="Orange"
          icon={Palette}
          style={{ color: "#f59e0b" }}
        />
        <DropdownItem
          onClick={() => executeCommand(chain => chain.setColor("#8b5cf6"))}
          title="Purple"
          icon={Palette}
          style={{ color: "#8b5cf6" }}
        />
      </Dropdown>

      {/* Highlight Colors */}
      <Dropdown 
        icon={Highlighter} 
        title="Highlight Text Background"
        colorIndicator={editor.getAttributes('highlight')?.color || "transparent"}
      >
        <DropdownItem
          onClick={() => executeCommand(chain => chain.unsetHighlight())}
          title="No Highlight"
          icon={Highlighter}
        />
        <DropdownItem
          onClick={() =>
            executeCommand(chain => chain.setHighlight({ color: "#fde047" }))
          }
          title="Yellow"
          icon={Highlighter}
          style={{ backgroundColor: "#fde047", padding: "2px 5px", borderRadius: "2px" }}
        />
        <DropdownItem
          onClick={() =>
            executeCommand(chain => chain.setHighlight({ color: "#86efac" }))
          }
          title="Green"
          icon={Highlighter}
          style={{ backgroundColor: "#86efac", padding: "2px 5px", borderRadius: "2px" }}
        />
        <DropdownItem
          onClick={() =>
            executeCommand(chain => chain.setHighlight({ color: "#93c5fd" }))
          }
          title="Blue"
          icon={Highlighter}
          style={{ backgroundColor: "#93c5fd", padding: "2px 5px", borderRadius: "2px" }}
        />
        <DropdownItem
          onClick={() =>
            executeCommand(chain => chain.setHighlight({ color: "#fca5a5" }))
          }
          title="Red/Pink"
          icon={Highlighter}
          style={{ backgroundColor: "#fca5a5", padding: "2px 5px", borderRadius: "2px" }}
        />
      </Dropdown>
      </div>

      <span className="border-l border-slate-200 mx-1"></span>

      {/* -------------------------------------------------
      // LINK & TABLE & MEDIA 
      // ------------------------------------------------- */}

      <div className="flex items-center gap-0.5 bg-slate-50/60 p-0.5 rounded-lg border border-slate-100">
        {/* Table Dropdown */}
        <Dropdown icon={Table} title="Table">
          <DropdownItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            title="Insert Table (3x3 Header)"
            icon={Table}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.addColumnBefore())}
            title="Add Column Before"
            icon={CornerDownLeft}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.addColumnAfter())}
            title="Add Column After"
            icon={CornerDownRight}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.addRowBefore())}
            title="Add Row Before"
            icon={CornerDownLeft}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.addRowAfter())}
            title="Add Row After"
            icon={CornerDownRight}
          />
          <DropdownItem
            onClick={() => executeCommand(chain => chain.deleteTable())}
            title="Delete Table"
            icon={Trash2}
          />
        </Dropdown>

        {/* Image - Modal */}
        <ToolbarButton
          editor={editor}
          command="focus"
          onClick={() => setIsImageModalOpen(true)}
          isActive={editor.isActive("image") ? "image" : "never"}
          icon={Image}
          title="Insert Image"
        />

        {/* Video (Embed) - Modal */}
        <ToolbarButton
          editor={editor}
          command="focus"
          onClick={() => setIsVideoModalOpen(true)}
          isActive={editor.isActive("youtube") ? "youtube" : "never"}
          icon={Video}
          title="Insert Video"
        />

        {/* Embed Button */}
        <ToolbarButton
          editor={editor}
          command="focus"
          onClick={() => openModal && openModal('embed')}
          isActive="never"
          icon={Globe}
          title="Embed (Figma, CodePen, etc.)"
        />

        {/* Audio Button */}
        <ToolbarButton
          editor={editor}
          command="focus"
          onClick={() => setIsAudioModalOpen(true)}
          isActive="never"
          icon={Mic2}
          title="Insert Audio (Upload)"
        />

        {/* Link Button */}
        <ToolbarButton
          editor={editor}
          command="focus"
          onClick={handleSetLink}
          isActive="link"
          icon={Link}
          title="Set/Unset Link"
        />
      </div>

      <span className="border-l border-slate-200 mx-1"></span>

      {/* ALIGNMENT */}
      <div className="flex items-center gap-0.5 bg-slate-50/60 p-0.5 rounded-lg border border-slate-100">
        <ToolbarButton
          editor={editor}
          command="setTextAlign"
          onClick={() => executeCommand(chain => chain.setTextAlign("left"))}
          isActive={{ textAlign: "left" }}
          icon={AlignLeft}
          title="Align Left"
        />
        <ToolbarButton
          editor={editor}
          command="setTextAlign"
          onClick={() => executeCommand(chain => chain.setTextAlign("center"))}
          isActive={{ textAlign: "center" }}
          icon={AlignCenter}
          title="Align Center"
        />
        <ToolbarButton
          editor={editor}
          command="setTextAlign"
          onClick={() => executeCommand(chain => chain.setTextAlign("right"))}
          isActive={{ textAlign: "right" }}
          icon={AlignRight}
          title="Align Right"
        />
        <ToolbarButton
          editor={editor}
          command="setTextAlign"
          onClick={() => executeCommand(chain => chain.setTextAlign("justify"))}
          isActive={{ textAlign: "justify" }}
          icon={AlignJustify}
          title="Align Justify"
        />
      </div>

      <span className="border-l border-slate-200 mx-1"></span>

      {/* AI ASSISTANT */}
      <ToolbarButton
        editor={editor}
        onClick={openAISelector}
        icon={Zap}
        title="AI Assistant"
      />

      <span className="border-l border-slate-200 mx-1"></span>

      {/* HISTORY */}
      <ToolbarButton
        editor={editor}
        command="undo"
        icon={Undo}
        title="Undo (Ctrl+Z)"
      />
      <ToolbarButton
        editor={editor}
        command="redo"
        icon={Redo}
        title="Redo (Ctrl+Shift+Z)"
      />
      
      <ToolbarButton
        onClick={toggleHistory}
        icon={Clock}
        title="View History"
      />

      

      {/* Vertical Divider */}
      <div className="h-6 w-px bg-slate-300 mx-1"></div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded hover:bg-slate-100 transition-colors"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>

      {/* Width Controls */}
      <div className="width-controls">
        <button
          onClick={() => changeEditorWidth('narrow')}
          className={editorWidth === 'narrow' ? 'active' : ''}
          title="Narrow width (680px)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => changeEditorWidth('medium')}
          className={editorWidth === 'medium' ? 'active' : ''}
          title="Medium width (900px)"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => changeEditorWidth('wide')}
          className={editorWidth === 'wide' ? 'active' : ''}
          title="Wide width (1200px)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => changeEditorWidth('full')}
          className={editorWidth === 'full' ? 'active' : ''}
          title="Full width"
        >
          <Maximize2 className="w-4 h-4" style={{ transform: 'rotate(45deg)' }} />
        </button>
      </div>
      {/* Auto-save Indicator */}
      <AutoSaveIndicator saveState={saveState} lastSaved={lastSaved} />

      {/* -------------------------------------------------
      // MODALS
      // ------------------------------------------------- */}

      {/* Link Modal */}
      <CustomModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setLinkUrl("");
          setLinkText("");
        }}
        onInsert={handleFinalLinkInsert}
        title="লিঙ্ক ইনসার্ট করুন"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              লিঙ্ক টেক্সট
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
              placeholder="যে লেখাটি লিঙ্ক হবে"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </CustomModal>

      {/* Image Modal */}
      <CustomModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setImageFile(null);
          setImageUrl("");
        }}
        onInsert={handleInsertImage}
        title="ইমেজ ইনসার্ট করুন"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">পিসি থেকে আপলোড করুন:</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileSelect}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full text-sm text-slate-700 mt-2"
          />
          {imageFile ? (
            <p className="text-sm text-blue-600 mt-2">
              ফাইল সিলেক্টেড: <strong>{imageFile.name}</strong>
            </p>
          ) : (
            <>
              <div className="my-3 text-center border-t border-slate-200 pt-3">
                <span className="text-xs text-slate-400">অথবা একটি URL দিন</span>
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFile(null);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                placeholder="https://example.com/image.jpg"
              />
            </>
          )}
        </div>
      </CustomModal>

      {/* Video Modal */}
      <CustomModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setVideoFile(null);
          setVideoUrl("");
        }}
        onInsert={handleInsertVideo}
        title="ভিডিও ইনসার্ট করুন"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">পিসি থেকে আপলোড করুন:</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoFileSelect}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full text-sm text-slate-700 mt-2"
          />
          {videoFile ? (
            <p className="text-sm text-blue-600 mt-2">
              ফাইল সিলেক্টেড: <strong>{videoFile.name}</strong>
            </p>
          ) : (
            <>
              <div className="my-3 text-center border-t border-slate-200 pt-3">
                <span className="text-xs text-slate-400">
                  অথবা একটি YouTube/ভিডিও URL দিন
                </span>
              </div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setVideoFile(null);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </>
          )}
        </div>
      </CustomModal>

      {/* Audio Modal */}
      <CustomModal
        isOpen={isAudioModalOpen}
        onClose={() => {
          setIsAudioModalOpen(false);
          setAudioFile(null);
        }}
        onInsert={handleInsertAudio}
        title="অডিও ফাইল আপলোড করুন"
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioFileSelect}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-full text-sm text-slate-700 mt-2"
        />
        {audioFile && (
          <p className="text-sm text-slate-600 mt-2">
            সিলেক্টেড ফাইল: <strong>{audioFile.name}</strong>
          </p>
        )}
      </CustomModal>
    </div>
  );
}

