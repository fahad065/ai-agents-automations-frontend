import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/marketing/blog-post-page";
import { lookupContent, NOT_FOUND_METADATA } from "@/lib/fetch-content";

interface Props { params: Promise<{ slug: string }>; }

interface BlogPost { title: string; metaTitle?: string; metaDescription?: string; excerpt?: string }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await lookupContent<BlogPost>(`/cms/content/blog/${slug}`);
  if (result.state === "missing") return NOT_FOUND_METADATA;
  if (result.state !== "found") return { title: "Blog" };
  const post = result.data;
  return { title: post.metaTitle || post.title, description: post.metaDescription || post.excerpt };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const result = await lookupContent(`/cms/content/blog/${slug}`);
  if (result.state === "missing") notFound();
  return <BlogPostPage slug={slug} />;
}
