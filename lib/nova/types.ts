// Amazon Nova 2 types — using Converse API schema

export interface NovaMessage {
  role: "user" | "assistant";
  content: NovaContentBlock[];
}

export interface NovaContentBlock {
  text?: string;
  image?: {
    format: "jpeg" | "png" | "gif" | "webp";
    source: {
      bytes: string; // base64
    };
  };
  video?: {
    format: "mkv" | "mov" | "mp4" | "webm" | "three_gp" | "flv" | "mpg" | "mpeg";
    source: {
      bytes: string; // base64
    };
  };
  audio?: {
    format: "amr" | "flac" | "mp3" | "mp4" | "ogg" | "webm" | "wav";
    source: {
      bytes: string; // base64
    };
  };
  document?: {
    format:
    | "pdf"
    | "csv"
    | "doc"
    | "docx"
    | "xls"
    | "xlsx"
    | "html"
    | "txt"
    | "md";
    name: string;
    source: {
      bytes: string; // base64
    };
  };
}

export interface NovaConverseResponse {
  output?: {
    message?: {
      role: string;
      content: Array<{ text?: string }>;
    };
  };
  stopReason?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Nova 2 model IDs — VERIFIED from official AWS docs
// Source: https://docs.aws.amazon.com/nova/latest/nova2-userguide/getting-started-api.html
export const NOVA_MODELS = {
  /** Nova Lite: text, images, video, documents → text. Extended thinking supported. */
  LITE: "amazon.nova-lite-v1:0",
  /** Nova Pro: The flagship model. Best for complex reasoning, visual analysis, and 100% accuracy tasks. */
  PRO: "amazon.nova-pro-v1:0",
  /** Nova Sonic: speech-to-speech real-time voice. */
  SONIC: "amazon.nova-2-sonic-v1:0",
  /** Nova Multimodal Embeddings (Switched to Titan v2 for Bedrock Knowledge Base) */
  EMBEDDINGS: "amazon.titan-embed-text-v2:0",
} as const;

export type NovaModelId = (typeof NOVA_MODELS)[keyof typeof NOVA_MODELS];

export type ImageFormat = "jpeg" | "png" | "gif" | "webp";

export type DocumentFormat =
  | "pdf"
  | "csv"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "html"
  | "txt"
  | "md";

export type FileFormat = ImageFormat | DocumentFormat;

export interface AnalysisResult {
  type: string;
  result: string;
  model: string;
  processingTimeMs: number;
  tokensUsed: { input: number; output: number };
  timestamp: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}
