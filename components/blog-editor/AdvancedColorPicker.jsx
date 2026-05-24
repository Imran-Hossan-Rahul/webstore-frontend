import React, { useState, useEffect, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { X, Check } from "lucide-react";

// Helper to check if string is a gradient
const isGradient = (str) => str && (str.includes("linear-gradient") || str.includes("radial-gradient"));

const AdvancedColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("solid"); // solid | gradient
  const [color, setColor] = useState("#000000");
  
  // Gradient State
  const [gradientType, setGradientType] = useState("linear"); // linear | radial
  const [gradientData, setGradientData] = useState({
    angle: 90,
    startColor: "#FF0000",
    endColor: "#0000FF",
  });

  const containerRef = useRef(null);

  // Sync internal state with external value
  useEffect(() => {
    if (value) {
      if (isGradient(value)) {
        setMode("gradient");
        if (value.includes("radial-gradient")) {
            setGradientType("radial");
        } else {
            setGradientType("linear");
        }
        // NOTE: Parsing exact colors from CSS string is complex. 
        // We keep internal state for editing, but initial sync might be partial 
        // if we don't implement full parser. For now, we respect the mode.
      } else {
        setMode("solid");
        setColor(value);
      }
    }
  }, [value]);

  const handleSolidChange = (newColor) => {
    setColor(newColor);
    onChange(newColor);
  };

  const updateGradient = (updates = {}) => {
    const newData = { ...gradientData, ...updates };
    setGradientData(newData);
    
    // Use current type unless updated
    const type = updates.type || gradientType;
    
    let gradStr = "";
    if (type === "linear") {
        gradStr = `linear-gradient(${newData.angle}deg, ${newData.startColor}, ${newData.endColor})`;
    } else {
        gradStr = `radial-gradient(circle, ${newData.startColor}, ${newData.endColor})`;
    }
    
    onChange(gradStr);
  };

  const handleTypeChange = (type) => {
      setGradientType(type);
      updateGradient({ type });
  };

  return (
    <div className="flex flex-col relative" ref={containerRef}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-700 w-24 truncate" title={label}>{label}</label>
        <div
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="w-10 h-8 rounded border border-slate-300 cursor-pointer shadow-sm relative overflow-hidden transition-transform active:scale-95"
          style={{ background: value || "#fff" }}
        >
          {/* Transparency grid simulated */}
          <div 
             className="absolute inset-0 -z-10" 
             style={{
               backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
               backgroundSize: '8px 8px',
               backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
             }}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed z-50 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-right-8"
          style={{ top: '20%', right: '340px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Tabs */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setMode("solid");
                  onChange(color);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === "solid" ? "bg-white shadow-sm text-black" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => {
                  setMode("gradient");
                  updateGradient({});
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === "gradient" ? "bg-white shadow-sm text-black" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Gradient
              </button>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>

          {mode === "solid" ? (
            <div className="space-y-4">
              <div className="custom-color-picker">
                <HexColorPicker color={color} onChange={handleSolidChange} style={{ width: '100%', height: '180px' }} />
              </div>
              
              <div className="flex items-center gap-2">
                 <div className="text-xs font-medium text-slate-500 w-8">HEX</div>
                 <div className="flex items-center flex-1 border rounded bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent">
                    <span className="pl-2 text-slate-400 text-xs">#</span>
                    <input 
                        value={color.replace('#', '')}
                        onChange={(e) => handleSolidChange(`#${e.target.value}`)}
                        className="flex-1 bg-transparent border-none px-1 py-1.5 text-xs font-mono uppercase focus:ring-0"
                    />
                 </div>
              </div>
              
              {/* Presets Grid */}
              <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-100">
                  {['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b', '#71717a', '#a1a1aa'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => handleSolidChange(c)}
                        className="w-full aspect-square rounded-md border border-slate-200 shadow-sm relative group overflow-hidden"
                        style={{ background: c }}
                        title={c}
                      >
                         {color.toLowerCase() === c.toLowerCase() && <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"><Check size={12} /></div>}
                      </button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gradient Preview */}
              <div 
                className="h-24 w-full rounded-lg border border-slate-200 shadow-inner relative" 
                style={{ background: value || "transparent" }}
              >
                {/* Visual helper for direction if linear */}
                {gradientType === 'linear' && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30"
                        style={{ transform: `rotate(${gradientData.angle - 90}deg)` }}
                    >
                        <div className="w-full h-0.5 bg-black" />
                        <div className="absolute right-0 w-2 h-2 border-t-2 border-r-2 border-black transform rotate-45" style={{ marginTop: '-3px', marginRight: '2px' }}/>
                    </div>
                )}
              </div>
              
              {/* Type Selection */}
              <div className="flex gap-2 text-xs">
                <button 
                    onClick={() => handleTypeChange("linear")}
                    className={`flex-1 py-1.5 border rounded ${gradientType === "linear" ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                    Linear
                </button>
                <button 
                    onClick={() => handleTypeChange("radial")}
                    className={`flex-1 py-1.5 border rounded ${gradientType === "radial" ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                    Radial
                </button>
              </div>

              {/* Controls */}
              {gradientType === 'linear' && (
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Angle</span>
                    <input 
                      type="range" min="0" max="360" 
                      value={gradientData.angle} 
                      onChange={(e) => updateGradient({ angle: Number(e.target.value) })}
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs w-8 text-right font-mono bg-white px-1 rounded border">{gradientData.angle}°</span>
                  </div>
              )}

              {/* Color Stops */}
              <div className="space-y-3 pt-2">
                {/* Start Color */}
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-slate-300 ring-2 ring-gray-100" />
                   <span className="text-xs font-medium text-slate-500 w-16">Start</span>
                   <div className="flex-1 flex items-center gap-2 border rounded p-1 bg-white hover:border-slate-300 transition-colors">
                     <input 
                        type="color" 
                        value={gradientData.startColor} 
                        onChange={(e) => updateGradient({ startColor: e.target.value })} 
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0" 
                     />
                     <span className="text-[10px] font-mono text-slate-600 uppercase">{gradientData.startColor}</span>
                   </div>
                </div>

                {/* Connection Line */}
                <div className="ml-1 w-0.5 h-2 bg-slate-200 my-[-6px]" />

                {/* End Color */}
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-slate-800 ring-2 ring-gray-100" />
                   <span className="text-xs font-medium text-slate-500 w-16">End</span>
                   <div className="flex-1 flex items-center gap-2 border rounded p-1 bg-white hover:border-slate-300 transition-colors">
                     <input 
                        type="color" 
                        value={gradientData.endColor} 
                        onChange={(e) => updateGradient({ endColor: e.target.value })} 
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0" 
                     />
                     <span className="text-[10px] font-mono text-slate-600 uppercase">{gradientData.endColor}</span>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedColorPicker;
