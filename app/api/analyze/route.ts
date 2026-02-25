import { NextRequest, NextResponse } from "next/server";
import { novaClient } from "@/lib/nova/client";
import { PROMPTS, type AnalysisType } from "@/lib/nova/prompts";
import {
    getImageFormat,
    getDocFormat,
    isImageFile,
    isDocumentFile,
    isVideoFile,
    getVideoFormat,
    bufferToBase64,
} from "@/lib/utils/file-processor";
import { videoAuditService } from "@/lib/nova/video-audit";

import { z } from "zod";

const analyzeSchema = z.object({
    fileUrl: z.string().url(),
    analysisType: z.enum(["summary", "compliance", "classification", "extraction", "custom", "video"]),
});

import { rateLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        // Rate Limit Check
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const isAllowed = await rateLimiter.check(10, ip); // 10 requests per minute
        if (!isAllowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();
        const validation = analyzeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { fileUrl, analysisType } = validation.data;

        // SSRF PROTECTION: Restrict to authorized S3/Amplify/AWS domains
        const url = new URL(fileUrl);
        const allowedHosts = [
            "s3.amazonaws.com",
            "amplifyapp.com",
            "localhost",
            "127.0.0.1"
        ];
        const isAuthorized = allowedHosts.some(host => url.host.endsWith(host));

        if (!isAuthorized) {
            console.warn(`[SSRF] Unauthorized host blocked: ${url.host}`);
            return NextResponse.json({ error: "Access denied: Unauthorized file source" }, { status: 403 });
        }

        const startTime = Date.now();

        // Fetch file from storage
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const base64 = bufferToBase64(fileBuffer);
        const contentType = fileResponse.headers.get("content-type") || "";

        // Determine file type from URL
        const urlPath = new URL(fileUrl).pathname;
        const filename = urlPath.split("/").pop() || "file";

        let result: { text: string; usage: { inputTokens: number; outputTokens: number } };

        if (isImageFile(filename) || contentType.startsWith("image/")) {
            const format = getImageFormat(filename);
            const prompt =
                PROMPTS[analysisType as AnalysisType] || PROMPTS.summary;

            switch (analysisType) {
                case "summary":
                    result = await novaClient.generateSummary(base64, format);
                    break;
                case "compliance":
                    result = await novaClient.checkCompliance(base64, format);
                    break;
                case "classification": {
                    const classification = await novaClient.classifyContent(
                        base64,
                        format
                    );
                    result = {
                        text: JSON.stringify(classification, null, 2),
                        usage: { inputTokens: 0, outputTokens: 0 },
                    };
                    break;
                }
                case "extraction": {
                    const schema = {
                        entities: {
                            type: "array",
                            description: "Named entities (people, companies, orgs)",
                        },
                        dates: { type: "array", description: "Dates mentioned" },
                        amounts: { type: "array", description: "Monetary amounts" },
                        locations: { type: "array", description: "Places mentioned" },
                        contacts: {
                            type: "array",
                            description: "Email addresses and phone numbers",
                        },
                    };
                    const extracted = await novaClient.extractStructured(
                        base64,
                        schema,
                        format
                    );
                    result = {
                        text: JSON.stringify(extracted, null, 2),
                        usage: { inputTokens: 0, outputTokens: 0 },
                    };
                    break;
                }
                default:
                    result = await novaClient.analyzeImage(
                        base64,
                        typeof prompt === "string" ? prompt : PROMPTS.summary,
                        format
                    );
            }
        } else if (isDocumentFile(filename)) {
            const format = getDocFormat(filename);
            if (!format) {
                return NextResponse.json(
                    { error: "Unsupported document format" },
                    { status: 400 }
                );
            }

            // Nova 2 Lite document analysis supports these formats
            const supportedDocFormats = ["pdf", "csv", "doc", "docx", "html", "txt", "md"] as const;
            type SupportedDocFormat = typeof supportedDocFormats[number];

            if (!supportedDocFormats.includes(format as SupportedDocFormat)) {
                return NextResponse.json(
                    { error: `Document format "${format}" is not supported for analysis` },
                    { status: 400 }
                );
            }

            const prompt =
                PROMPTS[analysisType as AnalysisType] || PROMPTS.summary;
            result = await novaClient.analyzeDocument(
                base64,
                filename,
                format as SupportedDocFormat,
                typeof prompt === "string" ? prompt : PROMPTS.summary,
                { enableReasoning: analysisType === "summary" || analysisType === "compliance" }
            );
        } else if (isVideoFile(filename) || contentType.startsWith("video/") || analysisType === "video") {
            const format = getVideoFormat(filename);
            const auditResult = await videoAuditService.performAudit(base64, filename, format);

            result = {
                text: auditResult.findings,
                usage: { inputTokens: 0, outputTokens: 0 } // Video audit wraps usage internally
            };
        } else {
            return NextResponse.json(
                { error: "Unsupported file type for analysis" },
                { status: 400 }
            );
        }

        const processingTimeMs = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            analysis: {
                type: analysisType,
                result: result.text,
                model: "Nova 2 Lite",
                processingTimeMs,
                tokensUsed: result.usage,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error: unknown) {
        console.error("Analysis error:", error);
        const message =
            error instanceof Error ? error.message : "Analysis failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
