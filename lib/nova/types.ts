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
  /** Nova 2 Lite: text, images, video, documents → text. Extended thinking supported. */
  LITE: "us.amazon.nova-2-lite-v1:0",
  /** Nova 2 Sonic: speech-to-speech real-time voice. Uses InvokeModelWithBidirectionalStream. */
  SONIC: "amazon.nova-2-sonic-v1:0",
  /** Nova Multimodal Embeddings (Switched to Titan G1 for maximum compatibility) */
  EMBEDDINGS: "amazon.titan-embed-g1-text-02",
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
