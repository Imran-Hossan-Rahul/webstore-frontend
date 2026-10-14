const fs = require('fs');
const path = 'app/globals.css';
let c = fs.readFileSync(path, 'utf8');
c = c.replace(/color: inherit !important;/g, 'color: inherit;');
fs.writeFileSync(path, c);
