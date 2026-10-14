const fs = require('fs');
const path = 'app/(dashboard)/blog/[slug]/page.js';
let c = fs.readFileSync(path, 'utf8');

const regexToRemove = /const hasHighlighted = useRef\(false\);\s*useEffect\(\(\) => \{\s*if \(blog\?\.content && !hasHighlighted\.current\) \{.*?\}, \[blog\?\.content\]\);/s;

c = c.replace(regexToRemove, '');
fs.writeFileSync(path, c);
