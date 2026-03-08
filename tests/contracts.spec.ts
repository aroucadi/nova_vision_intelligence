import { test, expect } from "@playwright/test";
import {
  actTriggerResponseSchema,
  agentsAnalyzeResponseSchema,
  uploadResponseSchema,
} from "../lib/contracts/api-contracts";

test("API contracts accept canonical examples", () => {
  expect(() =>
    uploadResponseSchema.parse({
      success: true,
      file: {
        id: "abc123",
        filename: "invoice.pdf",
        mimeType: "application/pdf",
        size: 12345,
        url: "https://example-bucket.s3.us-east-1.amazonaws.com/uploads/abc123.pdf",
        uploadedAt: new Date().toISOString(),
      },
    })
  ).not.toThrow();

  expect(() =>
    agentsAnalyzeResponseSchema.parse({
      success: true,
      pipeline: {
        pipelineId: "pipe_1",
        overallStatus: "completed",
        tasks: [
          {
            id: "t1",
            agentId: "extractor",
            name: "Phase 1",
            description: "Extract",
            status: "completed",
            result: "{}",
          },
        ],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      },
    })
  ).not.toThrow();

  expect(() =>
    actTriggerResponseSchema.parse({
      success: true,
      transactionId: "E-123",
      automationId: "auto-E-123",
      declaration: {
        entryNumber: "E-123",
      },
      agent: "Nova Act",
      model: "amazon.nova-act-v1:0",
    })
  ).not.toThrow();
});
