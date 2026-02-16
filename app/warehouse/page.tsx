"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Sparkles } from "lucide-react";
import { VoiceInterface } from "@/components/VoiceInterface";
import { useSearchParams } from "next/navigation";
import { useGlobalPathway } from "@/context/GlobalPathwayContext";

function WarehouseContent() {
    const searchParams = useSearchParams();
    const { activeEntries } = useGlobalPathway();

    // 1. Try URL param
    const refParam = searchParams.get("ref");

    // 2. Fallback to most recent entry in global state
    const latestEntry = activeEntries.length > 0 ? activeEntries[activeEntries.length - 1] : null;

    const contextId = refParam || latestEntry?.id;

    return (
        <div className="relative max-w-md mx-auto px-6 py-12 flex flex-col min-h-screen">
            <header className="mb-12">
                <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white flex items-center gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" /> Back to Command Center
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-pink-500/20 rounded-xl">
                        <Mic className="h-6 w-6 text-pink-400" />
                    </div>
                    <h1 className="text-2xl font-bold">Logistics Copilot</h1>
                </div>
                <p className="text-zinc-400">Hands-free voice operations for warehouse staff.</p>
            </header>

            <main className="flex-1 flex flex-col justify-center">
                <div className="mb-8 p-4 border border-zinc-800 bg-zinc-900/50 rounded-xl text-center">
                    <Sparkles className="h-5 w-5 text-zinc-500 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Try saying:</p>
                    <p className="text-white font-medium mt-1">
                        {contextId
                            ? `"Check status of Entry #${contextId}"`
                            : `"Check status of Customs Entry #998877"`}
                    </p>
                    {contextId && latestEntry && !refParam && (
                        <p className="text-xs text-pink-400 mt-2 animate-pulse">
                            (Detected recent filing #{contextId})
                        </p>
                    )}
                </div>

                <VoiceInterface contextId={contextId || undefined} />
            </main>
        </div>
    );
}

export default function WarehousePage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <WarehouseContent />
            </Suspense>
        </div>
    );
}
