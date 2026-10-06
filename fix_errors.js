const fs = require('fs');

let file;
let content;

// ProcessSection.jsx
file = 'components/dashboard/market/ProcessSection.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<p className="text-white\/95/g, '<p key={Math.random()} className="text-white/95');
content = content.replace(/you'd/g, 'you&apos;d');
content = content.replace(/we're/g, 'we&apos;re');
content = content.replace(/won't/g, 'won&apos;t');
fs.writeFileSync(file, content, 'utf8');

// MarketSEOContent.jsx
file = 'components/dashboard/market/MarketSEOContent.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/you've/g, 'you&apos;ve');
content = content.replace(/they're/g, 'they&apos;re');
content = content.replace(/don't/g, 'don&apos;t');
content = content.replace(/It's/g, 'It&apos;s');
fs.writeFileSync(file, content, 'utf8');

// StorePreviewSection.jsx
file = 'components/dashboard/market/StorePreviewSection.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/What's/g, 'What&apos;s');
content = content.replace(/customer's/g, 'customer&apos;s');
fs.writeFileSync(file, content, 'utf8');

// OrdersList.jsx
file = 'components/orders/OrdersList.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/haven't/g, 'haven&apos;t');
fs.writeFileSync(file, content, 'utf8');

// VerifyEmailTab.jsx
file = 'components/ProfileComponents/VerifyEmailTab.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/didn't/g, 'didn&apos;t');
fs.writeFileSync(file, content, 'utf8');
