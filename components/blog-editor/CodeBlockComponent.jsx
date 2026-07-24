import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Check, Copy, ChevronDown, Code2 } from "lucide-react";

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

export default function CodeBlockComponent({ node, updateAttributes, extension }) {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    const textContent = node.content.content.map(n => n.text).join('\n');
    navigator.clipboard.writeText(textContent);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedLang = languages.find(l => l.value === (node.attrs.language || 'javascript'))?.label || 'Auto';

  return (
    <NodeViewWrapper 
      className="code-block-wrapper my-6 rounded-xl overflow-hidden border border-[#30363d] shadow-2xl bg-[#0d1117] font-mono text-sm leading-relaxed"
      data-id={node.attrs.id}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] select-none">
        
        {/* Language Selector Custom Dropdown */}
        <div className="relative group flex items-center" ref={dropdownRef} contentEditable={false}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md text-[#c9d1d9] text-[11px] font-mono font-medium tracking-wide transition-all shadow-sm focus:outline-none"
          >
            <Code2 className="w-3.5 h-3.5 text-[#8b949e]" />
            <span>{selectedLang}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8b949e] ml-1" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 max-h-56 overflow-y-auto bg-[#161b22] border border-[#30363d] rounded-md shadow-xl z-[100] py-1 custom-scrollbar">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); updateAttributes({ language: null }); setIsDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-[11px] font-mono text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-colors"
              >
                Auto
              </button>
              {languages.map((lang, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); updateAttributes({ language: lang.value }); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-mono transition-colors ${node.attrs.language === lang.value ? 'text-indigo-400 bg-[#21262d]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy Button */}
        <button
          contentEditable={false}
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-medium uppercase tracking-wider text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] transition-all border border-transparent hover:border-[#8b949e]/20"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code Content Area */}
      <pre 
        className={`hljs language-${node.attrs.language || 'javascript'} m-0 p-5 overflow-x-auto`}
      >
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
