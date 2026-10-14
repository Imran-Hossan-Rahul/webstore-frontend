// "use client";

// import { useState, useEffect } from "react";

// export default function RightPanel({ editor, applyBlockStyles }) {
//   const [selectedNode, setSelectedNode] = useState(null);

//   // Image controls
//   const [imageWidth, setImageWidth] = useState(300);
//   const [imageHeight, setImageHeight] = useState(200);
//   const [imageAlign, setImageAlign] = useState("center");

//   // Padding (4 way)
//   const [padding, setPadding] = useState({
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//   });

//   // Margin (4 way)
//   const [margin, setMargin] = useState({
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//   });

//   if (!editor) return null;

//   // -----------------------------
//   // Read Selected Node Data
//   // -----------------------------
//   useEffect(() => {
//     const updateSelection = () => {
//       const { selection } = editor.state;
//       const node = selection.node || selection.$from.parent;

//       if (!node) {
//         setSelectedNode(null);
//         return;
//       }

//       setSelectedNode(node);

//       // Read image attributes
//       if (node.type.name === "image") {
//         setImageWidth(node.attrs.width || 300);
//         setImageHeight(node.attrs.height || 200);
//         setImageAlign(node.attrs.textAlign || "center");
//       }

//       // Read padding 4-way
//       setPadding({
//         top: node.attrs.paddingTop ?? 0,
//         right: node.attrs.paddingRight ?? 0,
//         bottom: node.attrs.paddingBottom ?? 0,
//         left: node.attrs.paddingLeft ?? 0,
//       });

//       // Read margin 4-way
//       setMargin({
//         top: node.attrs.marginTop ?? 0,
//         right: node.attrs.marginRight ?? 0,
//         bottom: node.attrs.marginBottom ?? 0,
//         left: node.attrs.marginLeft ?? 0,
//       });
//     };

//     editor.on("selectionUpdate", updateSelection);
//     return () => editor.off("selectionUpdate", updateSelection);
//   }, [editor]);

//   // ------------------------------
//   // Reusable UI Input Component
//   // ------------------------------
//   const InputBox = ({ label, value, onChange }) => (
//     <div className="flex flex-col items-center">
//       <span className="text-sm font-medium mb-1">{label}</span>
//       <input
//         type="number"
//         className="w-16 border px-2 py-1 rounded text-center"
//         value={value}
//         min={0}
//         onChange={(e) => onChange(parseInt(e.target.value) || 0)}
//       />
//     </div>
//   );

//   if (!selectedNode) {
//     return (
//       <div className="w-72 border-l bg-white p-4 h-screen sticky top-0 overflow-y-auto shadow-inner">
//         <p className="text-slate-500">Select a block to customize</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-72 border-l bg-white p-4 h-screen sticky top-0 overflow-y-auto shadow-inner">
//       <h2 className="text-lg font-semibold mb-4 capitalize border-b pb-2">
//         {selectedNode.type.name} Settings
//       </h2>

//       {/* --------------------------- */}
//       {/* IMAGE SETTINGS */}
//       {/* --------------------------- */}
//       {selectedNode.type.name === "image" && (
//         <>
//           {/* Width */}
//           <div className="mb-4">
//             <label>Image Width</label>
//             <input
//               type="number"
//               value={imageWidth}
//               min={50}
//               className="w-full border px-3 py-1 rounded"
//               onChange={(e) => {
//                 const w = parseInt(e.target.value) || 0;
//                 setImageWidth(w);
//                 editor
//                   .chain()
//                   .focus()
//                   .updateAttributes("image", { width: w })
//                   .run();
//               }}
//             />
//           </div>

//           {/* Height */}
//           <div className="mb-4">
//             <label>Image Height</label>
//             <input
//               type="number"
//               value={imageHeight}
//               min={50}
//               className="w-full border px-3 py-1 rounded"
//               onChange={(e) => {
//                 const h = parseInt(e.target.value) || 0;
//                 setImageHeight(h);
//                 editor
//                   .chain()
//                   .focus()
//                   .updateAttributes("image", { height: h })
//                   .run();
//               }}
//             />
//           </div>

