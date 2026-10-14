const fs = require('fs');
const path = 'app/(dashboard)/blog/[slug]/page.js';
let c = fs.readFileSync(path, 'utf8');

// 1. Remove the existing highlighting useEffect and useRef from BlogDetailPage
const useEffStart = c.indexOf('const hasHighlighted = useRef(false);');
const useEffEndStr = 'hasHighlighted.current = true;\n                }\n            }, 100);\n        }\n    }, [blog?.content]);';
const useEffEnd = c.indexOf(useEffEndStr) + useEffEndStr.length;

if (useEffStart > -1 && useEffEnd > useEffStart) {
    c = c.slice(0, useEffStart) + c.slice(useEffEnd);
}

// 2. Insert the memoized RenderedContent component right above BlogDetailPage
const renderedContentCode = `
const RenderedContent = React.memo(({ content }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (!content || !contentRef.current) return;
        
        const codeBlocks = contentRef.current.querySelectorAll('pre code');
        if (codeBlocks.length > 0) {
            codeBlocks.forEach((block) => {
                const rawText = block.textContent || block.innerText || '';
                block.innerHTML = '';
                block.textContent = rawText;
                block.removeAttribute('style');
                
                const preElement = block.parentElement;
                if (preElement && preElement.tagName === 'PRE') {
                    preElement.removeAttribute('style');
                }
                
                try {
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
                } catch(e) {
                    console.error(e);
                }
                
                if (!block.classList.contains('hljs') && !block.querySelector('.hljs-keyword')) {
                    const res = hljs.highlightAuto(rawText);
                    block.innerHTML = res.value;
                    block.classList.add('hljs');
                }
            });
        }
    }, [content]);

    return (
        <div 
            ref={contentRef}
            className="codex-prose w-full max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
});

`;

c = c.replace('export default function BlogDetailPage() {', renderedContentCode + 'export default function BlogDetailPage() {');

// 3. Replace the dangerouslySetInnerHTML usage with the new component
c = c.replace(/<div\s*className="codex-prose w-full max-w-none"\s*dangerouslySetInnerHTML=\{\{\s*__html:\s*content\s*\}\}\s*\/>/g, '<RenderedContent content={content} />');

fs.writeFileSync(path, c);
