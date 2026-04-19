// "use client";

// import { useState } from "react";
// import { Node } from "@tiptap/core";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import HardBreak from "@tiptap/extension-hard-break";
// import { mergeAttributes } from "@tiptap/core";
// import TextStyle from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";
// import Link from "@tiptap/extension-link";
// import Placeholder from "@tiptap/extension-placeholder";
// import TextAlign from "@tiptap/extension-text-align";
// import Underline from "@tiptap/extension-underline";
// import Highlight from "@tiptap/extension-highlight";
// import TipTaskList from "@tiptap/extension-task-list";
// import TipTaskItem from "@tiptap/extension-task-item";
// import TipBulletList from "@tiptap/extension-bullet-list";
// import TipOrderedList from "@tiptap/extension-ordered-list";
// import TipListItem from "@tiptap/extension-list-item";
// import Document from "@tiptap/extension-document";
// import { v4 as uuidv4 } from "uuid";

// import Youtube from "@tiptap/extension-youtube";

// import {
//   Table,
//   TableRow,
//   TableHeader,
//   TableCell,
// } from "@tiptap/extension-table";

// import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
// import { lowlight } from "lowlight/lib/common";
// import js from "highlight.js/lib/languages/javascript";
// import py from "highlight.js/lib/languages/python";
// lowlight.registerLanguage("javascript", js);
// lowlight.registerLanguage("python", py);
// import "highlight.js/styles/atom-one-dark.css";

// import Toolbar from "./Toolbar"; // Assuming you have this
// import LeftPanel from "./LeftPanel"; // Assuming you have this
// import RightPanel from "./RightPanel"; // Assuming you have this

// import Picker from "@emoji-mart/react";
// import emojiData from "@emoji-mart/data";

// import ImageNodeView from "./ImageNodeView"; // Assuming this path
// import Image from "@tiptap/extension-image";
// import Paragraph from "@tiptap/extension-paragraph";
// import Heading from "@tiptap/extension-heading";

// // ----------------------
// // Custom Node Extensions (production-safe with Unique IDs & Styles)
// // ----------------------
// const addStyleAttributes = (parentAttrs = {}) => ({
//   ...parentAttrs,
//   paddingTop: { default: 0 },
//   paddingRight: { default: 0 },
//   paddingBottom: { default: 0 },
//   paddingLeft: { default: 0 },

//   marginTop: { default: 0 },
//   marginRight: { default: 0 },
//   marginBottom: { default: 0 },
//   marginLeft: { default: 0 },

//   textColor: { default: "#000000" },
//   bgColor: { default: "#ffffff" },

//   opacity: { default: 1 },
//   boxShadow: { default: "none" },

//   borderWidth: { default: 0 },
//   borderStyle: { default: "solid" },
//   borderColor: { default: "#000000" },

//   strokeWidth: { default: 0 },
//   strokeColor: { default: "#000000" },
// });

// // ------------------------------------
// // ✅ CustomCodeBlockLowlight
// // ------------------------------------
// const CustomCodeBlockLowlight = CodeBlockLowlight.extend({
//   // -------------------------------------------
//   // ১. অ্যাট্রিবিউট সংজ্ঞা (Attributes Definition)
//   // -------------------------------------------
//   addAttributes() {
//     return {
//       id: {
//         default: () => uuidv4(), // Unique stable ID for LeftPanel
//         parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
//       },
//       // ✅ Border Radius অ্যাট্রিবিউটগুলি
//       borderRadiusTopLeft: { default: 0 },
//       borderRadiusTopRight: { default: 0 },
//       borderRadiusBottomRight: { default: 0 },
//       borderRadiusBottomLeft: { default: 0 },
//       // 🆕 isHidden অ্যাট্রিবিউট যোগ করা হলো
//       isHidden: {
//         default: false,
//         parseHTML: (element) =>
//           element.getAttribute("data-is-hidden") === "true",
//       },
//       // Tiptap এর ভাষা অ্যাট্রিবিউট
//       language: {
//         default: null,
//         parseHTML: (element) =>
//           element.querySelector("code")?.getAttribute("data-language"),
//       },
//       // ✅ রাইট প্যানেলের জন্য স্টাইল অ্যাট্রিবিউট যোগ করা হলো
//       ...addStyleAttributes(this.parent?.()),
//     };
//   },

//   // -------------------------------------------
//   // ২. HTML রেন্ডারিং (HTML Rendering)
//   // -------------------------------------------
//   renderHTML({ node, HTMLAttributes }) {
//     const attrs = node.attrs;

//     // 🆕 হাইডিং লজিক
//     let displayStyle = "";
//     if (attrs.isHidden === true) {
//       displayStyle = "display: none !important;";
//     }

//     // 💡 আপনার কাস্টম স্টাইল লজিক (Code Block-এ সাধারণত Margin/Padding দরকার হয়)
//     const customStyles = `
//       ${displayStyle}
//       /* Spacing */
//       padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
//       margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
      
//       /* Visual Style */
//       background-color: ${attrs.bgColor};
//       opacity: ${attrs.opacity};
//       box-shadow: ${attrs.boxShadow};
      
//       /* Border */
//       border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
      
//       /* ✅ Border Radius স্টাইল যোগ করা হলো */
//       border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//       border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//       border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//       border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
//     `
//       .replace(/\s+/g, " ")
//       .trim();

//     // outer <pre> ট্যাগে স্টাইল এবং data-id যোগ করা হলো
//     const mergedPreAttributes = mergeAttributes(HTMLAttributes, {
//       style: customStyles, // ✅ ফাইনাল স্টাইল যুক্ত করা হলো
//       "data-id": attrs.id, // LeftPanel এর জন্য ID
//       "data-is-hidden": attrs.isHidden ? "true" : undefined,
//     });

