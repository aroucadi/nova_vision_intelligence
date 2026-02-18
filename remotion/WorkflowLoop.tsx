
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from 'remotion';
import { Circle } from '@remotion/shapes';

// --- STYLING CONSTANTS ---
const COLORS = {
    background: '#0f172a', // Slate 900
    office: '#a78bfa',     // Faded Violet
    officeGlow: '#7c3aed', // Bright Violet
    nova: '#22d3ee',       // Cyan
    novaGlow: '#0891b2',   // Dark Cyan
    warehouse: '#34d399',  // Emerald
    warehouseGlow: '#059669', // Dark Emerald
    alert: '#f87171',      // Red
    text: '#e2e8f0'        // Slate 200
};

// --- HELPER COMPONENTS ---

const GlowingNode: React.FC<{
    x: number;
    y: number;
    color: string;
    glowColor: string;
    icon: string;
    label: string;
    frame: number;
    fps: number;
    delay: number;
    scale?: number;
}> = ({ x, y, color, glowColor, icon, label, frame, fps, delay, scale: extraScale = 1 }) => {

    // Entrance Animation (Spring)
    const entrance = spring({
        frame: frame - delay,
        fps,
        config: { damping: 12, stiffness: 100 }
    });

    // Ongoing Pulse (Sine Wave)
    const pulse = Math.sin(frame / 15) * 0.05 + 1;

    // Apply scaling
    const finalScale = entrance * pulse * extraScale;

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: `translate(-50%, -50%) scale(${finalScale})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10
        }}>
            <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(30, 41, 59, 0.8)', // Slate 800 with opacity
                border: `3px solid ${color}`,
                boxShadow: `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                fontSize: 40
            }}>
                {icon}
            </div>
            <div style={{
                marginTop: 15,
                color: COLORS.text,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 18,
                textShadow: `0 2px 4px rgba(0,0,0,0.5)`
            }}>
                {label}
            </div>
        </div>
    );
};

const ConnectionLine: React.FC<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    progress: number;
    color: string;
}> = ({ startX, startY, endX, endY, progress, color }) => {

    // Calculate distance and angle
    const dist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    // Reveal animation
    const width = interpolate(progress, [0, 1], [0, dist], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            position: 'absolute',
            left: startX,
            top: startY,
            width: dist,
            height: 4,
            transformOrigin: '0 50%',
            transform: `rotate(${angle}deg)`,
            zIndex: 1
        }}>
            {/* Base Line (Dim) */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 2
            }} />

            {/* Active Line (Bright) */}
            <div style={{
                position: 'absolute',
                width: width,
                height: '100%',
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
                borderRadius: 2,
                opacity: progress > 0 ? 1 : 0
            }} />
        </div>
    );
};

const DataPacket: React.FC<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    progress: number; // 0 to 1
    color: string;
}> = ({ startX, startY, endX, endY, progress, color }) => {
    if (progress <= 0 || progress >= 1) return null;

    const x = interpolate(progress, [0, 1], [startX, endX]);
    const y = interpolate(progress, [0, 1], [startY, endY]);

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
            zIndex: 20
        }}>
            <Circle radius={10} fill={color} style={{ boxShadow: `0 0 15px ${color}` }} />
        </div>
    );
};

// --- MAIN COMPOSITION ---

