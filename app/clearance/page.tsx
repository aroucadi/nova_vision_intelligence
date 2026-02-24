"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Workflow, Zap, Brain, Shield, Loader2, ArrowRight } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AgentPipeline } from "@/components/AgentPipeline";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { type PipelineState } from "@/lib/agents/types";
import { toast } from "sonner";

interface UploadedFileData {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
}

interface Analysis {
    type: string;
    result: string;
    model: string;
    processingTimeMs: number;
    tokensUsed: { input: number; output: number };
    timestamp: string;
}

import { useGlobalPathway } from "@/context/GlobalPathwayContext";

export default function ClearancePage() {
    const { addFiling } = useGlobalPathway();
    const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [pipeline, setPipeline] = useState<PipelineState | null>(null);
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [filingStatus, setFilingStatus] = useState<"idle" | "filing" | "complete">("idle");

    const handleFileUploaded = (file: UploadedFileData) => {
        setUploadedFile(file);
        setPipeline(null);
        setAnalyses([]);
        setFilingStatus("idle");
    };

    const handlePipelineAnalyze = async () => {
        if (!uploadedFile) return;

        setAnalyzing(true);
        setPipeline(null);

        try {
            const response = await fetch("/api/agents/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: uploadedFile.url }),
            });

            const data = await response.json();

            if (data.success) {
                setPipeline(data.pipeline);
            }
        } catch (error) {
            console.error("Pipeline error:", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const [filingResult, setFilingResult] = useState<{ transactionId: string; declaration: any } | null>(null);

    const handleAutoFile = async () => {
        if (!pipeline) return;

        setFilingStatus("filing");

        try {
            // Find the extraction result to send to Act
            const extractTask = pipeline.tasks.find(t => t.id === "extractor" || t.name === "Customs Broker");
            const shipmentData = extractTask?.result ? JSON.parse(extractTask.result as string) : {};

            const response = await fetch("/api/act/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentData }),
            });

            const data = await response.json();

            if (data.success) {
                setFilingResult(data);
                setFilingStatus("complete");

                // UPDATE GLOBAL STATE
                addFiling(
                    data.declaration?.entry_number || "998877",
                    "Auto-filed via Nova Act (Standard Import)"
                );
                toast.success("Customs Entry Filed Successfully", {
                    description: `Transaction ID: ${data.transactionId}`
                });
            } else {
                console.error("Filing failed:", data.error);
                setFilingStatus("idle"); // reset on error
                toast.error("Filing Failed", {
                    description: data.error || "Unknown error occurred"
                });
            }
        } catch (error) {
            console.error("Act API error:", error);
            setFilingStatus("idle");
            toast.error("System Error", {
                description: "Failed to connect to Nova Act API"
            });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Lifecycle Overview
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500/20">
                            <FileText className="h-6 w-6 text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Global Compliance Audit</h1>
                    </div>
                    <p className="text-zinc-400">Streamlining document intake and automated HS classification.</p>
                </header>

                <main className="space-y-8">
                    <section>
                        <FileUploader onFileUploaded={handleFileUploaded} />
                    </section>

                    <AnimatePresence>
                        {uploadedFile && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h3 className="font-semibold text-white">Document Stream Ready</h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                                            <span>3 Specialty Brokers engaged</span>
                                            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-mono border border-violet-500/20">
                                                Active Compliance Engine
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handlePipelineAnalyze}
                                        disabled={analyzing}
                                        size="lg"
                                        className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0"
                                    >
                                        {analyzing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
                                        Start Clearance Pipeline
                                    </Button>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {pipeline && (
                            <motion.section
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AgentPipeline pipeline={pipeline} />

                                {/* THE "ACT" STEP: Port Authority Filing */}
                                {pipeline.overallStatus === "completed" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-cyan-500/20 rounded-xl">
                                                    <Workflow className="h-6 w-6 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        Autonomous Filing
                                                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
                                                            EDI Gateway
                                                        </span>
                                                    </h3>
                                                    <p className="text-sm text-zinc-400">Transmit digital declaration to port authorities.</p>
                                                </div>
                                            </div>
                                            {filingStatus === "idle" && (
                                                <Button onClick={handleAutoFile} size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold border-0">
                                                    File Entry Now
                                                </Button>
                                            )}
                                            {filingStatus === "filing" && (
                                                <Button disabled size="lg" className="bg-cyan-600/50 text-white font-bold border-0">
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating Payload...
                                                </Button>
                                            )}
                                            {filingStatus === "complete" && filingResult && (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center text-emerald-400 font-bold">
                                                        <Shield className="h-5 w-5 mr-2" />
                                                        Filing Accepted (#{filingResult.declaration?.entry_number || "998877"})
                                                    </div>
                                                    <Link href={`/warehouse?ref=${filingResult.declaration?.entry_number || "998877"}`}>
                                                        <Button size="lg" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                                                            Track in Warehouse <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
