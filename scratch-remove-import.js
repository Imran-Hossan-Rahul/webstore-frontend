const fs = require('fs'); const path = 'app/(dashboard)/blog/[slug]/page.js'; let c = fs.readFileSync(path, 'utf8'); c = c.replace(/import ProjectRightSidebar.*?\n/, ''); fs.writeFileSync(path, c);
