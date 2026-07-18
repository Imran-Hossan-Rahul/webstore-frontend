"use client";

import { useState } from "react";
import { Node } from "@tiptap/core";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HardBreak from "@tiptap/extension-hard-break";
import { mergeAttributes } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TipTaskList from "@tiptap/extension-task-list";
import TipTaskItem from "@tiptap/extension-task-item";
import TipBulletList from "@tiptap/extension-bullet-list";
import TipOrderedList from "@tiptap/extension-ordered-list";
import TipListItem from "@tiptap/extension-list-item";
import Document from "@tiptap/extension-document";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
import Youtube from "@tiptap/extension-youtube";
import { UniversalEmbed } from "./UniversalEmbed";

import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight/lib/core"; // Use core for manual registering
import CodeBlockComponent from "./CodeBlockComponent";

import js from "highlight.js/lib/languages/javascript";
import py from "highlight.js/lib/languages/python";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import ts from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import ruby from "highlight.js/lib/languages/ruby";

lowlight.registerLanguage("javascript", js);
lowlight.registerLanguage("python", py);
lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("typescript", ts);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("sql", sql);
lowlight.registerLanguage("java", java);
lowlight.registerLanguage("cpp", cpp);
lowlight.registerLanguage("ruby", ruby);

import "highlight.js/styles/github-dark.css";

import Toolbar from "./Toolbar";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

import ImageNodeView from "./ImageNodeView";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import { HighlightedBlock } from "./extensions/HighlightedBlock";

// Slash Commands imports
import { SlashCommands, createSuggestionOptions } from "./slashCommands";
import "tippy.js/dist/tippy.css";
import "./SlashCommands.css";

// Markdown Shortcuts
import { MarkdownShortcuts } from "./markdownShortcuts";

// Dark Mode
import { ThemeProvider } from "./ThemeContext";
import "./DarkMode.css";

// Editor Width Control
import "./EditorWidth.css";

// Auto-save Indicator
import "./AutoSave.css";

import "./AutoSave.css";

import LivePreviewModal from "./LivePreviewModal";
import { BlockMenu } from "./BlockMenu";
import { HistoryViewer } from "./HistoryViewer";
import AIChat from "./AIChat";
import PublishModal from "./PublishModal";
import { TableOfContents } from "./extensions/TableOfContents";

// ----------------------
// Custom Node Extensions
// ----------------------
const addStyleAttributes = (parentAttrs = {}) => ({
  ...parentAttrs,
  paddingTop: { default: 0, parseHTML: e => parseInt(e.style.paddingTop, 10) || 0 },
  paddingRight: { default: 0, parseHTML: e => parseInt(e.style.paddingRight, 10) || 0 },
  paddingBottom: { default: 0, parseHTML: e => parseInt(e.style.paddingBottom, 10) || 0 },
  paddingLeft: { default: 0, parseHTML: e => parseInt(e.style.paddingLeft, 10) || 0 },

  marginTop: { default: 0, parseHTML: e => parseInt(e.style.marginTop, 10) || 0 },
  marginRight: { default: 0, parseHTML: e => parseInt(e.style.marginRight, 10) || 0 },
  marginBottom: { default: 0, parseHTML: e => parseInt(e.style.marginBottom, 10) || 0 },
  marginLeft: { default: 0, parseHTML: e => parseInt(e.style.marginLeft, 10) || 0 },

  textColor: { 
    default: "#000000", 
    parseHTML: e => {
      if (e.style.WebkitBackgroundClip === 'text' && e.style.background) {
         return e.style.background; // It's a gradient
      }
      return e.style.color || "#000000";
    }
  },
  bgColor: { 
    default: "transparent", 
    parseHTML: e => {
      if (e.style.WebkitBackgroundClip === 'text') return "transparent"; // Gradient background is for text
      return e.style.backgroundColor || "transparent";
    }
  },

  opacity: { default: 1, parseHTML: e => parseFloat(e.style.opacity) || 1 },
  boxShadow: { default: "none", parseHTML: e => e.style.boxShadow || "none" },

  borderWidth: { default: 0, parseHTML: e => parseInt(e.style.borderWidth, 10) || 0 },
  borderStyle: { default: "solid", parseHTML: e => e.style.borderStyle || "solid" },
  borderColor: { default: "#000000", parseHTML: e => e.style.borderColor || "#000000" },

  strokeWidth: { default: 0, parseHTML: e => parseInt(e.style.webkitTextStrokeWidth, 10) || 0 },
  strokeColor: { default: "#000000", parseHTML: e => e.style.webkitTextStrokeColor || "#000000" },
});