//           {/* Alignment */}
//           <div className="mb-4">
//             <label>Alignment</label>
//             <div className="flex gap-2 mt-2">
//               {["left", "center", "right"].map((align) => (
//                 <button
//                   key={align}
//                   className={`px-3 py-1 border rounded ${
//                     imageAlign === align ? "bg-slate-300" : ""
//                   }`}
//                   onClick={() => {
//                     setImageAlign(align);
//                     editor
//                       .chain()
//                       .focus()
//                       .updateAttributes("image", { textAlign: align })
//                       .run();
//                   }}
//                 >
//                   {align}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <hr className="my-4" />
//         </>
//       )}

//       {/* --------------------------- */}
//       {/* MARGIN CONTROLS */}
//       {/* --------------------------- */}
//       <h3 className="font-semibold mb-2">Margin</h3>

//       <div className="grid grid-cols-2 gap-4 mb-6 p-3 border rounded bg-slate-50">
//         {/* LEFT */}
//         <InputBox
//           label="Left"
//           value={margin.left}
//           onChange={(v) => {
//             const updated = { ...margin, left: v };
//             setMargin(updated);
//             applyBlockStyles(selectedNode, updated, padding);
//           }}
//         />

//         {/* RIGHT */}
//         <InputBox
//           label="Right"
//           value={margin.right}
//           onChange={(v) => {
//             const updated = { ...margin, right: v };
//             setMargin(updated);
//             applyBlockStyles(selectedNode, updated, padding);
//           }}
//         />

//         {/* TOP */}
//         <InputBox
//           label="Top"
//           value={margin.top}
//           onChange={(v) => {
//             const updated = { ...margin, top: v };
//             setMargin(updated);
//             applyBlockStyles(selectedNode, updated, padding);
//           }}
//         />

//         {/* BOTTOM */}
//         <InputBox
//           label="Bottom"
//           value={margin.bottom}
//           onChange={(v) => {
//             const updated = { ...margin, bottom: v };
//             setMargin(updated);
//             applyBlockStyles(selectedNode, updated, padding);
//           }}
//         />
//       </div>

//       {/* --------------------------- */}
//       {/* PADDING CONTROLS */}
//       {/* --------------------------- */}
//       <h3 className="font-semibold mb-2">Padding</h3>

//       <div className="grid grid-cols-2 gap-4 mb-6 p-3 border rounded bg-slate-50">
//         {/* LEFT */}
//         <InputBox
//           label="Left"
//           value={padding.left}
//           onChange={(v) => {
//             const updated = { ...padding, left: v };
//             setPadding(updated);
//             applyBlockStyles(selectedNode, margin, updated);
//           }}
//         />

//         {/* RIGHT */}
//         <InputBox
//           label="Right"
//           value={padding.right}
//           onChange={(v) => {
//             const updated = { ...padding, right: v };
//             setPadding(updated);
//             applyBlockStyles(selectedNode, margin, updated);
//           }}
//         />

//         {/* TOP */}
//         <InputBox
//           label="Top"
//           value={padding.top}
//           onChange={(v) => {
//             const updated = { ...padding, top: v };
//             setPadding(updated);
//             applyBlockStyles(selectedNode, margin, updated);
//           }}
//         />

//         {/* BOTTOM */}
//         <InputBox
//           label="Bottom"
//           value={padding.bottom}
//           onChange={(v) => {
//             const updated = { ...padding, bottom: v };
//             setPadding(updated);
//             applyBlockStyles(selectedNode, margin, updated);
//           }}
//         />
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { HexColorPicker } from "react-colorful";

// export default function RightPanel({ editor, applyBlockStyles }) {
//   const [selectedNode, setSelectedNode] = useState(null);

//   // Image controls
//   const [imageWidth, setImageWidth] = useState(300);
//   const [imageHeight, setImageHeight] = useState(200);
//   const [imageAlign, setImageAlign] = useState("center");

//   // Margin & Padding
//   const [margin, setMargin] = useState({
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//   });
//   const [padding, setPadding] = useState({
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//   });

//   // Colors
//   const [textColor, setTextColor] = useState("#000000");
//   const [bgColor, setBgColor] = useState("#ffffff");

