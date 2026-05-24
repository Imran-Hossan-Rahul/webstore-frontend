const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/Form/CreateDevlog.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rename Component
content = content.replace(/CreateDevlogModal/g, 'CreateDevlog');

// 2. Remove Props
content = content.replace(/const CreateDevlog = \(\{ isOpen, onClose, onDevlogCreated \}\) => \{/g, 'const CreateDevlog = ({ onDevlogCreated }) => {');

// 3. Remove early return
content = content.replace(/if \(!isOpen\) return null;/g, '');

// 4. Update wrapper
const oldWrapper = `    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm lg:pl-[280px] transition-all duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl shadow-purple-500/20 rounded-2xl overflow-hidden ring-1 ring-white/10"
      >`;
const newWrapper = `    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">`;
content = content.replace(oldWrapper, newWrapper);

// 5. Update header and remove close button
const oldHeader = `        <div className="bg-[#15121e] h-full flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-purple-500/20 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                Create Devlog Post ✨
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Share your creative journey, process, and final work with the
                community.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>`;
const newHeader = `        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Create Devlog Post
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Share your creative journey, process, and final work with the community.
              </p>
            </div>
          </div>`;
content = content.replace(oldHeader, newHeader);

// 6. Global CSS Replacements
const replacements = [
    { from: /bg-\[\#15121e\]/g, to: 'bg-white dark:bg-slate-900' },
    { from: /bg-\[\#1a1625\]/g, to: 'bg-slate-50 dark:bg-slate-950' },
    { from: /bg-\[\#1f1a2e\]/g, to: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' },
    { from: /bg-\[\#2a2438\]\/30/g, to: 'bg-slate-50 dark:bg-slate-800/50' },
    { from: /bg-\[\#2a2438\]/g, to: 'bg-slate-50 dark:bg-slate-800' },
    { from: /bg-\[\#221932\]/g, to: 'bg-slate-100 dark:bg-slate-800' },
    { from: /bg-\[\#342d47\]/g, to: 'bg-slate-200 dark:bg-slate-700' },
    
    // Borders
    { from: /border-purple-500\/10/g, to: 'border-slate-200 dark:border-slate-700' },
    { from: /border-purple-500\/20/g, to: 'border-slate-200 dark:border-slate-800' },
    { from: /border-purple-500\/30/g, to: 'border-slate-200 dark:border-slate-700' },
    { from: /border-purple-500\/40/g, to: 'border-slate-300 dark:border-slate-600' },
    { from: /border-purple-500\/50/g, to: 'border-slate-400 dark:border-slate-500' },
    { from: /focus:border-purple-500/g, to: 'focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white' },
    
    // Text
    { from: /text-white/g, to: 'text-slate-900 dark:text-white' },
    { from: /text-gray-300/g, to: 'text-slate-700 dark:text-gray-300' },
    { from: /text-slate-400/g, to: 'text-slate-600 dark:text-slate-400' },
    { from: /text-slate-500/g, to: 'text-slate-500 dark:text-slate-500' },
    { from: /text-purple-300/g, to: 'text-slate-700 dark:text-slate-300' },
    { from: /text-purple-400/g, to: 'text-slate-800 dark:text-slate-200' },
    
    // Shadows and Gradients
    { from: /shadow-purple-500\/30/g, to: 'shadow-sm' },
    { from: /shadow-purple-500\/20/g, to: 'shadow-sm' },
    { from: /from-purple-500\/20 to-pink-500\/20/g, to: 'bg-slate-100 dark:bg-slate-800' },
    { from: /from-purple-600 to-pink-600/g, to: 'bg-black dark:bg-white text-white dark:text-black' },
    { from: /hover:from-purple-500 hover:to-pink-500/g, to: 'hover:opacity-90' },
    { from: /bg-purple-600/g, to: 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' },
    { from: /hover:bg-purple-500/g, to: 'hover:bg-slate-700 dark:hover:bg-slate-300' },
    
    // Editor specific
    { from: /hover:bg-white\/10/g, to: 'hover:bg-slate-200 dark:hover:bg-slate-700' },
    { from: /bg-white\/10/g, to: 'bg-slate-200 dark:bg-slate-700' },
    { from: /ring-1 ring-white\/10/g, to: '' },
    
    // Buttons (like "Save as Draft")
    { from: /bg-transparent hover:bg-white\/5 border border-white\/20 hover:border-white\/30/g, to: 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300' },
];

replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
});

// Fix router integration
if (!content.includes('import { useRouter } from "next/navigation";')) {
    content = content.replace(/import React, \{ useState, useRef, useEffect, useCallback \} from "react";/, 
        `import React, { useState, useRef, useEffect, useCallback } from "react";\nimport { useRouter } from "next/navigation";`);
}

// Update submission logic to use router.push instead of onClose
content = content.replace(/setTimeout\(\(\) => \{[\s\S]*?onClose\(\);[\s\S]*?\}, 1500\);/g, `setTimeout(() => {\n          if (onDevlogCreated) onDevlogCreated();\n          window.location.href = "/devlogs";\n      }, 1500);`);

// Update the buttons wrapper div since onClose is missing now
content = content.replace(/onClick=\{onClose\}/g, `onClick={() => window.history.back()}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored CreateDevlog.jsx successfully.');
