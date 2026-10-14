const fs = require('fs');
const path = 'app/(dashboard)/blog/[slug]/page.js';
let c = fs.readFileSync(path, 'utf8');

const correctCode = `                        try {
                            // Strip unsupported language classes before highlighting
                            const classes = Array.from(block.classList);
                            let langClass = classes.find(c => c.startsWith('language-'));
                            if (langClass) {
                                let lang = langClass.replace('language-', '');
                                const langMap = { react: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'xml', vue: 'xml' };
                                if (langMap[lang]) {
                                    block.classList.remove(langClass);
                                    langClass = 'language-' + langMap[lang];
                                    block.classList.add(langClass);
                                }
                                
                                if (!hljs.getLanguage(langClass.replace('language-', ''))) {
                                    block.classList.remove(langClass);
                                }
                            }
                            hljs.highlightElement(block);
                        } catch(e) {`;

// Replace the entire try { ... } block up to catch(e) {
const regex = /try\s*\{\s*\/\/\s*Strip unsupported.*?catch\(e\)\s*\{/s;
c = c.replace(regex, correctCode);
fs.writeFileSync(path, c);
