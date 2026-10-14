const fs = require('fs'); 
const path = 'components/blog-editor/BlockMenu.jsx'; 
let c = fs.readFileSync(path, 'utf8'); 
c = c.replace(/className="flex bg-white shadow-sm border rounded overflow-hidden"/g, 'className="flex bg-white/60 dark:bg-black/60 backdrop-blur-2xl shadow-xl border border-white/30 dark:border-white/10 rounded-xl overflow-hidden"');
c = c.replace(/hover:bg-slate-50/g, 'hover:bg-white/40 dark:hover:bg-white/10');
c = c.replace(/text-slate-500/g, 'text-slate-800 dark:text-slate-300');
c = c.replace(/text-red-500/g, 'text-red-600 dark:text-red-400');
fs.writeFileSync(path, c);
