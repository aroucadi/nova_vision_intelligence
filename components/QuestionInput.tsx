"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Send, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QAEntry {
    question: string;
    answer: string;
    model?: string;
    processingTimeMs?: number;
}

interface QuestionInputProps {
    fileUrl: string;
    qaPairs: QAEntry[];
    onAnswer: (qa: QAEntry) => void;
}

export function QuestionInput({ fileUrl, qaPairs, onAnswer }: QuestionInputProps) {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!question.trim()) return;

        setLoading(true);

        try {
            const response = await fetch("/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl, question }),
            });

            const data = await response.json();

            if (data.success) {
                onAnswer({
                    question: data.qa.question,
                    answer: data.qa.answer,
                    model: data.qa.model,
                    processingTimeMs: data.qa.processingTimeMs,
                });
                setQuestion("");
            } else {
                onAnswer({
                    question,
                    answer: `Error: ${data.error || "Failed to get answer"}`,
                });
            }
        } catch (error) {
            console.error("Query failed:", error);
            onAnswer({
                question,
                answer: "Error: Failed to get answer. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <Card className="border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-violet-500" />

            <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                    Ask Questions About Your Content
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="What would you like to know about this content?"
                        className="flex-1 min-h-[80px] bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
                        disabled={loading}
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !question.trim()}
                        className="h-fit bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white border-0"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-zinc-500">
                    Press Ctrl/Cmd + Enter to submit • Powered by Nova 2 Lite
                </p>

                {/* Q&A History */}
                <AnimatePresence>
                    {qaPairs.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3 pt-2"
                        >
                            {qaPairs.map((qa, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border-l-2 border-violet-500/50 pl-4 py-2 space-y-2"
                                >
                                    <p className="font-medium text-zinc-200 text-sm">
                                        <span className="text-cyan-400">Q:</span> {qa.question}
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="h-3 w-3 text-violet-400 mt-1 shrink-0" />
                                        <p className="text-zinc-300 leading-relaxed text-sm">
                                            {qa.answer}
                                        </p>
                                    </div>
                                    {qa.processingTimeMs && (
                                        <p className="text-xs text-zinc-600">
                                            {(qa.processingTimeMs / 1000).toFixed(2)}s •{" "}
                                            {qa.model || "Nova 2 Lite"}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