//     // <code> ট্যাগ অ্যাট্রিবিউট
//     const codeAttributes = {
//       // Tiptap এর ভাষা অ্যাট্রিবিউট
//       ...(attrs.language ? { "data-language": attrs.language } : {}),
//       class: attrs.language ? `language-${attrs.language}` : null,
//     };

//     return [
//       "pre",
//       mergedPreAttributes,
//       [
//         "code",
//         codeAttributes,
//         0, // 0 মানে এই <code> ট্যাগের ভিতরে কনটেন্ট থাকবে (কোড)
//       ],
//     ];
//   },
// });

// /**
//  * Production-safe Paragraph with Unique ID:
//  */
// // BlogEditor.jsx ফাইল থেকে সম্পূর্ণ আপডেট করা CustomParagraph
// const CustomParagraph = Paragraph.extend({
//   name: "paragraph", // Tiptap-এ Built-in Paragraph নোডকে ওভাররাইড করার জন্য এটি অপরিহার্য

//   // -------------------------------------------
//   // ১. অ্যাট্রিবিউট সংজ্ঞা (Attributes Definition)
//   // -------------------------------------------
//   addAttributes() {
//     return {
//       id: {
//         default: () => uuidv4(), // Stable Unique ID
//         parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
//       },
//       // ✅ Border Radius অ্যাট্রিবিউট যোগ করা হলো
//       borderRadiusTopLeft: { default: 0 },
//       borderRadiusTopRight: { default: 0 },
//       borderRadiusBottomRight: { default: 0 },
//       borderRadiusBottomLeft: { default: 0 },

//       lineHeight: { default: 1.5 },
//       letterSpacing: { default: 0 },

//       // ✅ isHidden অ্যাট্রিবিউট
//       isHidden: {
//         default: false,
//         parseHTML: (element) =>
//           element.getAttribute("data-is-hidden") === "true",
//       },

//       // ✅ TextAlign এক্সটেনশনের জন্য এটি আবশ্যক
//       textAlign: {
//         default: "left", // 'null' এর বদলে 'left' ডিফল্ট ব্যবহার করা নিরাপদ
//         parseHTML: (element) => element.style.textAlign || "left",
//       },

//       // ✅ অন্যান্য স্টাইল অ্যাট্রিবিউট
//       ...addStyleAttributes(this.parent?.()),
//     };
//   },

//   // -------------------------------------------
//   // ২. HTML রেন্ডারিং (HTML Rendering)
//   // -------------------------------------------
//   renderHTML({ node, HTMLAttributes }) {
//     // Tiptap Attributes থেকে অ্যাট্রিবিউট মানগুলি বের করা
//     const attrs = node.attrs;

//     // 🛑 Bug Prevention Logic: CSS স্ট্রিং তৈরি করা
//     const customStyles = `
//         ${attrs.isHidden ? "display: none !important;" : "display: block;"}
        
//         /* Layout & Spacing */
//         line-height: ${attrs.lineHeight};
//         text-align: ${attrs.textAlign || "left"};
//         letter-spacing: ${attrs.letterSpacing}px;

//         padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${
//       attrs.paddingBottom
//     }px ${attrs.paddingLeft}px;
//         margin: ${attrs.marginTop}px ${attrs.marginRight}px ${
//       attrs.marginBottom
//     }px ${attrs.marginLeft}px;

//         /* Visual Style */
//         color: ${attrs.textColor};
//         background-color: ${attrs.bgColor};
//         opacity: ${attrs.opacity};
//         box-shadow: ${attrs.boxShadow};

//         /* Border (Border Radius কাজ করার জন্য এটি অপরিহার্য) */
//         border: ${attrs.borderWidth}px ${attrs.borderStyle} ${
//       attrs.borderColor
//     };
        
//         /* ✅ Border Radius স্টাইল যোগ করা হলো */
//         border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//         border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//         border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//         border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;

//         /* Text Effects */
//         -webkit-text-stroke: ${attrs.strokeWidth}px ${attrs.strokeColor};
//     `
//       .replace(/\s+/g, " ")
//       .trim(); // CSS স্ট্রিংকে ক্লিন করা

//     const mergedAttributes = mergeAttributes(HTMLAttributes, {
//       style: customStyles, // ✅ ফাইনাল স্টাইল
//       "data-id": attrs.id,
//       "data-is-hidden": attrs.isHidden ? "true" : undefined, // isHidden অ্যাট্রিবিউট
//     });

//     return ["p", mergedAttributes, 0];
//   },

//   // -------------------------------------------
//   // ৩. Tiptap কমান্ড (Tiptap Commands)
//   // -------------------------------------------
//   addCommands() {
//     // 🛑 BUG FIX: parent() থেকে ডিফল্ট কমান্ডগুলি নেওয়ার ব্যবস্থা করা হলো
//     const parentCommands = this.parent?.();

//     return {
//       // ✅ ১. ডিফল্ট `setParagraph` কমান্ডটি যুক্ত করা হলো (ত্রুটিমুক্তির জন্য অপরিহার্য)
//       setParagraph:
//         () =>
//         ({ commands }) => {
//           if (parentCommands && parentCommands.setParagraph) {
//             return parentCommands.setParagraph();
//           }
//           // ফলব্যাক হিসেবে setNode ব্যবহার করা হলো
//           return commands.setNode(this.name);
//         },

//       // ✅ ২. Line Height কমান্ড
//       setParagraphLineHeight:
//         (lineHeight) =>
//         ({ commands }) => {
//           if (typeof lineHeight !== "number" || lineHeight <= 0) return false;
//           return commands.updateAttributes(this.name, { lineHeight });
//         },

//       // ✅ ৩. Letter Spacing কমান্ড
//       setParagraphLetterSpacing:
//         (letterSpacing) =>
//         ({ commands }) => {
//           if (letterSpacing === undefined || letterSpacing === null) {
//             letterSpacing = 0; // Null বা Undefined হলে 0 সেট করা হলো
//           }
//           return commands.updateAttributes(this.name, { letterSpacing });
//         },

