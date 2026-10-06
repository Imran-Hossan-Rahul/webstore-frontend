const fs = require('fs');
let content = fs.readFileSync('components/DashboardComponents/ImageUploadModal.jsx', 'utf8');

const regex = /<img\s+src=\{preview\}\s+alt="Preview"\s+className=\{`w-full \$\{\s*type === "profile" \? "aspect-square object-cover" : "aspect-\[3\/1\] object-cover"\s*\}`\}\s*\/>/;

const replacement = `<Image src={preview} alt="Preview" width={800} height={800} className={\`w-full h-auto \${type === "profile" ? "aspect-square object-cover" : "aspect-[3/1] object-cover"}\`} />`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('components/DashboardComponents/ImageUploadModal.jsx', content, 'utf8');
    console.log("Replaced");
} else {
    console.log("Not found");
}
