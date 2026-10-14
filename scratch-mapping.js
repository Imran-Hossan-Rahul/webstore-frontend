const fs = require('fs');
const path = 'app/(dashboard)/blog/[slug]/page.js';
let c = fs.readFileSync(path, 'utf8');

const mappingCode = `const classes = Array.from(block.classList);
                            let langClass = classes.find(c => c.startsWith('language-'));
                            if (langClass) {
                                let lang = langClass.replace('language-', '');
                                const langMap = { react: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'xml', vue: 'xml' };
                                if (langMap[lang]) {
                                    block.classList.remove(langClass);
                                    langClass = 'language-' + langMap[lang];
                                    block.classList.add(langClass);
                                }
                            }`;

c = c.replace(/const classes = Array\.from\(block\.classList\);/g, mappingCode);
fs.writeFileSync(path, c);
