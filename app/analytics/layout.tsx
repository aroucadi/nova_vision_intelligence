import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/security/app-mode";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  if (!isDemoMode()) notFound();
  return children;
}
