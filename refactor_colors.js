const fs = require('fs');
const path = require('path');

const directoriesToScan = ['./app', './components'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const classMappings = {
  // --- PRIMARY ACTION: TRUST BLUE ---
  'bg-indigo-600': 'bg-brand-blue',
  'bg-indigo-500': 'bg-brand-blue',
  'bg-blue-600': 'bg-brand-blue',
  'bg-blue-500': 'bg-brand-blue',
  'text-indigo-600': 'text-brand-blue',
  'text-indigo-500': 'text-brand-blue',
  'text-blue-600': 'text-brand-blue',
  'text-blue-500': 'text-brand-blue',
  'border-indigo-600': 'border-brand-blue',
  'border-indigo-500': 'border-brand-blue',
  'border-blue-600': 'border-brand-blue',
  'border-blue-500': 'border-brand-blue',
  'hover:bg-indigo-700': 'hover:bg-brand-blue',
  'hover:bg-indigo-600': 'hover:bg-brand-blue',
  'hover:text-indigo-700': 'hover:text-brand-blue',
  'hover:text-indigo-600': 'hover:text-brand-blue',
  'ring-indigo-500': 'ring-brand-blue',
  'ring-indigo-600': 'ring-brand-blue',

  // --- PRIMARY: MIDNIGHT NAVY ---
  'bg-slate-900': 'bg-brand-navy',
  'bg-slate-950': 'bg-brand-navy',
  'bg-gray-900': 'bg-brand-navy',
  'text-slate-900': 'text-brand-navy',
  'text-gray-900': 'text-brand-navy',
  'hover:bg-slate-800': 'hover:bg-brand-navy',
  'hover:text-slate-900': 'hover:text-brand-navy',

  // --- SUCCESS: VERIFIED TEAL ---
  'bg-emerald-500': 'bg-brand-teal',
  'bg-emerald-600': 'bg-brand-teal',
  'bg-green-500': 'bg-brand-teal',
  'text-emerald-500': 'text-brand-teal',
  'text-emerald-600': 'text-brand-teal',
  'text-green-500': 'text-brand-teal',
  'border-emerald-500': 'border-brand-teal',
  'hover:bg-emerald-600': 'hover:bg-brand-teal',

  // --- TECH ACCENT: CIRCUIT CYAN ---
  'text-cyan-400': 'text-brand-cyan',
  'text-cyan-500': 'text-brand-cyan',
  'bg-cyan-500': 'bg-brand-cyan',
  'bg-cyan-400': 'bg-brand-cyan',

  // --- BODY TEXT: SLATE ---
  'text-slate-600': 'text-brand-slate',
  'text-slate-700': 'text-brand-slate',
  'text-gray-600': 'text-brand-slate',
  'text-gray-700': 'text-brand-slate',

  // --- COMMERCIAL CTA: SIGNAL AMBER ---
  'bg-amber-500': 'bg-brand-amber',
  'bg-yellow-500': 'bg-brand-amber',
  'text-amber-500': 'text-brand-amber',
  'text-yellow-500': 'text-brand-amber',

  // --- SOFT BACKGROUND: CLOUD ---
  'bg-slate-50': 'bg-brand-cloud',
  'bg-gray-50': 'bg-brand-cloud',

  // --- SOFT SURFACE: SKY TINT ---
  'bg-indigo-50': 'bg-brand-sky',
  'bg-blue-50': 'bg-brand-sky',
};

let filesModifiedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [oldClass, newClass] of Object.entries(classMappings)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    content = content.replace(regex, newClass);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModifiedCount++;
    console.log(`Updated colors in: ${filePath}`);
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

directoriesToScan.forEach(dir => {
  const absolutePath = path.resolve(__dirname, dir);
  if (fs.existsSync(absolutePath)) {
    traverseDirectory(absolutePath);
  }
});

console.log(`\nRefactoring Complete! Successfully updated colors in ${filesModifiedCount} files.`);
