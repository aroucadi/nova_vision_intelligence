import { NextRequest } from "next/server";

export function getRateLimitKey(request: NextRequest): string {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) return `api:${apiKey}`;

  const demoKey = request.headers.get("x-demo-key");
  if (demoKey) return `demo:${demoKey}`;

  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim();
  if (ip) return `ip:${ip}`;

  const ua = request.headers.get("user-agent") || "unknown";
  return `ua:${ua.slice(0, 80)}`;
}
