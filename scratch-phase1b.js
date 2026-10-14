const fs = require('fs'); 
const path = 'components/blog-editor/BlogEditor.js'; 
let c = fs.readFileSync(path, 'utf8'); 
c = c.replace(/className="flex-shrink-0 z-10 border-b border-slate-200 bg-white"/g, 'className="flex-shrink-0 z-10 border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-xl"'); 
fs.writeFileSync(path, c);