//       // ✅ ৪. isHidden টগল কমান্ড (যদি আপনি যোগ করতে চান)
//       toggleHidden:
//         () =>
//         ({ commands }) => {
//           return commands.updateAttributes(this.name, {
//             isHidden: !this.options.isHidden,
//           });
//         },

//       // ✅ ৫. অতিরিক্ত বাগ প্রতিরোধ: toggleParagraph কমান্ডও যুক্ত করা হলো
//       toggleParagraph:
//         () =>
//         ({ commands }) => {
//           if (parentCommands && parentCommands.toggleParagraph) {
//             return parentCommands.toggleParagraph();
//           }
//           return commands.toggleNode(this.name, "paragraph", {});
//         },
//     };
//   },
// });

// // ----------------------
// // ১. Custom Heading Node
// // ----------------------
// /**
//  * Production-safe Heading with Unique ID and Hide functionality:
//  */

// const CustomHeading = Heading.extend({
//   // Tiptap Built-in Heading নোডকে ওভাররাইড করার জন্য 'heading' নাম ব্যবহার করা হয়
//   // তবে এটি Tiptap এর কনফিগারেশনের উপর নির্ভর করে। এখানে ডিফল্ট নাম ব্যবহার করা হলো।
//   name: "heading",

//   // -------------------------------------------
//   // ১. অ্যাট্রিবিউট সংজ্ঞা (Attributes Definition)
//   // -------------------------------------------
//   addAttributes() {
//     return {
//       id: {
//         default: () => uuidv4(),
//         parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
//       },
//       // ✅ Border Radius অ্যাট্রিবিউটগুলি
//       borderRadiusTopLeft: { default: 0 },
//       borderRadiusTopRight: { default: 0 },
//       borderRadiusBottomRight: { default: 0 },
//       borderRadiusBottomLeft: { default: 0 },
//       // ✅ addStyleAttributes এর মাধ্যমে Border Radius সহ সব স্টাইল অ্যাট্রিবিউট আসবে
//       ...addStyleAttributes(this.parent?.()),

//       lineHeight: { default: 1.5 },
//       letterSpacing: { default: 0 },

//       isHidden: {
//         default: false,
//         parseHTML: (element) =>
//           element.getAttribute("data-is-hidden") === "true",
//       },

//       // ✅ Heading লেভেল (h1, h2, h3...)
//       level: { default: 1 },

//       // ✅ TextAlign কে ম্যানুয়ালি যোগ করুন যদি addStyleAttributes এ না থাকে
//       textAlign: {
//         default: "left",
//         parseHTML: (element) => element.style.textAlign || "left",
//       },
//     };
//   },

//   // -------------------------------------------
//   // ২. HTML রেন্ডারিং (HTML Rendering)
//   // -------------------------------------------
//   renderHTML({ node, HTMLAttributes }) {
//     // Tiptap Attributes থেকে অ্যাট্রিবিউট মানগুলি বের করা
//     const attrs = node.attrs;
//     const level = attrs.level ?? 1; // অ্যাট্রিবিউট থেকে level নেওয়া

//     // 🛑 Bug Prevention Logic: CSS স্ট্রিং তৈরি করা
//     const customStyles = `
//         ${attrs.isHidden ? "display: none !important;" : ""}
        
//         /* Layout & Spacing */
//         line-height: ${attrs.lineHeight};
//         text-align: ${attrs.textAlign || "left"};
//         letter-spacing: ${attrs.letterSpacing}px;

//         padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${
//       attrs.paddingBottom
//     }px ${attrs.paddingLeft}px;
//         margin: ${attrs.marginTop}px ${attrs.marginRight}px ${
//       attrs.marginBottom
//     }px ${attrs.marginLeft}px;

//         /* Visual Style */
//         color: ${attrs.textColor};
//         background-color: ${attrs.bgColor};
//         opacity: ${attrs.opacity};
//         box-shadow: ${attrs.boxShadow};

//         /* Border */
//         border: ${attrs.borderWidth}px ${attrs.borderStyle} ${
//       attrs.borderColor
//     };
        
//         /* ✅ Border Radius স্টাইল যোগ করা হলো (Paragraph এর মতোই) */
//         border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//         border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//         border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//         border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;

//         /* Text Effects */
//         -webkit-text-stroke: ${attrs.strokeWidth}px ${attrs.strokeColor};
//     `
//       .replace(/\s+/g, " ")
//       .trim(); // CSS স্ট্রিংকে ক্লিন করা

//     const mergedAttributes = mergeAttributes(HTMLAttributes, {
//       style: customStyles, // ✅ ফাইনাল স্টাইল
//       "data-id": attrs.id,
//       "data-is-hidden": attrs.isHidden ? "true" : undefined, // isHidden অ্যাট্রিবিউট
//     });

//     return [`h${level}`, mergedAttributes, 0];
//   },

//   // -------------------------------------------
//   // ৩. Tiptap কমান্ড (Tiptap Commands)
//   // -------------------------------------------
//   addCommands() {
//     return {
//       // ✅ Line Height কমান্ড
//       setHeadingLineHeight:
//         (lineHeight) =>
//         ({ commands }) => {
//           if (typeof lineHeight !== "number" || lineHeight <= 0) return false;
//           return commands.updateAttributes(this.name, { lineHeight });
//         },

//       // ✅ Letter Spacing কমান্ড
//       setHeadingLetterSpacing:
//         (letterSpacing) =>
//         ({ commands }) => {
//           if (letterSpacing === undefined || letterSpacing === null) {
//             letterSpacing = 0; // Null বা Undefined হলে 0 সেট করা হলো
//           }
//           return commands.updateAttributes(this.name, { letterSpacing });
//         },

//       // ✅ Level পরিবর্তন করার ডিফল্ট কমান্ড বজায় রাখুন
//       setLevel:
//         (level) =>
//         ({ commands }) => {
//           return commands.updateAttributes(this.name, { level });
//         },
//     };
//   },
// });

