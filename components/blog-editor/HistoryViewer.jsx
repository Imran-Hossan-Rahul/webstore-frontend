import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Clock } from "lucide-react";

export const HistoryViewer = ({ editor, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!editor) return;

    const handleTransaction = ({ transaction }) => {
      // Only track actual changes, not selection updates
      if (!transaction.docChanged) return;

      const timestamp = new Date().toLocaleTimeString();
      let summary = "Content Update";
      
      // Basic heuristic for description
      if (transaction.steps.length > 0) {
          const step = transaction.steps[0];
          // Try to guess operation type (simplified)
          // step.details not always available publicly in easy format
      }

      const newEntry = {
        id: Date.now(),
        time: timestamp,
        desc: summary,
        stepCount: 1 // Each transaction is usually 1 undo step
      };

      setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50
    };

    editor.on('transaction', handleTransaction);
    return () => editor.off('transaction', handleTransaction);
  }, [editor]);

  const handleRestore = (index) => {
    // If I want to go back to index 3 (0-based) in a list of [Newest ... Oldest]
    // That means I need to Undo (index + 1) times? 
    // Wait, the history list keeps growing.
    // If I have [A, B, C] (A is newest). If I want state C (index 2), I need to undo A and B. So Undo 2 times?
    // Actually, Tiptap history manages its own stack. My local list is just a visual mirror.
    // Syncing is hard.
    
    // Alternative: Just rely on Tiptap's undo depth?
    // editor.state.history$.done.eventCount? 
    
    // Safer approach:
    // Just use this list as "Recent Activity Log". 
    // And provide a generic "Undo" button next to each item? No that's confusing.
    
    // Let's implement "Preview" style restoring?
    // Or simpler: Just a list that visualizes *that changes happened*. 
    // And a big "Undo" button at the top.
    
    // User asked "History Viewer". Maybe they just want to see *what* happened.
    // Let's allow clicking to "Undo to this point".
    // Undo (index + 1) times.
    
    const stepsToUndo = index + 1;
    for(let i=0; i<stepsToUndo; i++) {
        editor.chain().undo().run();
    }
    // After undoing, we should probably clear those history items or mark them "undone".
    // Tiptap puts them in "Redo" stack.
    // This simple logic assumes linear history.
    
    // Update local history
    setHistory(prev => prev.slice(index + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[60] border-l transform transition-transform duration-200 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <h3 className="font-semibold flex items-center gap-2">
            <Clock size={16} /> History
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded">
            <X size={16} />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto h-[calc(100vh-60px)] space-y-3">
        {history.length === 0 && (
            <p className="text-slate-400 text-sm text-center italic mt-10">No recent changes recorded.</p>
        )}
        
        {history.map((item, idx) => (
            <div key={item.id} className="group flex items-start justify-between p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                <div>
                    <span className="text-xs text-slate-400 block mb-1">{item.time}</span>
                    <p className="text-sm font-medium text-slate-700">{item.desc}</p>
                </div>
                <button 
                    onClick={() => handleRestore(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                    title="Revert to state before this change"
                >
                    <RotateCcw size={14} />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};
