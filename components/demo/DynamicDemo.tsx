"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, RefreshCw, X, Play, Info } from "lucide-react";
import { ScannerVisual, TerminalVisual, WaveformVisual } from "./SceneVisuals";

export interface DemoScene {
    id: string;
    title: string;
    subtitle: string;
    type: "intro" | "problem" | "solution" | "demo" | "outro";
    content?: string;
    visual?: React.ReactNode;
    color: string;
}

interface DynamicDemoProps {
    scenes: DemoScene[];
    onClose: () => void;
}

export function DynamicDemo({ scenes, onClose }: DynamicDemoProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

    const currentScene = scenes[currentSceneIndex];
    const progress = ((currentSceneIndex + 1) / scenes.length) * 100;

    const paginate = (newDirection: number) => {
        const nextIndex = currentSceneIndex + newDirection;
        if (nextIndex >= 0 && nextIndex < scenes.length) {
            setDirection(newDirection);
            setCurrentSceneIndex(nextIndex);
        } else if (nextIndex >= scenes.length) {
            onClose();
        }
    };

    const replay = () => {
        setDirection(-1);
        setCurrentSceneIndex(0);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") paginate(1);
            if (e.key === "ArrowLeft") paginate(-1);
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSceneIndex, scenes.length]);

    // ANIMATION VARIANTS (Remotion-inspired Spring Physics)
    const slideVariants: any = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                // "Organic Motion" rule: Spring physics
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.4 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.4 }
            }
        })
    };

    const containerVariants: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // "Sequencing" rule
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 260, damping: 20 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col"
        >
            {/* Ambient Background */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 bg-gradient-to-br ${currentScene.color}`} />

            {/* Header / Nav */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
                            Scene {currentSceneIndex + 1}/{scenes.length}
                        </span>
                        <span className="font-bold text-lg">{currentScene.title}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden md:block w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentSceneIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12"
                    >
                        {/* Types: Intro/Outro are Centered Text. Problem/Solution/Demo are Split Layout. */}

                        {(currentScene.type === "intro" || currentScene.type === "outro") ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="text-center w-full space-y-8"
                            >
                                <motion.div variants={itemVariants} className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-4">
                                    {currentScene.visual || <Play className="h-12 w-12" />}
                                </motion.div>
                                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                                    {currentScene.title}
                                </motion.h1>
                                <motion.p variants={itemVariants} className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                                    {currentScene.content}
                                </motion.p>
                                <motion.div variants={itemVariants}>
                                    <Button size="lg" onClick={() => paginate(1)} className="rounded-full px-8 h-14 text-lg bg-white text-black hover:bg-zinc-200">
                                        {currentScene.type === 'intro' ? "Start Experience" : "Close Demo"} <ArrowRight className="ml-2" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <>
                                {/* Left: Narrative */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="flex-1 space-y-6"
                                >
                                    <motion.div variants={itemVariants}>
                                        <Badge variant="outline" className="text-xs uppercase tracking-widest border-white/20 text-white/60 px-3 py-1">
                                            {currentScene.type.toUpperCase()} PHASE
                                        </Badge>
                                    </motion.div>
                                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold leading-tight">
                                        {currentScene.subtitle}
                                    </motion.h2>
                                    <motion.p variants={itemVariants} className="text-lg text-zinc-400 leading-relaxed border-l-2 border-white/10 pl-6">
                                        {currentScene.content}
                                    </motion.p>
                                </motion.div>

                                {/* Right: Visual */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                                    className="flex-1 w-full flex items-center justify-center relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl blur-2xl -z-10" />
                                    <div className="relative z-10 w-full max-w-md aspect-square bg-zinc-900/50 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-hidden p-8">
                                        {currentScene.visual}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="relative z-10 p-6 flex justify-between items-center border-t border-white/10 bg-black/50 backdrop-blur-xl">
                <Button variant="ghost" onClick={replay} className="text-zinc-500 hover:text-white">
                    <RefreshCw className="h-4 w-4 mr-2" /> Replay
                </Button>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => paginate(-1)}
                        disabled={currentSceneIndex === 0}
                        className="rounded-full border-white/10 text-zinc-300 hover:bg-white/5"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Prev
                    </Button>
                    <Button
                        onClick={() => paginate(1)}
                        className="rounded-full bg-white text-black hover:bg-zinc-200 px-8"
                    >
                        {currentSceneIndex === scenes.length - 1 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
