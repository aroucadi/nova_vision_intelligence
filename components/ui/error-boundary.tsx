"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-red-600 dark:text-red-300 max-w-md">
                        {this.state.error?.message || "An unexpected error occurred."}
                    </p>
                    <Button
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
