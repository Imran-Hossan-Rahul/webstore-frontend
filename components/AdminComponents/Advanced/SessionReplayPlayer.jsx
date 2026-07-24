// components/AdminComponents/Advanced/SessionReplayPlayer.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import { Play, Pause, SkipForward, SkipBack, Maximize2, Loader2 } from "lucide-react";

export default function SessionReplayPlayer({ sessionId }) {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in ms
  const [session, setSession] = useState(null);
  const iframeRef = useRef(null);
  const playbackRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    fetchSession();
    return () => cancelAnimationFrame(playbackRef.current);
  }, [sessionId]);

  // When session loads, render the first frame immediately
  useEffect(() => {
    if (session && iframeRef.current) {
      const timer = setTimeout(() => {
        renderInitialState();
      }, 500); // Give iframe a moment to mount
      return () => clearTimeout(timer);
    }
  }, [session]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/advanced/replay/${sessionId}`);
      if (response.success) {
        setSession(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInitialState = () => {
    if (!session?.events || !iframeRef.current) return;
    
    // Render the very first full snapshot
    const firstFull = session.events.find(e => e.eventCategory === 'snapshot' && e.type === 'full');
    if (firstFull) {
      applyEvent(firstFull);
    }
  };

  const play = () => {
    if (!session?.events) return;
    setPlaying(true);
    lastTimeRef.current = performance.now();
    playbackRef.current = requestAnimationFrame(updatePlayback);
  };

  const pause = () => {
    setPlaying(false);
    cancelAnimationFrame(playbackRef.current);
  };

  const updatePlayback = (now) => {
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    setCurrentTime(prev => {
      const next = prev + delta;
      const totalDuration = (parseFloat(session?.duration) || 0) * 1000;
      
      if (next >= totalDuration) {
        pause();
        return totalDuration;
      }

      // Find and render events that happened between prev and next
      // Changed to >= to include events at the boundary
      renderEvents(prev, next);
      
      return next;
    });

    playbackRef.current = requestAnimationFrame(updatePlayback);
  };

  const renderEvents = (from, to) => {
    if (!session?.events || !iframeRef.current) return;
    
    // Find events in this time window
    const newEvents = session.events.filter(e => e.relativeTime > from && e.relativeTime <= to);
    
    newEvents.forEach(event => {
      applyEvent(event);
    });

    // Also update cursor position for the latest mousemove before 'to'
    const latestMove = [...session.events]
      .filter(e => e.eventCategory === 'interaction' && e.type === 'mousemove' && e.relativeTime <= to)
      .pop();
    
    if (latestMove) updateCursor(latestMove.x, latestMove.y);
  };

  const applyEvent = (event) => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    if (event.eventCategory === 'snapshot') {
      if (event.type === 'full' && event.html) {
        // Clear and write new HTML
        doc.open();
        doc.write(event.html);
        doc.close();
        
        // Ensure styles are applied and cursor is injected
        ensureCursor(doc);
      } else if (event.type === 'incremental' && event.mutations) {
        // Incremental logic would go here
      }
    } else if (event.eventCategory === 'interaction') {
      if (event.type === 'click' || event.type === 'mousedown') {
        showVisualClick(doc, event.x, event.y);
      }
    }
  };

  const ensureCursor = (doc) => {
    if (!doc || doc.getElementById('replay-cursor')) return;
    const cursor = doc.createElement('div');
    cursor.id = 'replay-cursor';
    cursor.style.cssText = `position:absolute;width:12px;height:12px;background:rgba(99,102,241,0.8);border:2px solid white;border-radius:50%;pointer-events:none;z-index:9999999;transition: transform 0.1s linear;box-shadow: 0 0 10px rgba(99,102,241,0.5);`;
    doc.body.appendChild(cursor);
  };

  const updateCursor = (x, y) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const cursor = doc.getElementById('replay-cursor');
    if (!cursor) {
      ensureCursor(doc);
      return;
    }
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  };

  const showVisualClick = (doc, x, y) => {
    if (!doc) return;
    const marker = doc.createElement('div');
    marker.style.cssText = `position:absolute;left:${x-10}px;top:${y-10}px;width:20px;height:20px;border-radius:50%;background:rgba(244,63,94,0.6);pointer-events:none;z-index:999999;animation: clickPulse 0.5s ease-out forwards;`;
    
    if (!doc.getElementById('click-animation-style')) {
      const style = doc.createElement('style');
      style.id = 'click-animation-style';
      style.textContent = `
        @keyframes clickPulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `;
      doc.head.appendChild(style);
    }
    
    doc.body.appendChild(marker);
    setTimeout(() => marker.remove(), 500);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    
    // Find the latest full snapshot before this time and re-render
    const latestFullSnapshot = [...session.events]
      .filter(e => e.eventCategory === 'snapshot' && e.type === 'full' && e.relativeTime <= time)
      .pop();
    
    if (latestFullSnapshot) {
      applyEvent(latestFullSnapshot);
    }
    
    // Apply all interactions from that snapshot to current time
    const startFrom = latestFullSnapshot ? latestFullSnapshot.relativeTime : 0;
    renderEvents(startFrom, time);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 h-96 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reconstructing Neural session...</p>
      </div>
    );
  }

  if (!session || !session.events) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 h-96 flex flex-col items-center justify-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Session Data Not Available</p>
      </div>
    );
  }

  const duration = (parseFloat(session.duration) || 0) * 1000;
  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Session Forensic Replay
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {session.duration}s • {session.events.length} Telemetry Events
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User ID</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{session.userId?.name || 'Guest'}</p>
        </div>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-black/40">
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white shadow-inner">
          <iframe 
            ref={iframeRef} 
            className="w-full h-[600px] pointer-events-none" 
            title="Session Replay"
          />
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0A0A0A]">
        <div className="flex flex-col gap-4">
          <div className="relative h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden group">
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max={duration} 
              value={currentTime} 
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5000))} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
              title="Back 5s"
            >
              <SkipBack size={20} />
            </button>
            <button 
              onClick={playing ? pause : play} 
              className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 5000))} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
              title="Forward 5s"
            >
              <SkipForward size={20} />
            </button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 tabular-nums uppercase tracking-widest">
              <span>{(currentTime / 1000).toFixed(1)}s</span>
              <span className="text-slate-300 dark:text-white/10">/</span>
              <span>{session.duration}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
