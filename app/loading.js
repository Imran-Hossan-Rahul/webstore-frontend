import AppleSpinner from "@/components/ui/AppleSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 dark:bg-[#030303]/70 backdrop-blur-md z-[9999]">
      <AppleSpinner size={50} className="text-brand-blue" />
    </div>
  );
}