// CustomCodeBlockLowlight
const CustomCodeBlockLowlight = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      id: {
        default: () => uuidv4(),
        parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
      },
      borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
      borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
      borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
      borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
      isHidden: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-hidden") === "true",
      },
      language: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("code")?.getAttribute("data-language"),
      },
      ...addStyleAttributes(this.parent?.()),
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    let displayStyle = "";
    if (attrs.isHidden === true) {
      // displayStyle = "display: none !important;";
    }
    const customStyles = `
      ${displayStyle}
      padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
      margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
      background: ${attrs.bgColor};
      opacity: ${attrs.opacity};
      box-shadow: ${attrs.boxShadow};
      border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
      border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
      border-top-right-radius: ${attrs.borderRadiusTopRight}px;
      border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
      border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
    `
      .replace(/\s+/g, " ")
      .trim();

    const mergedPreAttributes = mergeAttributes(HTMLAttributes, {
      style: customStyles,
      "data-id": attrs.id,
      "data-is-hidden": attrs.isHidden ? "true" : undefined,
    });

    const codeAttributes = {
      ...(attrs.language ? { "data-language": attrs.language } : {}),
      class: attrs.language ? `language-${attrs.language}` : null,
    };

    return ["pre", mergedPreAttributes, ["code", codeAttributes, 0]];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});

// CustomParagraph with Gradient Support
const CustomParagraph = Paragraph.extend({
  name: "paragraph",
  addAttributes() {
    return {
      id: {
        default: () => uuidv4(),
        parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
      },
      borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
      borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
      borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
      borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
      lineHeight: { default: 1.5, parseHTML: e => parseFloat(e.style.lineHeight) || 1.5 },
      letterSpacing: { default: 0, parseHTML: e => parseInt(e.style.letterSpacing, 10) || 0 },
      isHidden: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-hidden") === "true",
      },
      textAlign: {
        default: "left",
        parseHTML: (element) => element.style.textAlign || "left",
      },
      ...addStyleAttributes(this.parent?.()),
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    const isTextGradient =
      attrs.textColor && attrs.textColor.includes("gradient");

    let styleBuffer = `
        ${attrs.isHidden ? "" : "display: block;"}
        line-height: ${attrs.lineHeight};
        text-align: ${attrs.textAlign || "left"};
        letter-spacing: ${attrs.letterSpacing}px;
        padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${
      attrs.paddingBottom
    }px ${attrs.paddingLeft}px;
        margin: ${attrs.marginTop}px ${attrs.marginRight}px ${
      attrs.marginBottom
    }px ${attrs.marginLeft}px;
        opacity: ${attrs.opacity};
        box-shadow: ${attrs.boxShadow};
        border: ${attrs.borderWidth}px ${attrs.borderStyle} ${
      attrs.borderColor
    };
        border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
        border-top-right-radius: ${attrs.borderRadiusTopRight}px;
        border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
        border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
        -webkit-text-stroke: ${attrs.strokeWidth}px ${attrs.strokeColor};
    `;

    if (isTextGradient) {
      styleBuffer += `
            background: ${attrs.textColor};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
        `;
    } else {
      styleBuffer += `
            color: ${attrs.textColor};
            background: ${attrs.bgColor};
        `;
    }

    const customStyles = styleBuffer.replace(/\s+/g, " ").trim();
    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      style: customStyles,
      "data-id": attrs.id,
      "data-is-hidden": attrs.isHidden ? "true" : undefined,
    });
    return ["p", mergedAttributes, 0];
  },
  addCommands() {
    const parentCommands = this.parent?.();
    return {
      setParagraph:
        () =>
        ({ commands }) => {
          if (parentCommands && parentCommands.setParagraph)
            return parentCommands.setParagraph();
          return commands.setNode(this.name);
        },
      setParagraphLineHeight:
        (lineHeight) =>
        ({ commands }) => {
          if (typeof lineHeight !== "number" || lineHeight <= 0) return false;
          return commands.updateAttributes(this.name, { lineHeight });
        },
      setParagraphLetterSpacing:
        (letterSpacing) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            letterSpacing: letterSpacing || 0,
          });
        },
      toggleHidden:
        () =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            isHidden: !this.options.isHidden,
          });
        },
      toggleParagraph:
        () =>
        ({ commands }) => {
          if (parentCommands && parentCommands.toggleParagraph)
            return parentCommands.toggleParagraph();
          return commands.toggleNode(this.name, "paragraph", {});
        },
    };
  },
});

