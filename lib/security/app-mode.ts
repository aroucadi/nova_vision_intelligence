export type AppMode = "demo" | "prod";

export function getAppMode(): AppMode {
  const raw = (process.env.APP_MODE || "").toLowerCase();
  if (raw === "demo") return "demo";
  if (raw === "prod" || raw === "production") return "prod";
  return "prod";
}

export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}

export function isProdMode(): boolean {
  return getAppMode() === "prod";
}
