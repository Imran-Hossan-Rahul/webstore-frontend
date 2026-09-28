const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'components'));
// Also add app directory just in case there are popovers or contextual menus inline
const appFiles = walk(path.join(__dirname, 'app'));
const allFiles = [...files, ...appFiles];

let updatedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. We are looking for typical floating UI signatures:
  // Usually they are absolute/fixed and have z-indexes, or are known modals (Modal.jsx, Dropdown.jsx)

  // Standardize the "dark:bg-[#...]" used in modals to dark:bg-brand-dark
  // e.g. dark:bg-[#0D1117], dark:bg-[#06172E] in modal wrappers.
  // Wait, let's just target specific component patterns to be safe.
  
  const isModalOrDropdown = file.includes('Modal') || file.includes('Dropdown') || file.includes('Popover') || file.includes('Drawer') || file.includes('GlassNavbar');
  
  if (isModalOrDropdown) {
    // Replace typical dark mode background variants for modals
    content = content.replace(/dark:bg-\[#0D1117\]/g, 'dark:bg-brand-dark');
    content = content.replace(/dark:bg-\[#0a0a0a\]\/60/g, 'dark:bg-brand-dark');
    
    // Replace bg-brand-cloud with bg-brand-surface for Modals (like in Modal.jsx)
    if (file.includes('Modal.jsx')) {
        content = content.replace(/bg-brand-cloud/g, 'bg-brand-surface');
    }
    
    // Replace borders to the 0.10 standard if they are floating
    content = content.replace(/border-brand-navy\/\[0\.08\]/g, 'border-brand-navy/[0.10]');
    
    // Replace shadows with soft elevation shadow
    // We only want to replace basic shadows on the main modal container, not buttons inside
    // This is tricky via regex. Let's do it on known elements.
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log('Updated:', file);
  }
});

console.log(`Updated ${updatedCount} files.`);
