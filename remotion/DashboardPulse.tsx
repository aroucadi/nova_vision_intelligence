
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const COLORS = {
    background: '#18181b', // Zinc 900
    grid: 'rgba(255, 255, 255, 0.05)',
    primary: '#10b981',    // Emerald 500
    secondary: '#06b6d4',  // Cyan 500
    accent: '#8b5cf6'      // Violet 500
};

export const DashboardPulse: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Configuration
    const barCount = 20;
    const barWidth = width / barCount;

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.background }}>

            {/* 1. Scrolling Grid Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px), linear-gradient(${COLORS.grid} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                transform: `translateY(${frame % 20}px)`
            }} />

            {/* 2. Audio/Activity Visualizer Bars */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                paddingBottom: 0
            }}>
                {new Array(barCount).fill(0).map((_, i) => {
                    // Generate a unique wave for each bar
                    // Combine multiple sine waves for organic look
                    const wave1 = Math.sin(frame / 10 + i * 0.5);
                    const wave2 = Math.cos(frame / 15 + i * 0.2);
                    const wave3 = Math.sin(frame / 5 + i);

                    // Normalize to 0-1 range approx
                    const rawHeight = (wave1 + wave2 + wave3 + 3) / 6;

                    // Scale to view height (keep it bottom aligned)
                    const h = rawHeight * (height * 0.8);

                    // Dynamic Color based on height
                    let barColor = COLORS.primary;
                    if (h > height * 0.6) barColor = COLORS.secondary;
                    if (h > height * 0.7) barColor = COLORS.accent;

                    return (
                        <div key={i} style={{
                            width: '100%',
                            height: h,
                            backgroundColor: barColor,
                            opacity: 0.8,
                            borderRadius: '4px 4px 0 0',
                            boxShadow: `0 0 10px ${barColor}`
                        }} />
                    );
                })}
            </div>

            {/* 3. Overlay Text */}
            <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontFamily: 'monospace',
                fontSize: 10,
                color: COLORS.primary,
                fontWeight: 'bold',
                textShadow: `0 0 5px ${COLORS.primary}`
            }}>
                NET_ACTIVITY: {Math.round(Math.sin(frame / 10) * 50 + 50)}%
            </div>
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontFamily: 'monospace',
                fontSize: 10,
                color: '#fff',
                opacity: 0.5
            }}>
                LIVE
            </div>

        </AbsoluteFill>
    );
};
