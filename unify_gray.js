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
    const content = fs.readFileSync(file, 'utf8');
    // Replace gray-X with slate-X
    const newContent = content.replace(/(text|bg|border|ring|shadow|hover:bg|hover:text|hover:border|dark:bg|dark:text|dark:border|from|to|via)-gray-(\d+)/g, '$1-slate-$2');
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      changedFiles++;
      console.log('Updated:', file);
    }
  });
});

console.log(`Updated ${changedFiles} files with slate colors.`);
