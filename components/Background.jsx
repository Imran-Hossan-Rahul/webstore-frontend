export default function Background({ children }) {
  return (
    <div className="background mac-scroll w-full min-h-screen relative custom-scrollbar bg-brand-main">
      {children}
    </div>
  );
}
