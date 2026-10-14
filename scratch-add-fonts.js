const fs = require('fs');
const path = 'components/blog-editor/Toolbar.jsx';
let c = fs.readFileSync(path, 'utf8');

const bengaliFonts = `
            // --- BENGALI FONTS ---
            { name: 'Hind Siliguri', value: '"Hind Siliguri", sans-serif' },
            { name: 'SolaimanLipi', value: '"SolaimanLipi", sans-serif' },
            { name: 'Kalpurush', value: '"Kalpurush", sans-serif' },
            { name: 'Noto Sans Bengali', value: '"Noto Sans Bengali", sans-serif' },
            // --- SANS-SERIF ---`;

c = c.replace(/\/\/\s*---\s*SANS-SERIF\s*---/, bengaliFonts);
fs.writeFileSync(path, c);
