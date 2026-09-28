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

const classTally = {};
const customColors = new Set();
const gradientsAndShadows = new Set();

dirsToScan.forEach(dir => {
  const files = walk(dir);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Match bg-*, dark:bg-*, from-*, to-*, via-*, shadow-*
    const matches = content.match(/(?:dark:)?(?:bg|from|to|via|shadow)-[a-zA-Z0-9\-\/\[\]#]+/g);
    
    if (matches) {
      matches.forEach(m => {
        classTally[m] = (classTally[m] || 0) + 1;
        
        if (m.includes('[')) {
          customColors.add(m);
        }
        
        if (m.includes('from-') || m.includes('to-') || m.includes('via-') || m.includes('shadow-')) {
          gradientsAndShadows.add(m);
        }
      });
    }
  });
});

console.log("--- TOP 30 BACKGROUND CLASSES ---");
Object.entries(classTally)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([cls, count]) => console.log(`${count.toString().padEnd(4)} ${cls}`));

console.log("\n--- HARDCODED/CUSTOM BACKGROUNDS ---");
Array.from(customColors)
  .filter(c => c.includes('bg-['))
  .forEach(c => console.log(c));

console.log("\n--- GRADIENTS & SHADOWS ---");
Array.from(gradientsAndShadows)
  .slice(0, 20)
  .forEach(c => console.log(c));
