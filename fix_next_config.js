const fs = require('fs');
let content = fs.readFileSync('next.config.mjs', 'utf8');

if (!content.includes('i.pravatar.cc')) {
  content = content.replace(
    /remotePatterns:\s*\[/,
    "remotePatterns: [\n      { protocol: 'https', hostname: 'i.pravatar.cc' },\n      { protocol: 'https', hostname: 'via.placeholder.com' },"
  );
  fs.writeFileSync('next.config.mjs', content, 'utf8');
}
