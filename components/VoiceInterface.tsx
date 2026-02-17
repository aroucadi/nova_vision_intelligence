"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/AudioRecorder";
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Loader2,
    User,
    Bot,
    Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceEntry {
    id: string;
    role: "user" | "assistant";
    text: string;
    processingTimeMs?: number;
    timestamp: Date;
}

interface VoiceInterfaceProps {
    fileUrl?: string;
    contextId?: string;
}

export function VoiceInterface({ fileUrl, contextId }: VoiceInterfaceProps) {
    const [listening, setListening] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [conversation, setConversation] = useState<VoiceEntry[]>([]);
    const [interimText, setInterimText] = useState("");

    // Fallback to Web Speech API if preferred/needed
    const [sttSupported, setSttSupported] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Check browser support for fallback
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
            setSttSupported(false);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [conversation, interimText]);

    const speak = useCallback(
        (text: string) => {
            if (!ttsEnabled || !window.speechSynthesis) return;

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.05;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Pick a good voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(
                (v) =>
                    v.name.includes("Google") ||
                    v.name.includes("Samantha") ||
                    v.name.includes("Daniel")
            );
            if (preferred) utterance.voice = preferred;

            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);

            window.speechSynthesis.speak(utterance);
        },
        [ttsEnabled]
    );

    const sendToVoiceAPI = useCallback(
        async (input: string | Blob) => {
            setProcessing(true);

            // Add user entry (Optimistic UI)
            const userEntry: VoiceEntry = {
                id: `u-${Date.now()}`,
                role: "user",
                text: input instanceof Blob ? "🎤 [Audio Message]" : input,
                timestamp: new Date(),
            };
            setConversation((prev) => [...prev, userEntry]);

            try {
                const history = conversation.map((e) => ({
                    role: e.role,
                    text: e.text,
                }));

                let response;

                if (input instanceof Blob) {
                    // MULTIPART REQUEST (Audio)
                    const formData = new FormData();
                    formData.append("audio", input);
                    if (fileUrl) formData.append("fileUrl", fileUrl);
                    if (contextId) formData.append("contextId", contextId);
                    formData.append("conversationHistory", JSON.stringify(history));

                    response = await fetch("/api/voice", {
                        method: "POST",
                        body: formData,
                        // Content-Type header is set automatically by fetch for FormData
                    });
                } else {
                    // JSON REQUEST (Text)
                    response = await fetch("/api/voice", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            transcript: input,
                            fileUrl,
                            contextId,
                            conversationHistory: history,
                        }),
                    });
                }

                const data = await response.json();

                if (data.success) {
                    const botEntry: VoiceEntry = {
                        id: `a-${Date.now()}`,
                        role: "assistant",
                        text: data.answer,
                        processingTimeMs: data.processingTimeMs,
                        timestamp: new Date(),
                    };
                    setConversation((prev) => [...prev, botEntry]);

                    // Speak the response
                    speak(data.answer);
                } else {
                    const errorEntry: VoiceEntry = {
                        id: `e-${Date.now()}`,
                        role: "assistant",
                        text: data.error || "Sorry, I had trouble processing that.",
                        timestamp: new Date(),
                    };
                    setConversation((prev) => [...prev, errorEntry]);
                }
            } catch (error) {
                console.error("Voice API error:", error);
                const errorEntry: VoiceEntry = {
                    id: `e-${Date.now()}`,
                    role: "assistant",
                    text: "Sorry, there was a connection error. Please try again.",
                    timestamp: new Date(),
                };
                setConversation((prev) => [...prev, errorEntry]);
            } finally {
                setProcessing(false);
            }
        },
        [conversation, fileUrl, contextId, speak]
    );

    const handleAudioRecorded = useCallback(async (blob: Blob) => {
        console.log("Audio blob captured:", blob.size);
        // Direct Send to API (100% Real Audio)
        sendToVoiceAPI(blob);
    }, [sendToVoiceAPI]);

    const startListening = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let final = "";
            let interim = "";
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setInterimText(interim);
            if (final) {
                setInterimText("");
                setListening(false);
                sendToVoiceAPI(final.trim());
            }
        };

        recognition.onend = () => {
            setListening(false);
            setInterimText("");
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setListening(false);
            setInterimText("");
        };

        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    }, [sendToVoiceAPI]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
        setInterimText("");
    }, []);

    const clearConversation = () => {
        setConversation([]);
        window.speechSynthesis?.cancel();
    };

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-pink-500/20 to-violet-500/20 rounded-xl">
                        <Volume2 className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-100">Voice Q&A</h3>
                        <p className="text-xs text-zinc-500">
                            Speak your questions • Nova 2 Sonic
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setTtsEnabled(!ttsEnabled);
                            if (ttsEnabled) window.speechSynthesis?.cancel();
                        }}
                        className="text-zinc-500 hover:text-zinc-300"
                    >
                        {ttsEnabled ? (
                            <Volume2 className="h-4 w-4" />
                        ) : (
                            <VolumeX className="h-4 w-4" />
                        )}
                    </Button>
                    {conversation.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearConversation}
                            className="text-zinc-500 hover:text-zinc-300"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Conversation */}
            <div
                ref={scrollRef}
                className="p-4 md:p-5 space-y-4 max-h-80 overflow-y-auto custom-scrollbar"
            >
                {conversation.length === 0 && !listening && (
                    <div className="text-center py-8">
                        <div className="p-4 bg-zinc-800/50 rounded-full w-fit mx-auto mb-4">
                            <Mic className="h-8 w-8 text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-500">
                            {sttSupported
                                ? "Tap to speak (Nova Sonic Mode)"
                                : "Speech recognition is not supported in this browser. Try Chrome."}
                        </p>
                        {fileUrl && (
                            <p className="text-xs text-zinc-600 mt-2">
                                Ask questions about your uploaded document
                            </p>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {conversation.map((entry) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${entry.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {entry.role === "assistant" && (
                                <div className="p-1.5 bg-violet-500/20 rounded-lg h-fit mt-0.5 shrink-0">
                                    <Bot className="h-3.5 w-3.5 text-violet-400" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-3 rounded-xl text-sm ${entry.role === "user"
                                    ? "bg-violet-600/20 text-violet-200 rounded-tr-sm"
                                    : "bg-zinc-800 text-zinc-300 rounded-tl-sm"
                                    }`}
                            >
                                <p className="leading-relaxed">{entry.text}</p>
                                {entry.processingTimeMs && (
                                    <p className="text-[10px] text-zinc-600 mt-1.5">
                                        {entry.processingTimeMs}ms
                                    </p>
                                )}
                            </div>
                            {entry.role === "user" && (
                                <div className="p-1.5 bg-zinc-800 rounded-lg h-fit mt-0.5 shrink-0">
                                    <User className="h-3.5 w-3.5 text-zinc-400" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Interim text (live transcription) */}
                {interimText && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-end"
                    >
                        <div className="max-w-[80%] p-3 rounded-xl text-sm bg-violet-600/10 text-violet-300/60 rounded-tr-sm border border-violet-500/10 italic">
                            {interimText}...
                        </div>
                    </motion.div>
                )}

                {/* Processing indicator */}
                {processing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                    >
                        <div className="p-1.5 bg-violet-500/20 rounded-lg h-fit mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-violet-400" />
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-800 rounded-tl-sm flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                            <span className="text-xs text-zinc-500">Thinking...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Mic Button Area */}
            <div className="p-5 border-t border-zinc-800/50 flex flex-col items-center gap-4">
                {/* 
                     100% "Real Mode": We use the AudioRecorder to capture raw audio 
                     and send it to Amazon Nova (Multimodal).
                 */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                        Input Mode:
                    </span>
                    <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setSttSupported(false)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${!sttSupported ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                        >
                            Nova Audio
                        </button>
                        <button
                            onClick={() => setSttSupported(true)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${sttSupported ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                        >
                            Browser STT
                        </button>
                    </div>
                </div>

                {sttSupported ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={listening ? stopListening : startListening}
                        disabled={processing}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${listening
                            ? "bg-red-500 shadow-lg shadow-red-500/30"
                            : "bg-gradient-to-br from-violet-600 to-pink-600 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                            }`}
                    >
                        {listening && (
                            <>
                                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                                <span className="absolute inset-[-4px] rounded-full border-2 border-red-400/40 animate-pulse" />
                            </>
                        )}
                        <Mic className="h-6 w-6 text-white relative z-10" />
                    </motion.button>
                ) : (
                    <AudioRecorder onAudioRecorded={handleAudioRecorded} disabled={processing} />
                )}

                {/* Status */}
                <div className="px-5 pb-4 text-center">
                    <p className="text-[11px] text-zinc-600">
                        {listening
                            ? "🔴 Listening... speak your question"
                            : speaking
                                ? "🔊 Speaking response..."
                                : processing
                                    ? "⏳ Processing with Nova 2 Sonic..."
                                    : "Tap to speak"}
                    </p>
                </div>
            </div>
        </div>
    );
}
