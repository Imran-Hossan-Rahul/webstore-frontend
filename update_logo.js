const fs = require('fs');

let file = 'components/dashboard/GlassNavbar.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace logo image
content = content.replace(/\/logo\.png/g, '/codalina-logo.png');

// Replace Codalina text with CodalinaHQ
content = content.replace(/>\s*Codalina\s*<\/span>/g, '>\n                      CodalinaHQ\n                  </span>');

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced logo and text");
