// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useEditor } from "@tiptap/react";
// import { TextSelection, NodeSelection } from "@tiptap/pm/state";
// import {
//   ChevronRight,
//   ChevronDown,
//   FileText,
//   Type,
//   List,
//   Image,
//   Video,
//   Code,
//   Table,
//   ChevronsRight,
//   Trash2,
//   Eye, // Show Icon
//   EyeOff, // Hide Icon
// } from "lucide-react";

// // ----------------------------------------
// // ১. ইউটিলিটি ফাংশন (Display Name এবং Icon)
// // ----------------------------------------

// // (এই ফাংশনগুলিতে কোনো পরিবর্তন নেই)
// const getDisplayName = (node) => {
//   const nodeType = node.type?.name || node.type;
//   let textContent = node.textContent?.trim() || "";

//   const MAX_CHARS = 20;
//   if (textContent.length > MAX_CHARS)
//     return textContent.substring(0, MAX_CHARS).trim() + "...";
//   if (textContent.length > 0) return textContent;

//   if (node.content) {
//     let text = "";
//     const extractText = (content) => {
//       if (!content) return;
//       if (Array.isArray(content)) content.forEach(extractText);
//       else if (content.text) text += content.text + " ";
//       else if (content.content) extractText(content.content);
//     };
//     extractText(node.content);
//     textContent = text.trim();
//     if (textContent.length > MAX_CHARS)
//       return textContent.substring(0, MAX_CHARS).trim() + "...";
//     if (textContent.length > 0) return textContent;
//   }

//   switch (nodeType) {
//     case "heading":
//       return `Heading ${node.attrs?.level || 1}`;
//     case "paragraph":
//       return "Empty Paragraph";
//     case "image":
//       return "Image Block";
//     case "youtube":
//       return "YouTube Embed";
//     case "codeBlock":
//       return "Code Block";
//     case "table":
//       return "Table Block";
//     case "bulletList":
//     case "orderedList":
//     case "taskList":
//       return "List Block";
//     case "container":
//       return "Container";
//     case "section":
//       return "Section";
//     default:
//       return `[${nodeType}]`;
//   }
// };

// const getNodeIcon = (nodeName) => {
//   switch (nodeName) {
//     case "heading":
//       return <Type size={14} className="text-purple-600" />;
//     case "paragraph":
//       return <FileText size={14} className="text-gray-600" />;
//     case "image":
//       return <Image size={14} className="text-green-600" />;
//     case "youtube":
//       return <Video size={14} className="text-red-600" />;
//     case "codeBlock":
//       return <Code size={14} className="text-yellow-600" />;
//     case "table":
//       return <Table size={14} className="text-blue-600" />;
//     case "bulletList":
//     case "orderedList":
//     case "taskList":
//       return <List size={14} className="text-indigo-600" />;
//     default:
//       return <ChevronsRight size={14} className="text-gray-400" />;
//   }
// };

// // ----------------------------------------
// // ২. LeftPanel কম্পোনেন্ট
// // ----------------------------------------

// const LeftPanel = ({ editor }) => {
//   const [flatStructure, setFlatStructure] = useState([]);
//   const [activeNodeStartPos, setActiveNodeStartPos] = useState(null);
//   const [openSections, setOpenSections] = useState(new Set());

//   // Hover-এর জন্য ফ্ল্যাগ
//   const isHoverUpdate = useRef(false);

//   const toggleSection = (sectionId) => {
//     setOpenSections((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(sectionId)) {
//         newSet.delete(sectionId);
//       } else {
//         newSet.add(sectionId);
//       }
//       return newSet;
//     });
//   };

//   /**
//    * ✅ useEffect: Tiptap স্টেট আপডেট ট্র্যাকিং
//    */
//   useEffect(() => {
//     if (!editor) return;

//     const updateState = () => {
//       if (isHoverUpdate.current) {
//         return;
//       }

//       const doc = editor.state.doc;
//       const { $from } = editor.state.selection;

//       // অ্যাকটিভ নোড পজিশন ট্র্যাকিং
//       const nearestBlockName = $from.parent.type.name;
//       const nearestBlockStartPos = $from.before($from.depth);

//       if (!["doc", "container", "section"].includes(nearestBlockName)) {
//         setActiveNodeStartPos(nearestBlockStartPos);
//       } else {
//         setActiveNodeStartPos(null);
//       }

//       // নোড ট্রাভার্সাল
//       const flatList = [];
//       let sectionCount = 0;

//       doc.descendants((node, pos) => {
//         const nodeName = node.type.name;
//         // 🆕 isHidden স্টেট ট্র্যাকিং
//         const isHidden = node.attrs?.isHidden || false;

//         if (nodeName === "container") {
//           return;
//         }