// const CustomImage = Image.extend({
//   // Tiptap এর NodeView ব্যবহার করলে এই renderHTML-টি আসলে ব্যবহৃত হয় না,
//   // তবে এটি JSON/HTML রেন্ডারিং এবং RightPanel সিঙ্ক্রোনাইজেশনের জন্য অপরিহার্য।
//   addAttributes() {
//     return {
//       id: {
//         default: () => uuidv4(),
//       },
//       // ✅ Border Radius অ্যাট্রিবিউটগুলি
//       borderRadiusTopLeft: { default: 0 },
//       borderRadiusTopRight: { default: 0 },
//       borderRadiusBottomRight: { default: 0 },
//       borderRadiusBottomLeft: { default: 0 },
//       // ✅ isHidden অ্যাট্রিবিউট যোগ করা হয়েছে
//       isHidden: {
//         default: false,
//         parseHTML: (element) =>
//           element.getAttribute("data-is-hidden") === "true",
//       },
//       // ✅ addStyleAttributes থেকে Border Radius সহ সব স্টাইল অ্যাট্রিবিউট আসবে
//       ...addStyleAttributes(this.parent?.()),

//       src: {},
//       width: { default: 300 },
//       height: { default: 200 },
//       textAlign: { default: "center" },
//     };
//   },

//   // ... addNodeView অপরিবর্তিত ...

//   renderHTML({ node, HTMLAttributes }) {
//     // Tiptap Attributes থেকে অ্যাট্রিবিউট মানগুলি বের করা
//     const attrs = node.attrs;

//     // 🆕 হাইডিং লজিক
//     let displayStyle = "";
//     if (attrs.isHidden === true) {
//       displayStyle = "display: none !important;"; // !important যোগ করা হয়েছে
//       // data-is-hidden অ্যাট্রিবিউটটি main wrapper div-এ যোগ হবে
//     }

//     // Wrapper Style এ displayStyle যুক্ত করা হলো
//     // (Note: Image কে Center/Left/Right করার জন্য text-align Wrapper-এই থাকতে হবে)
//     const wrapperStyle = `
//         text-align: ${attrs.textAlign || "center"};
//         color: ${attrs.textColor};
//         background-color: ${attrs.bgColor};
//         -webkit-text-stroke: ${attrs.strokeWidth}px ${attrs.strokeColor};
//         ${displayStyle} /* <-- হাইডিং স্টাইল এখানে যুক্ত */
//     `
//       .replace(/\s+/g, " ")
//       .trim();

//     // 🛑 imgStyle: img ট্যাগের মূল স্টাইল। Border Radius এখানে যুক্ত হবে।
//     const imgStyle = `
//         width: ${attrs.width}px;
//         height: ${attrs.height}px;
//         padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
//         margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
//         opacity: ${attrs.opacity};
//         box-shadow: ${attrs.boxShadow};
//         border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        
//         /* ✅ Border Radius স্টাইল যোগ করা হলো */
//         border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//         border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//         border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//         border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
        
//         display: inline-block;
//     `
//       .replace(/\s+/g, " ")
//       .trim();

//     // Tiptap এর ডিফল্ট অ্যাট্রিবিউটগুলি মার্জ করা
//     const mergedAttributes = mergeAttributes(HTMLAttributes, {
//       style: wrapperStyle, // ✅ Wrapper Style
//       "data-id": attrs.id,
//       "data-is-hidden": attrs.isHidden ? "true" : undefined,
//     });

//     // 🛑 NodeView ব্যবহার করা হলে, এই আউটপুটটি শুধুমাত্র সিরিয়ালাইজেশনের জন্য ব্যবহৃত হয়।
//     // আপনার addNodeView ফাংশনটি যেন এই অ্যাট্রিবিউটগুলি (বিশেষ করে Border Radius) ব্যবহার করে, তা নিশ্চিত করুন।
//     return [
//       "div",
//       mergedAttributes, // Wrapper Div অ্যাট্রিবিউট
//       [
//         "img",
//         {
//           src: attrs.src, // src অ্যাট্রিবিউট
//           style: imgStyle, // ✅ Image স্টাইল (Border Radius সহ)
//         },
//       ],
//     ];
//   },
//   // isLeaf: true, selectable: true এই প্রপার্টিগুলি এখানে নয়, বরং Node.create() এ থাকতে পারে
//   // অথবা addNodeView() এর NodeView কনফিগারেশনে সেট করা থাকতে পারে।
// });

// // ----------------------
// // ৩. Custom Container & Section Nodes
// // ----------------------

// // 🚫 Container Node: এটি শুধুমাত্র Section ব্লকগুলি ধারণ করে।
// const Container = Node.create({
//   name: "container",
//   group: "block",
//   content: "section+",

//   addAttributes() {
//     return {
//       id: { default: () => uuidv4() }, // Unique ID for LeftPanel
//     };
//   },

//   parseHTML() {
//     return [{ tag: "div[data-type='container']" }];
//   },

//   renderHTML({ HTMLAttributes }) {
//     return [
//       "div",
//       {
//         "data-type": "container",
//         class: "editor-container",
//         "data-id": HTMLAttributes.id,
//       },
//       0,
//     ];
//   },
// });

// // ✅ Section Node: এখন হাইড করা যাবে।
// const Section = Node.create({
//   name: "section",
//   group: "block",
//   content: "block+",
//   defining: true,

//   addAttributes() {
//     return {
//       id: { default: () => uuidv4() }, // Unique ID for LeftPanel
//       // ✅ Border Radius অ্যাট্রিবিউটগুলি
//       borderRadiusTopLeft: { default: 0 },
//       borderRadiusTopRight: { default: 0 },
//       borderRadiusBottomRight: { default: 0 },
//       borderRadiusBottomLeft: { default: 0 },
//       // 🆕 isHidden অ্যাট্রিবিউট যোগ করা হলো
//       isHidden: {
//         default: false,
//         parseHTML: (element) =>
//           element.getAttribute("data-is-hidden") === "true",
//       },

