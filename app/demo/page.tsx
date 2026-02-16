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
    Globe,
    Mic,
    Sparkles,
    Layers,
    FileWarning,
    CheckCircle2,
    Server,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicDemo, DemoScene } from "@/components/demo/DynamicDemo";
import { ScannerVisual, TerminalVisual, WaveformVisual } from "@/components/demo/SceneVisuals";

// --- SCENARIO DATA DEFINTIONS ---

const SCENARIO_MULTIMODAL: DemoScene[] = [
    {
        id: "intro", title: "Visual Intelligence", subtitle: "", type: "intro", color: "from-violet-900 to-black",
        content: "See how Nova Vision transforms unstructured chaos into structured data.",
        visual: <Brain className="h-20 w-20 text-violet-400" />
    },
    {
        id: "problem", title: "The Problem", subtitle: "Unstructured Chaos", type: "problem", color: "from-red-900/40 to-black",
        content: "Global trade relies on PDF invoices that vary by vendor. Humans spend millions of hours manually re-typing this data, leading to errors and delays.",
        visual: <FileWarning className="h-32 w-32 text-red-400 opacity-80 animate-pulse" />
    },
    {
        id: "solution", title: "The Solution", subtitle: "Nova 2 Pro Vision", type: "solution", color: "from-blue-900/40 to-black",
        content: "We don't need templates. Nova 2 Pro 'sees' the document just like a human expert, identifying headers, line items, and extracting data with 99.8% precision.",
        visual: <ScannerVisual />
    },
    {
        id: "demo", title: "The Magic", subtitle: "Agentic Reasoning", type: "demo", color: "from-emerald-900/40 to-black",
        content: "Behind the scenes, the Analyzer Agent classifies goods (HS Codes) while the Compliance Agent checks for sanctions—all in < 2 seconds.",
        visual: (
            <div className="space-y-4 w-full px-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                    <Brain className="h-5 w-5 text-violet-400" />
                    <span className="text-sm font-mono text-zinc-300">Classifying 'Cotton Shirt'...</span>
                    <Badge className="ml-auto bg-green-500/20 text-green-400">HS 6109.10</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                    <Server className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-mono text-zinc-300">Checking Sanctions List...</span>
                    <Badge className="ml-auto bg-green-500/20 text-green-400">SAFE</Badge>
                </div>
            </div>
        )
    },
    {
        id: "outro", title: "Ready for Action", subtitle: "", type: "outro", color: "from-violet-900 to-black",
        content: "Data extracted. Compliance verified. Ready for filing."
    }
];

const SCENARIO_AUTOMATION: DemoScene[] = [
    {
        id: "intro", title: "Autonomous Execution", subtitle: "", type: "intro", color: "from-cyan-900 to-black",
        content: "Watch Nova Act navigate complex portals so humans don't have to.",
        visual: <Globe className="h-20 w-20 text-cyan-400" />
    },
    {
        id: "problem", title: "The Problem", subtitle: "The 'Swivel Chair' Gap", type: "problem", color: "from-orange-900/40 to-black",
        content: "Even with clean data, filing customs entries requires logging into archaic government portals (ACE), navigating 50+ screens, and typing... slowly.",
        visual: <div className="text-6xl">🐌</div>
    },
    {
        id: "solution", title: "The Solution", subtitle: "Nova Act Agents", type: "solution", color: "from-cyan-900/40 to-black",
        content: "Nova Act is a headless browser agent driven by Nova 2 Pro. It logs in, navigates, and inputs data at machine speed, with zero typos.",
        visual: <TerminalVisual />
    },
    {
        id: "outro", title: "Filing Complete", subtitle: "", type: "outro", color: "from-cyan-900 to-black",
        content: "Entry #998877 Filed. Transaction ID captured."
    }
];

const SCENARIO_VOICE: DemoScene[] = [
    {
        id: "intro", title: "Voice Intelligence", subtitle: "", type: "intro", color: "from-pink-900 to-black",
        content: "Experience hands-free warehouse operations with Nova Voice.",
        visual: <Mic className="h-20 w-20 text-pink-400" />
    },
    {
        id: "problem", title: "The Problem", subtitle: "Warehouse Disconnect", type: "problem", color: "from-red-900/40 to-black",
        content: "Warehouse workers operate forklifts and scanners. They cannot stop to type 'Where is shipment X?' on a laptop.",
        visual: <div className="text-6xl">📦❓</div>
    },
    {
        id: "solution", title: "The Solution", subtitle: "Nova Voice (Sonic)", type: "solution", color: "from-pink-900/40 to-black",
        content: "Workers simply ask. Nova Sonic listens, understands context (RAG), and speaks the answer instantly.",
        visual: <WaveformVisual />
    },
    {
        id: "outro", title: "Operations Unblocked", subtitle: "", type: "outro", color: "from-pink-900 to-black",
        content: "Information at the speed of sound."
    }
];


export default function DemoPage() {
    const [activeScenario, setActiveScenario] = useState<DemoScene[] | null>(null);

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
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
                            Interactive Demo Gallery
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Experience the Agentic AI difference. Select a capability to launch the interactive story.
                        </p>
                    </div>
                </motion.header>

                {/* Scenario Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    {/* Multimodal Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveScenario(SCENARIO_MULTIMODAL)}
                        className="cursor-pointer group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-violet-500/50 hover:bg-zinc-900/80 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Brain className="h-10 w-10 text-violet-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Visual Intelligence</h3>
                        <p className="text-sm text-zinc-500">How we turn PDF chaos into structured gold.</p>
                        <div className="mt-6 flex items-center text-sm font-bold text-violet-400">
                            Watch Story <Play className="ml-2 h-3 w-3 fill-current" />
                        </div>
                    </motion.div>

                    {/* Automation Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveScenario(SCENARIO_AUTOMATION)}
                        className="cursor-pointer group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-cyan-500/50 hover:bg-zinc-900/80 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Globe className="h-10 w-10 text-cyan-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Autonomous Action</h3>
                        <p className="text-sm text-zinc-500">How we file perfectly without lifting a finger.</p>
                        <div className="mt-6 flex items-center text-sm font-bold text-cyan-400">
                            Watch Story <Play className="ml-2 h-3 w-3 fill-current" />
                        </div>
                    </motion.div>

                    {/* Voice Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveScenario(SCENARIO_VOICE)}
                        className="cursor-pointer group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-pink-500/50 hover:bg-zinc-900/80 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Mic className="h-10 w-10 text-pink-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Voice Intelligence</h3>
                        <p className="text-sm text-zinc-500">How we enable hands-free operations.</p>
                        <div className="mt-6 flex items-center text-sm font-bold text-pink-400">
                            Watch Story <Play className="ml-2 h-3 w-3 fill-current" />
                        </div>
                    </motion.div>

                </div>

                {/* Footer */}
                <div className="flex justify-center mt-12">
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full border-zinc-800 text-zinc-400 hover:text-white">
                            Skip Demo & Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Dynamic Player Overlay */}
            <AnimatePresence>
                {activeScenario && (
                    <DynamicDemo
                        scenes={activeScenario}
                        onClose={() => setActiveScenario(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
