import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = [
    path.join(__dirname, 'components'),
    path.join(__dirname, 'app'),
    path.join(__dirname, 'utils')
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: (process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`) + "/...
    // Replace with: `${process.env.NEXT_PUBLIC_API_URL}/...
    content = content.replace(/\(process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\${process\.env\.NEXT_PUBLIC_API_URL\s*}`\)\s*\+\s*"/g, '`${process.env.NEXT_PUBLIC_API_URL}"');
    content = content.replace(/\(process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\${process\.env\.NEXT_PUBLIC_API_URL\s*}`\)\s*\+\s*'/g, "`${process.env.NEXT_PUBLIC_API_URL}'");

    // Pattern 2: ${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`}
    // Replace with: ${process.env.NEXT_PUBLIC_API_URL}
    content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\}`\}/g, '${process.env.NEXT_PUBLIC_API_URL}');
    
    // Pattern 3: fetch(${process.env... (Missing opening backtick)
    content = content.replace(/fetch\(\s*\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}');

    // Pattern 4: axios.get(${process.env... (Missing opening backtick)
    content = content.replace(/axios\.get\(\s*\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'axios.get(`${process.env.NEXT_PUBLIC_API_URL}');
    content = content.replace(/axios\.post\(\s*\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'axios.post(`${process.env.NEXT_PUBLIC_API_URL}');
    content = content.replace(/axios\.put\(\s*\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'axios.put(`${process.env.NEXT_PUBLIC_API_URL}');
    content = content.replace(/axios\.delete\(\s*\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, 'axios.delete(`${process.env.NEXT_PUBLIC_API_URL}');

    // Clean up socket mess
    content = content.replace(/process\.env\.NEXT_PUBLIC_SOCKET_URL\s*\|\|\s*\(process\.env\.NEXT_PUBLIC_API_URL\s*\)/g, 'process.env.NEXT_PUBLIC_SOCKET_URL');

    // api.js mess
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*\(process\.env\.NEXT_PUBLIC_API_URL\s*\)\s*\+\s*""\}`/g, 'process.env.NEXT_PUBLIC_API_URL');
    
    // Any remaining ` (process.env.NEXT_PUBLIC_API_URL ) ` weirdness
    content = content.replace(/\(process\.env\.NEXT_PUBLIC_API_URL\s*\)/g, 'process.env.NEXT_PUBLIC_API_URL');
    
    // Any missed `process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL }`) + ''
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*process\.env\.NEXT_PUBLIC_API_URL\s*\+\s*''/g, 'process.env.NEXT_PUBLIC_API_URL');

    if (content !== original) {
        console.log(`Fixed syntax in: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

for (const dir of targetDirs) {
    if (fs.existsSync(dir)) processDirectory(dir);
}
console.log("Cleanup complete.");
