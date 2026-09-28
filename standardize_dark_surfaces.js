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

dirsToScan.forEach(dir => {
  const files = walk(dir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix the Regex to properly match brackets and #
    content = content.replace(/dark:bg-\[#161B22\]/g, 'dark:bg-brand-surface');
    content = content.replace(/dark:bg-\[#1c1c1e\]/g, 'dark:bg-brand-surface');
    content = content.replace(/dark:bg-slate-800/g, 'dark:bg-brand-surface');
    
    // Also remove the dark:bg-[#0D1117] fallback from cards if they exist and replace with dark:bg-brand-surface
    // But be careful, #0D1117 is used for background. Let's stick to surface replacements.

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      surfaceChanged++;
    }
  });
});

console.log(`Standardized dark surfaces across ${surfaceChanged} files.`);
