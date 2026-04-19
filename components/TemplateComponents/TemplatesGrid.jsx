"use client";

import TemplateCard from "../Card/TemplateCard";

export default function TemplatesGrid({ templatesData }) {
  const sections = [
    { key: "featured", title: "Featured Templates" },
    { key: "trending", title: "Trending Templates" },
    { key: "editorsChoice", title: "Editor’s Choice" },
  ];

  return (
    <div className="w-full px-4 md:px-8 mt-8 space-y-16">
      {sections.map((section) => {
        const items = templatesData[section.key];
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
              {items.map((template) => (
                <div key={template._id} className="break-inside-avoid mb-4">
                  <TemplateCard
                    title={template.title}
                    description={template.description}
                    tags={template.tags}
                    category={template.category}
                    price={template.price}
                    discount={template.discount}
                    rating={template.averageRating}
                    ratingCount={template.ratingCount}
                    previewFile={template.previewFile}
                    profilePic={template.user?.profilePic}
                    authorName={template.user?.name}
                    verifiedSeller={template.verifiedSeller}
                    viewsCount={template.viewsCount}
                    downloadsCount={template.downloadsCount}
                    featured={
                      template.popular
                        ? "popular"
                        : template.trending
                        ? "trending"
                        : template.editorsChoice
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
