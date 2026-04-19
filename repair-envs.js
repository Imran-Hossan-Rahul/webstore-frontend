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

    // Fix the horribly nested declarations my previous script made:
    // API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || `${...}`) + "";
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*\(process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\${process\.env\.NEXT_PUBLIC_API_URL\s*}`\)\s*\+\s*""/g, 'process.env.NEXT_PUBLIC_API_URL');
    
    // Also clean up Socket URL messes if any
    content = content.replace(/process\.env\.NEXT_PUBLIC_SOCKET_URL\s*\|\|\s*\(process\.env\.NEXT_PUBLIC_SOCKET_URL\s*\|\|\s*`\${process\.env\.NEXT_PUBLIC_SOCKET_URL\s*}`\)\s*\+\s*""/g, 'process.env.NEXT_PUBLIC_SOCKET_URL');

    // Make sure we have a clean process.env reference
    
    if (content !== original) {
        console.log(`Cleaned up broken env reference: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

for (const dir of targetDirs) {
    if (fs.existsSync(dir)) processDirectory(dir);
}
console.log("Cleanup complete.");
