const fs = require('fs');

let file1 = 'components/dashboard/market/MarketClientView.jsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/<img\s+src=\{getOptimizedUrl\(JSON\.parse\(product\.photos\)\[0\]\)\}\s+alt=\{product\.title\}\s+className="w-full h-full object-contain p-4 group-hover:scale-\[1\.03\] transition-transform duration-500 ease-out"\s*\/>/g, '<Image src={getOptimizedUrl(JSON.parse(product.photos)[0])} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500 ease-out" />');
fs.writeFileSync(file1, content1, 'utf8');

let file2 = 'components/ProfileComponents/PublicProfile.jsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/<img\s+src=\{getOptimizedUrl\(profile\.profilePicture\)\}\s+alt=\{profile\.name\}\s+className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-\[1\.02\]"\s*\/>/g, '<Image src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} fill sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />');
fs.writeFileSync(file2, content2, 'utf8');

console.log("Replaced remaining images");
