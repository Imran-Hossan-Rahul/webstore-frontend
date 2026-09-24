const fs = require('fs');
let code = fs.readFileSync('c:/Codalina/codalina-frontend/app/(dashboard)/checkout/page.js', 'utf8');

// Chunk 1
code = code.replace(
  /const \[paymentMethod, setPaymentMethod\] = useState\(''\);\s*const \[deliveryMethod, setDeliveryMethod\] = useState\('Regular Delivery'\);\s*const \[addressTab, setAddressTab\] = useState\('New Address'\);\s*const \[form, setForm\] = useState\(\{[\s\S]*?district: '',\s*thana: ''\s*\}\);\s*const \[showLocationModal, setShowLocationModal\] = useState\(false\);\s*const \[modalStep, setModalStep\] = useState\(1\);\s*const \[tempLocation, setTempLocation\] = useState\(\{ district: '', thana: '', zip: '' \}\);\s*const \[searchQuery, setSearchQuery\] = useState\(''\);\s*const \[addressConfirmed, setAddressConfirmed\] = useState\(false\);\s*const \[termsAccepted, setTermsAccepted\] = useState\(false\);\s*const \[addressSaved, setAddressSaved\] = useState\(false\);\s*const \[orderConfirmed, setOrderConfirmed\] = useState\(false\);\s*const \[showErrorModal, setShowErrorModal\] = useState\(false\);\s*const \[errorMessage, setErrorMessage\] = useState\(''\);\s*const \[mounted, setMounted\] = useState\(false\);\s*const \[marketConfig, setMarketConfig\] = useState\(null\);\s*const \[promoCodeInput, setPromoCodeInput\] = useState\(''\);\s*const \[appliedPromo, setAppliedPromo\] = useState\(null\);\s*const \[promoError, setPromoError\] = useState\(''\);\s*const \[savedAddresses, setSavedAddresses\] = useState\(\[\]\);\s*const \[formErrors, setFormErrors\] = useState\(\{\}\);\s*const \[deliveryData, setDeliveryData\] = useState\(\{ baseCharge: 0, codCharge: 0, totalDeliveryCharge: 0, totalWeightInGrams: 0 \}\);\s*const \[isCalculatingDelivery, setIsCalculatingDelivery\] = useState\(false\);\s*const selectedDistrictId = districts\.find[\s\S]*?\[\];/m,
  `const [paymentMethod, setPaymentMethod] = useState('');
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '' 
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const [marketConfig, setMarketConfig] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [formErrors, setFormErrors] = useState({});`
);

// Chunk 2
code = code.replace(
  /try \{\s*const stored = localStorage\.getItem\('codalina_addresses'\);[\s\S]*?setDeliveryData\(\{ baseCharge: 0, codCharge: 0, totalDeliveryCharge: 0, totalWeightInGrams: 0 \}\);\s*\}\s*\}, \[form\.district, form\.thana, quantity, paymentType, product\]\);/m,
  `  }, [productId]);`
);

// Chunk 3
code = code.replace(
  /const address = \{[\s\S]*?details: form\.address_line\s*\};\s*const discountAmountPerItem = appliedPromo \? \(baseFinalPrice \* appliedPromo\.discountPercentage\) \/ 100 : 0;\s*const finalPriceAfterDiscount = baseFinalPrice - discountAmountPerItem;\s*const payload = \{\s*phone: form\.phone,\s*address,[\s\S]*?total_amount: total\s*\};/m,
  `const discountAmountPerItem = appliedPromo ? (baseFinalPrice * appliedPromo.discountPercentage) / 100 : 0;
      const finalPriceAfterDiscount = baseFinalPrice - discountAmountPerItem;

      const payload = {
        phone: form.phone,
        email: form.email,
        name: form.name,
        isDigital: true,
        items: [{ product_id: product.id, quantity, price: finalPriceAfterDiscount, variants: variantSummary }],
        source_channel: 'organic:direct',
        delivery_charge: 0,
        discount_amount: discountAmount,
        subtotal: subTotal,
        total_amount: total
      };`
);

// Chunk 4
code = code.replace(
  /const handleSaveAddress = \(\) => \{[\s\S]*?\} catch\(e\) \{\}\s*\};/m,
  ``
);

// Chunk 5
code = code.replace(
  /const deliveryCharge = deliveryData\.totalDeliveryCharge \|\| 0;\s*const total = subTotal - discountAmount \+ deliveryCharge;\s*const totalOriginal = baseOriginalPrice \* quantity \+ deliveryCharge;\s*const isFormValid = \s*addressTab === 'New Address' &&\s*form\.name\.trim\(\) !== '' &&\s*form\.phone\.trim\(\)\.length >= 11 &&\s*form\.address_line\.trim\(\) !== '' &&\s*form\.district !== '' &&\s*form\.thana !== '' &&\s*addressConfirmed &&\s*termsAccepted;/m,
  `const deliveryCharge = 0;
  const total = subTotal - discountAmount;
  const totalOriginal = baseOriginalPrice * quantity;

  const isFormValid = 
    form.name.trim() !== '' &&
    form.phone.trim().length >= 11 &&
    form.email.trim() !== '' &&
    termsAccepted;`
);

// Chunk 6 (Delivery Form)
code = code.replace(
  /\{\/\* Delivery Section \*\/\}[\s\S]*?\{\/\* Right Column \*\/}/m,
  `{/* Delivery Details */}
            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Customer Details</h2>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 text-[#111827] dark:text-white">
                  <FileText size={18} />
                  <span className="font-semibold text-sm">Digital Delivery Information</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">Your license keys and download links will be sent to this email address.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input required type="text" value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setFormErrors({...formErrors, name: null}); }} className="w-full border rounded py-2.5 px-4 text-sm focus:outline-none focus:ring-1 border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent" placeholder="Full Name" />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1.5 ml-1">{formErrors.name}</p>}
                </div>
                
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <input required type="tel" value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setFormErrors({...formErrors, phone: null}); }} className="w-full border rounded py-2.5 px-3 sm:px-4 text-sm focus:outline-none focus:ring-1 border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent" placeholder="Phone Number" />
                    {formErrors.phone && <p className="text-xs text-red-500 mt-1.5 ml-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <input required type="email" value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setFormErrors({...formErrors, email: null}); }} className="w-full border rounded py-2.5 px-4 text-sm focus:outline-none focus:ring-1 border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent" placeholder="Email Address" />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1.5 ml-1">{formErrors.email}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}`
);

// Chunk 7 (Delivery Charge Right Column Logic)
code = code.replace(
  /<div className="flex justify-between w-full">\s*<span className="text-gray-600 dark:text-gray-400">Delivery Charge<\/span>[\s\S]*?<\/div>\s*<\/div>/m,
  `<div className="flex justify-between w-full">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Charge</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      0 BDT <span className="text-xs text-emerald-600 font-normal ml-1">(Instant Digital)</span>
                    </span>
                  </div>
                </div>`
);

// Chunk 8 (Remove Location Modal at end of file)
code = code.replace(
  /\{showLocationModal && mounted && createPortal\([\s\S]*?, document\.body\)}/m,
  ``
);

fs.writeFileSync('c:/Codalina/codalina-frontend/app/(dashboard)/checkout/page.js', code);
console.log('File successfully updated.');
