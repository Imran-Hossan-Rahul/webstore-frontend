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
    
    // Remove the fallback logic created by the previous script
    content = content.replace(/\|\|\s*["'`]http:\/\/localhost:5000\/api\/v1["'`]/g, '');
    content = content.replace(/\|\|\s*["'`]http:\/\/localhost:5000["'`]/g, '');

    // Convert standard artifact literals `${process.env.NEXT_PUBLIC_API_URL}/endpoint`
    // Ensure Next.js can interpolate it cleanly
    
    if (content !== original) {
        console.log(`Cleaned up: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

for (const dir of targetDirs) {
    if (fs.existsSync(dir)) processDirectory(dir);
}
console.log("Cleanup complete.");

