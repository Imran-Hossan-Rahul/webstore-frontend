// app/loading.js
export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-black dark:border-white border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
