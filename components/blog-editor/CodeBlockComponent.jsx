import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Check, Copy, ChevronDown } from 'lucide-react';

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

  const handleCopy = () => {
    // Collect text from all text nodes within the code block
    const textContent = node.content.content.map(n => n.text).join('\n');
    navigator.clipboard.writeText(textContent);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (event) => {
    updateAttributes({ language: event.target.value });
  };

  return (
    <NodeViewWrapper 
      className="code-block-wrapper my-6 rounded-xl overflow-hidden border border-[#30363d] shadow-lg bg-[#0d1117] font-mono text-[14px]"
      data-id={node.attrs.id}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] select-none">
        
        {/* Language Selector */}
        <div className="relative group flex items-center gap-1">
          <select
            contentEditable={false}
            value={node.attrs.language || 'javascript'}
            onChange={handleLanguageChange}
            className="appearance-none bg-transparent text-[#8b949e] hover:text-[#c9d1d9] text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer py-1 pr-6 focus:ring-0"
          >
            <option value="null">Auto</option>
            {languages.map((lang, index) => (
              <option key={index} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-[#8b949e] absolute right-1 pointer-events-none group-hover:text-[#c9d1d9]" />
        </div>

        {/* Copy Button */}
        <button
          contentEditable={false}
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] transition-colors border border-transparent hover:border-[#8b949e]/20"
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
