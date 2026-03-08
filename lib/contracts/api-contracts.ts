import { z } from "zod";

export const uploadedFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string().url(),
  uploadedAt: z.string(),
});

export const uploadResponseSchema = z.object({
  success: z.literal(true),
  file: uploadedFileSchema,
});

export const agentTaskSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["idle", "running", "completed", "failed"]),
  result: z.string().optional(),
  error: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export const pipelineStateSchema = z.object({
  pipelineId: z.string(),
  requestId: z.string().optional(),
  tasks: z.array(agentTaskSchema),
  overallStatus: z.enum(["idle", "running", "completed", "failed"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  events: z.array(z.object({
    ts: z.string(),
    agentId: z.string(),
    type: z.enum(["task_update", "pipeline_update"]),
    message: z.string(),
  })).optional(),
});

export const agentsAnalyzeResponseSchema = z.object({
  success: z.literal(true),
  pipeline: pipelineStateSchema,
});

export const actTriggerResponseSchema = z.object({
  success: z.literal(true),
  transactionId: z.string(),
  automationId: z.string(),
  declaration: z.object({
    entryNumber: z.string(),
  }).passthrough(),
  agent: z.string(),
  model: z.string(),
});
