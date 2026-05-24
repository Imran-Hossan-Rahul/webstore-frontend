import dynamic from "next/dynamic";

const CodexEditor = dynamic(() => import("@/components/blog-editor/BlogEditor"), {
  ssr: false,
});

export default function Page() {
  return <CodexEditor />;
}

