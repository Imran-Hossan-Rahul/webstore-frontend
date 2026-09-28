const fs = require('fs');
const path = require('path');

const directoriesToScan = ['./app', './components'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const excludeFiles = [
  'GlassNavbar.jsx',
  'MarketFooter.jsx',
  'MarketClientView.jsx',
  'globals.css'
];

const classMappings = {
  'bg-brand-navy': 'bg-slate-900',
  'text-brand-navy': 'text-slate-900',
  'hover:bg-brand-navy': 'hover:bg-slate-800',
  'hover:text-brand-navy': 'hover:text-slate-900',
};

let filesModifiedCount = 0;

function processFile(filePath) {
  if (excludeFiles.some(f => filePath.endsWith(f))) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [oldClass, newClass] of Object.entries(classMappings)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    content = content.replace(regex, newClass);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModifiedCount++;
    console.log('Reverted navy in: ' + filePath);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

directoriesToScan.forEach(dir => traverseDirectory(path.resolve('./', dir)));
console.log('Revert complete! Modified ' + filesModifiedCount + ' files.');
