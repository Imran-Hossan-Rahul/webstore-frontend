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

    // This targets my previous broken replacement:
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}"/stats/user-analysis", {
    // and turns it into:
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/user-analysis`, {
    
    // We want to safely get rid of the `" ` after the `}` and the `",` or `")`
    content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL\}"([^"]+)"/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL\}'([^']+)'/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

    // It also looks like some `axios.get` calls are broken. Let's fix those too.
    content = content.replace(/\(process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\}`\)\s*\+\s*"([^"]+)"/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    content = content.replace(/\(process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\}`\)\s*\+\s*'([^']+)'/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

    // Look for stray backticks or quotes like: `${process.env.NEXT_PUBLIC_API_URL}"/endpoint",
    content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL\}"(\/[a-zA-Z0-9\-\/]+)"/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL\}'(\/[a-zA-Z0-9\-\/]+)'/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');

    if (content !== original) {
        console.log(`Fixed syntax in: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

for (const dir of targetDirs) {
    if (fs.existsSync(dir)) processDirectory(dir);
}
console.log("Cleanup complete.");
