import JudgingPortal from "@/components/dashboard/challenges/JudgingPortal";

export default function JudgingPage({ params }) {
  return <JudgingPortal challengeId={params.id} />;
}
