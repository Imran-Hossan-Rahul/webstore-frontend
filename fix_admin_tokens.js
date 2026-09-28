const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const targetDirs = [
  path.join(__dirname, 'components', 'AdminComponents'),
  path.join(__dirname, 'app', 'admin'),
];

let files = [];
targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = files.concat(walk(dir));
  }
});

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Background replacements
  content = content.replace(/bg-gray-950/g, 'bg-white dark:bg-[#0D1117]');
  content = content.replace(/bg-gray-900/g, 'bg-brand-cloud dark:bg-[#161B22]');
  
  // Text color replacements (only when used as general text, not inside buttons usually, but be careful)
  // Let's replace `text-gray-400` which is extremely common in the old dark mode
  content = content.replace(/text-gray-400/g, 'text-slate-500');
  content = content.replace(/text-gray-300/g, 'text-brand-navy dark:text-slate-300');
  
  // Header text fixes (text-blue-400 to text-brand-navy dark:text-white or similar, we'll just leave text-blue-400 but remove the general wrapper text-white)
  // Actually, replacing `text-white` everywhere is dangerous because of buttons. 
  // Let's specifically target `<div className="p-4 md:p-6 w-full max-w-full text-white">`
  content = content.replace(/text-white">/g, 'text-brand-navy dark:text-white">');
  // Revert it inside buttons if we broke it? No, just match `<div className="[^"]*text-white[^"]*">`
  content = content.replace(/className="([^"]*)text-white([^"]*)"/g, (match, p1, p2) => {
    // If it's a button, keep text-white
    if (p1.includes('bg-brand-blue') || p1.includes('bg-green-600') || p1.includes('bg-red-600') || p1.includes('bg-blue-600')) {
      return match;
    }
    // If it's the main container, use brand-navy
    if (p1.includes('p-4') && p1.includes('w-full')) {
       return `className="${p1}text-brand-navy dark:text-white${p2}"`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Processed:', filePath);
  }
}
