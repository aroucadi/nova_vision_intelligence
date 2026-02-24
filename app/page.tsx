"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, Mic, Workflow, PlayCircle, Rocket, Globe, Box, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { ScannerVisual, TerminalVisual, WaveformVisual } from "@/components/demo/SceneVisuals";
import { SPRING_PHYSICS, STAGGER_CONTAINER, FADE_UP_ITEM } from "@/components/motion/constants";
import { Player } from "@remotion/player";
import { WorkflowLoop } from "@/remotion/WorkflowLoop";

export default function LandingPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            LogisticsOS
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white transition-all rounded-full hidden md:flex">
                                Login
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full font-medium transition-all shadow-lg hover:shadow-white/20">
                                Launch Platform <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-20 px-6">

                {/* Hero Section */}
                <section ref={targetRef} className="max-w-5xl mx-auto text-center mb-32 relative">
                    <motion.div style={{ opacity, scale }} className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={SPRING_PHYSICS}
                        >
                            <Badge variant="outline" className="px-4 py-1.5 border-violet-500/30 bg-violet-500/10 text-violet-300 rounded-full text-sm font-medium backdrop-blur-md mb-6 inline-flex items-center gap-2 hover:bg-violet-500/20 transition-colors cursor-default">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                Architected on Amazon Nova
                            </Badge>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ ...SPRING_PHYSICS, delay: 0.1 }}
                            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1]"
                        >
                            The Autonomous <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 animate-gradient-x">
                                OS for Global Trade.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING_PHYSICS, delay: 0.2 }}
                            className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                        >
                            Accelerate clearance, automate compliance, and empower your workforce. 
                            The end-to-end intelligence layer for modern supply chain operations.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING_PHYSICS, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                        >
                            <Link href="/dashboard">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all">
                                    Start Free Trial <Rocket className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all group">
                                    <PlayCircle className="mr-2 h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" /> Watch Demo
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Remotion Workflow Loop */}
                <section className="max-w-3xl mx-auto mb-24">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 inline-flex items-center gap-2">
                            The Agentic Loop <Layers className="h-5 w-5 text-violet-400" />
                        </h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={SPRING_PHYSICS}
                        viewport={{ once: true }}
                        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-violet-500/10 ring-1 ring-white/5"
                    >
                        <div className="aspect-video w-full bg-zinc-900/50 relative">
                            <Player
                                component={WorkflowLoop}
                                durationInFrames={360}
                                compositionWidth={1280}
                                compositionHeight={720}
                                fps={30}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                controls
                                loop
                                autoPlay
                            />
                        </div>
                        <div className="px-6 py-3 border-t border-white/5 bg-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                            <span>LIVE RENDER</span>
                            <span>30 FPS • 1280x720</span>
                        </div>
                    </motion.div>
                </section>

                {/* Features Grid ("Bento Box") */}
                <section className="max-w-6xl mx-auto mb-32">
                    <motion.div
                        variants={STAGGER_CONTAINER}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >

                        {/* Card 1: Vision */}
                        <motion.div
                            variants={FADE_UP_ITEM}
                            className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-violet-500/30 overflow-hidden transition-all hover:bg-zinc-900/60 flex flex-col"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Visual Container */}
                            <div className="h-48 mb-6 rounded-2xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
                                <div className="scale-75 origin-center">
                                    <ScannerVisual />
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400"><Brain className="h-5 w-5" /></div>
                                    Document Audit
                                </h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Instantly analyze commercial invoices and BOLs. Support for 25+ document types with 99.8% extraction accuracy and deep compliance checking.
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-zinc-500 font-mono">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active • Compliance Engine
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2: Act */}
                        <motion.div
                            variants={FADE_UP_ITEM}
                            className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 overflow-hidden transition-all hover:bg-zinc-900/60 flex flex-col"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Visual Container */}
                            <div className="h-48 mb-6 rounded-2xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
                                <div className="scale-75 origin-center w-full px-4">
                                    <TerminalVisual />
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><Workflow className="h-5 w-5" /></div>
                                    Autonomous Filing
                                </h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Frictionless execution. Automatically generate and transmit compliant filing payloads directly to port authorities and customs partners.
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-zinc-500 font-mono">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active • Automated EDI
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: Sonic */}
                        <motion.div
                            variants={FADE_UP_ITEM}
                            className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-pink-500/30 overflow-hidden transition-all hover:bg-zinc-900/60 flex flex-col"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Visual Container */}
                            <div className="h-48 mb-6 rounded-2xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
                                <div className="scale-75 origin-center w-full px-4">
                                    <WaveformVisual />
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400"><Mic className="h-5 w-5" /></div>
                                    Ground Verification
                                </h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Hands-free warehouse operations. Empower ground staff to verify stock, track shipments, and report discrepancies using natural voice.
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-zinc-500 font-mono">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active • Real-time Voice Ops
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>


            </main>
        </div>
    );
}
