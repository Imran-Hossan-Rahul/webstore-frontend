const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const dirsToScan = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

let surfaceChanged = 0;
let borderChanged = 0;
let shadowChanged = 0;

dirsToScan.forEach(dir => {
  const files = walk(dir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Unify surfaces
    // Replace standalone `bg-white` or `bg-[#161B22]` with `bg-brand-surface`
    // (We only replace if it's acting as a surface, but bg-white is essentially the surface color)
    content = content.replace(/\bbg-white\b/g, 'bg-brand-surface');
    content = content.replace(/\bdark:bg-\[\#161B22\]\b/g, 'dark:bg-brand-surface');
    content = content.replace(/\bdark:bg-slate-800\b/g, 'dark:bg-brand-surface');

    // 2. Unify borders to rgba(11, 37, 69, 0.08) -> border-brand-navy/10
    // We replace border-slate-200 with border-brand-navy/10
    content = content.replace(/\bborder-slate-200\b/g, 'border-brand-navy/10');
    // We also replace border-gray-200 just in case
    content = content.replace(/\bborder-gray-200\b/g, 'border-brand-navy/10');
    content = content.replace(/\bborder-slate-300\b/g, 'border-brand-navy/10');

    // 3. Purge heavy shadows, fallback to shadow-sm
    content = content.replace(/\bshadow-md\b/g, 'shadow-sm');
    content = content.replace(/\bshadow-lg\b/g, 'shadow-sm');
    content = content.replace(/\bshadow-xl\b/g, 'shadow-sm');
    content = content.replace(/\bshadow-2xl\b/g, 'shadow-sm');
    // Remove inline huge shadows
    content = content.replace(/\bshadow-\[0_[^\]]+\]\b/g, 'shadow-sm');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      surfaceChanged++;
    }
  });
});

console.log(`Standardized surfaces, borders, and shadows across ${surfaceChanged} files.`);
