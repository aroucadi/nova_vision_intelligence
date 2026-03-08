import { NextRequest } from "next/server";
import { getAppMode } from "@/lib/security/app-mode";

function redact(obj: Record<string, unknown>) {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (/(authorization|token|secret|password|api[-_]?key)/i.test(key)) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function createApiLog(request: NextRequest, route: string, principal: string) {
  const requestId =
    request.headers.get("x-request-id") ||
    request.headers.get("x-amzn-trace-id") ||
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const startMs = Date.now();

  return {
    requestId,
    end: (status: number, extra: Record<string, unknown> = {}) => {
      const durationMs = Date.now() - startMs;
      console.log(
        JSON.stringify({
          event: "api",
          route,
          mode: getAppMode(),
          requestId,
          principal,
          status,
          durationMs,
          ...redact(extra),
        })
      );
    },
  };
}
