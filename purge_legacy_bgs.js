const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'components'));
const appFiles = walk(path.join(__dirname, 'app'));
const allFiles = [...files, ...appFiles];

let updatedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace legacy background colors
  content = content.replace(/bg-\[#0D1117\]/g, 'bg-brand-surface'); // Map to surface
  content = content.replace(/bg-\[#010409\]/g, 'bg-brand-dark'); // Map to dark
  content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-brand-dark');
  content = content.replace(/bg-\[#161b22\]/g, 'bg-brand-surface');
  
  // Replace legacy border colors
  content = content.replace(/border-\[#30363D\]/g, 'border-white/10');
  content = content.replace(/border-\[#8B949E\]/g, 'border-white/20');
  
  // Replace arbitrary old tailwind shadows with standard
  content = content.replace(/shadow-\[0_8px_24px_rgba\(0,0,0,0\.04\)\]/g, 'shadow-[1px_1px_10px_rgba(11,37,69,0.02)]');
  
  // Clean up multiple dark:dark:
  content = content.replace(/dark:dark:/g, 'dark:');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log('Updated:', file);
  }
});

console.log(`Updated ${updatedCount} files.`);
