const fs = require('fs');

function replaceInFile(file, replacements, addImport = true) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (let [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }

  if (changed) {
    if (addImport && !content.includes("import Image from")) {
      // Find the first import and add it after
      content = content.replace(/import .*?;?[\r\n]+/, (match) => match + "import Image from 'next/image';\n");
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}

// 1. GlassNavbar.jsx
replaceInFile('components/dashboard/GlassNavbar.jsx', [
  ['<img src="/logo.png" alt="Codalina" className="h-8 w-8 object-contain" />', '<Image src="/logo.png" alt="Codalina" width={32} height={32} className="h-8 w-8 object-contain" />'],
  ['<img src="/logo.png" alt="Codalina" className="w-[15px] h-[15px] object-contain shrink-0 mr-1.5 z-10 mb-[3px]" />', '<Image src="/logo.png" alt="Codalina" width={15} height={15} className="w-[15px] h-[15px] object-contain shrink-0 mr-1.5 z-10 mb-[3px]" />'],
  ['<img src={getOptimizedUrl(user.profilePicture)} alt="" className="w-full h-full object-cover" />', '<Image src={getOptimizedUrl(user.profilePicture)} alt="" fill className="object-cover" sizes="40px" />']
]);

// 2. EditorialProductShowcase.jsx
replaceInFile('components/dashboard/market/EditorialProductShowcase.jsx', [
  [
    '<img \n                  src={getOptimizedUrl(JSON.parse(featured.photos)[0])}\n                  alt={featured.title}\n                  className="w-full h-full object-cover"\n                />',
    '<Image src={getOptimizedUrl(JSON.parse(featured.photos)[0])} alt={featured.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />'
  ],
  [
    '<img \n                    src={getOptimizedUrl(JSON.parse(product.photos)[0])}\n                    alt={product.title}\n                    className="w-full h-full object-cover"\n                  />',
    '<Image src={getOptimizedUrl(JSON.parse(product.photos)[0])} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />'
  ]
]);

// 3. MarketClientView.jsx
replaceInFile('components/dashboard/market/MarketClientView.jsx', [
  [
    '<img \n            src={getOptimizedUrl(JSON.parse(product.photos)[0])} \n            alt={product.title} \n            className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500 ease-out" \n          />',
    '<Image src={getOptimizedUrl(JSON.parse(product.photos)[0])} alt={product.title} fill className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />'
  ],
  ['<img src="https://i.pravatar.cc/100?img=33" alt="user" className="w-full h-full object-cover"/>', '<Image src="https://i.pravatar.cc/100?img=33" alt="user" fill className="object-cover" sizes="40px" />'],
  ['<img src="https://i.pravatar.cc/100?img=47" alt="user" className="w-full h-full object-cover"/>', '<Image src="https://i.pravatar.cc/100?img=47" alt="user" fill className="object-cover" sizes="40px" />'],
  ['<img src="https://i.pravatar.cc/100?img=12" alt="user" className="w-full h-full object-cover"/>', '<Image src="https://i.pravatar.cc/100?img=12" alt="user" fill className="object-cover" sizes="40px" />']
]);

// 4. ImageUploadModal.jsx
replaceInFile('components/DashboardComponents/ImageUploadModal.jsx', [
  [
    '<img\n                  src={preview}\n                  alt="Preview"\n                  className="w-full h-auto max-h-[60vh] object-contain"\n                />',
    '<Image src={preview} alt="Preview" width={800} height={600} className="w-full h-auto max-h-[60vh] object-contain" />'
  ]
]);

// 5. OrdersList.jsx
replaceInFile('components/orders/OrdersList.jsx', [
  [
    '<img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply " />',
    '<Image src={photo} alt="" fill className="object-contain mix-blend-multiply" sizes="100px" />'
  ]
]);

// 6. PublicProfile.jsx
replaceInFile('components/ProfileComponents/PublicProfile.jsx', [
  [
    '<img src={profile.profilePicture ? getOptimizedUrl(profile.profilePicture) : "https://via.placeholder.com/150"} className="w-full h-full object-cover" />',
    '<Image src={profile.profilePicture ? getOptimizedUrl(profile.profilePicture) : "https://via.placeholder.com/150"} alt="Profile" fill className="object-cover" sizes="150px" />'
  ],
  [
    '<img \n                src={getOptimizedUrl(profile.profilePicture)} \n                alt={profile.name} \n                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" \n              />',
    '<Image src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes="300px" />'
  ]
]);

