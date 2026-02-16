"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error caught:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 p-6">
            <div className="flex flex-col items-center max-w-md text-center space-y-6">
                <div className="p-4 rounded-full bg-red-900/20">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                    Something went wrong!
                </h1>

                <p className="text-neutral-400">
                    {error.message || "An unexpected error occurred while loading this page."}
                </p>

                <div className="flex gap-4">
                    <Button
                        variant="default"
                        onClick={reset}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/dashboard"}
                        className="border-neutral-700 hover:bg-neutral-900"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