//   // New features
//   const [opacity, setOpacity] = useState(1);
//   const [boxShadow, setBoxShadow] = useState("none");
//   const [borderWidth, setBorderWidth] = useState(0);
//   const [borderStyle, setBorderStyle] = useState("solid");
//   const [borderColor, setBorderColor] = useState("#000000");
//   const [strokeColor, setStrokeColor] = useState("#000000");
//   const [strokeWidth, setStrokeWidth] = useState(0);

//   if (!editor) return null;

//   // Update selected node
//   useEffect(() => {
//     const updateSelection = () => {
//       const { selection } = editor.state;
//       const node = selection.node || selection.$from.parent;
//       if (!node) {
//         setSelectedNode(null);
//         return;
//       }

//       setSelectedNode(node);

//       // Image attributes
//       if (node.type.name === "image") {
//         setImageWidth(node.attrs.width || 300);
//         setImageHeight(node.attrs.height || 200);
//         setImageAlign(node.attrs.textAlign || "center");
//       }

//       // Margin & Padding
//       setMargin({
//         top: node.attrs.marginTop ?? 0,
//         right: node.attrs.marginRight ?? 0,
//         bottom: node.attrs.marginBottom ?? 0,
//         left: node.attrs.marginLeft ?? 0,
//       });
//       setPadding({
//         top: node.attrs.paddingTop ?? 0,
//         right: node.attrs.paddingRight ?? 0,
//         bottom: node.attrs.paddingBottom ?? 0,
//         left: node.attrs.paddingLeft ?? 0,
//       });

//       // Colors
//       setTextColor(node.attrs.textColor || "#000000");
//       setBgColor(node.attrs.bgColor || "#ffffff");
//       setBorderColor(node.attrs.borderColor || "#000000");
//       setStrokeColor(node.attrs.strokeColor || "#000000");

//       // New features
//       setOpacity(node.attrs.opacity ?? 1);
//       setBoxShadow(node.attrs.boxShadow || "none");
//       setBorderWidth(node.attrs.borderWidth ?? 0);
//       setBorderStyle(node.attrs.borderStyle || "solid");
//       setStrokeWidth(node.attrs.strokeWidth ?? 0);
//     };

//     editor.on("selectionUpdate", updateSelection);
//     return () => editor.off("selectionUpdate", updateSelection);
//   }, [editor]);

//   // Input Box Component
//   const InputBox = ({ label, value, onChange }) => (
//     <div className="flex flex-col items-center">
//       <span className="text-sm font-medium text-slate-700 mb-1">{label}</span>
//       <input
//         type="number"
//         className="w-16 border border-slate-300 bg-white px-2 py-1 rounded text-center text-slate-800"
//         value={value}
//         min={0}
//         onChange={(e) => onChange(parseInt(e.target.value) || 0)}
//       />
//     </div>
//   );

//   const handleColorInput = (value, type) => {
//     try {
//       const testDiv = document.createElement("div");
//       testDiv.style.color = value;
//       if (testDiv.style.color !== "") {
//         let newAttrs = {};
//         if (type === "text") {
//           setTextColor(value);
//           newAttrs.textColor = value;
//         }
//         if (type === "bg") {
//           setBgColor(value);
//           newAttrs.bgColor = value;
//         }
//         if (type === "border") {
//           setBorderColor(value);
//           newAttrs.borderColor = value;
//         }
//         if (type === "stroke") {
//           setStrokeColor(value);
//           newAttrs.strokeColor = value;
//         }

//         editor
//           .chain()
//           .focus()
//           .updateAttributes(selectedNode.type.name, newAttrs)
//           .run();
//       }
//     } catch (e) {}
//   };

//   if (!selectedNode) {
//     return (
//       <div className="w-72 border-l border-slate-300 bg-slate-50 p-4 h-screen sticky top-0 overflow-y-auto">
//         <p className="text-slate-500">Select a block to customize</p>
//       </div>
//     );
//   }

//   // Box shadow options
//   const shadowPresets = [
//     "none",
//     "2px 2px 5px rgba(0,0,0,0.3)",
//     "4px 4px 10px rgba(0,0,0,0.4)",
//     "0 4px 8px rgba(0,0,0,0.2)",
//     "0 0 10px rgba(0,0,255,0.5)",
//   ];

