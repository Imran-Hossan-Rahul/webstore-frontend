"use client";

import ArtifactCard from "../Card/ArtifactCard";

export default function ArtifactsGrid({ artifactsData }) {
  const sections = [
    { key: "featured", title: "Featured Artifacts" },
    { key: "trending", title: "Trending Artifacts" },
    { key: "editorsChoice", title: "Editor’s Choice" },
  ];

  return (
    <div className="w-full px-4 md:px-8 mt-8 space-y-16">
      {sections.map((section) => {
        const items = artifactsData[section.key];
        if (!items || items.length === 0) return null;

        return (
          <div key={section.key} className="w-full">
            {/* Section Title */}
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              {section.title}
            </h2>

            {/* Masonry Layout */}
            <div
              className="
              columns-1
              sm:columns-2
              md:columns-3
              lg:columns-4 
              xl:columns-5
              gap-4
            "
            >
              {items.map((artifact) => (
                <div key={artifact._id} className="break-inside-avoid mb-4">
                  <ArtifactCard
                    title={artifact.title}
                    description={artifact.description}
                    tags={artifact.tags}
                    category={artifact.category}
                    price={artifact.price}
                    discount={artifact.discount}
                    rating={artifact.averageRating}
                    ratingCount={artifact.ratingCount}
                    previewFile={artifact.previewFile}
                    profilePic={artifact.user?.profilePic}
                    authorName={artifact.user?.name}
                    verifiedSeller={artifact.verifiedSeller}
                    viewsCount={artifact.viewsCount}
                    downloadsCount={artifact.downloadsCount}
                    featured={
                      artifact.popular
                        ? "popular"
                        : artifact.trending
                        ? "trending"
                        : artifact.editorsChoice
                        ? "editorsChoice"
                        : ""
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