//         if (nodeName === "section") {
//           sectionCount++;
//           flatList.push({
//             type: "section",
//             name: `Section ${sectionCount}`,
//             id: node.attrs?.id || `sec-temp-${sectionCount}`,
//             pos: pos,
//             content: [],
//           });
//           return;
//         }

//         if (
//           flatList.length > 0 &&
//           node.isBlock &&
//           !["doc", "container", "section", "listItem", "taskItem"].includes(
//             nodeName
//           )
//         ) {
//           const currentSection = flatList[flatList.length - 1];

//           currentSection.content.push({
//             type: nodeName,
//             name: getDisplayName(node),
//             id: node.attrs?.id,
//             pos: pos,
//             nodeSize: node.nodeSize,
//             isHidden: isHidden, // isHidden স্টেট যোগ করা হলো
//           });
//           return false;
//         }
//       });

//       setFlatStructure(flatList);
//     };

//     editor.on("update", updateState);
//     editor.on("selectionUpdate", updateState);
//     updateState();

//     return () => {
//       editor.off("update", updateState);
//       editor.off("selectionUpdate", updateState);
//     };
//   }, [editor]);

//   /**
//    * 🚫 handleNodeToggleHide (Hide/Show টগল) - ফিক্সড
//    * 💡 TypeError ফিক্স করার জন্য নোড ভ্যালিডেশন এবং NodeSelection ব্যবহার করা হয়েছে।
//    */
//   const handleNodeToggleHide = useCallback(
//     (position, currentIsHidden) => {
//       if (!editor) return;

//       // 1. পজিশনে NodeSelection তৈরি এবং প্রয়োগ (এটি নোড সিলেক্ট করে)
//       const tr = editor.state.tr.setSelection(
//         NodeSelection.create(editor.state.doc, position)
//       );
//       editor.view.dispatch(tr);

//       const selectedNode = editor.state.selection.node;

//       // 2. নোড ভ্যালিডেশন: সিলেক্টেড নোড বৈধ কিনা, তা নিশ্চিত করা
//       if (!selectedNode || !selectedNode.type) {
//         console.error(
//           "Invalid node selected for toggling hide/show at position:",
//           position
//         );
//         return;
//       }

//       // 3. অ্যাট্রিবিউট আপডেট করা
//       editor
//         .chain()
//         .focus()
//         .updateAttributes(selectedNode.type.name, {
//           isHidden: !currentIsHidden,
//         })
//         .run();
//     },
//     [editor]
//   );

//   /**
//    * ✅ handleNodeDelete
//    */
//   const handleNodeDelete = useCallback(
//     (position, nodeSize) => {
//       if (!editor) return;

//       const from = position;
//       const to = position + nodeSize;

//       editor.chain().focus().deleteRange({ from, to }).run();

//       if (activeNodeStartPos === position) {
//         setActiveNodeStartPos(null);
//       }
//     },
//     [editor, activeNodeStartPos]
//   );

//   /**
//    * 🚀 handleNodeHover
//    */
//   const handleNodeHover = useCallback(
//     (position, nodeName) => {
//       if (!editor) return;

//       let targetPos = position + 1;
//       const currentSelectionPos = editor.state.selection.from;

//       if (currentSelectionPos === targetPos) {
//         return;
//       }

//       let tr = editor.state.tr;

//       if (
//         [
//           "paragraph",
//           "heading",
//           "bulletList",
//           "orderedList",
//           "taskList",
//         ].includes(nodeName)
//       ) {
//         const selection = TextSelection.create(editor.state.doc, targetPos);
//         tr.setSelection(selection);
//       } else {
//         const selection = NodeSelection.create(editor.state.doc, position);
//         tr.setSelection(selection);
//       }

//       tr.scrollIntoView();

//       isHoverUpdate.current = true;
//       editor.view.dispatch(tr);

//       setTimeout(() => {
//         isHoverUpdate.current = false;
//       }, 0);
//     },
//     [editor]
//   );

//   /**
//    * 🚀 handleNodeClick
//    */
//   const handleNodeClick = useCallback(
//     (position, nodeName, id) => {
//       if (!editor) return;

//       setActiveNodeStartPos(position);

//       let chain = editor.chain().focus();
//       if (
//         [
//           "paragraph",
//           "heading",
//           "bulletList",
//           "orderedList",
//           "taskList",
//         ].includes(nodeName)
//       ) {
//         const targetPos = position + 1;
//         chain = chain.setTextSelection({ from: targetPos, to: targetPos });
//       } else {
//         chain = chain.setNodeSelection(position);
//       }
//       chain.scrollIntoView().run();

//       if (id) {
//         setTimeout(() => {
//           const domElement = document.querySelector(`[data-id="${id}"]`);
//           if (domElement) {
//             domElement.style.transition = "outline 0.3s";
//             domElement.style.outline = "2px solid #3b82f6";
//             domElement.scrollIntoView({ behavior: "smooth", block: "center" });