//       // ✅ Section-এও স্টাইল অ্যাট্রিবিউট যোগ করা হলো
//       // এর মধ্যেই Border Radius অ্যাট্রিবিউটগুলি থাকার কথা।
//       ...addStyleAttributes(this.parent?.()),
//     };
//   },

//   parseHTML() {
//     return [{ tag: "div[data-type='section']" }];
//   },

//   renderHTML({ node, HTMLAttributes }) {
//     // Tiptap Attributes থেকে অ্যাট্রিবিউট মানগুলি বের করা
//     const attrs = node.attrs;

//     // 🆕 হাইডিং লজিক
//     let displayStyle = "";
//     if (attrs.isHidden === true) {
//       displayStyle = "display: none !important;"; // !important ব্যবহার করা হয়েছে
//     }

//     // ✅ Section-এর জন্য কাস্টম স্টাইল
//     const customStyles = `
//         /* Display */
//         ${displayStyle}
        
//         /* Spacing */
//         padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
//         margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;
        
//         /* Visual Style */
//         background-color: ${attrs.bgColor};
//         opacity: ${attrs.opacity};
//         box-shadow: ${attrs.boxShadow};
        
//         /* Border */
//         border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        
//         /* ✅ Border Radius স্টাইল যোগ করা হলো */
//         border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//         border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//         border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//         border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
//     `
//       .replace(/\s+/g, " ")
//       .trim(); // CSS স্ট্রিংকে ক্লিন করা

//     const mergedAttributes = mergeAttributes(HTMLAttributes, {
//       "data-type": "section",
//       class: "editor-section",
//       "data-id": attrs.id,
//       "data-is-hidden": attrs.isHidden ? "true" : undefined, // isHidden অ্যাট্রিবিউট
//       style: customStyles, // ✅ ফাইনাল স্টাইল যুক্ত করা হলো
//     });

//     return ["div", mergedAttributes, 0];
//   },

//   addKeyboardShortcuts() {
//     return {
//       Enter: () => {
//         return this.editor.chain().focus().splitBlock().run();
//       },

//       "Alt-Enter": () => {
//         const { state, view } = this.editor;
//         const { $from } = state.selection;

//         let sectionDepth = null;
//         for (let d = $from.depth; d > 0; d--) {
//           if ($from.node(d).type.name === "section") {
//             sectionDepth = d;
//             break;
//           }
//         }

//         if (sectionDepth !== null) {
//           const posAfterSection = $from.after(sectionDepth);
//           const newSection = state.schema.nodes.section.create(
//             {},
//             state.schema.nodes.paragraph.create()
//           );

//           const tr = state.tr.insert(posAfterSection, newSection);
//           view.dispatch(tr);

//           this.editor.commands.setTextSelection(posAfterSection + 2);
//           this.editor.commands.focus();

//           return true; // prevents default <br>
//         }

//         return false; // fallback
//       },
//     };
//   },
// });

// // ----------------------
// // ৪. List Extensions with Hide functionality
// // ----------------------

// // আপনার বর্তমান লিস্ট তৈরির ফাংশন:
// const createListExtension = (BaseExtension, tagName) => {
//   return BaseExtension.extend({
//     // -------------------------------------------
//     // ১. অ্যাট্রিবিউট সংজ্ঞা (Attributes Definition)
//     // -------------------------------------------
//     addAttributes() {
//       return {
//         id: {
//           default: () => uuidv4(),
//           parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
//         },
//         // ✅ Border Radius অ্যাট্রিবিউটগুলি
//         borderRadiusTopLeft: { default: 0 },
//         borderRadiusTopRight: { default: 0 },
//         borderRadiusBottomRight: { default: 0 },
//         borderRadiusBottomLeft: { default: 0 },
//         isHidden: {
//           default: false,
//           parseHTML: (element) =>
//             element.getAttribute("data-is-hidden") === "true",
//         },
//         // ✅ লিস্টেও সব স্টাইল অ্যাট্রিবিউট যোগ করা হলো (Margin, Padding, Border, Border Radius, BG Color)
//         ...addStyleAttributes(this.parent?.()),
//       };
//     },

//     // -------------------------------------------
//     // ২. HTML রেন্ডারিং (HTML Rendering)
//     // -------------------------------------------
//     renderHTML({ node, HTMLAttributes }) {
//       // Tiptap Attributes থেকে অ্যাট্রিবিউট মানগুলি বের করা
//       const attrs = node.attrs;

//       // 🆕 হাইডিং লজিক
//       let displayStyle = "";
//       if (attrs.isHidden === true) {
//         displayStyle = "display: none !important;";
//         // HTMLAttributes["data-is-hidden"] = "true"; // NodeView থাকলে এটি এখানে না দিলেও চলে, mergeAttributes-এ যুক্ত হবে
//       }

//       // ✅ লিস্টের জন্য কাস্টম স্টাইল (Border, Background Color, Padding এবং Border Radius যুক্ত হলো)
//       const customStyles = `
//         /* Display & Opacity */
//         ${displayStyle}
//         opacity: ${attrs.opacity};
        
//         /* Spacing */
//         padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
//         margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;

//         /* Visual Style */
//         background-color: ${attrs.bgColor};
//         box-shadow: ${attrs.boxShadow};

//         /* Border (List এর জন্য) */
//         border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        
//         /* ✅ Border Radius স্টাইল যোগ করা হলো */
//         border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//         border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//         border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//         border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
//       `
//         .replace(/\s+/g, " ")
//         .trim();

//       const mergedAttributes = mergeAttributes(HTMLAttributes, {
//         "data-id": attrs.id,
//         "data-is-hidden": attrs.isHidden ? "true" : undefined,
//         style: customStyles, // ✅ ফাইনাল স্টাইল স্ট্রিং পাস করা হলো
//       });

