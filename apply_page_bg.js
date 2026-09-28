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

let changedFiles = 0;

dirsToScan.forEach(dir => {
  const files = walk(dir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Pattern 1: Find min-h-screen and strip existing background classes, then add bg-brand-main
    content = content.replace(/(className=["'`][^"'`]*\bmin-h-screen\b[^"'`]*)(["'`])/g, (match, prefix, suffix) => {
      // Remove all bg-* and dark:bg-* from the class list
      let cleaned = prefix.replace(/\b(?:dark:)?bg-[a-zA-Z0-9\-\/\[\]#]+\b/g, '');
      // Remove duplicates or extra spaces
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      // Ensure bg-brand-main is present
      if (!cleaned.includes('bg-brand-main')) {
        cleaned += ' bg-brand-main';
      }
      return cleaned + suffix;
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      changedFiles++;
      console.log('Updated backgrounds in:', file);
    }
  });
});

console.log(`Updated ${changedFiles} files with bg-brand-main.`);
