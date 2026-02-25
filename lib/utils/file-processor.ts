import type { ImageFormat, DocumentFormat } from "../nova/types";

export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });
}

export function bufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString("base64");
}

export function getImageFormat(filename: string): ImageFormat {
    const ext = filename.split(".").pop()?.toLowerCase();
    const formats: Record<string, ImageFormat> = {
        jpg: "jpeg",
        jpeg: "jpeg",
        png: "png",
        gif: "gif",
        webp: "webp",
    };
    return formats[ext || ""] || "jpeg";
}

export function getDocFormat(filename: string): DocumentFormat | null {
    const ext = filename.split(".").pop()?.toLowerCase();
    const formats: Record<string, DocumentFormat> = {
        pdf: "pdf",
        csv: "csv",
        doc: "doc",
        docx: "docx",
        xls: "xls",
        xlsx: "xlsx",
        html: "html",
        txt: "txt",
        md: "md",
    };
    return formats[ext || ""] || null;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function isImageFile(filename: string): boolean {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
}

export function isDocumentFile(filename: string): boolean {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["pdf", "csv", "doc", "docx", "xls", "xlsx", "html", "txt", "md"].includes(
        ext || ""
    );
}

export function getMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        pdf: "application/pdf",
        csv: "text/csv",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        html: "text/html",
        txt: "text/plain",
        md: "text/markdown",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
}

export function isVideoFile(filename: string): boolean {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "mov", "mkv", "mpg", "mpeg", "3gp", "flv"].includes(ext || "");
}

export function getVideoFormat(filename: string): any {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "three_gp") return "three_gp";
    return ext || "mp4";
}
