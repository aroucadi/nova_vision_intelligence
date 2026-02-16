"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Play,
    Brain,
    Zap,
    Globe,
    Mic,
    Sparkles,
    CheckCircle2,
    Layers,
    ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoScenario {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    features: string[];
    steps: DemoStep[];
}

interface DemoStep {
    label: string;
    detail: string;
    result?: string;
}

const scenarios: DemoScenario[] = [
    {
        id: "multimodal",
        title: "The Eyes & Brain (Ingest)",
        description:
            "PROBLEM: Global trade runs on unstructured PDF invoices. SOLUTION: Nova Lite is the 'Eyes' that see the layout, and Nova Pro is the 'Brain' that reasons about HS Codes.",
        category: "Step 1: Ingest & Analyze",
        icon: Brain,
        gradient: "from-violet-600 to-cyan-600",
        features: [
            "Nova Lite (The Eyes)",
            "Nova Pro (The Brain)",
            "HS Code Classification",
        ],
        steps: [
            {
                label: "The Eyes: Ingest PDF",
                detail: "Nova Lite 'sees' the unstructured layout of the Commercial Invoice.",
                result: "File uploaded — 2.4 MB PDF detected",
            },
            {
                label: "The Brain: Structured Analysis",
                detail: "Nova Agents extract Vendor, Line Items, and Total Amount",
                result:
                    '{"analyzer": "Commercial invoice for electronics shipment, total $12,450", "extractor": {"vendor": "TechCorp Ltd", "items": 3, "total": "$12,450"}, "compliance": "No PII detected. Standard commercial document."}',
            },
            {
                label: "Reasoning: HS Classification",
                detail: "Nova Pro decides 'Cotton Shirt' = HS 6109.10",
                result: "ALL CLEAR: HS 8542.31 is valid for import.",
            },
        ],
    },
    {
        id: "automation",
        title: "The Hands (Act)",
        description:
            "PROBLEM: Humans spend hours typing data. SOLUTION: Nova Act is the 'Hands' that take our clean JSON and auto-fills the Port Authority web form.",
        category: "Step 2: Act & File",
        icon: Globe,
        gradient: "from-orange-600 to-amber-600",
        features: [
            "Nova Act (The Hands)",
            "Automated Form Filling",
            "Zero Human Error",
        ],
        steps: [
            {
                label: "Trigger Auto-Filing",
                detail: "System sends structured JSON to Port Authority Agent",
                result: "Action Triggered: File Customs Entry #998877",
            },
            {
                label: "The Hands: Navigate & Fill",
                detail: "Nova Act logs into portal and types in the data",
                result: "Navigating to https://ace.cbp.gov/entries/new...",
            },
            {
                label: "Submission Complete",
                detail: "Agent submits form and captures Transaction ID",
                result:
                    '{"status": "FILED", "entry_number": "998877", "timestamp": "2024-10-15T14:30:00Z"}',
            },
        ],
    },
    {
        id: "voice",
        title: "The Mouth (Verify)",
        description:
            "PROBLEM: Warehouse staff don't have keyboards. SOLUTION: Nova Sonic is the 'Mouth' that lets staff query shipment status hands-free.",
        category: "Step 3: Verify & Monitor",
        icon: Mic,
        gradient: "from-pink-600 to-violet-600",
        features: [
            "Nova Sonic (The Mouth)",
            "Context-Aware RAG",
            "< 500ms Latency",
        ],
        steps: [
            {
                label: "Worker Asks Question",
                detail: "Input: 'What is the status of this shipment?' (Context Aware)",
                result: 'Transcribed: "What is the status of this shipment?"',
            },
            {
                label: "Context Retrieval",
                detail: "System retrieves 'Entry #998877' status from Global State",
                result:
                    "Context Found: Entry #998877 is CLEARED.",
            },
            {
                label: "The Mouth: Spoken Response",
                detail: "Nova Sonic generates natural voice audio",
                result: "🔊 'This shipment is cleared and ready for pickup.'",
            },
        ],
    },
];

