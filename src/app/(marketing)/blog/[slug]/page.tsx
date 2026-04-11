import type { Metadata } from "next";
import { BlogPostPage } from "@/components/marketing/blog-post-page";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/cms/blog/${slug}`, { next: { revalidate: 300 } });
    const post = await res.json();
    return { title: post.metaTitle || post.title, description: post.metaDescription || post.excerpt };
  } catch {
    return { title: "Blog — NexAgent" };
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} />;
}