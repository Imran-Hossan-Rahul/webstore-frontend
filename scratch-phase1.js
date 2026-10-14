const fs = require('fs'); 
const path = 'components/blog-editor/BlogEditor.js'; 
let c = fs.readFileSync(path, 'utf8'); 
c = c.replace(/className=\{`editor-container width-\$\{editorWidth\} relative pl-12 pt-4`\}/g, 'className={`editor-container width-${editorWidth} relative pt-12 pb-12 pr-12 pl-16 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-xl mx-auto min-h-[80vh] mt-8 mb-20 transition-all duration-300`}'); 
fs.writeFileSync(path, c);
