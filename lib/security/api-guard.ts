import { NextRequest, NextResponse } from "next/server";
import { getAppMode, isDemoMode } from "./app-mode";

export type ApiGuardResult = {
  ok: true;
  mode: "demo" | "prod";
  principal: string;
} | {
  ok: false;
  response: NextResponse;
};

function getExpectedKey(mode: "demo" | "prod"): string | undefined {
  return mode === "demo" ? process.env.DEMO_API_KEY : process.env.API_KEY;
}

function getHeaderName(mode: "demo" | "prod"): string {
  return mode === "demo" ? "x-demo-key" : "x-api-key";
}

function getCookieName(mode: "demo" | "prod"): string {
  return mode === "demo" ? "nova_demo_key" : "nova_api_key";
}

export function enforceDemoMode(): NextResponse | null {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export function guardApiRequest(request: NextRequest): ApiGuardResult {
  const mode = getAppMode();
  const isProdRuntime = process.env.NODE_ENV === "production";

  const headerName = getHeaderName(mode);
  const cookieName = getCookieName(mode);
  const provided = request.headers.get(headerName) || request.cookies.get(cookieName)?.value || "";
  const expected = getExpectedKey(mode);

  if (isProdRuntime && !expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      ),
    };
  }

  if (expected && provided !== expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": "API key" } }
      ),
    };
  }

  const principal = expected ? `${mode}:api-key` : "dev-anonymous";

  return { ok: true, mode, principal };
}