//             setTimeout(() => {
//               domElement.style.outline = "none";
//             }, 1000);
//           }
//         }, 50);
//       }
//     },
//     [editor]
//   );

//   /**
//    * রেন্ডারিং লজিক (বাটন ডানে স্টিকি করা হয়েছে)
//    */
//   const renderFlatStructure = (flatList) => {
//     return flatList.map((section, secIdx) => {
//       if (section.type !== "section") return null;

//       const sectionId = section.id;
//       const isSectionOpen = openSections.has(sectionId);

//       const sectionHeader = (
//         <div
//           key={`sec-header-${secIdx}`}
//           className="py-1 px-2 text-sm rounded mt-2 font-bold text-blue-800 bg-blue-50 flex items-center gap-1 cursor-pointer"
//           onClick={() => toggleSection(sectionId)}
//         >
//           {isSectionOpen ? (
//             <ChevronDown size={14} />
//           ) : (
//             <ChevronRight size={14} />
//           )}
//           <span className="truncate">{section.name}</span>
//         </div>
//       );

//       let innerContent = null;
//       if (isSectionOpen) {
//         innerContent = section.content.map((contentNode, contentIdx) => {
//           const isActiveNode = activeNodeStartPos === contentNode.pos;
//           const display = contentNode.name;
//           const nodeName = contentNode.type;
//           const isHidden = contentNode.isHidden;

//           let className =
//             "py-1 pl-6 pr-2 text-sm rounded cursor-pointer transition-colors flex items-center gap-2 relative group";
//           className += " text-gray-700 hover:bg-gray-100";

//           if (isActiveNode) {
//             className += " bg-blue-100 ring-2 ring-blue-500 font-medium";
//           }

//           // 🚫 হাইড করা আইটেমের জন্য আলাদা স্টাইল
//           if (isHidden) {
//             className +=
//               " opacity-60 italic text-red-500 border border-dashed border-red-300 bg-red-50 hover:bg-red-100";
//           }

//           return (
//             <div
//               key={`${secIdx}-${contentIdx}`}
//               className={className}
//               onClick={() =>
//                 handleNodeClick(contentNode.pos, nodeName, contentNode.id)
//               }
//               onMouseEnter={() => handleNodeHover(contentNode.pos, nodeName)}
//             >
//               <span className="absolute left-3 top-0 bottom-0 w-px bg-gray-300 group-last:h-1/2 group-last:top-0"></span>
//               <span className="absolute left-3.5 top-1/2 w-2 h-px bg-gray-300"></span>

//               {/* 🚫 আইকন সেট করা */}
//               {isHidden ? (
//                 <EyeOff size={14} className="text-red-600" />
//               ) : (
//                 getNodeIcon(nodeName)
//               )}
//               <span className="truncate max-w-[120px]">{display}</span>

//               {/* ➡️ রাইট সাইড বাটন কন্টেইনার (ml-auto ব্যবহার করে) */}
//               <div className="ml-auto flex items-center gap-1">
//                 {/* 🚫 হাইড/শো বাটন */}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleNodeToggleHide(contentNode.pos, isHidden);
//                   }}
//                   className={`p-1 rounded transition-opacity ${
//                     isHidden ? "hover:bg-green-200" : "hover:bg-yellow-200"
//                   } opacity-0 group-hover:opacity-100`}
//                   title={isHidden ? "Show Block" : "Hide Block"}
//                 >
//                   {isHidden ? (
//                     <Eye size={14} className="text-green-600" />
//                   ) : (
//                     <EyeOff size={14} className="text-yellow-600" />
//                   )}
//                 </button>

//                 {/* 🗑️ ডিলিট বাটন */}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleNodeDelete(contentNode.pos, contentNode.nodeSize);
//                   }}
//                   className="p-1 rounded hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
//                   title="Delete Block"
//                 >
//                   <Trash2 size={14} className="text-red-600" />
//                 </button>
//               </div>
//             </div>
//           );
//         });
//       }

//       return (
//         <div key={`section-block-${secIdx}`}>
//           {sectionHeader}
//           <div className="ml-3">{innerContent}</div>
//         </div>
//       );
//     });
//   };

//   return (
//     <div className="w-64 bg-white border-r h-full overflow-y-auto p-4 flex-shrink-0">
//       <h2 className="text-xl font-bold mb-4 text-gray-800">
//         <ChevronDown size={20} className="inline mr-2" />
//         Document Structure
//       </h2>
//       <div className="space-y-1">
//         {editor && flatStructure.length > 0 ? (
//           renderFlatStructure(flatStructure)
//         ) : (
//           <p className="text-gray-500 text-sm">
//             Add content to the editor to see the structure.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeftPanel;
