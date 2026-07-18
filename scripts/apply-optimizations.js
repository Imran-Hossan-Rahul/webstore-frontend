const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, '../components'),
  path.join(__dirname, '../app')
];

const IMPORT_STMT = 'import { getOptimizedUrl } from "@/utils/optimizeImage";';

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      // exclude node_modules and .git
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Find <img ... src={...} ... />
  // We will do this carefully: we will look for `src={variable}` and `src="string"` inside `<img` or `<Image`
  // Actually, we should just look for <img src={...}
  
  // Replace <img src={...}
  // Let's use a regex that matches src={something} inside <img
  // But wait, it's safer to just look for `src={` and `src="` if they are in lines with `<img`
  
  let lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Check if line has <img and src=
    if (line.includes('<img') && line.includes('src=')) {
      
      // If already wrapped in getOptimizedUrl, skip
      if (line.includes('getOptimizedUrl(')) continue;
      
      // Replace src={val} with src={getOptimizedUrl(val)}
      // Handle src={val}
      const matchBrace = line.match(/src=\{([^}]+)\}/);
      if (matchBrace) {
          // If the inside is already a string literal or complex, we might still wrap it.
          // e.g. src={user.profilePicture} -> src={getOptimizedUrl(user.profilePicture)}
          line = line.replace(/src=\{([^}]+)\}/, 'src={getOptimizedUrl($1)}');
          lines[i] = line;
          modified = true;
          continue;
      }
      
      // Handle src="val"
      const matchQuote = line.match(/src="([^"]+)"/);
      if (matchQuote) {
          const val = matchQuote[1];
          // if it's a local static asset (starts with /), skip
          if (!val.startsWith('/')) {
              line = line.replace(/src="([^"]+)"/, 'src={getOptimizedUrl("$1")}');
              lines[i] = line;
              modified = true;
          }
      }
    }
  }
  
  if (modified) {
    let newContent = lines.join('\n');
    
    // Add import if not present
    if (!newContent.includes(IMPORT_STMT)) {
      // Find the first line after "use client" if it exists, or just line 0
      let insertIndex = 0;
      if (lines[0].includes('"use client"') || lines[0].includes("'use client'")) {
        insertIndex = 1;
      }
      
      lines.splice(insertIndex, 0, IMPORT_STMT);
      newContent = lines.join('\n');
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

dirsToScan.forEach(dir => {
  walkDir(dir, processFile);
});

console.log("Done scanning and applying optimizations.");
