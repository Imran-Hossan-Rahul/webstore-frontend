const fs = require('fs');
const file = 'c:/Codalina/codalina-frontend/components/dashboard/market/MarketClientView.jsx';
let code = fs.readFileSync(file, 'utf8');

// Replace all bg-brand-navy with bg-black to ensure pure dark sections
code = code.replaceAll('bg-brand-navy', 'bg-black');
code = code.replaceAll('bg-[#071324]', 'bg-[#050505]');
code = code.replaceAll('bg-[#0A1A2F]', 'bg-black');

fs.writeFileSync(file, code);
console.log('Background colors updated to pure dark in MarketClientView.jsx');