//       return [
//         tagName, // ul বা ol
//         mergedAttributes,
//         0,
//       ];
//     },
//   });
// };

// // BulletList
// const BulletList = createListExtension(TipBulletList, "ul");

// // OrderedList
// const OrderedList = createListExtension(TipOrderedList, "ol");

// // TaskList
// const TaskList = createListExtension(TipTaskList, "ul");

// // ListItem (ListItem-এ স্টাইল দরকার নেই, কারণ এটি Parent List Node থেকে আসে)
// const ListItem = TipListItem.extend({
//   addAttributes() {
//     return {
//       id: { default: () => uuidv4() },
//     };
//   },
//   renderHTML({ HTMLAttributes }) {
//     return ["li", { "data-id": HTMLAttributes.id }, 0];
//   },
// });

// // TaskItem (TaskItem-এ স্টাইল দরকার নেই, কারণ এটি Parent List Node থেকে আসে)
// const TaskItem = TipTaskItem.extend({
//   // -------------------------------------------
//   // ১. অ্যাট্রিবিউট সংজ্ঞা (Attributes Definition)
//   // -------------------------------------------
//   addAttributes() {
//     return {
//       id: {
//         default: () => uuidv4(),
//         parseHTML: (element) => element.getAttribute("data-id") || uuidv4(),
//       },
//       // ✅ Border Radius অ্যাট্রিবিউটগুলি
//       borderRadiusTopLeft: { default: 0 },
//       borderRadiusTopRight: { default: 0 },
//       borderRadiusBottomRight: { default: 0 },
//       borderRadiusBottomLeft: { default: 0 },
//       // isChecked অ্যাট্রিবিউট Tiptap ডিফল্টভাবে নিজেই হ্যান্ডেল করে।

//       // ✅ সব স্টাইল অ্যাট্রিবিউট যোগ করা হলো
//       ...addStyleAttributes(this.parent?.()),
//     };
//   },

//   // -------------------------------------------
//   // ২. HTML রেন্ডারিং (HTML Rendering)
//   // -------------------------------------------
//   renderHTML({ node, HTMLAttributes }) {
//     // Tiptap Attributes থেকে অ্যাট্রিবিউট মানগুলি বের করা
//     const attrs = node.attrs;

//     // ✅ Task Item এর জন্য কাস্টম স্টাইল
//     const customStyles = `
//         /* Spacing */
//         padding: ${attrs.paddingTop}px ${attrs.paddingRight}px ${attrs.paddingBottom}px ${attrs.paddingLeft}px;
//         margin: ${attrs.marginTop}px ${attrs.marginRight}px ${attrs.marginBottom}px ${attrs.marginLeft}px;

//         /* Visual Style */
//         color: ${attrs.textColor};
//         background-color: ${attrs.bgColor};
//         opacity: ${attrs.opacity};
//         box-shadow: ${attrs.boxShadow};
        
//         /* Border */
//         border: ${attrs.borderWidth}px ${attrs.borderStyle} ${attrs.borderColor};
        
//         /* ✅ Border Radius স্টাইল যোগ করা হলো */
//         border-top-left-radius: ${attrs.borderRadiusTopLeft}px;
//         border-top-right-radius: ${attrs.borderRadiusTopRight}px;
//         border-bottom-right-radius: ${attrs.borderRadiusBottomRight}px;
//         border-bottom-left-radius: ${attrs.borderRadiusBottomLeft}px;
//     `
//       .replace(/\s+/g, " ")
//       .trim();

//     const mergedAttributes = mergeAttributes(HTMLAttributes, {
//       "data-id": attrs.id,
//       // TaskItem এর checked অ্যাট্রিবিউট Tiptap-এর ডিফল্ট অ্যাট্রিবিউট থেকে আসে
//       "data-checked": attrs.checked ? "true" : "false",
//       class: "task-list-item", // বা আপনার প্রয়োজনীয় ক্লাস
//       style: customStyles, // ✅ ফাইনাল স্টাইল স্ট্রিং পাস করা হলো
//     });

//     // 0 মানে হলো এই নোডের কনটেন্ট, যা List Item এর ভিতরে থাকে
//     return ["li", mergedAttributes, 0];
//   },
// });
// // ----------------------
// // Main Component
// // ----------------------

// export default function BlogEditor() {
//   const [modalType, setModalType] = useState(null);
//   const [modalInput, setModalInput] = useState("");
//   const [modalDisplayText, setModalDisplayText] = useState("");
//   const [file, setFile] = useState(null);
//   const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

//   const editor = useEditor({
//     immediatelyRender: false,
//     extensions: [
//       Document.extend({
//         content: "container",
//       }),
//       // Section is defined above and needs to be included before StarterKit in case of conflicts
//       Section,

//       // StarterKit with conflicting nodes disabled
//       StarterKit.configure({
//         paragraph: false,
//         document: false,
//         heading: false,
//         codeBlock: false, // ডিফল্ট codeBlock নিষ্ক্রিয়
//         bulletList: false, // Disabled to use custom BulletList
//         orderedList: false, // Disabled to use custom OrderedList
//         listItem: false, // Disabled to use custom ListItem
//         taskList: false, // Disabled to use custom TaskList
//         taskItem: false, // Disabled to use custom TaskItem
//       }),
//       Heading,

//       // Our custom container + section
//       Container,
//       Section,

//       // Hard break to insert <br>
//       HardBreak,
//       CustomHeading,
//       // Custom nodes with unique IDs:
//       CustomParagraph, // ✅ এখানে ফিক্স করা এক্সটেনশনটি ব্যবহার করা হচ্ছে
//       CustomHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
//       CustomImage.extend({
//         addNodeView: () => ImageNodeView, // NodeView ব্যবহার করা
//       }),

//       // ✅ ফিক্সড কোড ব্লক এক্সটেনশন: CustomCodeBlockLowlight ব্যবহার করা হলো
//       CustomCodeBlockLowlight.configure({ lowlight }),

