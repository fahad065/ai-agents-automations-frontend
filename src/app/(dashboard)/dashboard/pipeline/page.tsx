import type { Metadata } from "next";
import { PipelineClient } from "@/components/dashboard/pipeline-client";

export const metadata: Metadata = { title: "Pipeline Monitor — NexAgent" };

export default function PipelinePage() {
  return <PipelineClient />;
}