//   return (
//     <div className="w-72 border-l border-slate-300 bg-slate-50 p-4 h-screen sticky top-0 overflow-y-auto space-y-4">
//       <h2 className="text-lg font-semibold text-slate-900 capitalize border-b pb-2 border-slate-300">
//         {selectedNode.type.name} Settings
//       </h2>

//       {/* IMAGE SETTINGS */}
//       {selectedNode.type.name === "image" && (
//         <>
//           <div>
//             <label className="text-slate-700">Image Width</label>
//             <input
//               type="number"
//               value={imageWidth}
//               min={50}
//               className="w-full border border-slate-300 bg-white px-3 py-1 rounded text-slate-800"
//               onChange={(e) => {
//                 const w = parseInt(e.target.value) || 0;
//                 setImageWidth(w);
//                 editor
//                   .chain()
//                   .focus()
//                   .updateAttributes("image", { width: w })
//                   .run();
//               }}
//             />
//           </div>
//           <div>
//             <label className="text-slate-700">Image Height</label>
//             <input
//               type="number"
//               value={imageHeight}
//               min={50}
//               className="w-full border border-slate-300 bg-white px-3 py-1 rounded text-slate-800"
//               onChange={(e) => {
//                 const h = parseInt(e.target.value) || 0;
//                 setImageHeight(h);
//                 editor
//                   .chain()
//                   .focus()
//                   .updateAttributes("image", { height: h })
//                   .run();
//               }}
//             />
//           </div>
//           <div>
//             <label className="text-slate-700">Alignment</label>
//             <div className="flex gap-2 mt-2">
//               {["left", "center", "right"].map((align) => (
//                 <button
//                   key={align}
//                   className={`px-3 py-1 border border-slate-300 rounded text-slate-800 hover:bg-slate-200 ${
//                     imageAlign === align ? "bg-slate-300" : "bg-white"
//                   }`}
//                   onClick={() => {
//                     setImageAlign(align);
//                     editor
//                       .chain()
//                       .focus()
//                       .updateAttributes("image", { textAlign: align })
//                       .run();
//                   }}
//                 >
//                   {align}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </>
//       )}

//       {/* MARGIN & PADDING */}
//       <div>
//         <h3 className="font-semibold text-slate-800 mb-2">Margin</h3>
//         <div className="grid grid-cols-2 gap-4 p-3 border rounded bg-slate-100">
//           {["Left", "Right", "Top", "Bottom"].map((side) => (
//             <InputBox
//               key={side}
//               label={side}
//               value={margin[side.toLowerCase()]}
//               onChange={(v) => {
//                 const updated = { ...margin, [side.toLowerCase()]: v };
//                 setMargin(updated);
//                 applyBlockStyles(selectedNode, updated, padding);
//               }}
//             />
//           ))}
//         </div>

//         <h3 className="font-semibold text-slate-800 mb-2 mt-4">Padding</h3>
//         <div className="grid grid-cols-2 gap-4 p-3 border rounded bg-slate-100">
//           {["Left", "Right", "Top", "Bottom"].map((side) => (
//             <InputBox
//               key={side}
//               label={side}
//               value={padding[side.toLowerCase()]}
//               onChange={(v) => {
//                 const updated = { ...padding, [side.toLowerCase()]: v };
//                 setPadding(updated);
//                 applyBlockStyles(selectedNode, margin, updated);
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* COLORS */}
//       {["paragraph", "heading"].includes(selectedNode.type.name) && (
//         <>
//           <h3 className="font-semibold text-slate-800 mb-2">Text Color</h3>
//           <HexColorPicker
//             color={textColor}
//             onChange={(color) => handleColorInput(color, "text")}
//           />
//           <input
//             type="text"
//             className="w-full border rounded px-2 py-1 mt-2"
//             value={textColor}
//             onChange={(e) => handleColorInput(e.target.value, "text")}
//           />
//           <div
//             className="h-6 w-full mt-1 border rounded"
//             style={{ backgroundColor: textColor }}
//           />

