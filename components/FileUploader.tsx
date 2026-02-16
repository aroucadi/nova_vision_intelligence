"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatFileSize } from "@/lib/utils/file-processor";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFileData {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
}

interface FileUploaderProps {
    onFileUploaded: (file: UploadedFileData) => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setUploading(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    setUploadedFile(data.file);
                    onFileUploaded(data.file);
                } else {
                    setError(data.error || "Upload failed");
                }
            } catch (err) {
                console.error("Upload failed:", err);
                setError("Upload failed. Please try again.");
            } finally {
                setUploading(false);
            }
        },
        [onFileUploaded]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
            "application/pdf": [".pdf"],
            "text/csv": [".csv"],
            "text/plain": [".txt"],
        },
        maxFiles: 1,
        disabled: uploading,
    });

    const handleRemove = () => {
        setUploadedFile(null);
        setError(null);
    };

    if (uploadedFile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6 border-2 border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                <FileText className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">
                                    {uploadedFile.filename}
                                </p>
                                <p className="text-sm text-zinc-400">
                                    {formatFileSize(uploadedFile.size)} • Ready for analysis
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            className="hover:bg-red-500/10 hover:text-red-400 text-zinc-400"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <div>
            <div
                {...getRootProps()}
                className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed p-8 md:p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragActive
                        ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                        : "border-zinc-700 hover:border-violet-500/50 hover:bg-zinc-800/50"
                    }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
            >
                <input {...getInputProps()} disabled={uploading} />

                {/* Gradient glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

                <div className="relative flex flex-col items-center gap-4">
                    {uploading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="h-12 w-12 text-violet-400" />
                        </motion.div>
                    ) : (
                        <motion.div
                            className="p-4 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <Upload className="h-8 w-8 text-violet-400" />
                        </motion.div>
                    )}

                    {uploading ? (
                        <div>
                            <p className="text-lg font-semibold text-white">Uploading...</p>
                            <p className="text-sm text-zinc-400">Please wait</p>
                        </div>
                    ) : isDragActive ? (
                        <div>
                            <p className="text-lg font-semibold text-violet-400">
                                Drop it here!
                            </p>
                            <p className="text-sm text-zinc-400">
                                We&apos;ll process it with Nova 2 Lite
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-lg font-semibold text-white mb-1">
                                Drop your file here, or click to browse
                            </p>
                            <p className="text-sm text-zinc-400">
                                Images (JPG, PNG, GIF, WebP), PDFs, CSV, TXT — up to 10MB
                            </p>
                            <p className="text-xs text-zinc-500 mt-2">
                                Powered by Amazon Nova 2 Lite • Up to 1M tokens context
                            </p>
                        </div>
                    )}
                </div>

                {/* Demo Helper - Quick Action */}
                <div className="absolute bottom-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Simulate upload
                            const sampleFile: UploadedFileData = {
                                id: "demo-invoice-001",
                                filename: "commercial_invoice_scan.pdf",
                                mimeType: "application/pdf",
                                size: 1024 * 450, // 450KB
                                url: "https://nova-hackathon-assets.s3.amazonaws.com/demo/invoice.pdf", // Mock URL
                                uploadedAt: new Date().toISOString()
                            };
                            setUploadedFile(sampleFile);
                            onFileUploaded(sampleFile);
                        }}
                    >
                        Try Sample Invoice
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                        <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
