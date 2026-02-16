"use client";

import { motion } from "framer-motion";
import { FileText, Terminal, Mic, Activity, Search, CheckCircle, Smartphone } from "lucide-react";

// --- Scene 1: The Scanner (Multimodal) ---
export function ScannerVisual() {
    return (
        <div className="relative w-64 h-80 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center overflow-hidden mx-auto shadow-2xl">
            <FileText className="h-32 w-32 text-zinc-700" />
            <div className="absolute top-4 left-4 w-32 h-2 bg-zinc-800 rounded-full" />
            <div className="absolute top-8 left-4 w-48 h-2 bg-zinc-800 rounded-full" />
            <div className="absolute top-12 left-4 w-40 h-2 bg-zinc-800 rounded-full" />

            {/* Scanning Beam */}
            <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] z-10"
            />

            {/* Detected Field Highlights */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute top-20 left-6 w-24 h-6 border-2 border-emerald-500/50 rounded bg-emerald-500/10"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                className="absolute bottom-20 right-6 w-16 h-6 border-2 border-emerald-500/50 rounded bg-emerald-500/10"
            />
        </div>
    );
}

// --- Scene 2: The Terminal (Automation) ---
export function TerminalVisual() {
    return (
        <div className="w-full max-w-md bg-zinc-950 rounded-lg border border-zinc-800 shadow-2xl overflow-hidden font-mono text-xs mx-auto">
            <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 border-b border-zinc-800">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <span className="ml-2 text-zinc-500">nova-act — zsh</span>
            </div>
            <div className="p-4 space-y-2 text-green-400">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    &gt; connect --target="CBP ACE Portal"
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    [SUCCESS] Secure tunnel established (24ms)
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    &gt; payload.inject(entry_998877.json)
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                >
                    [INFO] Form fields populated: 42/42
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.0 }}
                    className="text-emerald-300 font-bold"
                >
                    &gt; SUBMITTING...
                </motion.div>
            </div>
        </div>
    );
}

// --- Scene 3: The Waveform (Voice) ---
export function WaveformVisual() {
    return (
        <div className="flex items-center justify-center gap-1 h-32 mx-auto">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ height: ["20%", "80%", "30%"] }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className="w-3 bg-gradient-to-t from-pink-500 to-violet-500 rounded-full opacity-80"
                    style={{ height: "40%" }}
                />
            ))}
        </div>
    );
}
