const fs = require('fs');
let content = fs.readFileSync('./constants/companyWebsitePlans.js', 'utf8');
content = content.replace(/A/g, '·');
fs.writeFileSync('./constants/companyWebsitePlans.js', content, 'utf8');
console.log('Fixed encoding in constants');
