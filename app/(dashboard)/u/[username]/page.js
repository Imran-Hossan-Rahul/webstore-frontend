import PublicProfile from "@/components/ProfileComponents/PublicProfile";
import { api } from "@/utils/api";

export async function generateMetadata({ params }) {
  try {
    const res = await api.get(`/user/profile/${params.username}`);
    if (res.success) {
      const user = res.data;
      const allowIndexing = user.privacy?.allowSearchIndexing !== false;
      
      return {
        title: `${user.name} (@${user.username}) | Store`,
        description: user.bio || `Check out ${user.name}'s profile on Store.`,
        robots: {
          index: allowIndexing,
          follow: allowIndexing,
        }
      };
    }
  } catch (err) {
    return { title: "Profile | Store" };
  }
  return { title: "Profile | Store" };
}

export default function ProfilePage({ params }) {
  return <PublicProfile username={params.username} />;
}
