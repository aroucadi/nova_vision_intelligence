"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Zap,
    ShieldCheck,
    Brain,
    ArrowLeft,
    TrendingUp,
    Clock,
    FileText,
    Activity
} from "lucide-react";
import { useGlobalPathway } from "@/context/GlobalPathwayContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
    const { metrics } = useGlobalPathway();

    // Authoritative data derived from live context
    const stats = [
        { label: "Total Analyses", value: metrics.processedDocs.toString(), icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10" },
        { label: "Real-time Filings", value: metrics.filings.toString(), icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Operational Voice", value: metrics.voiceOps.toString(), icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { label: "Compliance Risk", value: metrics.flagged.toString(), icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
    ];

    const agentPerformance = [
        { name: "Document Analyzer", score: 100, latency: "Real-time", usage: "Dynamic" },
        { name: "Customs Broker (Act)", score: 100, latency: "Real-time", usage: "Dynamic" },
        { name: "Compliance Guard", score: 100, latency: "Real-time", usage: "Dynamic" },
        { name: "Sonic Voice Ops", score: 100, latency: "Real-time", usage: "Dynamic" },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link href="/">
                            <Button variant="ghost" className="mb-4 text-zinc-400 hover:text-white -ml-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                            Platform Analytics
                        </h1>
                        <p className="text-zinc-500 mt-2">Real-time performance and usage metrics for Amazon Nova agents</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300">
                            Download Report
                        </Button>
                        <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0">
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                        </div>
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
                                        <p className="text-3xl font-bold text-zinc-100">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Chart Placeholder */}
                    <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-violet-400" />
                                Agent Performance Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 w-full flex items-end justify-between gap-2 px-2 pb-2">
                                {[65, 45, 75, 55, 95, 85, 45, 60, 80, 70, 90, 65].map((val, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${val}%` }}
                                        transition={{ delay: i * 0.05, duration: 1 }}
                                        className="flex-1 bg-gradient-to-t from-violet-600/20 to-violet-500/60 rounded-t-sm relative group"
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {val}% Load
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-medium px-1">
                                <span>12:00</span>
                                <span>15:00</span>
                                <span>18:00</span>
                                <span>21:00</span>
                                <span>00:00</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Agent Efficiency */}
                    <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Brain className="h-5 w-5 text-cyan-400" />
                                Specialist Matrix
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {agentPerformance.map((agent) => (
                                    <div key={agent.name} className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-zinc-300">{agent.name}</span>
                                            <span className="text-emerald-400">{agent.score}% Acc.</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${agent.score}%` }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-600">
                                            <span>Latency: {agent.latency}</span>
                                            <span>Quota: {agent.usage}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-zinc-500 text-xs">
                    <p>Metrics aggregated across all Nova 2 model variations</p>
                    <p>Last sync: Just now • System Status: Operational</p>
                </div>
            </div>
        </div>
    );
}
