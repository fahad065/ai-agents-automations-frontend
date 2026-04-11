"use client";

import dynamic from "next/dynamic";

const PipelineMonitor = dynamic(
  () => import("@/components/dashboard/pipeline-monitor").then(
    (m) => ({ default: m.PipelineMonitor })
  ),
  { ssr: false, loading: () => null }
);

export function PipelineClient() {
  return <PipelineMonitor />;
}