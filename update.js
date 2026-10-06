const fs = require('fs');

let content = fs.readFileSync('./components/dashboard/market/ServicesStoryteller.jsx', 'utf-8');

const importStmt = "import { COMPANY_WEBSITE_PLANS } from '@/constants/companyWebsitePlans';\n";
content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\n" + importStmt);

const oldService = `    {
      title: "Company Website",
      icon: <MonitorPlay className="w-7 h-7 text-green-400" strokeWidth={1.5} />,
      desc: "Professional corporate presence designed to establish trust, engage visitors, and showcase your brand.",
      bullets: ["Responsive Layouts", "SEO & Performance Optimized", "Content Management System", "Lead Generation Focused"],
      tags: ["Next.js", "Tailwind", "Framer"],
      metric: { value: "Trust", label: "Builds" },
      price: "Starts at 1,00,000 BDT",
      glow: "from-green-500/20 to-transparent",
      flex: "1.2",
      storeLink: "/store?category_name=Company+Website"
    }`;

const newService = `    {
      title: "Company Website",
      icon: <MonitorPlay className="w-7 h-7 text-green-400" strokeWidth={1.5} />,
      desc: COMPANY_WEBSITE_PLANS.description,
      isTiered: true,
      tiers: COMPANY_WEBSITE_PLANS.tiers,
      addons: COMPANY_WEBSITE_PLANS.addons,
      trustLine: COMPANY_WEBSITE_PLANS.trustLine,
      bullets: [],
      tags: [],
      metric: { value: "Trust", label: "Builds" },
      price: COMPANY_WEBSITE_PLANS.priceStart,
      glow: "from-green-500/20 to-transparent",
      flex: "1.2",
      // TODO: verify contact route exists or change to correct form
      storeLink: "/contact"
    }`;

content = content.replace(oldService, newService);