//           <h3 className="font-semibold text-slate-800 mb-2 mt-4">
//             Background Color
//           </h3>
//           <HexColorPicker
//             color={bgColor}
//             onChange={(color) => handleColorInput(color, "bg")}
//           />
//           <input
//             type="text"
//             className="w-full border rounded px-2 py-1 mt-2"
//             value={bgColor}
//             onChange={(e) => handleColorInput(e.target.value, "bg")}
//           />
//           <div
//             className="h-6 w-full mt-1 border rounded"
//             style={{ backgroundColor: bgColor }}
//           />
//         </>
//       )}

//       {/* NEW STYLING CONTROLS */}
//       <div>
//         <h3 className="font-semibold text-slate-800 mt-4 mb-2">Opacity</h3>
//         <input
//           type="number"
//           min="0"
//           max="1"
//           step="0.05"
//           className="w-full border rounded px-2 py-1"
//           value={opacity}
//           onChange={(e) => {
//             const val = parseFloat(e.target.value);
//             const newVal = isNaN(val) ? 1 : val;
//             setOpacity(newVal);
//             editor
//               .chain()
//               .focus()
//               .updateAttributes(selectedNode.type.name, { opacity: newVal })
//               .run();
//           }}
//         />

//         <h3 className="font-semibold text-slate-800 mt-4 mb-2">Box Shadow</h3>
//         <div className="flex flex-wrap gap-2 mb-2">
//           {shadowPresets.map((preset) => (
//             <button
//               key={preset}
//               className={`px-3 py-1 border rounded text-sm ${
//                 boxShadow === preset ? "bg-slate-300" : "bg-white"
//               }`}
//               onClick={() => {
//                 setBoxShadow(preset);
//                 editor
//                   .chain()
//                   .focus()
//                   .updateAttributes(selectedNode.type.name, {
//                     boxShadow: preset,
//                   })
//                   .run();
//               }}
//             >
//               {preset === "none" ? "None" : "Preview"}
//             </button>
//           ))}
//         </div>
//         <input
//           type="text"
//           placeholder="Custom shadow e.g. 2px 2px 10px rgba(0,0,0,0.3)"
//           className="w-full border rounded px-2 py-1"
//           value={boxShadow}
//           onChange={(e) => {
//             setBoxShadow(e.target.value);
//             editor
//               .chain()
//               .focus()
//               .updateAttributes(selectedNode.type.name, {
//                 boxShadow: e.target.value,
//               })
//               .run();
//           }}
//         />

//         <h3 className="font-semibold text-slate-800 mt-4 mb-2">Border</h3>
//         <div className="grid grid-cols-3 gap-2">
//           <input
//             type="number"
//             min="0"
//             className="border rounded px-2 py-1"
//             placeholder="Width"
//             value={borderWidth}
//             onChange={(e) => {
//               const val = parseInt(e.target.value) || 0;
//               setBorderWidth(val);
//               editor
//                 .chain()
//                 .focus()
//                 .updateAttributes(selectedNode.type.name, { borderWidth: val })
//                 .run();
//             }}
//           />
//           <select
//             className="border rounded px-2 py-1"
//             value={borderStyle}
//             onChange={(e) => {
//               setBorderStyle(e.target.value);
//               editor
//                 .chain()
//                 .focus()
//                 .updateAttributes(selectedNode.type.name, {
//                   borderStyle: e.target.value,
//                 })
//                 .run();
//             }}
//           >
//             {["solid", "dashed", "dotted", "double", "none"].map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select>
//           <input
//             type="text"
//             className="border rounded px-2 py-1"
//             value={borderColor}
//             onChange={(e) => handleColorInput(e.target.value, "border")}
//           />
//         </div>

//         <h3 className="font-semibold text-slate-800 mt-4 mb-2">Stroke</h3>
//         <div className="grid grid-cols-2 gap-2">
//           <input
//             type="number"
//             min="0"
//             className="border rounded px-2 py-1"
//             placeholder="Width"
//             value={strokeWidth}
//             onChange={(e) => {
//               const val = parseInt(e.target.value) || 0;
//               setStrokeWidth(val);
//               editor
//                 .chain()
//                 .focus()
//                 .updateAttributes(selectedNode.type.name, { strokeWidth: val })
//                 .run();
//             }}
//           />
//           <input
//             type="text"
//             className="border rounded px-2 py-1"
//             placeholder="Color"
//             value={strokeColor}
//             onChange={(e) => handleColorInput(e.target.value, "stroke")}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
