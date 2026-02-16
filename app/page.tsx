"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, Mic, Workflow, Zap, PlayCircle, Rocket, Shield, Globe, Box, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

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
                            NovaVision
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1]"
                        >
                            Turn Supply Chain <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-gradient-x">
                                Chaos into Intelligence.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                        >
                            The first Autonomous Logistics OS powered by Multimodal AI.
                            Instant clearance, proactive compliance, and hands-free warehouse ops.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                        >
                            <Link href="/dashboard">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all">
                                    Start Free Trial <Rocket className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all">
                                    <PlayCircle className="mr-2 h-5 w-5 text-zinc-400" /> Watch Demo
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Grid ("Bento Box") */}
                <section className="max-w-6xl mx-auto mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Card 1: Vision */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-violet-500/30 overflow-hidden transition-all hover:bg-zinc-900/60"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-violet-500 group-hover:text-white transition-all duration-500">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Nova Vision</h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Instantly analyze Commercial Invoices and BOLs. Support for 25+ document types with 99.8% extraction accuracy using <span className="text-violet-400">Nova 2 Pro</span>.
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-zinc-500 font-mono">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active • 24ms latency
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2: Act (Span 2 on mobile, 1 on desktop for symmetry in 3-col) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 overflow-hidden transition-all hover:bg-zinc-900/60"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                    <Workflow className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Nova Act</h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Autonomous execution. Takes extracted data and generates compliant filing payloads for Port Authorities and Customs via <span className="text-cyan-400">Nova 2 Pro</span> reasoning agents.
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-zinc-500 font-mono">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active • Automated Payload Gen
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: Sonic */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-pink-500/30 overflow-hidden transition-all hover:bg-zinc-900/60"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                                    <Mic className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Nova Voice</h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Hands-free warehouse operations. Workers simply speak to verify stock and shipping status, powered by ultra-low latency <span className="text-pink-400">Nova 2 Pro</span> Voice Intelligence.
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-zinc-500 font-mono">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active • &lt;600ms response
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Social Proof Marquee */}
                <section className="border-t border-white/5 pt-16 pb-20">
                    <p className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-12">Trusted by Global Logistics Leaders</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale pointer-events-none select-none">
                        <div className="flex items-center gap-3 text-2xl font-black text-white"><Globe className="h-8 w-8" /> ATLAS LOGISTICS</div>
                        <div className="flex items-center gap-3 text-2xl font-black text-white"><Box className="h-8 w-8" /> TYCHO FREIGHT</div>
                        <div className="flex items-center gap-3 text-2xl font-black text-white"><Shield className="h-8 w-8" /> GUARDIAN SHIPPING</div>
                        <div className="flex items-center gap-3 text-2xl font-black text-white"><Layers className="h-8 w-8" /> STRATUM CHAIN</div>
                    </div>
                </section>
            </main>
        </div>
    );
}
