"use client";

export default function ProjectCard({ project }) {
  const folderName = project?.folder || null;
  const tags = Array.isArray(project?.tags) ? project.tags : [];

  return (
    <div className="border rounded p-4 shadow-md bg-white">
      <h2 className="text-xl font-bold">{project.title}</h2>
      <p className="text-gray-700">{project.description}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <p className="text-sm text-gray-500">Tags: {tags.join(", ")}</p>
      )}

      {/* Options */}
      {project.options?.length > 0 && (
        <div className="flex flex-wrap gap-2 my-2">
          {project.options.map((opt) => (
            <span
              key={opt}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
            >
              {opt}
            </span>
          ))}
        </div>
      )}

      {/* Static Build Preview */}
      {folderName ? (
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/projects/${folderName}/index.html`.replace('/api/v1', '')}
          className="w-full h-96 border mt-2"
          title={project.title}
        ></iframe>
      ) : (
        <div className="text-red-500 text-sm mt-2">
          ⚠️ Folder not found — no project preview available.
        </div>
      )}

      {/* Image / Video preview */}
      {project.file && (
        <>
          {project.file.endsWith(".mp4") ? (
            <video
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/uploads/${project.file}`.replace('/api/v1', '')}
              controls
              className="w-full mt-2"
            />
          ) : (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/uploads/${project.file}`.replace('/api/v1', '')}
              alt={project.title}
              className="w-full mt-2"
            />
          )}
        </>
      )}
    </div>
  );
}
