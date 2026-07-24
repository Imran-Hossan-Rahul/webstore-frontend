// components/AdminComponents/Advanced/MouseHeatmap.jsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { api } from '@/utils/api';
import { MousePointer2, Activity, Zap, Loader2, Maximize2, Layers, MousePointer, Info, Filter, Download, RefreshCcw } from "lucide-react";

export default function MouseHeatmap({ page = "/", timeRange = 7 }) {
  const canvasRef = useRef(null);
  const clickCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeLayer, setActiveLayer] = useState('heatmap'); // 'heatmap', 'clicks', 'both'
  const [intensity, setIntensity] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    fetchHeatmapData();
  }, [page, timeRange]);

  useEffect(() => {
    if (!loading && movements.length > 0) {
      renderAll();
    }
  }, [movements, activeLayer, intensity, isFullscreen]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/advanced/mouse/heatmap?page=${page}&days=${timeRange}`);
      if (response.success) {
        setMovements(response.data.movements);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAll = () => {
    if (activeLayer === 'heatmap' || activeLayer === 'both') {
      renderHeatmap();
    } else {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (activeLayer === 'clicks' || activeLayer === 'both') {
      renderClicks();
    } else {
      const ctx = clickCanvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, clickCanvasRef.current.width, clickCanvasRef.current.height);
    }
  };

  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    const heatmap = new Array(height).fill(0).map(() => new Array(width).fill(0));
    const radius = intensity;

    movements.forEach(m => {
      m.compressedPath.forEach(([x, y]) => {
        const centerX = Math.floor((x / m.viewportWidth) * width);
        const centerY = Math.floor((y / m.viewportHeight) * height);

        for (let i = -radius; i <= radius; i++) {
          for (let j = -radius; j <= radius; j++) {
            const tx = centerX + i;
            const ty = centerY + j;
            if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
              const dist = Math.sqrt(i * i + j * j);
              if (dist <= radius) {
                heatmap[ty][tx] += (radius - dist) / radius;
              }
            }
          }
        }
      });
    });

    let maxValue = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (heatmap[y][x] > maxValue) maxValue = heatmap[y][x];
      }
    }
    if (maxValue === 0) maxValue = 1;

    const imageData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const val = heatmap[y][x];
        const intens = val / maxValue;
        const idx = (y * width + x) * 4;

        if (intens > 0.05) {
          // Modern heatmap palette: Deep Purple -> Blue -> Cyan -> Green -> Yellow -> Red
          if (intens < 0.2) {
            imageData.data[idx] = 75; imageData.data[idx+1] = 0; imageData.data[idx+2] = 130;
          } else if (intens < 0.4) {
            imageData.data[idx] = 0; imageData.data[idx+1] = 0; imageData.data[idx+2] = 255;
          } else if (intens < 0.6) {
            imageData.data[idx] = 0; imageData.data[idx+1] = 255; imageData.data[idx+2] = 255;
          } else if (intens < 0.8) {
            imageData.data[idx] = 0; imageData.data[idx+1] = 255; imageData.data[idx+2] = 0;
          } else {
            imageData.data[idx] = 255; imageData.data[idx+1] = 0; imageData.data[idx+2] = 0;
          }
          imageData.data[idx+3] = Math.floor(intens * 220);
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const renderClicks = () => {
    const canvas = clickCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    
    movements.forEach(m => {
      if (m.clicks && m.clicks.length > 0) {
        m.clicks.forEach(click => {
          const cx = Math.floor((click.x / m.viewportWidth) * width);
          const cy = Math.floor((click.y / m.viewportHeight) * height);

          // Draw neon pulse for clicks
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.2, 'rgba(255, 0, 150, 0.6)');
          gradient.addColorStop(1, 'rgba(255, 0, 150, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, 15, 0, Math.PI * 2);
          ctx.fill();

          // Small center dot
          ctx.fillStyle = '#FF0096';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8 flex flex-col items-center justify-center h-[500px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="text-indigo-600 animate-pulse" size={24} />
          </div>
        </div>
        <p className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Neural Interaction Matrix...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col bg-white dark:bg-[#050505] rounded-3xl border border-slate-200/60 dark:border-white/5 overflow-hidden transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-0' : 'h-full shadow-2xl shadow-indigo-500/5'}`}>
      
      {/* Dynamic Header */}
      <div className="p-8 border-b border-slate-100 dark:border-white/[0.03] bg-white/50 dark:bg-black/20 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Zap size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Neural Interaction Map</h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-tighter rounded-full flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                  Live Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <Filter size={12} className="text-indigo-500" />
                Context: {page} • Horizon: {timeRange} Days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Layer Toggles */}
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
              {[
                { id: 'heatmap', icon: Activity, label: 'Heat' },
                { id: 'clicks', icon: MousePointer, label: 'Clicks' },
                { id: 'both', icon: Layers, label: 'Hybrid' }
              ].map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeLayer === layer.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  <layer.icon size={14} />
                  {layer.label}
                </button>
              ))}
            </div>

            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <Maximize2 size={20} />
            </button>
            
            <button 
              onClick={fetchHeatmapData}
              className="p-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* Real-time Insights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Neural Signals', value: stats?.totalPoints || 0, sub: 'Coordinate sets', color: 'indigo' },
            { label: 'Avg Pulse Speed', value: `${Math.round(stats?.avgSpeed || 0)}`, sub: 'Pixels / second', color: 'emerald' },
            { label: 'Trigger Events', value: stats?.totalClicks || 0, sub: 'Verified clicks', color: 'pink' },
            { label: 'Active Sessions', value: movements?.length || 0, sub: 'Data sources', color: 'amber' }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.03] group hover:border-indigo-500/30 transition-colors">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black text-${item.color}-500 tracking-tighter`}>{item.value.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-bold">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden group">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <div className="relative w-full max-w-6xl aspect-[12/8] bg-black/40 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Heatmap Canvas */}
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-90 transition-opacity duration-700"
            />
            {/* Clicks Overlay */}
            <canvas
              ref={clickCanvasRef}
              width={1200}
              height={800}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Empty State Overlay */}
            {movements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-black/60 backdrop-blur-md">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 mb-6 border border-indigo-500/20">
                  <Info size={40} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Insufficient Neural Data</h4>
                <p className="text-slate-400 max-w-sm text-sm font-medium">We haven't captured enough user interactions on this page within the selected time window to generate a meaningful map.</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="flex items-center gap-4 border-r border-white/10 pr-6">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Intensity</span>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={intensity} 
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-32 accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-bold text-indigo-400 w-6">{intensity}</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Heat</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF0096] shadow-lg shadow-pink-500/50" />
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Clicks</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,1)]" />
          Neural Engine Active • Latency 14ms • Precision Optimized
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[9px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
            <Download size={12} />
            Export Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