//       // Custom list extensions with unique IDs
//       BulletList.configure({ keepMarks: true, keepAttributes: false }),
//       OrderedList.configure({ keepMarks: true, keepAttributes: false }),
//       ListItem,
//       TaskList, // Using custom TaskList
//       TaskItem, // Using custom TaskItem

//       // Other extensions (unchanged behavior)
//       TextStyle,
//       Color,
//       Link.configure({
//         openOnClick: false,
//         autolink: false, // Turned off to prevent interference
//       }),
//       Placeholder.configure({ placeholder: "Start writing..." }),
//       TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
//       Underline,
//       Highlight,
//       Youtube.configure({ controls: true, allowFullscreen: true }),
//       Table.configure({ resizable: true }),
//       TableRow,
//       TableHeader,
//       TableCell,
//     ],

//     // 💡 Initial content
//     content: {
//       type: "doc",
//       content: [
//         {
//           type: "container",
//           content: [
//             {
//               type: "section",
//               content: [{ type: "paragraph" }],
//             },
//           ],
//         },
//       ],
//     },

//     editorProps: {
//       attributes: {
//         class: "tiptap text-black max-w-full focus:outline-none",
//       },
//     },
//   });

//   if (!editor) return null;

//   // Utility: find current section node and its positions
//   const findCurrentSection = () => {
//     const { state } = editor;
//     const { $from } = state.selection;
//     for (let depth = $from.depth; depth > 0; depth--) {
//       const node = $from.node(depth);
//       if (node.type.name === "section") {
//         const start = $from.before(depth);
//         return { node, depth, start, size: node.nodeSize };
//       }
//     }
//     return null;
//   };

//   // Section operations
//   const insertSectionAfter = (pos) => {
//     editor
//       .chain()
//       .focus()
//       .insertContentAt(pos, {
//         type: "section",
//         content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
//       })
//       .run();
//   };

//   const deleteCurrentSection = () => {
//     const found = findCurrentSection();
//     if (!found) return;
//     const { start, size } = found;
//     editor
//       .chain()
//       .focus()
//       .deleteRange(start, start + size)
//       .run();
//   };

//   const duplicateCurrentSection = () => {
//     const found = findCurrentSection();
//     if (!found) return;
//     const { start, size, node } = found;
//     const json = node.toJSON();
//     // insert after
//     editor
//       .chain()
//       .focus()
//       .insertContentAt(start + size, json)
//       .run();
//   };

//   const moveSectionUp = () => {
//     const found = findCurrentSection();
//     if (!found) return;
//     const { start, size } = found;

//     if (start === 0) return;

//     // find previous section start
//     const { state } = editor;
//     let prevStart = null;
//     state.doc.descendants((node, pos) => {
//       if (node.type.name === "section" && pos < start) prevStart = pos;
//     });
//     if (prevStart === null) return;

//     const slice = state.doc.slice(start, start + size);
//     // Deleting then inserting a slice preserves the nodes (and their IDs) for the move
//     editor
//       .chain()
//       .focus()
//       .deleteRange(start, start + size)
//       .insertContentAt(prevStart, slice.content.toJSON())
//       .run();
//   };

//   const moveSectionDown = () => {
//     const found = findCurrentSection();
//     if (!found) return;
//     const { start, size } = found;

//     const { state } = editor;
//     let nextStart = null;
//     // Find the start of the next section
//     state.doc.descendants((node, pos) => {
//       if (node.type.name === "section" && pos > start && nextStart === null)
//         nextStart = pos;
//     });
//     if (nextStart === null) return;

//     const slice = state.doc.slice(start, start + size);
//     // delete current and insert after next section (adjusting position)
//     const nextNode = state.doc.nodeAt(nextStart);
//     const insertPos = nextStart + nextNode.nodeSize;

//     // Deleting then inserting a slice preserves the nodes (and their IDs) for the move
//     editor
//       .chain()
//       .focus()
//       .deleteRange(start, start + size)
//       // Insert position is adjusted because the deletion of the current node shifts positions
//       .insertContentAt(insertPos - size, slice.content.toJSON())
//       .run();
//   };

//   const openModal = (type) => {
//     setModalType(type);
//     setModalInput("");
//     setModalDisplayText("");
//     setFile(null);
//   };

//   const openEmojiPicker = () => setEmojiPickerOpen(true);

//   // --------------------------
//   // FIXED LINK INSERTION FUNCTION
//   // --------------------------
//   const handleLinkInsert = (displayText, url) => {
//     if (!editor || !url) return;

//     // Check if user currently has text highlighted/selected
//     const selection = editor.state.selection;
//     const isTextSelected = !selection.empty;

//     // Case 1: Text is already selected
//     if (isTextSelected) {
//       editor
//         .chain()
//         .focus()
//         .extendMarkRange("link")
//         .setLink({ href: url, target: "_blank" })
//         .run();
//     } else {
//       // Case 2: No text selected. We insert new text with a link mark.
//       const textToDisplay = displayText || url; // Fallback to URL if display text is empty

//       editor
//         .chain()
//         .focus()
//         .insertContent({
//           type: "text",
//           text: textToDisplay,
//           marks: [
//             {
//               type: "link",
//               attrs: {
//                 href: url,
//                 target: "_blank",
//               },
//             },
//           ],
//         })
//         .run();
//     }
//   };

//   const handleModalConfirm = () => {
//     const initialWidth = 300;
//     const initialHeight = 200;

//     if (modalType === "image") {
//       if (file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           editor
//             .chain()
//             .focus()
//             .setImage({
//               src: e.target.result,
//               width: initialWidth,
//               height: initialHeight,
//               textAlign: "center",
//             })
//             .run();
//         };
//         reader.readAsDataURL(file);
//       } else if (modalInput) {
//         editor
//           .chain()
//           .focus()
//           .setImage({
//             src: modalInput,
//             width: initialWidth,
//             height: initialHeight,
//             textAlign: "center",
//           })
//           .run();
//       }
//     }

