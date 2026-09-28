const fs = require('fs');
const path = require('path');

const directoriesToScan = ['./app', './components'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const classMappings = {
  'bg-[#0071e3]': 'bg-brand-blue',
  'bg-[#0071E3]': 'bg-brand-blue',
  'bg-[#007AFF]': 'bg-brand-blue',
  'bg-[#0066CC]': 'bg-brand-blue',
  'text-[#0071e3]': 'text-brand-blue',
  'text-[#0071E3]': 'text-brand-blue',
  'text-[#007AFF]': 'text-brand-blue',
  'text-[#0066CC]': 'text-brand-blue',
  'border-[#0071e3]': 'border-brand-blue',
  'border-[#0071E3]': 'border-brand-blue',
  'border-[#007AFF]': 'border-brand-blue',
  'border-[#0066CC]': 'border-brand-blue',
  'hover:bg-[#0077ED]': 'hover:bg-brand-blue/90',
  'hover:bg-[#0055b3]': 'hover:bg-brand-blue/90',
};

let filesModifiedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [oldClass, newClass] of Object.entries(classMappings)) {
    const regex = new RegExp(oldClass.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
    content = content.replace(regex, newClass);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModifiedCount++;
    console.log('Updated blue in: ' + filePath);
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
console.log('Replacement complete! Modified ' + filesModifiedCount + ' files.');
