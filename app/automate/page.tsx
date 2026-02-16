"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Brain,
    Database,
    FileInput,
    ShieldCheck,
    Play,
    Loader2,
    CheckCircle2,
    XCircle,
    Globe,
    Zap,
    ArrowLeft,
    RotateCcw,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface WorkflowType {
    id: string;
    name: string;
    description: string;
    icon: string;
    example_url: string;
}

interface WorkflowStep {
    step: number;
    action: string;
    status: string;
    result?: string;
    duration_ms: number;
}

interface WorkflowResult {
    workflow_type: string;
    target_url: string;
    status: string;
    steps: WorkflowStep[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extracted_data?: any;
    total_duration_ms: number;
    model: string;
    mode: string;
}

import { type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    Database,
    FileInput,
    ShieldCheck,
};

export default function AutomatePage() {
    const [workflowTypes, setWorkflowTypes] = useState<WorkflowType[]>([]);
    const [selectedType, setSelectedType] = useState<WorkflowType | null>(null);
    const [targetUrl, setTargetUrl] = useState("");
    const [instructions, setInstructions] = useState("");
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<WorkflowResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        fetch("/api/act/types")
            .then((r) => r.json())
            .then((d) => setWorkflowTypes(d.types || []))
            .catch(() => { });
    }, []);

    const triggerWorkflow = async () => {
        if (!selectedType || !targetUrl) return;

        setRunning(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch("/api/act/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workflowType: selectedType.id,
                    targetUrl,
                    instructions,
                }),
            });

            const data = await response.json();

            if (response.status === 503) {
                // Render cold start
                setError(data.error);
                setRetrying(true);
                // Auto-retry after 5s
                setTimeout(() => {
                    setRetrying(false);
                    triggerWorkflow();
                }, 5000);
                return;
            }

            if (data.success) {
                setResult(data.result);
            } else {
                setError(data.error || "Workflow failed");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-violet-600/6 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl border border-orange-500/10">
                            <Globe className="h-7 w-7 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                                UI Automation Studio
                            </h1>
                            <p className="text-zinc-400 text-sm">
                                Powered by Amazon Nova Act — Intelligent browser automation
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 gap-1">
                            <Zap className="h-3 w-3" />
                            Nova Act
                        </Badge>
                        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 gap-1">
                            <Brain className="h-3 w-3" />
                            Browser AI Agent
                        </Badge>
                    </div>
                </motion.header>

                {/* Workflow Type Selection */}
                <section className="mb-8">
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                        Choose Workflow
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {workflowTypes.map((wf) => {
                            const Icon = iconMap[wf.icon] || Globe;
                            const isSelected = selectedType?.id === wf.id;

                            return (
                                <motion.div
                                    key={wf.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        className={`cursor-pointer transition-all border ${isSelected
                                            ? "border-orange-500/50 bg-orange-500/5 shadow-lg shadow-orange-500/10"
                                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                            }`}
                                        onClick={() => {
                                            setSelectedType(wf);
                                            setTargetUrl(wf.example_url);
                                            setResult(null);
                                            setError(null);
                                        }}
                                    >
                                        <CardContent className="pt-6 pb-5">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`p-2.5 rounded-xl ${isSelected
                                                        ? "bg-orange-500/20"
                                                        : "bg-zinc-800"
                                                        }`}
                                                >
                                                    <Icon
                                                        className={`h-5 w-5 ${isSelected ? "text-orange-400" : "text-zinc-400"
                                                            }`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm text-zinc-100">
                                                        {wf.name}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                                        {wf.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Configuration */}
                <AnimatePresence>
                    {selectedType && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-8"
                        >
                            <Card className="border border-zinc-800 bg-zinc-900/60 backdrop-blur-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg text-zinc-100">
                                        Configure & Launch
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-zinc-400 mb-1.5 block">
                                            Target URL
                                        </label>
                                        <Input
                                            value={targetUrl}
                                            onChange={(e) => setTargetUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="bg-zinc-950 border-zinc-800 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-zinc-400 mb-1.5 block">
                                            Instructions (optional)
                                        </label>
                                        <Textarea
                                            value={instructions}
                                            onChange={(e) => setInstructions(e.target.value)}
                                            placeholder="e.g. Extract all product prices and names from the listings page..."
                                            rows={3}
                                            className="bg-zinc-950 border-zinc-800 text-white resize-none"
                                        />
                                    </div>
                                    <Button
                                        onClick={triggerWorkflow}
                                        disabled={running || !targetUrl}
                                        className="w-full py-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold border-0"
                                    >
                                        {running ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Agent Working...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-5 w-5 mr-2" />
                                                Launch Nova Act Agent
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Cold Start Warning */}
                <AnimatePresence>
                    {retrying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
                        >
                            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-300">
                                    Service is waking up (cold start)
                                </p>
                                <p className="text-xs text-amber-400/60 mt-0.5">
                                    Render.com free tier spins down after 15min idle. Auto-retrying in 5s...
                                </p>
                            </div>
                            <RotateCcw className="h-4 w-4 text-amber-400 animate-spin ml-auto" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && !retrying && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-xl overflow-hidden">
                                <div
                                    className={`h-1.5 ${result.status === "completed"
                                        ? "bg-gradient-to-r from-emerald-500 to-green-500"
                                        : "bg-gradient-to-r from-red-500 to-orange-500"
                                        }`}
                                />
                                <CardHeader className="pb-3 border-b border-zinc-800/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg text-white flex items-center gap-3">
                                            {result.status === "completed" ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-400" />
                                            )}
                                            Workflow{" "}
                                            {result.status === "completed"
                                                ? "Completed"
                                                : "Failed"}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 gap-1">
                                                <Clock className="h-3 w-3" />
                                                {result.total_duration_ms}ms
                                            </Badge>
                                            <Badge
                                                className={`gap-1 ${result.mode === "live"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    }`}
                                            >
                                                {result.mode === "live" ? "Live" : "Simulation"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {/* Steps */}
                                    {result.steps.map((step, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/50"
                                        >
                                            <div
                                                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.status === "completed"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {step.step}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-200">
                                                    {step.action}
                                                </p>
                                                {step.result && (
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {step.result}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-zinc-600 shrink-0">
                                                {step.duration_ms}ms
                                            </span>
                                        </motion.div>
                                    ))}

                                    {/* Extracted Data */}
                                    {result.extracted_data && (
                                        <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                                            <h4 className="text-sm font-bold text-zinc-300 mb-2">
                                                Extracted Data
                                            </h4>
                                            <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(result.extracted_data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <footer className="mt-16 py-6 border-t border-zinc-900 text-center">
                    <p className="text-xs text-zinc-600">
                        Nova Act Service hosted on Render.com • Free Tier • Cold starts after
                        15min idle
                    </p>
                </footer>
            </div>
        </div>
    );
}
