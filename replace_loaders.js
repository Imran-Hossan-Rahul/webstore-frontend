const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDir(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Loader2')) {
        let modified = false;

        // Replace <Loader2 ... with <AppleSpinner ...
        if (/<Loader2/.test(content)) {
          content = content.replace(/<Loader2/g, '<AppleSpinner');
          modified = true;
        }

        // Remove Loader2 from lucide-react imports
        if (/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/.test(content)) {
          content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/g, (match, p1) => {
            const imports = p1.split(',').map(s => s.trim()).filter(s => s !== 'Loader2' && s !== '');
            if (imports.length === 0) {
              return ''; // Remove the whole import if it was only Loader2
            }
            return `import { ${imports.join(', ')} } from "lucide-react"`;
          });
          modified = true;
        }

        // Add AppleSpinner import after the last import or at top
        if (modified && !content.includes('import AppleSpinner')) {
          const importsEnd = content.lastIndexOf('import ');
          if (importsEnd !== -1) {
            const newlineIdx = content.indexOf('\n', importsEnd);
            content = content.slice(0, newlineIdx + 1) + 'import AppleSpinner from "@/components/ui/AppleSpinner";\n' + content.slice(newlineIdx + 1);
          } else {
            content = 'import AppleSpinner from "@/components/ui/AppleSpinner";\n' + content;
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
