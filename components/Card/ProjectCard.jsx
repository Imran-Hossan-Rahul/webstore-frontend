"use client";

export default function DevlogCard({ devlog }) {
  const folderName = devlog?.folder || null;
  const tags = Array.isArray(devlog?.tags) ? devlog.tags : [];

  return (
    <div className="border border-brand-navy/[0.08] dark:border-[#262626] rounded p-4 bg-brand-surface dark:bg-[#0A0A0A]">
      <h2 className="text-base font-medium font-sans text-slate-900 dark:text-white">{devlog.title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed mt-1">{devlog.description}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, i) => (
            <span key={i} className="text-[10px] font-mono text-brand-blue bg-brand-sky px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Options */}
      {devlog.options?.length > 0 && (
        <div className="flex flex-wrap gap-2 my-2">
          {devlog.options.map((opt) => (
            <span
              key={opt}
              className="bg-slate-100 dark:bg-brand-surface/[0.05] text-brand-slate dark:text-slate-300 px-2 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest border border-brand-navy/[0.08]"
            >
              {opt}
            </span>
          ))}
        </div>
      )}

      {/* Static Build Preview */}
      {folderName ? (
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/devlogs/${folderName}/index.html`.replace('/api/v1', '')}
          className="w-full h-96 border mt-2"
          title={devlog.title}
        ></iframe>
      ) : (
        <div className="text-red-500 text-sm mt-2">
          ⚠️ Folder not found — no devlog preview available.
        </div>
      )}

      {/* Image / Video preview */}
      {devlog.file && (
        <>
          {devlog.file.endsWith(".mp4") ? (
            <video
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/uploads/${devlog.file}`.replace('/api/v1', '')}
              controls
              className="w-full mt-2"
            />
          ) : (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/uploads/${devlog.file}`.replace('/api/v1', '')}
              alt={devlog.title}
              className="w-full mt-2"
            />
          )}
        </>
      )}
    </div>
  );
}

