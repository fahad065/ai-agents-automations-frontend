export interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    avatar?: string;
    provider: "local" | "google";
    isActive: boolean;
    createdAt: string;
  }
  
  export interface Agent {
    _id: string;
    userId: string;
    templateId: AgentTemplate;
    name: string;
    status: "active" | "paused" | "error";
    niche?: string;
    scheduleFrequency: string;
    scheduleTime: string;
    videosGenerated: number;
    creditsUsed: number;
    lastRunAt?: string;
    isDeleted: boolean;
  }
  
  export interface AgentTemplate {
    _id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    capabilities: string[];
    icon?: string;
  }
  
  export interface ContentIdea {
    _id: string;
    agentId: string;
    title: string;
    topic: string;
    script?: string;
    status: ContentIdeaStatus;
    outputFolderPath?: string;
    videoPath?: string;
    shortsPaths: string[];
    thumbnailPath?: string;
    youtubeVideoId?: string;
    youtubeUrl?: string;
    scheduledUploadTime?: string;
    createdAt: string;
  }
  
  export type ContentIdeaStatus =
    | "draft"
    | "script_ready"
    | "video_queued"
    | "generating_clips"
    | "generating_audio"
    | "assembling_video"
    | "uploading"
    | "uploaded"
    | "failed";
  
  export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
  }
  
  export interface PipelineStep {
    step: number;
    total: number;
    label: string;
    status: "pending" | "running" | "done" | "error";
    detail?: string;
  }