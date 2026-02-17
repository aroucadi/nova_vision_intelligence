
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { Circle } from '@remotion/shapes';

const COLORS = {
    office: '#7c3aed', // Violet (Nova 2 Lite)
    middleware: '#06b6d4', // Cyan (Nova Pro)
    warehouse: '#10b981', // Emerald (Compliance)
    alert: '#ef4444', // Red (Discrepancy)
};

export const WorkflowLoop: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animation Sequence
    // 0-60: Document -> Cloud (Analysis)
    // 60-120: Cloud -> Warehouse (Notification)
    // 120-180: Warehouse (Voice Input)
    // 180-240: Warehouse -> Cloud (Discrepancy)
    // 240-300: Cloud -> Office (Claim Draft)

    const progress = interpolate(frame, [0, 300], [0, 1]);

    // Phase 1: Document Upload
    const docOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const docY = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

    // Phase 2: Processing
    const cloudScale = spring({ frame: frame - 45, fps, config: { damping: 10 } });

    // Phase 3: Warehouse Receive
    const warehouseOpacity = interpolate(frame, [90, 120], [0, 1], { extrapolateRight: 'clamp' });

    // Phase 4: Discrepancy Signal
    const signalProgress = interpolate(frame, [180, 240], [0, 1], { extrapolateRight: 'clamp' });
    const signalY = interpolate(signalProgress, [0, 1], [200, -200]); // Moving Up

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>

            {/* BACKGROUND GRID */}
            <AbsoluteFill style={{ opacity: 0.1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20, width: '100%', height: '100%' }}>
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} style={{ width: 4, height: 4, backgroundColor: '#fff', borderRadius: '50%' }} />
                    ))}
                </div>
            </AbsoluteFill>

            {/* NODES */}

            {/* 1. OFFICE (Top Left) */}
            <div style={{ position: 'absolute', top: '20%', left: '20%', opacity: docOpacity, transform: `translateY(${docY}px)` }}>
                <div style={{ width: 100, height: 120, backgroundColor: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40 }}>📄</span>
                </div>
                <h2 style={{ color: 'white', fontFamily: 'sans-serif', textAlign: 'center' }}>Office</h2>
            </div>

            {/* 2. CLOUD / AI (Center) */}
            <div style={{ transform: `scale(${Math.max(0, cloudScale)})`, zIndex: 10 }}>
                <Circle radius={80} fill={COLORS.middleware} style={{ opacity: 0.2, position: 'absolute' }} />
                <Circle radius={60} fill={COLORS.office} />
                <h1 style={{ position: 'absolute', color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold' }}>NOVA</h1>
            </div>

            {/* 3. WAREHOUSE (Bottom Right) */}
            <div style={{ position: 'absolute', bottom: '20%', right: '20%', opacity: warehouseOpacity }}>
                <div style={{ width: 120, height: 80, backgroundColor: '#334155', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${COLORS.warehouse}` }}>
                    <span style={{ fontSize: 40 }}>🎤</span>
                </div>
                <h2 style={{ color: 'white', fontFamily: 'sans-serif', textAlign: 'center' }}>Warehouse</h2>
            </div>

            {/* SIGNALS */}

            {/* Forward Flow (Blue) */}
            {frame > 60 && frame < 120 && (
                <div style={{
                    position: 'absolute', width: 20, height: 20, borderRadius: '50%', backgroundColor: COLORS.middleware,
                    top: interpolate(frame, [60, 120], [360, 500]), // Calculated positions approximately
                    left: interpolate(frame, [60, 120], [640, 900])
                }} />
            )}

            {/* Feedback Loop (Red) */}
            {frame > 180 && (
                <div style={{
                    position: 'absolute', width: 25, height: 25, borderRadius: '50%', backgroundColor: COLORS.alert,
                    bottom: interpolate(frame, [180, 240], [200, 500]),
                    right: interpolate(frame, [180, 240], [300, 640]),
                    boxShadow: `0 0 20px ${COLORS.alert}`
                }} />
            )}

            {/* TEXT OVERLAYS */}
            <div style={{ position: 'absolute', bottom: 50, width: '100%', textAlign: 'center', fontFamily: 'sans-serif', color: 'white', fontSize: 24 }}>
                {frame < 60 && "Invoice Upload & Analysis"}
                {frame >= 60 && frame < 120 && "Global Pathway Update"}
                {frame >= 120 && frame < 180 && "Proactive Notification (Voice)"}
                {frame >= 180 && frame < 240 && "Discrepancy Reported!"}
                {frame >= 240 && "Claims Agent Triggered"}
            </div>

        </AbsoluteFill>
    );
};
