const fs = require('fs');
const file = 'c:/Codalina/codalina-frontend/components/dashboard/market/MarketClientView.jsx';
let code = fs.readFileSync(file, 'utf8');

// The marker for the start of the hero section I added previously
const heroStartMarker = '{/* 3D Animated Professional Hero Section */}';
const fallbackHeroStartMarker = '{/* Digital Technology Partner Hero Section */}';
const heroEndMarker = '{/* Capabilities Section */}';

let startIndex = code.indexOf(heroStartMarker);
if (startIndex === -1) {
    startIndex = code.indexOf(fallbackHeroStartMarker);
}
const endIndex = code.indexOf(heroEndMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newHero = `
      {/* World-Class Premium Hero Section */}
      {!query && (
        <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-brand-navy pt-32 pb-24 md:pb-32 border-b border-white/[0.05]">
          {/* Background Effects - Ultra Premium Glow */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[url('/icons/grid-pattern.svg')] opacity-[0.03] z-0 pointer-events-none" style={{ backgroundSize: '60px 60px', backgroundPosition: 'center top' }}></div>
          
          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
            
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
              </span>
              <span className="text-[12px] font-mono text-white/80 uppercase tracking-[0.2em] font-medium">Digital Technology Partner</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-[52px] md:text-[80px] lg:text-[96px] font-display font-semibold tracking-[-0.04em] leading-[1.05] text-white mb-6">
                Build digital products <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-white/80">that scale.</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18px] md:text-[22px] text-brand-cloud/60 max-w-2xl mx-auto font-sans leading-relaxed mb-10"
            >
              Websites, software, and custom solutions — engineered with precision, built to last, and maintained for the long term.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button 
                onClick={() => {
                  const el = document.getElementById('what-we-build');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="group relative inline-flex items-center justify-center gap-2 bg-white text-brand-navy px-8 py-4 rounded-full font-sans font-medium text-[15px] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto"
              >
                Start a Project
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <Link 
                href="/shop" 
                className="group inline-flex items-center justify-center gap-2 bg-white/[0.05] text-white border border-white/[0.1] px-8 py-4 rounded-full font-sans font-medium text-[15px] hover:bg-white/[0.1] transition-colors w-full sm:w-auto backdrop-blur-md"
              >
                Explore Products
              </Link>
            </motion.div>
          </div>

          {/* 3D Dashboard/Interface Reveal */}
          <motion.div 
            initial={{ opacity: 0, y: 150, rotateX: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 2000 }}
            className="w-full max-w-[1100px] mx-auto mt-16 md:mt-24 px-4 md:px-6 relative z-20"
          >
            <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[16px] md:rounded-[24px] bg-[#071324]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden flex flex-col relative group">
              {/* Window Header */}
              <div className="h-12 border-b border-white/[0.08] flex items-center px-6 bg-white/[0.03]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20"></div>
                  <div className="w-3 h-3 rounded-full bg-white/20"></div>
                  <div className="w-3 h-3 rounded-full bg-white/20"></div>
                </div>
                <div className="mx-auto text-[11px] font-mono text-white/40 tracking-[0.1em]">CODALINA_SYSTEMS</div>
              </div>
              
              {/* Fake UI Content to look ultra premium */}
              <div className="flex-1 p-6 md:p-10 flex gap-6 md:gap-10">
                {/* Sidebar Mock */}
                <div className="hidden md:flex flex-col gap-5 w-[200px] border-r border-white/[0.05] pr-6">
                  <div className="h-5 w-24 bg-white/10 rounded-md mb-2"></div>
                  {[1,2,3,4,5].map((i, idx) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (idx * 0.1), duration: 0.5 }}
                      className="h-8 w-full bg-white/[0.04] rounded-md"
                    ></motion.div>
                  ))}
                </div>
                {/* Main Content Mock */}
                <div className="flex-1 flex flex-col gap-8">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-3">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                        className="h-4 w-32 bg-brand-cyan/40 rounded-full"
                      ></motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
                        className="h-12 w-64 bg-white/[0.08] rounded-lg"
                      ></motion.div>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
                      className="h-10 w-32 bg-brand-blue/60 rounded-md hidden sm:block"
                    ></motion.div>
                  </div>
                  {/* Chart/Grid area */}
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-end p-6 gap-3 md:gap-5 overflow-hidden relative">
                     {/* Floating Glow in Chart */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-blue/20 blur-[80px] rounded-full"></div>
                     {/* Horizontal grid lines */}
                     <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-20">
                       <div className="w-full h-px bg-white/[0.1]"></div>
                       <div className="w-full h-px bg-white/[0.1]"></div>
                       <div className="w-full h-px bg-white/[0.1]"></div>
                       <div className="w-full h-px bg-white/[0.1]"></div>
                     </div>
                     {/* Bars */}
                     {[30, 50, 40, 70, 55, 90, 65, 100, 80, 45, 75, 60].map((h, i) => (
                       <motion.div 
                         key={i}
                         initial={{ height: 0 }}
                         animate={{ height: \`\${h}%\` }}
                         transition={{ duration: 1.2, delay: 1.2 + (i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                         className="flex-1 bg-gradient-to-t from-brand-blue/30 via-brand-blue/60 to-brand-cyan/80 rounded-t-sm relative z-10 hover:brightness-125 transition-all"
                       ></motion.div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-transparent opacity-50 pointer-events-none"></div>
            </div>
          </motion.div>
          
        </div>
      )}
      `;

    code = code.substring(0, startIndex) + newHero + code.substring(endIndex);
    fs.writeFileSync(file, code);
    console.log('Hero fixed successfully');
} else {
    console.log('Markers not found');
}
