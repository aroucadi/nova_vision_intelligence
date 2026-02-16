"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Brain, Copy, Check, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

interface AnalysisResultsProps {
    analysis: {
        type: string;
        result: string;
        model: string;
        processingTimeMs: number;
        tokensUsed: { input: number; output: number };
        timestamp: string;
    };
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(analysis.result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isJson = analysis.result.trim().startsWith("{") || analysis.result.trim().startsWith("[");

    const typeLabels: Record<string, string> = {
        summary: "📋 Summary",
        extraction: "🗃️ Data Extraction",
        classification: "🏷️ Classification",
        compliance: "🛡️ Compliance Check",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
                {/* Gradient accent bar */}
                <div className="h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500" />

                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-xl text-white">
                            {typeLabels[analysis.type] || "Analysis Results"}
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <Badge
                                variant="secondary"
                                className="gap-1 bg-violet-500/10 text-violet-300 border-violet-500/20"
                            >
                                <Brain className="h-3 w-3" />
                                {analysis.model}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="gap-1 text-cyan-300 border-cyan-500/20"
                            >
                                <Clock className="h-3 w-3" />
                                {(analysis.processingTimeMs / 1000).toFixed(2)}s
                            </Badge>
                            {(analysis.tokensUsed.input > 0 ||
                                analysis.tokensUsed.output > 0) && (
                                    <Badge
                                        variant="outline"
                                        className="gap-1 text-amber-300 border-amber-500/20"
                                    >
                                        <Coins className="h-3 w-3" />
                                        {analysis.tokensUsed.input + analysis.tokensUsed.output}{" "}
                                        tokens
                                    </Badge>
                                )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="gap-1 text-zinc-400 hover:text-white h-6"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {isJson ? (
                        <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-xl overflow-x-auto text-sm font-mono border border-zinc-800">
                            {(() => {
                                try {
                                    return JSON.stringify(JSON.parse(analysis.result), null, 2);
                                } catch {
                                    return analysis.result;
                                }
                            })()}
                        </pre>
                    ) : (
                        <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800">
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-violet-400 mt-1 shrink-0" />
                                <p className="whitespace-pre-wrap text-zinc-200 leading-relaxed text-sm">
                                    {analysis.result}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