// CustomHeading
const CustomHeading = Heading.extend({
  name: "heading",
  addAttributes() {
    return {
      id: {
        default: () => uuidv4(),
        parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
      },
      borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
      borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
      borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
      borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
      ...addStyleAttributes(this.parent?.()),
      lineHeight: { default: 1.5, parseHTML: e => parseFloat(e.style.lineHeight) || 1.5 },
      letterSpacing: { default: 0, parseHTML: e => parseInt(e.style.letterSpacing, 10) || 0 },
      isHidden: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-hidden") === "true",
      },
      level: { default: 1 },
      textAlign: {
        default: "left",
        parseHTML: (element) => element.style.textAlign || "left",
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    const level = attrs.level ?? 1;
    const isTextGradient =
      attrs.textColor && attrs.textColor.includes("gradient");

    let styleBuffer = `
        ${attrs.isHidden ? "" : ""}
        line-height: ${attrs.lineHeight};
        text-align: ${attrs.textAlign || "left"};
        letter-spacing: ${attrs.letterSpacing}px;
        padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${
      attrs.paddingBottom
    }px ${attrs.paddingLeft}px;
        margin: ${attrs.marginTop}px ${attrs.marginRight}px ${
      attrs.marginBottom
    }px ${attrs.marginLeft}px;
        opacity: ${attrs.opacity};
        box-shadow: ${attrs.boxShadow};
        border: ${attrs.borderWidth}px ${attrs.borderStyle} ${
      attrs.borderColor
    };
        border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
        border-top-right-radius: ${attrs.borderRadiusTopRight}px;
        border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
        border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
        -webkit-text-stroke: ${attrs.strokeWidth}px ${attrs.strokeColor};
    `;

    if (isTextGradient) {
      styleBuffer += `
            background: ${attrs.textColor};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
        `;
    } else {
      styleBuffer += `
            color: ${attrs.textColor};
            background: ${attrs.bgColor};
        `;
    }

    const customStyles = styleBuffer.replace(/\s+/g, " ").trim();
    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      style: customStyles,
      "data-id": attrs.id,
      "data-is-hidden": attrs.isHidden ? "true" : undefined,
    });
    return [`h${level}`, mergedAttributes, 0];
  },
  addCommands() {
    return {
      setHeadingLineHeight:
        (lineHeight) =>
        ({ commands }) => {
          if (typeof lineHeight !== "number" || lineHeight <= 0) return false;
          return commands.updateAttributes(this.name, { lineHeight });
        },
      setHeadingLetterSpacing:
        (letterSpacing) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            letterSpacing: letterSpacing || 0,
          });
        },
      setLevel:
        (level) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { level });
        },
    };
  },
});

// CustomImage
const CustomImage = Image.extend({
  // 🔑 Make the image node inline so multiple images can sit side-by-side
  inline: true,
  group: "inline",

  addAttributes() {
    return {
      id: { default: () => uuidv4() },
      borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
      borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
      borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
      borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
      isHidden: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-hidden") === "true",
      },
      ...addStyleAttributes(this.parent?.()),
      src: {},
      width: { default: 300 },
      height: { default: 200 },
      textAlign: { default: "center" },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    let displayStyle = "";
    if (attrs.isHidden === true) displayStyle = "";

    // Use inline-block span wrapper instead of block-level div
    // so multiple images can appear on the same line
    const wrapperStyle = `
        display: inline-block;
        vertical-align: middle;
        text-align: ${attrs.textAlign || "center"};
        color: ${attrs.textColor};
        background: ${attrs.bgColor};
        -webkit-text-stroke: ${attrs.strokeWidth}px ${attrs.strokeColor};
        ${displayStyle}
    `
      .replace(/\s+/g, " ")
      .trim();

    const imgStyle = `
        width: ${attrs.width}px;
        height: ${attrs.height}px;
        padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
        margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
        opacity: ${attrs.opacity};
        box-shadow: ${attrs.boxShadow};
        border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
        border-top-right-radius: ${attrs.borderRadiusTopRight}px;
        border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
        border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
        display: block;
    `
      .replace(/\s+/g, " ")
      .trim();

    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      style: wrapperStyle,
      "data-id": attrs.id,
      "data-is-hidden": attrs.isHidden ? "true" : undefined,
    });

    return [
      "span",       // ← span instead of div (inline, not block)
      mergedAttributes,
      ["img", { src: attrs.src, style: imgStyle }],
    ];
  },
});


// Container & Section
const Container = Node.create({
  name: "container",
  group: "block",
  content: "section+",
  addAttributes() {
    return { id: { default: () => uuidv4() } };
  },
  parseHTML() {
    return [{ tag: "div[data-type='container']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-type": "container",
        class: "editor-container",
        "data-id": HTMLAttributes.id,
      },
      0,
    ];
  },
});

