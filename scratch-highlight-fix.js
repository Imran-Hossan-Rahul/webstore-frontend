const fs = require('fs');
const path = 'app/(dashboard)/blog/[slug]/page.js';
let c = fs.readFileSync(path, 'utf8');

const replacement = `
                        try {
                            // Strip unsupported language classes before highlighting
                            const classes = Array.from(block.classList);
                            const langClass = classes.find(c => c.startsWith('language-'));
                            if (langClass && !hljs.getLanguage(langClass.replace('language-', ''))) {
                                block.classList.remove(langClass);
                            }
                            hljs.highlightElement(block);
                        } catch(e) {
                            console.error(e);
                        }
                        
                        // If it still didn't highlight (no hljs class added), force auto
                        if (!block.classList.contains('hljs') && !block.querySelector('.hljs-keyword')) {
                            const res = hljs.highlightAuto(rawText);
                            block.innerHTML = res.value;
                            block.classList.add('hljs');
                        }
`;

c = c.replace(/hljs\.highlightElement\(block\);/g, replacement);
fs.writeFileSync(path, c);
