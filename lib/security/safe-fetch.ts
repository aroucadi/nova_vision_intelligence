import { NextResponse } from "next/server";
import { isDemoMode } from "./app-mode";

export function validateFileUrl(fileUrl: string): { ok: true; url: URL } | { ok: false; response: NextResponse } {
  let url: URL;
  try {
    url = new URL(fileUrl);
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Invalid fileUrl" }, { status: 400 }) };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, response: NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 }) };
  }

  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "";
  if (!bucketName) {
    return { ok: false, response: NextResponse.json({ error: "Server misconfiguration" }, { status: 500 }) };
  }

  const allowHttpLocal = process.env.NODE_ENV !== "production" && isDemoMode();
  if (!allowHttpLocal && url.protocol !== "https:") {
    return { ok: false, response: NextResponse.json({ error: "HTTPS required" }, { status: 403 }) };
  }

  const host = url.hostname.toLowerCase();
  const isBucketHost = host.startsWith(`${bucketName.toLowerCase()}.s3.`) && host.endsWith(".amazonaws.com");

  if (!isBucketHost) {
    return { ok: false, response: NextResponse.json({ error: "Access denied: Unauthorized file source" }, { status: 403 }) };
  }

  return { ok: true, url };
}

export async function fetchArrayBufferWithLimits(
  url: string,
  options: { maxBytes: number; timeoutMs: number }
): Promise<{ ok: true; bytes: ArrayBuffer; contentType: string } | { ok: false; response: NextResponse }> {
  const validated = validateFileUrl(url);
  if (!validated.ok) return validated;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const res = await fetch(validated.url.toString(), {
      redirect: "error",
      signal: controller.signal,
      headers: { accept: "*/*" },
    });

    if (!res.ok) {
      return { ok: false, response: NextResponse.json({ error: "Failed to fetch file" }, { status: 400 }) };
    }

    const contentType = res.headers.get("content-type") || "";
    const lengthHeader = res.headers.get("content-length");
    if (lengthHeader) {
      const length = Number(lengthHeader);
      if (Number.isFinite(length) && length > options.maxBytes) {
        return { ok: false, response: NextResponse.json({ error: "File too large" }, { status: 413 }) };
      }
    }

    const stream = res.body;
    if (!stream) {
      return { ok: false, response: NextResponse.json({ error: "Failed to read file" }, { status: 400 }) };
    }

    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > options.maxBytes) {
        controller.abort();
        return { ok: false, response: NextResponse.json({ error: "File too large" }, { status: 413 }) };
      }
      chunks.push(value);
    }

    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }

    return { ok: true, bytes: out.buffer, contentType };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Failed to fetch file" }, { status: 400 }) };
  } finally {
    clearTimeout(timeout);
  }
}