export const WorkflowLoop: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Coordinates (1280x720)
    const POS = {
        office: { x: 250, y: 360 },
        nova: { x: 640, y: 360 },
        warehouse: { x: 1030, y: 360 }
    };

    // --- TIMING ---
    // 0-30: Intro
    // 30-90: Office -> Nova (Document)
    // 90-150: Nova -> Warehouse (Alert)
    // 150-210: Warehouse -> Nova (Discrepancy)
    // 210-270: Nova -> Office (Claim Draft)
    // 270-330: User -> Sent (Resolution)

    // Intro Entrance
    const officeEnter = 0;
    const novaEnter = 10;
    const warehouseEnter = 20;

    // Phases
    const phase1Start = 45;
    const phase2Start = 105;
    const phase3Start = 165;
    const phase4Start = 225;
    const phase5Start = 285;

    // Progress Calculations
    const progress1 = interpolate(frame, [phase1Start, phase1Start + 45], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1) });
    const progress2 = interpolate(frame, [phase2Start, phase2Start + 45], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1) });
    const progress3 = interpolate(frame, [phase3Start, phase3Start + 45], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1) });
    const progress4 = interpolate(frame, [phase4Start, phase4Start + 45], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1) });
    const progress5 = interpolate(frame, [phase5Start, phase5Start + 45], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1) });

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.background,
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif'
        }}>
            {/* BACKGROUND GRID */}
            <AbsoluteFill style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.05) 0%, rgba(15, 23, 42, 0) 60%)`
            }} />
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.15,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* CONNECTIONS */}
            <ConnectionLine startX={POS.office.x} startY={POS.office.y} endX={POS.nova.x} endY={POS.nova.y} progress={1} color={COLORS.office} />
            <ConnectionLine startX={POS.nova.x} startY={POS.nova.y} endX={POS.warehouse.x} endY={POS.warehouse.y} progress={1} color={COLORS.warehouse} />

            {/* NODES */}
            <GlowingNode
                x={POS.office.x} y={POS.office.y}
                icon="📄" label="Office"
                color={COLORS.office} glowColor={COLORS.officeGlow}
                frame={frame} fps={fps} delay={officeEnter}
            />

            <GlowingNode
                x={POS.nova.x} y={POS.nova.y}
                icon="🧠" label="Nova Core"
                color={COLORS.nova} glowColor={COLORS.novaGlow}
                frame={frame} fps={fps} delay={novaEnter}
                scale={1.2}
            />

            <GlowingNode
                x={POS.warehouse.x} y={POS.warehouse.y}
                icon="🎤" label="Warehouse"
                color={COLORS.warehouse} glowColor={COLORS.warehouseGlow}
                frame={frame} fps={fps} delay={warehouseEnter}
            />

            {/* DATA PACKETS */}
            {/* 1. Document to Nova */}
            <DataPacket
                startX={POS.office.x} startY={POS.office.y} endX={POS.nova.x} endY={POS.nova.y}
                progress={progress1} color={COLORS.office}
            />

            {/* 2. Alert to Warehouse */}
            <DataPacket
                startX={POS.nova.x} startY={POS.nova.y} endX={POS.warehouse.x} endY={POS.warehouse.y}
                progress={progress2} color={COLORS.nova}
            />

            {/* 3. Discrepancy to Nova (Red) */}
            <DataPacket
                startX={POS.warehouse.x} startY={POS.warehouse.y} endX={POS.nova.x} endY={POS.nova.y}
                progress={progress3} color={COLORS.alert}
            />

            {/* 4. Claim Draft to Office (Red) */}
            <DataPacket
                startX={POS.nova.x} startY={POS.nova.y} endX={POS.office.x} endY={POS.office.y}
                progress={progress4} color={COLORS.alert}
            />

            {/* 5. Resolution: Sent Back (Emerald) */}
            <DataPacket
                startX={POS.office.x} startY={POS.office.y} endX={POS.nova.x} endY={POS.nova.y}
                progress={progress5} color={COLORS.warehouse}
            />

            {/* TEXT OVERLAY */}
            <div style={{
                position: 'absolute', bottom: 60, width: '100%', textAlign: 'center',
                color: 'white', fontSize: 24, fontWeight: 'bold', letterSpacing: '1px',
                textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}>
                {progress1 > 0 && progress1 < 1 && "Start: Invoice Processing"}
                {progress2 > 0 && progress2 < 1 && "Nova Logic: Proactive Context Update"}
                {progress3 > 0 && progress3 < 1 && "Voice Action: Discrepancy Reported"}
                {progress4 > 0 && progress4 < 1 && "AI Agent: Claim Email Drafted"}
                {progress5 > 0 && progress5 < 1 && "Human-In-Loop: Claim Verified & Sent"}
            </div>

        </AbsoluteFill>
    );
};
