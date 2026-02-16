"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    CheckCircle2,
    CircleDashed,
    AlertCircle,
    Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type AgentTask, type PipelineState, AGENT_METADATA, type AgentId } from "@/lib/agents/types";

// ...

export function AgentPipeline({ pipeline }: { pipeline: PipelineState }) {
    return (
        <Card className="border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 animate-pulse" />

            <CardHeader className="pb-3 border-b border-zinc-800/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <Brain className="h-5 w-5 text-violet-400" />
                        </div>
                        Multi-Agent Intelligence Pipeline
                    </CardTitle>
                    <Badge
                        variant={pipeline.overallStatus === "completed" ? "default" : "secondary"}
                        className={`${pipeline.overallStatus === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            }`}
                    >
                        {pipeline.overallStatus.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                <div className="relative">
                    {/* Vertical connector line */}
                    <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-zinc-800" />

                    <div className="space-y-8">
                        {pipeline.tasks.map((task, index) => (
                            <AgentStep key={task.id} task={task} index={index} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AgentStep({ task, index }: { task: AgentTask; index: number }) {
    const isCompleted = task.status === "completed";
    const isRunning = task.status === "running";
    const isFailed = task.status === "failed";

    const meta = AGENT_METADATA[task.agentId as AgentId] || AGENT_METADATA['coordinator'];

    // Construct semantic classes
    const modelBadgeClass = `${meta.color} ${meta.borderColor} ${meta.bgColor}`;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="relative flex gap-4 md:gap-6"
        >
            {/* Node Icon */}
            <div className="relative z-10 shrink-0">
                <div className={`
          w-11 h-11 rounded-full flex items-center justify-center border-4 border-zinc-950
          transition-all duration-500
          ${isCompleted ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                        isRunning ? "bg-violet-600 text-white animate-pulse" :
                            isFailed ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-500"}
        `}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                        isRunning ? <CircleDashed className="h-5 w-5 animate-spin" /> :
                            isFailed ? <AlertCircle className="h-5 w-5" /> :
                                <span className="text-sm font-bold">{index + 1}</span>}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-zinc-100">{task.name}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${modelBadgeClass}`}>
                            {meta.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {task.completedAt ? "Done" : "Processing..."}
                    </div>
                </div>
                <p className="text-sm text-zinc-400 mb-3">{task.description}</p>

                <AnimatePresence>
                    {isCompleted && task.result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 text-sm font-mono text-zinc-300 overflow-hidden"
                        >
                            <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                {(() => {
                                    try {
                                        // Only attempt parse if it looks like JSON
                                        if (task.result.trim().startsWith('{') || task.result.trim().startsWith('[')) {
                                            return <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(task.result), null, 2)}</pre>;
                                        }
                                        throw new Error("Not JSON");
                                    } catch {
                                        // Fallback to text display
                                        return <p className="whitespace-pre-wrap">{task.result.substring(0, 500)}{task.result.length > 500 ? '...' : ''}</p>;
                                    }
                                })()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isFailed && (
                    <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                        {task.error || "Agent encounterd an unknown error during execution."}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
