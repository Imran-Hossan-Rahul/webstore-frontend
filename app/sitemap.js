export default async function sitemap() {
  const baseUrl = 'https://webstore-frontend-fawn.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const sitemapUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    // Fetch Blogs
    const blogsRes = await fetch(`${apiUrl}/blog?limit=1000`);
    if (blogsRes.ok) {
      const blogsData = await blogsRes.json();
      const blogs = blogsData.blogs || blogsData.data || (Array.isArray(blogsData) ? blogsData : []);
      blogs.forEach((blog) => {
        if (blog.slug) {
          sitemapUrls.push({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: new Date(blog.updatedAt || blog.createdAt),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }

    // Fetch Templates
    const templatesRes = await fetch(`${apiUrl}/template?limit=1000`);
    if (templatesRes.ok) {
      const templatesData = await templatesRes.json();
      const templates = templatesData.templates || templatesData.data || (Array.isArray(templatesData) ? templatesData : []);
      templates.forEach((template) => {
        if (template._id) {
          sitemapUrls.push({
            url: `${baseUrl}/templates/${template._id}`,
            lastModified: new Date(template.updatedAt || template.createdAt),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }

  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return sitemapUrls;
}
