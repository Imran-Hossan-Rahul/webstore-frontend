const fs = require('fs');
const files = [
  'components/dashboard/market/MarketSEOContent.jsx',
  'components/dashboard/market/ProcessSection.jsx',
  'components/dashboard/market/StorePreviewSection.jsx',
  'components/orders/OrdersList.jsx',
  'components/ProfileComponents/VerifyEmailTab.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Simple regex to replace contractions or quotes in JSX text
  // This is a bit risky but we can replace common ones:
  content = content.replace(/don't/g, "don&apos;t");
  content = content.replace(/can't/g, "can&apos;t");
  content = content.replace(/you're/g, "you&apos;re");
  content = content.replace(/You're/g, "You&apos;re");
  content = content.replace(/It's/g, "It&apos;s");
  content = content.replace(/it's/g, "it&apos;s");
  content = content.replace(/We'll/g, "We&apos;ll");
  content = content.replace(/we'll/g, "we&apos;ll");
  content = content.replace(/You'll/g, "You&apos;ll");
  content = content.replace(/we've/g, "we&apos;ve");
  content = content.replace(/that's/g, "that&apos;s");
  content = content.replace(/That's/g, "That&apos;s");
  content = content.replace(/I'm/g, "I&apos;m");
  content = content.replace(/Let's/g, "Let&apos;s");
  content = content.replace(/let's/g, "let&apos;s");
  content = content.replace(/isn't/g, "isn&apos;t");
  fs.writeFileSync(file, content, 'utf8');
});
