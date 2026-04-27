import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("@/components/blog-editor/BlogEditor"), {
  ssr: false,
});

export default function Page() {
  return <BlogEditor />;
}