const Section = Node.create({
  name: "section",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      id: { default: () => uuidv4() },
      borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
      borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
      borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
      borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
      isHidden: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-hidden") === "true",
      },
      ...addStyleAttributes(this.parent?.()),
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='section']" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    let displayStyle = "";
    if (attrs.isHidden === true) displayStyle = "";

    const customStyles = `
        ${displayStyle}
        padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
        margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
        background: ${attrs.bgColor};
        opacity: ${attrs.opacity};
        box-shadow: ${attrs.boxShadow};
        border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
        border-top-right-radius: ${attrs.borderRadiusTopRight}px;
        border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
        border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
    `
      .replace(/\s+/g, " ")
      .trim();

    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      "data-type": "section",
      class: "editor-section",
      "data-id": attrs.id,
      "data-is-hidden": attrs.isHidden ? "true" : undefined,
      style: customStyles,
    });
    return ["div", mergedAttributes, 0];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.chain().focus().splitBlock().run(),
      "Alt-Enter": () => {
        const { state, view } = this.editor;
        const { $from } = state.selection;
        let sectionDepth = null;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === "section") {
            sectionDepth = d;
            break;
          }
        }
        if (sectionDepth !== null) {
          const posAfterSection = $from.after(sectionDepth);
          const newSection = state.schema.nodes.section.create(
            {},
            state.schema.nodes.paragraph.create()
          );
          const tr = state.tr.insert(posAfterSection, newSection);
          view.dispatch(tr);
          this.editor.commands.setTextSelection(posAfterSection + 2);
          this.editor.commands.focus();
          return true;
        }
        return false;
      },
    };
  },
});

// List Extensions
const createListExtension = (BaseExtension, tagName) => {
  return BaseExtension.extend({
    addAttributes() {
      return {
        id: {
          default: () => uuidv4(),
          parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
        },
        borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
        borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
        borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
        borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
        isHidden: {
          default: false,
          parseHTML: (element) =>
            element.getAttribute("data-is-hidden") === "true",
        },
        ...addStyleAttributes(this.parent?.()),
      };
    },
    renderHTML({ node, HTMLAttributes }) {
      const attrs = node.attrs;
      let displayStyle = "";
      if (attrs.isHidden === true) displayStyle = "";
      const customStyles = `
        ${displayStyle}
        opacity: ${attrs.opacity};
        padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
        margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
        background: ${attrs.bgColor};
        box-shadow: ${attrs.boxShadow};
        border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
        border-top-right-radius: ${attrs.borderRadiusTopRight}px;
        border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
        border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
      `
        .replace(/\s+/g, " ")
        .trim();

      const mergedAttributes = mergeAttributes(HTMLAttributes, {
        "data-id": attrs.id,
        "data-is-hidden": attrs.isHidden ? "true" : undefined,
        style: customStyles,
      });
      return [tagName, mergedAttributes, 0];
    },
  });
};

const BulletList = createListExtension(TipBulletList, "ul");
const OrderedList = createListExtension(TipOrderedList, "ol");
const TaskList = createListExtension(TipTaskList, "ul");
const ListItem = TipListItem.extend({
  addAttributes() {
    return { id: { default: () => uuidv4() } };
  },
  renderHTML({ HTMLAttributes }) {
    return ["li", { "data-id": HTMLAttributes.id }, 0];
  },
});
const TaskItem = TipTaskItem.extend({
  addAttributes() {
    return {
      id: {
        default: () => uuidv4(),
        parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
      },
      borderRadiusTopLeft: { default: 0, parseHTML: e => parseInt(e.style.borderTopLeftRadius, 10) || 0 },
      borderRadiusTopRight: { default: 0, parseHTML: e => parseInt(e.style.borderTopRightRadius, 10) || 0 },
      borderRadiusBottomRight: { default: 0, parseHTML: e => parseInt(e.style.borderBottomRightRadius, 10) || 0 },
      borderRadiusBottomLeft: { default: 0, parseHTML: e => parseInt(e.style.borderBottomLeftRadius, 10) || 0 },
      ...addStyleAttributes(this.parent?.()),
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    const customStyles = `
        padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
        margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
        color: ${attrs.textColor};
        background: ${attrs.bgColor};
        opacity: ${attrs.opacity};
        box-shadow: ${attrs.boxShadow};
        border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
        border-top-right-radius: ${attrs.borderRadiusTopRight}px;
        border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
        border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
    `
      .replace(/\s+/g, " ")
      .trim();

    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      "data-id": attrs.id,
    "data-checked": attrs.checked ? "true" : "false",
      class: "task-list-item",
      style: customStyles,
    });
    return ["li", mergedAttributes, 0];
  },
});

