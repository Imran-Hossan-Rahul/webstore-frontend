const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'components'),
    path.join(__dirname, 'app')
];

function processFile(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx') && !filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix texts
    content = content.replace(/\btext-brand-slate(?!\s+dark:text-)\b/g, 'text-brand-slate dark:text-slate-300');
    content = content.replace(/\btext-slate-900(?!\s+dark:text-)\b/g, 'text-slate-900 dark:text-white');
    content = content.replace(/\btext-slate-800(?!\s+dark:text-)\b/g, 'text-slate-800 dark:text-slate-100');
    content = content.replace(/\btext-slate-700(?!\s+dark:text-)\b/g, 'text-slate-700 dark:text-slate-200');
    content = content.replace(/\btext-slate-600(?!\s+dark:text-)\b/g, 'text-slate-600 dark:text-slate-300');
    content = content.replace(/\btext-slate-500(?!\s+dark:text-)\b/g, 'text-slate-500 dark:text-slate-400');
    
    // Fix backgrounds
    content = content.replace(/\bbg-white(?!\s+dark:bg-)\b/g, 'bg-white dark:bg-brand-surface');
    content = content.replace(/\bbg-slate-50(?!\s+dark:bg-)\b/g, 'bg-slate-50 dark:bg-brand-surface');
    content = content.replace(/\bbg-slate-100(?!\s+dark:bg-)\b/g, 'bg-slate-100 dark:bg-brand-surface/[0.05]');
    content = content.replace(/\bbg-slate-200(?!\s+dark:bg-)\b/g, 'bg-slate-200 dark:bg-brand-surface/[0.1]');

    // Fix borders
    content = content.replace(/\bborder-slate-200(?!\s+dark:border-)\b/g, 'border-slate-200 dark:border-white/10');
    content = content.replace(/\bborder-slate-100(?!\s+dark:border-)\b/g, 'border-slate-100 dark:border-white/5');
    content = content.replace(/\bborder-brand-navy\/\[0\.08\](?!\s+dark:border-)\b/g, 'border-brand-navy/[0.08] dark:border-white/10');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

targetDirs.forEach(dir => traverse(dir));
console.log('Done!');
