// This route is intentionally redirected to the dashboard blog detail page.
import { redirect } from 'next/navigation';

export default function BlogSlugRedirect({ params }) {
  redirect(`/blogs/${params.slug}`);
}