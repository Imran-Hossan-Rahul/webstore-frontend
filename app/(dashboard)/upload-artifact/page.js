"use client";
import ArtifactPublishForm from "@/components/Form/TemplateUpload";
import TrackerPatron from "@/components/TrackerPatron";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UploadArtifactContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "create";
    const id = searchParams.get("id");

    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <TrackerPatron />
        <ArtifactPublishForm mode={mode} id={id} />
      </div>
    );
}

export default function UploadArtifactPage() {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <UploadArtifactContent />
      </Suspense>
    );
}