//     if (modalType === "link") {
//       if (modalInput) {
//         handleLinkInsert(modalDisplayText, modalInput);
//       }
//     }

//     if (modalType === "youtube") {
//       if (!modalInput) return;

//       editor
//         .chain()
//         .focus()
//         .insertContent({
//           type: "youtube",
//           attrs: {
//             src: modalInput,
//             width: 640,
//             height: 360,
//           },
//         })
//         .run();
//     }

//     setModalType(null);
//   };

//   const handleEmojiSelect = (emoji) => {
//     editor.chain().focus().insertContent(emoji.native).run();
//     setEmojiPickerOpen(false);
//   };

//   /**
//    * RightPanel থেকে Margin/Padding/Style Attributes আপডেট করার জন্য কমন ফাংশন।
//    * @param {object} selectedNode - বর্তমানে নির্বাচিত নোড (RightPanel থেকে আসা)
//    * @param {object} updatedMargin - নতুন Margin মান
//    * @param {object} updatedPadding - নতুন Padding মান
//    * @param {object} updatedStyles - অন্যান্য স্টাইল অ্যাট্রিবিউট
//    */
//   const applyBlockStyles = (
//     selectedNode,
//     updatedMargin,
//     updatedPadding,
//     updatedStyles = {}
//   ) => {
//     if (!selectedNode || !editor) return;

//     // সম্মিলিত অ্যাট্রিবিউট অবজেক্ট
//     const attributesToUpdate = {
//       // Margin/Padding
//       marginTop: updatedMargin.top,
//       marginRight: updatedMargin.right,
//       marginBottom: updatedMargin.bottom,
//       marginLeft: updatedMargin.left,

//       paddingTop: updatedPadding.top,
//       paddingRight: updatedPadding.right,
//       paddingBottom: updatedPadding.bottom,
//       paddingLeft: updatedPadding.left,

//       // Other Styles (RightPanel-এর handleStyleChange কল হলে এটি ব্যবহৃত হবে)
//       ...updatedStyles,
//     };

//     // RightPanel-এ Text Alignment হ্যান্ডলিং-এর জন্য editor.commands.setTextAlign ব্যবহার করা হয়েছে।
//     // এখানে শুধু স্পেসিং/স্টাইল অ্যাট্রিবিউটগুলো আপডেট করা হবে।
//     editor
//       .chain()
//       .focus()
//       .updateAttributes(selectedNode.type.name, attributesToUpdate)
//       .run();
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <LeftPanel editor={editor} />
//       <div
//         className="flex-1 relative p-4 bg-white overflow-y-auto"
//         onClick={() => editor.commands.focus()}
//       >
//         <Toolbar
//           editor={editor}
//           openModal={openModal}
//           openEmojiPicker={openEmojiPicker}
//           // exposing some section operations for toolbar integration (if toolbar uses them)
//           deleteSection={deleteCurrentSection}
//           duplicateSection={duplicateCurrentSection}
//           moveSectionUp={moveSectionUp}
//           moveSectionDown={moveSectionDown}
//         />
//         <EditorContent editor={editor} className="min-h-full h-full" />

//         {/* Modals */}
//         {modalType && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div
//               className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h3 className="text-lg font-semibold mb-4 capitalize">
//                 {modalType}
//               </h3>

//               {modalType === "image" ? (
//                 <>
//                   <div className="border border-dashed border-gray-300 rounded p-4 mb-4 text-center cursor-pointer hover:bg-gray-50">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       id="fileUpload"
//                       onChange={(e) => setFile(e.target.files[0])}
//                     />
//                     <label htmlFor="fileUpload" className="cursor-pointer">
//                       {file
//                         ? file.name
//                         : "Click or drag an image here to upload"}
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     className="w-full border px-3 py-2 rounded"
//                     value={modalInput}
//                     onChange={(e) => setModalInput(e.target.value)}
//                     placeholder="Or enter image URL"
//                   />
//                 </>
//               ) : modalType === "link" ? (
//                 <>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     URL (Link)
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full border px-3 py-2 rounded mb-2"
//                     value={modalInput}
//                     onChange={(e) => setModalInput(e.target.value)}
//                     placeholder="https://example.com"
//                   />
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Display Text
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full border px-3 py-2 rounded mb-4"
//                     value={modalDisplayText}
//                     onChange={(e) => setModalDisplayText(e.target.value)}
//                     placeholder="Click Here"
//                   />
//                 </>
//               ) : (
//                 <input
//                   type="text"
//                   className="w-full border px-3 py-2 rounded mb-4"
//                   value={modalInput}
//                   onChange={(e) => setModalInput(e.target.value)}
//                   placeholder="Enter YouTube URL"
//                 />
//               )}

//               <div className="flex justify-end gap-2">
//                 <button
//                   className="px-3 py-1 border rounded hover:bg-gray-200"
//                   onClick={() => setModalType(null)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-3 py-1 border rounded bg-blue-500 text-white"
//                   disabled={modalType === "link" && !modalInput}
//                   onClick={handleModalConfirm}
//                 >
//                   Insert
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Emoji Picker */}
//         {emojiPickerOpen && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white p-4 rounded-lg shadow-lg max-w-full max-h-full overflow-auto">
//               <Picker
//                 data={emojiData}
//                 onEmojiSelect={handleEmojiSelect}
//                 theme="light"
//               />
//               <div className="flex justify-end mt-2">
//                 <button
//                   className="px-3 py-1 border rounded hover:bg-gray-200"
//                   onClick={() => setEmojiPickerOpen(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//       {/* ✅ RightPanel কম্পোনেন্ট এখানে যুক্ত করা হয়েছে */}
//       <RightPanel editor={editor} applyBlockStyles={applyBlockStyles} />
//     </div>
//   );
// }
