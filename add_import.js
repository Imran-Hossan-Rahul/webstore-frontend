const fs = require('fs');

function addImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("import Image from")) {
    content = content.replace(/import .*?;?[\r\n]+/, (match) => match + "import Image from 'next/image';\n");
    fs.writeFileSync(file, content, 'utf8');
  }
}

addImport('components/dashboard/market/EditorialProductShowcase.jsx');
addImport('components/DashboardComponents/ImageUploadModal.jsx');
