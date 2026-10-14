const fs = require('fs'); 
const path = 'components/blog-editor/PublishModal.jsx'; 
let c = fs.readFileSync(path, 'utf8'); 
c = c.replace(/bg-white dark:bg-zinc-950/g, 'bg-white/70 dark:bg-black/70 backdrop-blur-2xl');
c = c.replace(/bg-white dark:bg-slate-900\/20/g, 'bg-white/40 dark:bg-black/40 backdrop-blur-md');
fs.writeFileSync(path, c);
