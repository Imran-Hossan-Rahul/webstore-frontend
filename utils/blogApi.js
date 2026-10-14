import { api } from "./api";

// Blog Category API
export const getBlogCategories = () => api.get("/blogs/categories");
export const createBlogCategory = (data) => api.post("/blogs/categories", data);

// Blog Post API
export const getBlogs = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/blogs?${query}`);
};

export const getBlogBySlug = (slug, lang = "en") => 
  api.get(`/blogs/${slug}?lang=${lang}`);

export const createBlog = (data) => api.post("/blogs", data);

export const updateBlog = (slug, data) => api.put(`/blogs/${slug}`, data);

export const incrementBlogView = (slug) => api.post(`/blogs/${slug}/view`);