export const getExtensions = (options = {}) => [
  Document.extend({ content: "container" }),
  Section,
  StarterKit.configure({
    paragraph: false,
    document: false,
    heading: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    taskList: false,
    taskItem: false,
  }),
  Heading,
  Container,
  Section,
  HardBreak,
  CustomHeading,
  CustomParagraph,
  CustomHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
  CustomImage.extend({ addNodeView: () => ImageNodeView }),
  CustomCodeBlockLowlight.configure({ lowlight }),
  BulletList.configure({ keepMarks: true, keepAttributes: false }),
  OrderedList.configure({ keepMarks: true, keepAttributes: false }),
  ListItem,
  TaskList,
  TaskItem,
  TextStyle,
  FontFamily,
  Color,
  Link.configure({ openOnClick: false, autolink: false }),
  Placeholder.configure({ placeholder: "Start writing..." }),
  TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
  Underline,
  Highlight.configure({ multicolor: true }),
  Youtube.configure({ controls: true, allowFullscreen: true }),
  UniversalEmbed,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  SlashCommands.configure({
    suggestion: createSuggestionOptions(options),
  }),
  MarkdownShortcuts,
  HighlightedBlock,
  TableOfContents,
];

export default function CodexEditor() {
  const [modalType, setModalType] = useState(null);
  const [modalInput, setModalInput] = useState("");
  const [modalDisplayText, setModalDisplayText] = useState("");
  const [file, setFile] = useState(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [editorWidth, setEditorWidth] = useState("medium");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [saveState, setSaveState] = useState("saved");
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // AI Assistant State
  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load existing codex content if slug is present
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [isLoading, setIsLoading] = useState(false);
  const [codexData, setCodexData] = useState(null); // Added state
  const [selectedPositions, setSelectedPositions] = useState(new Set()); // Global batch select state


  // Listen for publish modal event
  useEffect(() => {
    const handleOpenPublishModal = () => {
      setIsPublishModalOpen(true);
    };
    window.addEventListener('openPublishModal', handleOpenPublishModal);
    return () => window.removeEventListener('openPublishModal', handleOpenPublishModal);
  }, []);

  useEffect(() => {
    const savedWidth = localStorage.getItem("editor-width");
    if (savedWidth) setEditorWidth(savedWidth);
  }, []);

  const changeEditorWidth = (width) => {
    setEditorWidth(width);
    localStorage.setItem("editor-width", width);
  };

  const saveContent = useCallback(async (content) => {
    setSaveState("saving");
    try {
      localStorage.setItem("codex-content", JSON.stringify(content));
      setSaveState("saved");
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save failed:", error);
      setSaveState("error");
    }
  }, []);

  const debouncedSave = useCallback(
    debounce((content) => saveContent(content), 2000),
    [saveContent]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getExtensions({
      setImageModalOpen: () => setModalType("image"),
      setVideoModalOpen: () => setModalType("youtube"),
      setAudioModalOpen: () => setModalType("audio"),
      setEmbedModalOpen: () => setModalType("embed"),
      openAISelector: () => handleAIRequest(),
    }),
    content: {
      type: "doc",
      content: [
        {
          type: "container",
          content: [
            {
              type: "section",
              content: [{ type: "paragraph" }],
            },
          ],
        },
      ],
    },
    editorProps: {
      attributes: {
        class: "tiptap text-black max-w-full focus:outline-none",
      },
      handlePaste(view, event, slice) {
        // Only intercept if we don't have HTML, or if we want to aggressively parse raw text.
        // Actually, sometimes HTML clipboard from ChatGPT is messy. But let's mainly focus on plain text.
        const text = event.clipboardData?.getData("text/plain");
        const html = event.clipboardData?.getData("text/html");
        
        // If it's a purely internal Tiptap slice (e.g. dragging nodes around), let it be
        if (slice && slice.content.childCount > 0 && !text) return false;

        // If there's text but no HTML (like raw markdown), OR if the user is pasting something that contains markdown backticks
        if (text && text.includes("```")) {
          // Parse the text manually to separate paragraphs and code blocks
          const blocks = text.split(/(```[\s\S]*?```)/g);
          
          if (blocks.length > 1) {
            const { state } = view;
            const nodes = [];
            
            blocks.forEach(block => {
              if (block.startsWith("```") && block.endsWith("```")) {
                const lines = block.slice(3, -3).trim().split('\n');
                let language = null;
                if (lines.length > 0 && !lines[0].includes(' ') && !lines[0].includes('(')) {
                  language = lines[0].trim();
                  lines.shift();
                }
                const codeContent = lines.join('\n');
                
                nodes.push(state.schema.nodes.codeBlock.create(
                  { language: language || 'javascript' },
                  codeContent ? state.schema.text(codeContent) : null
                ));
              } else {
                // Regular text block - split by double newlines for paragraphs
                if (block.trim()) {
                  const paragraphs = block.split(/\n\s*\n/);
                  paragraphs.forEach(p => {
                    if (p.trim()) {
                      nodes.push(state.schema.nodes.paragraph.create(null, state.schema.text(p.trim())));
                    }
                  });
                }
              }
            });

            const tr = state.tr.replaceSelectionWith(state.schema.nodes.container.create(null, 
                state.schema.nodes.section.create(null, nodes)
            ));
            view.dispatch(tr);
            return true; // prevent default paste
          }
        }

        // HEURISTIC AUTO-DETECTION FOR MIXED RAW TEXT (No backticks)
        if (text && !html && text.length > 30 && !text.includes("```")) {
            const { state } = view;
            const nodes = [];
            
            // Split by double newlines to treat each chunk as a separate paragraph/code block candidate
            const chunks = text.split(/\n\s*\n/);
            
            chunks.forEach(chunk => {
                if (!chunk.trim()) return;
                
                // Heuristic: Check if this chunk is likely code
                const codeMarkers = ['import ', 'const ', 'function ', 'class ', 'export ', 'let ', '<div', '=>', 'try {', 'catch ', 'await ', 'console.log'];
                const hasMarker = codeMarkers.some(m => chunk.trim().startsWith(m) || chunk.includes('\n' + m) || chunk.includes(m));
                const curlyBraces = (chunk.match(/\{|\}/g) || []).length;
                const semicolons = (chunk.match(/;/g) || []).length;
                const hasSyntax = curlyBraces >= 2 || semicolons >= 2 || (chunk.includes('(') && chunk.includes(')'));
                
                // If it looks heavily like code, wrap in codeBlock
                if (hasMarker && hasSyntax && chunk.split('\n').length > 1) {
                    nodes.push(state.schema.nodes.codeBlock.create(
                        { language: 'null' }, // Auto-detect later via lowlight or let it be neutral
                        state.schema.text(chunk.trim())
                    ));
                } else {
                    // Otherwise, generic paragraph
                    // If the chunk has single newlines, we can either keep them or let tiptap handle them. 
                    // Tiptap paragraph doesn't support rendering \n natively without hard breaks, 
                    // but we'll insert it as a single text node and users can format, or we can split it into multiple paragraphs.
                    const lines = chunk.split('\n');
                    lines.forEach(line => {
                        if(line.trim()) {
                            nodes.push(state.schema.nodes.paragraph.create(null, state.schema.text(line.trim())));
                        }
                    });
                }
            });

            if (nodes.length > 0) {
                // If we detect at least one code block in the mix, we intercept. Otherwise let Tiptap handle it normally.
                const hasCode = nodes.some(n => n.type.name === 'codeBlock');
                if (hasCode) {
                    const tr = state.tr.replaceSelectionWith(
                        state.schema.nodes.container.create(null, 
                            state.schema.nodes.section.create(null, nodes)
                        )
                    );
                    view.dispatch(tr);
                    return true;
                }
            }
        }

        return false;
      }
    },
  });

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      debouncedSave(editor.getJSON());
    };
    editor.on("update", handleUpdate);
    return () => editor.off("update", handleUpdate);
  }, [editor, debouncedSave]);

  useEffect(() => {
    if (editor) {
      window.editor = editor;
    }
  }, [editor]);

  // AI Chat Handler - must be before early return
  const handleAIRequest = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  useEffect(() => {
    if (slug && editor) {
      setIsLoading(true);
      // Use editor-specific endpoint to fetch drafts
      api.get(`/codex/editor-data/${slug}`)
        .then((codex) => {
          if (codex) {
             setCodexData(codex); // Store the fetched codex object
          }
          if (codex && codex.content) {
            let content = codex.content;
            
            // Try to parse if it's a string (could be JSON string or HTML)
            if (typeof content === 'string') {
              try {
                const parsed = JSON.parse(content);
                // If it parses to a valid object, use it. 
                // Otherwise (e.g. parsed to a number/boolean), keep original string if needed? 
                // But for Tiptap JSON, it should be an object.
                if (parsed && typeof parsed === 'object') {
                  content = parsed;
                }
              } catch (e) {
                // parsing failed, so it's likely HTML string
              }
            }
              
            editor.commands.setContent(content);
            // Don't overwrite with local storage immediately
          }
        })
        .catch((err) => {
          console.error("Failed to load codex:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [slug, editor]);

  if (!editor) return null;

  const findCurrentSection = () => {
    const { state } = editor;
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === "section") {
        const start = $from.before(depth);
        return { node, depth, start, size: node.nodeSize };
      }
    }
    return null;
  };

  const deleteCurrentSection = () => {
    const found = findCurrentSection();
    if (!found) return;
    const { start, size } = found;
    editor
      .chain()
      .focus()
      .deleteRange(start, start + size)
      .run();
  };

  const duplicateCurrentSection = () => {
    const found = findCurrentSection();
    if (!found) return;
    const { start, size, node } = found;
    const json = node.toJSON();
    editor
      .chain()
      .focus()
      .insertContentAt(start + size, json)
      .run();
  };

  const moveSectionUp = () => {
    const found = findCurrentSection();
    if (!found) return;
    const { start, size } = found;
    if (start === 0) return;
    const { state } = editor;
    let prevStart = null;
    state.doc.descendants((node, pos) => {
      if (node.type.name === "section" && pos < start) prevStart = pos;
    });
    if (prevStart === null) return;
    const slice = state.doc.slice(start, start + size);
    editor
      .chain()
      .focus()
      .deleteRange(start, start + size)
      .insertContentAt(prevStart, slice.content.toJSON())
      .run();
  };

  const moveSectionDown = () => {
    const found = findCurrentSection();
    if (!found) return;
    const { start, size } = found;
    const { state } = editor;
    let nextStart = null;
    state.doc.descendants((node, pos) => {
      if (node.type.name === "section" && pos > start && nextStart === null)
        nextStart = pos;
    });
    if (nextStart === null) return;
    const slice = state.doc.slice(start, start + size);
    const nextNode = state.doc.nodeAt(nextStart);
    const insertPos = nextStart + nextNode.nodeSize;
    editor
      .chain()
      .focus()
      .deleteRange(start, start + size)
      .insertContentAt(insertPos - size, slice.content.toJSON())
      .run();
  };

  const openModal = (type) => {
    setModalType(type);
    setModalInput("");
    setModalDisplayText("");
    setFile(null);
  };

  const openEmojiPicker = () => setEmojiPickerOpen(true);

  const handleLinkInsert = (displayText, url) => {
    if (!editor || !url) return;
    const selection = editor.state.selection;
    if (!selection.empty) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank" })
        .run();
    } else {
      const text = displayText || url;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: text,
          marks: [{ type: "link", attrs: { href: url, target: "_blank" } }],
        })
        .run();
    }
  };

  const handleModalConfirm = () => {
    const initialWidth = 300;
    const initialHeight = 200;

    if (modalType === "image") {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          editor
            .chain()
            .focus()
            .setImage({
              src: e.target.result,
              width: initialWidth,
              height: initialHeight,
              textAlign: "center",
            })
            .run();
        };
        reader.readAsDataURL(file);
      } else if (modalInput) {
        editor
          .chain()
          .focus()
          .setImage({
            src: modalInput,
            width: initialWidth,
            height: initialHeight,
            textAlign: "center",
          })
          .run();
      }
    } else if (modalType === "link") {
      if (modalInput) handleLinkInsert(modalDisplayText, modalInput);
    } else if (modalType === "youtube") {
      if (modalInput) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "youtube",
            attrs: { src: modalInput, width: 640, height: 360 },
          })
          .run();
      }
    } else if (modalType === "embed") {
      // Universal Embed Logic
      let src = modalInput;
      // 1. Iframe Code
      if (modalInput.trim().startsWith("<iframe")) {
        const match = modalInput.match(/src="([^"]+)"/);
        if (match && match[1]) src = match[1];
      }
      // 2. Figma
      else if (modalInput.includes("figma.com")) {
        src = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
          modalInput
        )}`;
      }
      // 3. CodePen
      else if (
        modalInput.includes("codepen.io") &&
        modalInput.includes("/pen/")
      ) {
        src = modalInput.replace("/pen/", "/embed/");
      }

      if (src) {
        editor.chain().focus().setUniversalEmbed({ src }).run();
      }
    }
    setModalType(null);
  };

  const handleEmojiSelect = (emoji) => {
    editor.chain().focus().insertContent(emoji.native).run();
    setEmojiPickerOpen(false);
  };

  const applyBlockStyles = (
    selectedNode,
    updatedMargin,
    updatedPadding,
    updatedStyles = {}
  ) => {
    if (!selectedNode || !editor) return;
    
    if (selectedPositions && selectedPositions.size > 0) {
      let chain = editor.chain().focus();
      selectedPositions.forEach(pos => {
        const node = editor.state.doc.nodeAt(pos);
        if (node) {
          chain = chain.setNodeSelection(pos).updateAttributes(node.type.name, {
            marginTop: updatedMargin.top,
            marginRight: updatedMargin.right,
            marginBottom: updatedMargin.bottom,
            marginLeft: updatedMargin.left,
            paddingTop: updatedPadding.top,
            paddingRight: updatedPadding.right,
            paddingBottom: updatedPadding.bottom,
            paddingLeft: updatedPadding.left,
            ...updatedStyles,
          });
        }
      });
      chain.run();
    } else {
      editor
        .chain()
        .focus()
        .updateAttributes(selectedNode.type.name, {
          marginTop: updatedMargin.top,
          marginRight: updatedMargin.right,
          marginBottom: updatedMargin.bottom,
          marginLeft: updatedMargin.left,
          paddingTop: updatedPadding.top,
          paddingRight: updatedPadding.right,
          paddingBottom: updatedPadding.bottom,
          paddingLeft: updatedPadding.left,
          ...updatedStyles,
        })
        .run();
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-slate-50 relative">
        {isLoading && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
             <div className="flex flex-col items-center gap-4">
                 <div className="animate-spin w-12 h-12 border-4 border-t-[#3ea6ff] border-slate-200 rounded-full"></div>
                 <p className="text-slate-600 font-medium animate-pulse">Loading Codex...</p>
             </div>
          </div>
        )}
        <LeftPanel 
          editor={editor} 
          selectedPositions={selectedPositions}
          setSelectedPositions={setSelectedPositions}
        />
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Toolbar: fixed at top, never scrolls */}
          <div className="flex-shrink-0 z-10 border-b border-slate-200 bg-white"
               onClick={(e) => e.stopPropagation()}>
            <Toolbar
              editor={editor}
              editorWidth={editorWidth}
              changeEditorWidth={changeEditorWidth}
              saveState={saveState}
              lastSaved={lastSaved}
              openModal={openModal}
              openEmojiPicker={openEmojiPicker}
              deleteSection={deleteCurrentSection}
              toggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
              openAISelector={handleAIRequest}
              selectedPositions={selectedPositions}
            />
          </div>

          {/* Content: independently scrollable BELOW the toolbar */}
          <div
            className="flex-1 overflow-y-auto p-4"
            onClick={() => editor.commands.focus()}
          >
            <div
              className={`editor-container width-${editorWidth} relative pl-12 pt-4`}
            >
              <BlockMenu editor={editor} />
              <EditorContent editor={editor} className="min-h-full h-full" />
            </div>
          </div>

          {/* Modals — 'fixed' so they float above everything regardless of DOM position */}
          {modalType && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div
                className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  {modalType === "embed" ? "Embed Content" : modalType}
                </h3>
                {modalType === "image" ? (
                  <>
                    <div className="border border-dashed border-slate-300 rounded p-4 mb-4 text-center cursor-pointer hover:bg-slate-50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="fileUpload"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                      <label htmlFor="fileUpload" className="cursor-pointer">
                        {file
                          ? file.name
                          : "Click or drag an image here to upload"}
                      </label>
                    </div>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      placeholder="Or enter image URL"
                    />
                  </>
                ) : modalType === "link" ? (
                  <>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      URL (Link)
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded mb-2"
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Display Text
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded mb-4"
                      value={modalDisplayText}
                      onChange={(e) => setModalDisplayText(e.target.value)}
                      placeholder="Click Here"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded mb-4"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder={
                      modalType === "youtube"
                        ? "Enter YouTube URL"
                        : modalType === "audio"
                        ? "Enter Audio URL"
                        : modalType === "embed"
                        ? "Paste Link (Figma, CodePen) or Embed Code"
                        : "Enter URL"
                    }
                  />
                )}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-1 border rounded hover:bg-slate-200"
                    onClick={() => setModalType(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 border rounded bg-indigo-600 text-white"
                    disabled={modalType === "link" && !modalInput}
                    onClick={handleModalConfirm}
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          )}

          {emojiPickerOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg max-w-full max-h-full overflow-auto">
                <Picker
                  data={emojiData}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="px-3 py-1 border rounded hover:bg-slate-200"
                    onClick={() => setEmojiPickerOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <HistoryViewer
          editor={editor}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
        <LivePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          editor={editor}
        />
        <AIChat
          editor={editor}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
        <RightPanel
          editor={editor}
          applyBlockStyles={applyBlockStyles}
          selectedPositions={selectedPositions}
          onPreviewClick={() => setIsPreviewOpen(true)}
        />
      </div>
      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        editor={editor}
        existingSlug={slug}
        initialData={codexData}
      />
    </ThemeProvider>
  );
}


