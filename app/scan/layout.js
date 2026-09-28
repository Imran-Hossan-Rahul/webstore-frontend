export const metadata = {
  title: "Unbox. Explore. Innovate. | Codalina",
  description: "Welcome to the Codalina experience.",
};

export default function ScanLayout({ children }) {
  return (
    <div className="min-h-screen ] text-white selection:] selection:text-white font-sans antialiased relative overflow-hidden bg-brand-main">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#4F46E5]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