const newCardItem = `
const CardItem = ({ service, isStacked, index }) => {
  const [activeTierIdx, setActiveTierIdx] = useState(1);

  if (service.isTiered) {
    const activeTier = service.tiers[activeTierIdx] || service.tiers[0];
    
    return (
      <div className="group relative cursor-pointer w-full h-full transform-gpu will-change-transform">
        <div className={\`absolute inset-0 bg-gradient-to-br \${service.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[16px] transform-gpu will-change-transform\`}></div>
        <div className="relative h-full w-full bg-[#080808] backdrop-blur-3xl ring-1 ring-white/10 group-hover:ring-white/30 ring-inset rounded-[16px] px-5 pb-5 pt-4 md:px-7 md:pb-7 md:pt-6 flex flex-col transition-all duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_40px_rgba(0,0,0,0.8)] transform-gpu will-change-transform" style={{ WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
          
          <h3 className="text-[18px] md:text-[24px] font-display font-medium text-white mb-2 leading-tight relative z-10 w-full whitespace-nowrap">
            {service.title}
          </h3>
          <p className="text-[13px] md:text-[15px] text-[#A0A0A0] leading-relaxed mb-4 relative z-10 w-full">
            {service.desc}
          </p>
          
          {/* Tier Selector */}
          <div className="relative z-10 flex flex-col md:flex-row gap-2 mb-4">
             {service.tiers.map((tier, idx) => (
                <button 
                  key={tier.id}
                  onClick={(e) => { e.stopPropagation(); setActiveTierIdx(idx); }}
                  className={\`relative flex-1 py-1.5 px-3 rounded-lg border transition-all text-left md:text-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-cyan \${activeTierIdx === idx ? 'bg-white/10 border-brand-cyan/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'}\`}
                >
                  <div className="flex justify-between items-center md:flex-col md:justify-center md:gap-1">
                    <span className={\`text-[13px] md:text-[14px] font-medium \${activeTierIdx === idx ? 'text-white' : 'text-white/70'}\`}>
                      {tier.name}
                    </span>
                    {tier.isPopular && (
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded">
                        Most Popular
                      </span>
                    )}
                  </div>
                </button>
             ))}
          </div>

          <ul className="flex flex-col gap-2 mb-auto relative z-10 overflow-y-auto pr-2 max-h-[160px] md:max-h-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeTier.bullets.map((bullet, idx) => {
              const isPlus = bullet.includes('Everything in');
              return (
                <li key={idx} className="flex items-start gap-2.5 text-[12px] md:text-[13px] text-white/75 font-sans">
                  {isPlus ? (
                     <ArrowRight className="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5" />
                  ) : (
                     <Check className="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5" />
                  )}
                  <span className={\`leading-tight \${isPlus ? 'font-medium text-white' : ''}\`}>{bullet}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3 relative z-10">
            {/* Add-ons */}
            {service.addons && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                <span className="text-[11px] text-white/50 w-full mb-0.5">Optional Add-ons:</span>
                {service.addons.map((addon, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-[4px] bg-white/5 border border-white/10 text-[10px] text-[#A0A0A0]">
                    {addon.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col min-[450px]:flex-row min-[450px]:items-end justify-between gap-3 mt-1">
              <div className="flex flex-col gap-0.5">
                 <span className="text-[15px] md:text-[17px] font-semibold text-white">{activeTier.price}</span>
                 <span className="text-[10px] text-[#808080]">{service.trustLine}</span>
                 <span className="text-[10px] text-white/30 mt-1 cursor-help" title="Built with Next.js, Tailwind, Framer">Built with Next.js</span>
              </div>
              <Link
                href={service.storeLink || '/store'}
                onClick={(e) => e.stopPropagation()}
                aria-label="Get a Free Quote"
                className="group/btn relative w-full min-[450px]:w-auto px-4 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 hover:border-brand-cyan/60 rounded-lg text-[13px] md:text-[14px] font-medium text-brand-cyan hover:text-white transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-[#080808]"
              >
                Get a Free Quote <ArrowRight aria-hidden="true" className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative cursor-pointer w-full h-full transform-gpu will-change-transform">
      <div className={\`absolute inset-0 bg-gradient-to-br \${service.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[16px] transform-gpu will-change-transform\`}></div>
      <div className="relative h-full w-full bg-[#080808] backdrop-blur-3xl ring-1 ring-white/10 group-hover:ring-white/30 ring-inset rounded-[16px] px-6 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6 flex flex-col transition-all duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_40px_rgba(0,0,0,0.8)] transform-gpu will-change-transform" style={{ WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
        
        <h3 className="text-[16px] min-[350px]:text-[19px] md:text-[26px] font-display font-medium text-white mb-3 leading-tight relative z-10 transition-all w-full whitespace-nowrap">
          {service.title}
        </h3>
        <p className="text-[14px] md:text-[16px] text-[#A0A0A0] leading-relaxed mb-6 relative z-10 w-[95%]">
          {service.desc}
        </p>
        
        <ul className="flex flex-col gap-3 mb-auto relative z-10">
          {service.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-[14px] md:text-[15px] text-white/70 font-sans">
              <Check className="w-4 h-4 text-brand-cyan shrink-0 mt-1" />
              <span className="leading-tight">{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col gap-4 relative z-10">
          <div className="flex flex-wrap gap-2 mb-1">
            {service.tags && service.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 rounded-[4px] bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono uppercase tracking-wider group-hover:border-white/20 transition-colors">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[14px] md:text-[16px] font-medium text-white/80">{service.price}</span>
            <Link
              href={service.storeLink || '/store'}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] md:text-[14px] font-medium text-brand-cyan group-hover:text-white flex items-center gap-1.5 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-[#080808] rounded"
            >
              Explore <ArrowRight aria-hidden="true" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const oldCardItemStart = "  const CardItem = ({ service, isStacked, index }) => (";
const oldCardItemEnd = "  );\n\n  return (";

const startIdx = content.indexOf(oldCardItemStart);
const endIdx = content.indexOf(oldCardItemEnd) + "  );\n".length;

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newCardItem + content.substring(endIdx);
    fs.writeFileSync('./components/dashboard/market/ServicesStoryteller.jsx', content, 'utf-8');
    console.log("Success");
} else {
    console.log("Could not find CardItem boundaries");
}
