"use client";
import PostJobPage from "@/components/dashboard/patron/PostJobPage";
import { useParams } from "next/navigation";

export default function EditJobRoute() {
  const { jobId } = useParams();
  
  return <PostJobPage editId={jobId} />;
}
