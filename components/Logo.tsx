"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "icon" | "full";
    theme?: "light" | "dark";
}

export function Logo({ className, size = "md", variant = "full", theme = "dark" }: LogoProps) {
    const sizes = {
        sm: { height: 24, fontSize: "text-lg" },
        md: { height: 32, fontSize: "text-xl" },
        lg: { height: 48, fontSize: "text-2xl" },
        xl: { height: 64, fontSize: "text-4xl" }
    };

    const { height, fontSize } = sizes[size];

    // Amazon Nova-inspired Gradient: Purple to Orange
    const gradientId = "nova-gradient";

    return (
        <div className={cn("flex items-center gap-2 font-sans select-none", className)}>
            {/* Abstract Eye / Node Icon */}
            <svg
                height={height}
                width={height}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7C3AED" /> {/* Deep Purple */}
                        <stop offset="100%" stopColor="#FF9900" /> {/* Bright Orange */}
                    </linearGradient>
                </defs>

                {/* Outer Ring (Vision) */}
                <circle
                    cx="50" cy="50" r="40"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-90"
                />

                {/* Inner Node (Intelligence/Network) */}
                <circle cx="50" cy="50" r="15" fill={`url(#${gradientId})`} />

                {/* Connecting Lines (Agents) */}
                <path
                    d="M85 50 L95 50 M50 85 L50 95 M15 50 L5 50 M50 15 L50 5"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="opacity-70"
                />
                <circle cx="85" cy="50" r="4" fill="#FF9900" />
            </svg>

            {/* Text Mark */}
            {variant === "full" && (
                <span className={cn("font-bold tracking-tight", fontSize, theme === "dark" ? "text-white" : "text-slate-900")}>
                    Nova<span style={{ color: "#FF9900" }}>Vision</span>
                </span>
            )}
        </div>
    );
}
