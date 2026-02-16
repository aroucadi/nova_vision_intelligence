"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AudioRecorderProps {
    onAudioRecorded: (blob: Blob) => void;
    disabled?: boolean;
}

export function AudioRecorder({ onAudioRecorded, disabled }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onAudioRecorded(blob);
                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Could not access microphone. Please allow microphone access.");
        }
    }, [onAudioRecorded]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    return (
        <div className="flex justify-center p-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${isRecording
                        ? "bg-red-500 shadow-lg shadow-red-500/30"
                        : "bg-gradient-to-br from-violet-600 to-pink-600 shadow-lg shadow-violet-500/20"
                    }`}
            >
                {isRecording && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                        <span className="absolute inset-[-4px] rounded-full border-2 border-red-400/40 animate-pulse" />
                    </>
                )}

                {isRecording ? (
                    <Square className="h-6 w-6 text-white relative z-10 fill-current" />
                ) : (
                    <Mic className="h-6 w-6 text-white relative z-10" />
                )}
            </motion.button>
        </div>
    );
}
