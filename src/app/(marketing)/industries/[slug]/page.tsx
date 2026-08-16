import { IndustryDetailPage } from "@/components/marketing/industry-detail-page";

export default async function IndustryDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <IndustryDetailPage slug={slug} />;
}
