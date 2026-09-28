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

let borderChanged = 0;

dirsToScan.forEach(dir => {
  const files = walk(dir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/\bborder-brand-navy\/10\b/g, 'border-brand-navy/[0.08]');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      borderChanged++;
    }
  });
});

console.log(`Refined border opacity across ${borderChanged} files.`);
