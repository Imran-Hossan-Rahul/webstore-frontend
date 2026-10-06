const fs = require('fs');
let content = fs.readFileSync('components/DashboardComponents/ImageUploadModal.jsx', 'utf8');

const target = <img
                  src={preview}
                  alt="Preview"
                  className={\w-full \\}
                />;

const replacement = <Image
                  src={preview}
                  alt="Preview"
                  width={800}
                  height={800}
                  className={\w-full h-auto \\}
                />;

content = content.replace(target, replacement);
fs.writeFileSync('components/DashboardComponents/ImageUploadModal.jsx', content, 'utf8');