export default function DemoPage() {
    const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(
        null
    );
    const [activeStep, setActiveStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const playScenario = (scenario: DemoScenario) => {
        setActiveScenario(scenario);
        setActiveStep(0);
        setIsPlaying(true);

        // Auto-advance through steps
        scenario.steps.forEach((_, i) => {
            setTimeout(() => {
                setActiveStep(i);
            }, i * 2000);
        });

        setTimeout(() => {
            setIsPlaying(false);
        }, scenario.steps.length * 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl border border-violet-500/10">
                                <Sparkles className="h-7 w-7 text-violet-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                            Interactive Demo
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Explore NovaVision&apos;s capabilities across all four hackathon
                            categories. Each scenario demonstrates real Amazon Nova AI
                            integration.
                        </p>

                        <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
                            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 gap-1">
                                <Brain className="h-3 w-3" />
                                Multimodal
                            </Badge>
                            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 gap-1">
                                <Globe className="h-3 w-3" />
                                UI Automation
                            </Badge>
                            <Badge className="bg-pink-500/10 text-pink-300 border-pink-500/20 gap-1">
                                <Mic className="h-3 w-3" />
                                Voice AI
                            </Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 gap-1">
                                <Layers className="h-3 w-3" />
                                Agentic System
                            </Badge>
                        </div>
                    </div>
                </motion.header>

                {/* Scenario Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                    {scenarios.map((scenario, i) => {
                        const Icon = scenario.icon;
                        const isActive = activeScenario?.id === scenario.id;

                        return (
                            <motion.div
                                key={scenario.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all border overflow-hidden ${isActive
                                        ? "border-violet-500/40 bg-violet-500/5 shadow-xl shadow-violet-500/10"
                                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                        }`}
                                    onClick={() => playScenario(scenario)}
                                >
                                    <div
                                        className={`h-1 bg-gradient-to-r ${scenario.gradient}`}
                                    />
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`p-3 rounded-xl bg-gradient-to-br ${scenario.gradient} bg-opacity-20`}
                                            >
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-zinc-100">
                                                        {scenario.title}
                                                    </h3>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] border-zinc-700 text-zinc-500"
                                                    >
                                                        {scenario.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                                                    {scenario.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {scenario.features.map((f) => (
                                                        <span
                                                            key={f}
                                                            className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
                                                        >
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-zinc-500 hover:text-white"
                                            >
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Active Scenario Walkthrough */}
                <AnimatePresence>
                    {activeScenario && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-xl overflow-hidden">
                                <div
                                    className={`h-1.5 bg-gradient-to-r ${activeScenario.gradient}`}
                                />
                                <CardContent className="pt-6 pb-6">
                                    <h3 className="font-bold text-lg text-zinc-100 mb-6 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-violet-400" />
                                        {activeScenario.title} — Step-by-Step
                                    </h3>

                                    <div className="space-y-4">
                                        {activeScenario.steps.map((step, i) => {
                                            const isReached = i <= activeStep;
                                            const isCurrent = i === activeStep && isPlaying;

                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0.4 }}
                                                    animate={{
                                                        opacity: isReached ? 1 : 0.4,
                                                    }}
                                                    className="flex items-start gap-4"
                                                >
                                                    <div
                                                        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${isReached
                                                            ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                            : "bg-zinc-800 text-zinc-600"
                                                            } ${isCurrent ? "animate-pulse" : ""}`}
                                                    >
                                                        {isReached ? (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        ) : (
                                                            i + 1
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-zinc-200">
                                                            {step.label}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 mt-0.5">
                                                            {step.detail}
                                                        </p>
                                                        {isReached && step.result && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                className="mt-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800/50 text-xs font-mono text-zinc-400 overflow-hidden"
                                                            >
                                                                {step.result.startsWith("{") ? (
                                                                    <pre className="whitespace-pre-wrap">
                                                                        {JSON.stringify(
                                                                            JSON.parse(step.result),
                                                                            null,
                                                                            2
                                                                        )}
                                                                    </pre>
                                                                ) : (
                                                                    <p>{step.result}</p>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Try it yourself */}
                                    <div className="mt-6 pt-5 border-t border-zinc-800/50 flex items-center justify-between">
                                        <p className="text-xs text-zinc-500">
                                            Want to try this yourself?
                                        </p>
                                        <Link
                                            href={
                                                activeScenario.id === "automation" ? "/automate" : "/dashboard"
                                            }
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1"
                                            >
                                                Try Live
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <footer className="mt-20 py-8 border-t border-zinc-900 text-center">
                    <p className="text-sm text-zinc-500">
                        NovaVision Intelligence Platform • Amazon Nova AI Hackathon 2025
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                        Demo mode — all scenarios use simulated data to showcase the architecture
                    </p>
                </footer>
            </div>
        </div>
    );
}
