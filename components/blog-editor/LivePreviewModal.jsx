import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet, X, CheckCircle, ExternalLink } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import { getExtensions } from "./BlogEditor";

/**
 * LivePreviewModal - A premium 'Figma-style' preview experience
 */
const LivePreviewModal = ({ isOpen, onClose, editor }) => {
  const [device, setDevice] = useState("desktop"); // desktop | tablet | mobile
  const [isAnimateIn, setIsAnimateIn] = useState(false);

  // Initialize a read-only instance of the editor for perfect rendering
  const previewEditor = useEditor({
    editable: false,
    extensions: getExtensions(),
    content: "",
    immediatelyRender: false,
  });

  // Sync content when modal opens
  useEffect(() => {
    if (isOpen && editor && previewEditor) {
      previewEditor.commands.setContent(editor.getJSON());
      setIsAnimateIn(true);
    } else {
      setIsAnimateIn(false);
    }
  }, [isOpen, editor, previewEditor]);

  if (!isOpen) return null;

  // Device Dimensions Configuration
  const deviceStyles = {
    desktop: { width: "100%", height: "100%", maxWidth: "100%", borderRadius: "0px", border: "none" },
    tablet: { width: "768px", height: "90%", maxWidth: "100%", borderRadius: "12px", border: "1px solid #e5e7eb" },
    mobile: { width: "375px", height: "85%", maxWidth: "100%", borderRadius: "24px", border: "4px solid #1f2937" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Header / Controls */}
      <div className="w-full h-16 bg-white/10 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-md absolute top-0 left-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> 
            Live Preview
          </h2>
          <div className="h-6 w-px bg-white/20 mx-2" />
          
          {/* Device Toggles */}
          <div className="flex bg-black/30 rounded-lg p-1 gap-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-md transition-all ${
                device === "desktop" ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded-md transition-all ${
                device === "tablet" ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Tablet View"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-md transition-all ${
                device === "mobile" ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors flex items-center gap-2">
             <ExternalLink size={14} /> Publish Now
          </button>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div 
        className={`relative overflow-hidden bg-white shadow-2xl transition-all duration-500 ease-in-out mt-16 ${isAnimateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
             ...deviceStyles[device],
             // Add distinct shadow for mobile/tablet
             boxShadow: device !== 'desktop' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
        }}
      >
        {/* Mobile Notch Simulation */}
        {device === "mobile" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20" />
        )}

        {/* Content Scroll Area */}
        <div className="w-full h-full overflow-y-auto bg-white custom-scrollbar">
            <div className={`w-full min-h-full p-8 ${device === 'mobile' ? 'pt-12 px-4' : 'px-8 md:px-16'}`}>
                {/* Render exact EditorContent */}
                <EditorContent editor={previewEditor} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewModal;
