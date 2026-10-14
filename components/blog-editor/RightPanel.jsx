import React, { useState, useEffect, useCallback, useMemo } from "react";
// ধরে নেওয়া হচ্ছে useCurrentNode, DocumentQualityMetrics এই ফাইলের সাথে সম্পর্কিত
import { useCurrentNode } from "./useCurrentNode";
import DocumentQualityMetrics from "./DocumentQualityMetrics";
import { Ruler, AlignLeft, TextCursorInput, Layers, AlertTriangle, Info, Clock, ChevronRight, ChevronLeft, Tag, X, ChevronDown, ChevronUp, Monitor, Download } from "lucide-react";
import { api } from "@/utils/api";
import AdvancedColorPicker from "./AdvancedColorPicker";
import TurndownService from "turndown";
// html2pdf.js will be dynamically imported when needed to avoid SSR issues

// --- স্পেসিং ইনপুট কম্পোনেন্ট (অপরিবর্তিত) ---
const SpacingInput = React.memo(({ label, value, onChange, min = 0 }) => {
  const displayValue = value === null || value === undefined ? "" : value;

  const handleInputChange = (e) => {
    const valStr = e.target.value.trim();
    if (valStr === "") {
      onChange(null);
      return;
    }
    const val = parseInt(valStr);
    if (isNaN(val)) {
      onChange(0);
    } else if (val < min) {
      onChange(min);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col mb-1 w-1/4">
      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">{label}</label>
      <input
        type="number"
        value={displayValue}
        onChange={handleInputChange}
        min={min}
        className="w-full text-xs border border-slate-300 rounded px-1 py-0.5 focus:ring-indigo-600 focus:border-indigo-600"
      />
    </div>
  );
});
SpacingInput.displayName = "SpacingInput";

// --- সেকশন হেডার কম্পোনেন্ট (অপরিবর্তিত) ---
const PanelSection = ({ title, icon: Icon, children }) => (
  <div className="mb-6 p-4 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-[16px] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
    <h3 className="text-sm font-bold text-brand-navy border-b border-white/40 pb-2 mb-3 flex items-center space-x-2">
      {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
      <span>{title}</span>
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

// --- রাইট প্যানেল মেইন কম্পোনেন্ট ---

export default function RightPanel({ editor, selectedPositions, onPreviewClick }) {
  const executeCommand = (commandFn) => {
    if (selectedPositions && selectedPositions.size > 0) {
      let chain = editor.chain();
      selectedPositions.forEach(pos => {
        const node = editor.state.doc.nodeAt(pos);
        if (node) {
          chain = chain.setNodeSelection(pos);
          commandFn(chain, node.type.name);
        }
      });
      chain.run();
    } else {
      commandFn(editor.chain(), selectedNode?.type?.name || activeNodeName).run();
    }
  };
  const { node: cursorNode, pos: cursorNodePos } = useCurrentNode(editor);
  const firstSelectedPos = selectedPositions && selectedPositions.size > 0 ? Array.from(selectedPositions)[0] : null;
  const selectedNode = firstSelectedPos !== null ? editor?.state?.doc?.nodeAt(firstSelectedPos) : cursorNode;
  const selectedNodePos = firstSelectedPos !== null ? firstSelectedPos : cursorNodePos;
  const activeNodeName = selectedNode?.type?.name;

  const [isEditorFocused, setIsEditorFocused] = useState(
    editor?.isFocused || false
  );
  const [isPanelClicking, setIsPanelClicking] = useState(false);

  // ⭐ নতুন স্টেট ১: তথ্য সেকশন এক্সপ্যান্ডেড কি না
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // ⭐ নতুন স্টেট ২: কভারের জন্য উচ্চতা ট্র্যাক করা
  // অনুমান করা হচ্ছে Document Quality + Tagging সেকশনের সম্মিলিত উচ্চতা প্রায় 450px
  const [infoHeight, setInfoHeight] = useState(450);

  // --- স্টেট ইনিশিয়ালাইজেশন ---
  const [margin, setMargin] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [padding, setPadding] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [borderRadius, setBorderRadius] = useState({
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
  });
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [styles, setStyles] = useState({
    width: null,
    height: null,
    minWidth: null,
    maxWidth: null,
    minHeight: null,
    maxHeight: null,
    textAlign: "left",
    textColor: "#000000",
    bgColor: "#ffffff",
    opacity: 1,
    boxShadow: "none",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "#000000",
    strokeWidth: 0,
    strokeColor: "#000000",
    isHidden: false,
    cursor: "auto",
    zIndex: 0,
  });
  const [headingLevel, setHeadingLevel] = useState(1);

  // Document Quality ও Tagging সেকশনের রেফ
  const infoContainerRef = React.useRef(null);
  const infoContentRef = React.useRef(null);

  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => setIsEditorFocused(true);

    const handleBlur = () => {
      if (isPanelClicking) {
        // Panel click হচ্ছে → editor deselect হবে না
        // 🚀 Remove `editor.view.focus()` to allow typing in panel inputs like Hex color!
        return;
      }
      setIsEditorFocused(false);
    };

    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [editor, isPanelClicking]);

  // --- useEffect: এডিটর ফোকাস/ডিফোকাসের উপর ভিত্তি করে ইনফো সেকশনের উচ্চতা পরিবর্তন ---
  useEffect(() => {
    if (infoContentRef.current) {
      const fullHeight = infoContentRef.current.offsetHeight;

      if (isEditorFocused) {
        // এডিটর ফোকাসড হলে আংশিক উচ্চতা দেখাবে (মোটের 1/3 এর একটু বেশি)
        const partialHeight = fullHeight * 0.45;
        setInfoHeight(partialHeight);
        setIsInfoExpanded(false); // ডিফল্টভাবে ফোকাসড হলে কলাপসড থাকবে
      } else {
        // এডিটর ফোকাসড না থাকলে পূর্ণ উচ্চতা দেখাবে
        setInfoHeight(fullHeight);
        setIsInfoExpanded(true); // ডিফল্টভাবে আনফোকাসড হলে এক্সপ্যান্ডেড থাকবে
      }
    }
  }, [isEditorFocused, selectedNode]);

  // --- Toggle ফাংশন ---
  const toggleInfoExpansion = useCallback(() => {
    if (infoContentRef.current) {
      const fullHeight = infoContentRef.current.offsetHeight;
      const partialHeight = fullHeight * 0.45;

      // Toggle Logic
      const targetHeight = isInfoExpanded ? partialHeight : fullHeight;
      setInfoHeight(targetHeight);
      setIsInfoExpanded((prev) => !prev);
    }
  }, [isInfoExpanded]);

  // --- useEffect: নোড পরিবর্তন হলে স্টেট লোড করা (আগের লজিক) ---
  useEffect(() => {
    if (!selectedNode || !editor) {
      setLineHeight(1.5);
      setLetterSpacing(0);
      setTags([]);
      return;
    }

    // ... (বাকি স্টেট লোডিং লজিক অপরিবর্তিত) ...
    const attrs = selectedNode.attrs;
    const nodeType = selectedNode.type.name;

    const isBlockWithStyles = [
      "paragraph",
      "heading",
      "image",
      "section",
      "codeBlockLowlight",
      "listItem",
      "highlightedBlock",
    ].includes(nodeType);

    if (isBlockWithStyles) {
      setMargin({
        top: attrs.marginTop ?? 0,
        right: attrs.marginRight ?? 0,
        bottom: attrs.marginBottom ?? 0,
        left: attrs.marginLeft ?? 0,
      });
      setPadding({
        top: attrs.paddingTop ?? 0,
        right: attrs.paddingRight ?? 0,
        bottom: attrs.paddingBottom ?? 0,
        left: attrs.paddingLeft ?? 0,
      });
      setBorderRadius({
        topLeft: attrs.borderRadiusTopLeft ?? 0,
        topRight: attrs.borderRadiusTopRight ?? 0,
        bottomRight: attrs.borderRadiusBottomRight ?? 0,
        bottomLeft: attrs.borderRadiusBottomLeft ?? 0,
      });

      setStyles((prevStyles) => ({
        ...prevStyles,
        width: attrs.width ?? null,
        height: attrs.height ?? null,
        minWidth: attrs.minWidth ?? null,
        maxWidth: attrs.maxWidth ?? null,
        minHeight: attrs.minHeight ?? null,
        maxHeight: attrs.maxHeight ?? null,
        textAlign: attrs.textAlign ?? "left",
        textColor: attrs.textColor ?? "#000000",
        bgColor: attrs.bgColor ?? "#ffffff",
        opacity: attrs.opacity ?? 1,
        boxShadow: attrs.boxShadow ?? "none",
        borderWidth: attrs.borderWidth ?? 0,
        borderStyle: attrs.borderStyle ?? "solid",
        borderColor: attrs.borderColor ?? "#000000",
        strokeWidth: attrs.strokeWidth ?? 0,
        strokeColor: attrs.strokeColor ?? "#000000",
        isHidden: attrs.isHidden ?? false,
        cursor: attrs.cursor ?? "auto",
        zIndex: attrs.zIndex ?? 0,
      }));

      setLineHeight(attrs.lineHeight ?? 1.5);
      setLetterSpacing(attrs.letterSpacing ?? 0);

      const loadedTags = Array.isArray(attrs.tags)
        ? attrs.tags
        : typeof attrs.tags === "string" && attrs.tags
        ? attrs.tags.split(",")
        : [];
      setTags(loadedTags);

      if (nodeType === "heading") {
        setHeadingLevel(attrs.level ?? 1);
      }
    }
  }, [selectedNode, editor]);

  // দুটি শর্ত পূরণ হলে নোড অ্যাকটিভলি সিলেক্টেড (রেন্ডার কন্ডিশন)
  const isNodeActivelySelected = useMemo(() => {
    const hasBatchSelection = selectedPositions && selectedPositions.size > 0;
    return !!selectedNode && (isEditorFocused || hasBatchSelection);
  }, [selectedNode, isEditorFocused, selectedPositions]);

  // সমস্ত কনস্ট্যান্ট এখানে সংজ্ঞায়িত
  const isBlockWithSpacing = [
    "paragraph",
    "heading",
    "image",
    "section",
    "codeBlockLowlight",
    "listItem",
    "highlightedBlock",
  ].includes(activeNodeName);

  const isResizable = ["image", "section", "highlightedBlock"].includes(
    activeNodeName
  );
  const isCodeBlock = activeNodeName === "codeBlockLowlight";
  const isList = ["bulletList", "orderedList", "taskList"].includes(
    activeNodeName
  );
  const isTextBlock = ["paragraph", "heading", "listItem"].includes(
    activeNodeName
  );
  const isTaggable = isBlockWithSpacing;

  // --- হ্যান্ডলার ফাংশনসমূহ (আগের কোড থেকে কপি করা - অপরিবর্তিত) ---

  const handleSpacingChange = useCallback(
    (newMargin, newPadding) => {
      if (!editor) return;

      const nodeType = selectedNode?.type?.name;
      if (!nodeType) return;

      const allAttrs = {
        marginTop: newMargin.top ?? 0,
        marginRight: newMargin.right ?? 0,
        marginBottom: newMargin.bottom ?? 0,
        marginLeft: newMargin.left ?? 0,
        paddingTop: newPadding.top ?? 0,
        paddingRight: newPadding.right ?? 0,
        paddingBottom: newPadding.bottom ?? 0,
        paddingLeft: newPadding.left ?? 0,
      };
      executeCommand((chain, type) => chain.updateAttributes(type, allAttrs));

      setMargin(newMargin);
      setPadding(newPadding);
    },
    [selectedNode, editor]
  );

  const handleBorderRadiusChange = useCallback(
    (key, value) => {
      if (!editor || !selectedNode) return;

      const newNodeType = selectedNode.type.name;

      let finalValue = value;
      if (
        typeof value !== "number" ||
        isNaN(value) ||
        value < 0 ||
        value === null
      ) {
        finalValue = 0;
      }

      const updatedAttrs = { [key]: finalValue };

      const currentBorderWidth = selectedNode.attrs.borderWidth ?? 0;
      const currentBorderStyle = selectedNode.attrs.borderStyle ?? "none";

      if (
        finalValue > 0 &&
        currentBorderWidth === 0 &&
        currentBorderStyle !== "none"
      ) {
        updatedAttrs.borderWidth = 1;
        setStyles((prev) => ({ ...prev, borderWidth: 1 }));
      }

      executeCommand((chain, type) => chain.updateAttributes(type, updatedAttrs));

      const localKey = key.replace("borderRadius", "");
      setBorderRadius((prev) => ({
        ...prev,
        [localKey.charAt(0).toLowerCase() + localKey.slice(1)]: finalValue,
      }));
    },
    [selectedNode, editor]
  );

  const handleStyleChange = useCallback(
    (key, value) => {
      if (!editor || !selectedNode) return;

      let finalValue = value;
      const newNodeType = selectedNode.type.name;

      const numericKeys = [
        "width",
        "height",
        "minWidth",
        "maxWidth",
        "minHeight",
        "maxHeight",
        "zIndex",
        "borderWidth",
        "strokeWidth",
        "opacity",
      ];

      if (numericKeys.includes(key)) {
        const numValue = Number(value);
        if (value === "" || value === null || isNaN(numValue)) {
          finalValue = [
            "width",
            "height",
            "minWidth",
            "maxWidth",
            "minHeight",
            "maxHeight",
          ].includes(key)
            ? null
            : 0;
        } else {
          finalValue = numValue;
        }
      }

      if (key === "opacity") {
        finalValue = Math.min(1, Math.max(0, parseFloat(value)));
      }

      executeCommand((chain, type) => chain.updateAttributes(type, { [key]: finalValue }));

      setStyles((prevStyles) => ({ ...prevStyles, [key]: finalValue }));
    },
    [selectedNode, editor]
  );

  // ... (বাকি হ্যান্ডলার ফাংশনগুলি সংক্ষেপে) ...
  // handleLineHeightChange, handleLetterSpacingChange, handleAddTag,
  // handleRemoveTag, handleIndent, handleOutdent, insertHighlightedBlock,
  // handleHeadingLevelChange, handleAlignmentChange - এগুলির লজিক অপরিবর্তিত থাকবে

  const handleLineHeightChange = useCallback(
    (value) => {
      if (!editor || !selectedNode) return;
      const activeNodeName = selectedNode.type.name;
      const parsedValue = parseFloat(value);
      let finalValue = isNaN(parsedValue) ? 1.5 : parsedValue;
      finalValue = Math.min(2.5, Math.max(1.0, finalValue));
      setLineHeight(finalValue);
      executeCommand((chain, type) => chain.updateAttributes(type, { lineHeight: finalValue }));
    },
    [selectedNode, editor]
  );

  const handleLetterSpacingChange = useCallback(
    (value) => {
      if (!editor || !selectedNode) return;
      const activeNodeName = selectedNode.type.name;
      const parsedValue = parseFloat(value);
      let finalValue = isNaN(parsedValue) ? 0 : parsedValue;
      finalValue = Math.min(0.5, Math.max(-0.1, finalValue));
      setLetterSpacing(finalValue);
      executeCommand((chain, type) => chain.updateAttributes(type, { letterSpacing: finalValue }));
    },
    [selectedNode, editor]
  );

  const handleAddTag = useCallback(() => {
    if (!editor || !selectedNode || !newTagInput.trim()) return;

    const cleanTag = newTagInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");

    if (!cleanTag || tags.includes(cleanTag)) {
      setNewTagInput("");
      return;
    }

    const updatedTags = [...tags, cleanTag];
    setTags(updatedTags);
    setNewTagInput("");

    editor
      .chain()
      .updateAttributes(selectedNode.type.name, { tags: updatedTags })
      .run();
  }, [selectedNode, editor, newTagInput, tags]);

  const handleRemoveTag = useCallback(
    (tagToRemove) => {
      if (!editor || !selectedNode) return;

      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(updatedTags);

      editor
        .chain()
        .updateAttributes(selectedNode.type.name, { tags: updatedTags })
        .run();
    },
    [selectedNode, editor, tags]
  );

  const handleIndent = useCallback(() => {
    if (editor && selectedNode) {
      const currentMarginLeft = selectedNode.attrs.marginLeft || 0;
      editor
        .chain()
        .updateAttributes(selectedNode.type.name, {
          marginLeft: Math.min(currentMarginLeft + 20, 200),
        })
        .run();
    }
  }, [editor, selectedNode]);

  const handleOutdent = useCallback(() => {
    if (editor && selectedNode) {
      const currentMarginLeft = selectedNode.attrs.marginLeft || 0;
      editor
        .chain()
        .updateAttributes(selectedNode.type.name, {
          marginLeft: Math.max(currentMarginLeft - 20, 0),
        })
        .run();
    }
  }, [editor, selectedNode]);

  const insertHighlightedBlock = useCallback(
    (type) => {
      if (!editor) return;
      editor.chain().focus().insertHighlightedBlock({ type }).run();
    },
    [editor]
  );

  const handleHeadingLevelChange = (level) => {
    if (!editor || !selectedNode || selectedNode.type.name !== "heading")
      return;

    const safeLevel = Math.min(6, Math.max(1, level));
    setHeadingLevel(safeLevel);
    executeCommand((chain, type) => chain.setHeading({ level: safeLevel }));
  };

  const handleAlignmentChange = (alignment) => {
    if (!editor || !selectedNode) return;

    const nodeType = selectedNode.type.name;
    const command = editor.chain();

    if (
      ["image", "section", "codeBlockLowlight", "highlightedBlock"].includes(
        nodeType
      )
    ) {
      command.updateAttributes(nodeType, { textAlign: alignment });
    } else if (["paragraph", "heading", "listItem"].includes(nodeType)) {
      command.setTextAlign(alignment);
    } else {
      return;
    }

    command.run();
    setStyles((prevStyles) => ({ ...prevStyles, textAlign: alignment }));
  };

  // --- Export Functionality ---
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (!editor) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `document-${timestamp}`;

    switch (format) {
      case "markdown":
        const html = editor.getHTML();
        const turndownService = new TurndownService({
          headingStyle: "atx",
          codeBlockStyle: "fenced",
        });
        const markdown = turndownService.turndown(html);
        downloadFile(markdown, `${filename}.md`, "text/markdown");
        break;

      case "html":
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${filename}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.5; }
        img { max-width: 100%; height: auto; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; margin-left: 0; color: #666; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { font-family: monospace; background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
    </style>
</head>
<body>
    ${editor.getHTML()}
</body>
</html>`;
        downloadFile(htmlContent, `${filename}.html`, "text/html");
        break;

      case "json":
        const json = JSON.stringify(editor.getJSON(), null, 2);
        downloadFile(json, `${filename}.json`, "application/json");
        break;

      case "pdf": {
        // Dynamically import html2pdf.js to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;
        
        // High-quality PDF export with print-optimized CSS and tuned canvas settings
        // A4 width in CSS px at 96 DPI ~ 794px. We'll render at that width with high scale
        const container = document.createElement("div");
        container.id = "pdf-root";
        container.style.width = "780px";
        container.style.margin = "0 auto";
        container.style.background = "#ffffff";
        container.style.color = "#000000";
        container.style.padding = "32px"; // ~24pt margins visually

        const style = document.createElement("style");
        style.innerHTML = `
          @page { size: A4; margin: 24pt; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body, #pdf-root { box-sizing: border-box; }
          *, *::before, *::after { box-sizing: inherit; }
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
          h1, h2, h3, h4, h5, h6 { margin-top: 1.2em; margin-bottom: 0.5em; font-weight: 700; color: #111; }
          h1 { font-size: 28px; }
          h2 { font-size: 22px; }
          h3 { font-size: 18px; }
          p { margin: 0 0 0.9em 0; line-height: 1.5; overflow-wrap: anywhere; word-break: break-word; hyphens: auto; }
          ul, ol { margin: 0 0 1em 1.25em; }
          li { margin-bottom: 0.4em; line-height: 1.5; overflow-wrap: anywhere; word-break: break-word; hyphens: auto; }
          p, li { widows: 2; orphans: 2; }
          [style*="text-align: justify"] { text-justify: inter-word; }
          img { max-width: 100%; height: auto; display: block; margin: 12px 0; image-rendering: -webkit-optimize-contrast; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
          blockquote { border-left: 4px solid #ddd; padding-left: 12px; margin: 0 0 1em 0; color: #555; }
          pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
          code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
          /* Page breaks for large blocks */
          .page-break { page-break-before: always; break-before: page; }
          /* Normalize editor-specific artifacts */
          [data-is-hidden="true"] { display: none !important; }
        `;

        // Prepare sanitized content
        const wrapper = document.createElement("div");
        wrapper.innerHTML = editor.getHTML();
        // Normalize all images to avoid taint/CORS issues
        wrapper.querySelectorAll("img").forEach((img) => {
          try {
            img.setAttribute("crossorigin", "anonymous");
            // Force block layout to prevent text shifting
            img.style.display = "block";
            img.style.imageRendering = "-webkit-optimize-contrast";
            // Ensure max-width containment
            img.style.maxWidth = "100%";
            img.style.height = "auto";
          } catch (_) {}
        });
        // Reset problematic text metrics to prevent clipping & large gaps
        try {
          wrapper.querySelectorAll('[style*="letter-spacing"]').forEach((n) => { n.style.letterSpacing = '0px'; });
          wrapper.querySelectorAll('[style*="line-height"]').forEach((n) => { n.style.lineHeight = '1.5'; });
          wrapper.querySelectorAll('p, li').forEach((n) => { if (!n.style.lineHeight) n.style.lineHeight = '1.5'; });
          wrapper.querySelectorAll('[style*="text-align: justify"]').forEach((n) => { n.style.textJustify = 'inter-word'; });
        } catch (_) {}
        container.appendChild(style);
        container.appendChild(wrapper);

        const opt = {
          filename: `${filename}.pdf`,
          margin: 0, // margins handled via padding/@page
          image: { type: "jpeg", quality: 1.0 },
          html2canvas: {
            scale: 3, // high scale for sharp text
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            windowWidth: 780,
          },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        };

        html2pdf()
          .set(opt)
          .from(container)
          .save()
          .catch((err) => {
            console.error("PDF Export failed:", err);
            alert("Failed to export PDF. Please try again.");
          });
        break;
      }
    }
  };

  // --- রেন্ডার কন্ট্রোল লজিক ---

  if (!editor) {
    return (
      <div className="w-80 border-l border-white/30 p-4 bg-white/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center text-slate-900 flex-shrink-0 z-10">
        <p className="text-sm">Editor not initialized.</p>
      </div>
    );
  }

  const shouldShowStyleControls = isNodeActivelySelected;

  return (
    // ⭐ ফিক্স: onMouseDown এবং onMouseUp ব্যবহার করে ফোকাস প্রিজার্ভ করা
    <div
      className="w-80 border-l border-white/30 bg-white/10 backdrop-blur-2xl shadow-[[-4px_0_24px_rgba(0,0,0,0.02)]] h-full flex flex-col flex-shrink-0 z-10"
      // মাউস ডাউন: প্যানেলে ক্লিক শুরু হয়েছে (Capture phase ensures child stopPropagation doesn't block this)
      onMouseDownCapture={() => {
        setIsPanelClicking(true);
      }}
      // মাউস আপ: ক্লিক শেষ হলে একটু পরে প্যানেল ক্লিকের স্টেটটি false হবে
      onMouseUpCapture={() => {
        setTimeout(() => {
          setIsPanelClicking(false);
        }, 100);
      }}
    >
      {/* Fixed Header (No longer needs sticky or negative margins) */}
      <div className="z-20 bg-transparent px-4 pt-4 pb-3 border-b border-white/10 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-extrabold text-slate-900">Design Panel</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Open publish modal
                const event = new CustomEvent('openPublishModal', { 
                  detail: { 
                    editor,
                    getTitle: () => {
                      const titleNode = editor.state.doc.firstChild?.firstChild?.content?.firstChild;
                      return titleNode && titleNode.text ? titleNode.text : "Untitled";
                    },
                    getContent: () => editor.getHTML()
                  } 
                });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md shadow-md hover:shadow-lg transition-all text-xs font-bold uppercase tracking-wider hover:opacity-90"
              title="Publish Codex"
            >
              Publish
            </button>
            <button
              onClick={onPreviewClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-md hover:shadow-lg transition-all text-xs font-bold uppercase tracking-wider hover:opacity-90"
              title="View Live Preview"
            >
              <Monitor size={14} /> Preview
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex gap-2 justify-between">
          <button
            onClick={() => handleExport("markdown")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded text-xs font-semibold text-brand-navy transition-colors"
            title="Export as Markdown"
          >
            <Download size={12} /> MD
          </button>
          <button
            onClick={() => handleExport("html")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded text-xs font-semibold text-brand-navy transition-colors"
            title="Export as HTML"
          >
            <Download size={12} /> HTML
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded text-xs font-semibold text-brand-navy transition-colors"
            title="Export as JSON"
          >
            <Download size={12} /> JSON
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded text-xs font-semibold text-brand-navy transition-colors"
            title="Export as PDF"
          >
            <Download size={12} /> PDF
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

      {/* I & II. Document Info and Tagging Section (Always Visible, Conditional Height) */}
      <div
        ref={infoContainerRef}
        className="relative overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: `${infoHeight}px` }}
      >
        <div ref={infoContentRef}>
          {/* I. Document Metrics & Quality (Always Visible) */}
          <DocumentQualityMetrics editor={editor} />
          <hr className="my-4 border-slate-200" />

          {/* II. Tagging Section (Always Visible) */}
          <PanelSection title="Tagging" icon={Tag}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add tag (e.g., react-component)"
                className="flex-grow text-sm border border-slate-300 rounded px-2 py-1 focus:ring-indigo-600 focus:border-indigo-600"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Add Tag"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 min-h-[30px]">
              {tags.length === 0 ? (
                <p className="text-xs text-slate-800 dark:text-slate-300 italic">No tags added.</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center space-x-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-500 hover:text-indigo-700 transition-colors"
                      title={`Remove ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </PanelSection>
        </div>

        {/* ⭐ কভার বাটন: যদি এডিটর ফোকাসড থাকে এবং এক্সপ্যান্ডেড না থাকে */}
        {isEditorFocused && !isInfoExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-100 to-transparent flex justify-center items-end pb-3">
            <button
              onClick={toggleInfoExpansion}
              className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronDown className="w-4 h-4" /> <span>Expand Info</span>
            </button>
          </div>
        )}
      </div>

      {/* ⭐ কলাপস বাটন: যদি এক্সপ্যান্ডেড থাকে এবং এডিটর ফোকাসড থাকে */}
      {isEditorFocused && isInfoExpanded && (
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleInfoExpansion}
            className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full bg-slate-300 text-slate-700 shadow-sm hover:bg-slate-400 transition-colors"
          >
            <ChevronUp className="w-4 h-4" /> <span>Collapse Info</span>
          </button>
        </div>
      )}

      <hr className="my-4 border-slate-200" />

      {/* III. স্টাইল কন্ট্রোল সেকশন: শুধুমাত্র যখন নোড অ্যাকটিভলি সিলেক্টেড (Focus + Node) */}
      {shouldShowStyleControls ? (
        <>
          {/* Focus Message Removed, as controls are visible only when focused and selected */}

          {/* III. Structure Section */}
          <PanelSection title="Structure" icon={Layers}>
            {/* টাইপ ডিসপ্লে */}
            <div className="flex justify-between items-center text-sm font-mono bg-white/30 dark:bg-white/10 p-2 rounded">
              <span className="text-slate-600">Type:</span>
              <span className="font-bold text-indigo-600 capitalize">
                {activeNodeName.replace("Custom", "").replace("Lowlight", "")}
              </span>
            </div>

            {/* Visibility/Hide Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label
                htmlFor="isHidden"
                className="text-sm font-medium text-slate-700"
              >
                Hide Element
              </label>
              <input
                type="checkbox"
                id="isHidden"
                checked={styles.isHidden}
                onChange={(e) =>
                  handleStyleChange("isHidden", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 border-slate-300 rounded"
              />
            </div>

            {/* Z-Index (Layering) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label
                htmlFor="zIndex"
                className="text-sm font-medium text-slate-700"
              >
                Z-Index
              </label>
              <input
                type="number"
                id="zIndex"
                value={styles.zIndex === null ? "" : styles.zIndex}
                onChange={(e) =>
                  handleStyleChange("zIndex", Number(e.target.value))
                }
                className="w-1/4 text-xs border border-slate-300 rounded px-1 py-0.5 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            {/* Cursor Style */}
            <div className="flex flex-col pt-2 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700 mb-1">
                Cursor
              </label>
              <select
                value={styles.cursor}
                onChange={(e) => handleStyleChange("cursor", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded px-2 py-1"
              >
                <option value="auto">Auto</option>
                <option value="pointer">Pointer</option>
                <option value="default">Default</option>
                <option value="text">Text</option>
                <option value="not-allowed">Not Allowed</option>
                <option value="crosshair">Crosshair</option>
              </select>
            </div>
          </PanelSection>

          <hr className="my-4 border-slate-200" />

          {/* IV. Block Content/Type Specific Controls */}
          {activeNodeName === "heading" && (
            <PanelSection title="Heading Level">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleHeadingLevelChange(level)}
                    className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
                      headingLevel === level
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    H{level}
                  </button>
                ))}
              </div>
            </PanelSection>
          )}

          {isCodeBlock && (
            <PanelSection title="Code Language">
              <select
                value={selectedNode.attrs.language || "null"}
                onChange={(e) =>
                  editor
                    .chain()
                    .setCodeBlockLanguage(
                      e.target.value === "null" ? null : e.target.value
                    )
                    .run()
                }
                className="w-full text-sm border border-slate-300 rounded px-2 py-1"
              >
                <option value="null">Auto</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="bash">Bash</option>
              </select>
            </PanelSection>
          )}

          {/* 
          <PanelSection title="Highlighted Block" icon={AlertTriangle}>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => insertHighlightedBlock("info")}
                className="flex items-center space-x-1 px-3 py-2 text-sm rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                title="Insert Info Block"
              >
                <Info className="w-4 h-4" /> <span>Info Block</span>
              </button>
              <button
                onClick={() => insertHighlightedBlock("warning")}
                className="flex items-center space-x-1 px-3 py-2 text-sm rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                title="Insert Warning Block"
              >
                <AlertTriangle className="w-4 h-4" /> <span>Warning Block</span>
              </button>
            </div>
          </PanelSection>
          */}

          <hr className="my-4 border-slate-200" />

          {/* V. Typography Control */}
          {isTextBlock && (
            <PanelSection title="Typography Control" icon={TextCursorInput}>
              {/* Line Height Control */}
              <div>
                <label
                  htmlFor="line-height"
                  className="text-sm font-medium text-slate-700 block mb-1"
                >
                  Line Height
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="line-height"
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => handleLineHeightChange(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer flex-1"
                  />
                  <input
                    type="number"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={lineHeight.toFixed(1)}
                    onChange={(e) => handleLineHeightChange(e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-center focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Margin Top Control */}
              <div className="pt-3">
                <label
                  htmlFor="margin-top"
                  className="text-sm font-medium text-slate-700 block mb-1"
                >
                  Spacing Top (px)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="margin-top"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={margin.top}
                    onChange={(e) => handleSpacingChange({ ...margin, top: Number(e.target.value) }, padding)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={margin.top}
                    onChange={(e) => handleSpacingChange({ ...margin, top: Number(e.target.value) }, padding)}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-center focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Margin Bottom Control */}
              <div className="pt-3">
                <label
                  htmlFor="margin-bottom"
                  className="text-sm font-medium text-slate-700 block mb-1"
                >
                  Spacing Bottom (px)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="margin-bottom"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={margin.bottom}
                    onChange={(e) => handleSpacingChange({ ...margin, bottom: Number(e.target.value) }, padding)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={margin.bottom}
                    onChange={(e) => handleSpacingChange({ ...margin, bottom: Number(e.target.value) }, padding)}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-center focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Letter Spacing Control */}
              <div className="pt-3">
                <label
                  htmlFor="letter-spacing"
                  className="text-sm font-medium text-slate-700 block mb-1"
                >
                  Letter Spacing (em)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="letter-spacing"
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={letterSpacing}
                    onChange={(e) => handleLetterSpacingChange(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={letterSpacing.toFixed(2)}
                    onChange={(e) => handleLetterSpacingChange(e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-center focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Indent / Outdent (Buttons) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Indentation
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={handleOutdent}
                    className="p-2 rounded bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700"
                    title="Outdent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleIndent}
                    className="p-2 rounded bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700"
                    title="Indent"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </PanelSection>
          )}

          <hr className="my-4 border-slate-200" />

          {/* VI. Layout & Alignment Section */}
          {(isBlockWithSpacing || isResizable) && !isList && (
            <PanelSection title="Layout & Alignment" icon={Ruler}>
              {/* Alignment */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-1">
                  Align
                </h4>
                <div className="flex justify-around space-x-2">
                  {["left", "center", "right", "justify"].map((align) => (
                    <button
                      key={align}
                      onClick={() => handleAlignmentChange(align)}
                      className={`p-2 rounded transition-colors ${
                        styles.textAlign === align
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                      title={align}
                    >
                      <span className="text-lg">{align[0].toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size (Width, Height, Min/Max) */}
              {(isResizable || activeNodeName === "section") && (
                <div className="flex flex-col gap-3 mb-4 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-1">
                    Size (px or null)
                  </h4>

                  {/* Width & Height */}
                  <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                        Width
                      </label>
                      <input
                        type="number"
                        value={styles.width === null ? "" : styles.width}
                        onChange={(e) =>
                          handleStyleChange("width", e.target.value)
                        }
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                        Height
                      </label>
                      <input
                        type="number"
                        value={styles.height === null ? "" : styles.height}
                        onChange={(e) =>
                          handleStyleChange("height", e.target.value)
                        }
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>

                  {/* Min Width & Max Width */}
                  <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                        Min Width
                      </label>
                      <input
                        type="number"
                        value={styles.minWidth === null ? "" : styles.minWidth}
                        onChange={(e) =>
                          handleStyleChange("minWidth", e.target.value)
                        }
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                        Max Width
                      </label>
                      <input
                        type="number"
                        value={styles.maxWidth === null ? "" : styles.maxWidth}
                        onChange={(e) =>
                          handleStyleChange("maxWidth", e.target.value)
                        }
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>

                  {/* Min Height & Max Height */}
                  <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                        Min Height
                      </label>
                      <input
                        type="number"
                        value={
                          styles.minHeight === null ? "" : styles.minHeight
                        }
                        onChange={(e) =>
                          handleStyleChange("minHeight", e.target.value)
                        }
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                        Max Height
                      </label>
                      <input
                        type="number"
                        value={
                          styles.maxHeight === null ? "" : styles.maxHeight
                        }
                        onChange={(e) =>
                          handleStyleChange("maxHeight", e.target.value)
                        }
                        className="w-full text-sm border border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Spacing Controls (Margin/Padding) */}
              {isBlockWithSpacing && (
                <>
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-2">
                      Margin (px)
                    </h4>
                    <div className="flex justify-between gap-1">
                      <SpacingInput
                        label="Top"
                        value={margin.top}
                        onChange={(val) =>
                          handleSpacingChange({ ...margin, top: val }, padding)
                        }
                        min={-100}
                      />
                      <SpacingInput
                        label="Right"
                        value={margin.right}
                        onChange={(val) =>
                          handleSpacingChange(
                            { ...margin, right: val },
                            padding
                          )
                        }
                        min={-100}
                      />
                      <SpacingInput
                        label="Bottom"
                        value={margin.bottom}
                        onChange={(val) =>
                          handleSpacingChange(
                            { ...margin, bottom: val },
                            padding
                          )
                        }
                        min={-100}
                      />
                      <SpacingInput
                        label="Left"
                        value={margin.left}
                        onChange={(val) =>
                          handleSpacingChange({ ...margin, left: val }, padding)
                        }
                        min={-100}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-2">
                      Padding (px)
                    </h4>
                    <div className="flex justify-between gap-1">
                      <SpacingInput
                        label="Top"
                        value={padding.top}
                        onChange={(val) =>
                          handleSpacingChange(margin, { ...padding, top: val })
                        }
                      />
                      <SpacingInput
                        label="Right"
                        value={padding.right}
                        onChange={(val) =>
                          handleSpacingChange(margin, {
                            ...padding,
                            right: val,
                          })
                        }
                      />
                      <SpacingInput
                        label="Bottom"
                        value={padding.bottom}
                        onChange={(val) =>
                          handleSpacingChange(margin, {
                            ...padding,
                            bottom: val,
                          })
                        }
                      />
                      <SpacingInput
                        label="Left"
                        value={padding.left}
                        onChange={(val) =>
                          handleSpacingChange(margin, { ...padding, left: val })
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </PanelSection>
          )}

          <hr className="my-4 border-slate-200" />

          {/* VII. Visual Style Controls */}
          <PanelSection title="Visual Style" icon={Layers}>
            {/* Color/Opacity */}
            <div className="flex flex-col gap-4 mb-2">
              <AdvancedColorPicker
                label="Text Color"
                value={styles.textColor}
                onChange={(val) => handleStyleChange("textColor", val)}
              />
              <AdvancedColorPicker
                label="Background"
                value={styles.bgColor}
                onChange={(val) => handleStyleChange("bgColor", val)}
              />
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Opacity
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={styles.opacity}
                  onChange={(e) => handleStyleChange("opacity", e.target.value)}
                  className="w-1/4 text-xs border border-slate-300 rounded px-1 py-0.5"
                />
              </div>
            </div>

            {/* Border Radius */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-2">
                Border Radius (px)
              </h4>
              <div className="flex justify-between gap-1">
                <SpacingInput
                  label="TL"
                  value={borderRadius.topLeft}
                  onChange={(val) =>
                    handleBorderRadiusChange("borderRadiusTopLeft", val)
                  }
                />
                <SpacingInput
                  label="TR"
                  value={borderRadius.topRight}
                  onChange={(val) =>
                    handleBorderRadiusChange("borderRadiusTopRight", val)
                  }
                />
                <SpacingInput
                  label="BR"
                  value={borderRadius.bottomRight}
                  onChange={(val) =>
                    handleBorderRadiusChange("borderRadiusBottomRight", val)
                  }
                />
                <SpacingInput
                  label="BL"
                  value={borderRadius.bottomLeft}
                  onChange={(val) =>
                    handleBorderRadiusChange("borderRadiusBottomLeft", val)
                  }
                />
              </div>
            </div>

            {/* Border Style */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <h4 className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-1">Border</h4>
              <div className="flex gap-2">
                <div className="flex flex-col w-1/3">
                  <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                    Width
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={styles.borderWidth}
                    onChange={(e) =>
                      handleStyleChange("borderWidth", e.target.value)
                    }
                    className="w-full text-xs border border-slate-300 rounded px-1 py-0.5"
                  />
                </div>
                <div className="flex flex-col w-1/3">
                  <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                    Style
                  </label>
                  <select
                    value={styles.borderStyle}
                    onChange={(e) =>
                      handleStyleChange("borderStyle", e.target.value)
                    }
                    className="w-full text-xs border border-slate-300 rounded px-1 py-0.5"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="flex flex-col w-1/3">
                  <label className="text-xs font-medium text-slate-800 dark:text-slate-300">
                    Color
                  </label>
                  <input
                    type="color"
                    value={styles.borderColor}
                    onChange={(e) =>
                      handleStyleChange("borderColor", e.target.value)
                    }
                    className="w-full h-7 rounded border-none p-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </PanelSection>
        </>
      ) : (
        // যখন নোড সিলেক্টেড নয় অথবা এডিটর ফোকাসড নয়, তখন এই মেসেজ দেখাবে
        <div className="p-4 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-[16px] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] text-center">
          <Layers className="h-6 w-6 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            Select an element in the editor to view style controls.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
