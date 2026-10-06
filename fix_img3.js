const fs = require('fs');

let file1 = 'components/dashboard/market/MarketClientView.jsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/<img\s+src=\{getOptimizedUrl\(JSON\.parse\(product\.photos\)\[0\]\)\}\s+alt=\{product\.title\}\s+loading="lazy"\s+className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 ease-out group-hover:scale-105"\s*\/>/g, '<Image src={getOptimizedUrl(JSON.parse(product.photos)[0])} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 ease-out group-hover:scale-105" />');
fs.writeFileSync(file1, content1, 'utf8');

console.log("Replaced");
