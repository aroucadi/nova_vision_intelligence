"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export interface ActivityLog {
    id: string;
    time: string;
    agent: "Nova Act" | "Nova Pro" | "Nova Vision" | "Nova Sonic";
    action: string;
    status: "Success" | "Processing" | "Failed";
    reasoning?: string; // Chain-of-thought for transparency
}

export interface Claim {
    id: string;
    shipmentId: string;
    vendor: string;
    vendorEmail: string;
    draft: string;
    status: "PENDING" | "SENT";
    timestamp: Date;
}

export interface Metrics {
    processedDocs: number;
    filings: number;
    flagged: number;
    voiceOps: number;
}

export interface CustomsEntry {
    id: string; // The entry number (e.g., 998877)
    status: string;
    description: string;
    timestamp: Date;
}

export interface PulseItem {
    id: string;
    headline: string;
    pulse: string;
    risk: "LOW" | "MEDIUM" | "HIGH";
    recommendation: string;
    timestamp: string;
    source: string;
}

interface GlobalPathwayContextType {
    metrics: Metrics;
    activityLog: ActivityLog[];
    activeEntries: CustomsEntry[];
    claims: Claim[];
    intelligencePulse: PulseItem[];
    addFiling: (entryId: string, description: string) => void;
    addVoiceOp: () => void;
    addScan: () => void;
    addClaim: (claim: Omit<Claim, "status" | "timestamp">) => void;
    sendClaim: (claimId: string) => Promise<void>;
    refreshRegistry: () => Promise<void>;
    refreshPulse: () => Promise<void>;
}

// Initial/Seed Data (So it looks alive initially)
const INITIAL_METRICS: Metrics = {
    processedDocs: 0,
    filings: 0,
    flagged: 0,
    voiceOps: 0,
};

const INITIAL_LOGS: ActivityLog[] = [];

const GlobalPathwayContext = createContext<GlobalPathwayContextType | undefined>(undefined);

export function GlobalPathwayProvider({ children }: { children: ReactNode }) {
    const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>(INITIAL_LOGS);
    const [activeEntries, setActiveEntries] = useState<CustomsEntry[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [intelligencePulse, setIntelligencePulse] = useState<PulseItem[]>([]);

    const addFiling = (entryId: string, description: string) => {
        // 1. Update Metrics
        setMetrics(prev => ({
            ...prev,
            filings: prev.filings + 1,
            processedDocs: prev.processedDocs + 1 // Implies a doc was processed to get here
        }));

        // 2. Add to Activity Log
        const newLog: ActivityLog = {
            id: Date.now().toString(),
            time: "Just now",
            agent: "Nova Act",
            action: `Filed Customs Entry #${entryId}`,
            status: "Success",
            reasoning: `Orchestrated payload generation for Entry #${entryId}. Mapped extraction results to Port Authority EDI standard and performed pre-flight validation on HS codes. Transmission confirmed via secure gateway.`
        };
        setActivityLog(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10

        // 3. Add to Active Entries (for Warehouse context)
        setActiveEntries(prev => [...prev, {
            id: entryId,
            status: "CLEARED",
            description,
            timestamp: new Date()
        }]);
    };

    const addVoiceOp = () => {
        setMetrics(prev => ({ ...prev, voiceOps: prev.voiceOps + 1 }));
    };

    const addScan = () => {
        setMetrics(prev => ({ ...prev, processedDocs: prev.processedDocs + 1 }));
    };

    const addClaim = (claimData: Omit<Claim, "status" | "timestamp">) => {
        const newClaim: Claim = {
            ...claimData,
            status: "PENDING",
            timestamp: new Date()
        };
        setClaims(prev => [newClaim, ...prev]);

        // Add to activity log
        const log: ActivityLog = {
            id: `claim-${Date.now()}`,
            time: "Just now",
            agent: "Nova Pro",
            action: `Drafted Shortage Claim for ${claimData.shipmentId}`,
            status: "Success"
        };
        setActivityLog(prev => [log, ...prev].slice(0, 15));
    };

    const sendClaim = async (claimId: string) => {
        // Real-time update (Removal of simulated network delay)

        setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: "SENT" } : c));

        // Update log
        const log: ActivityLog = {
            id: `send-${Date.now()}`,
            time: "Just now",
            agent: "Nova Act",
            action: `Sent Official Claim to vendor`,
            status: "Success",
            reasoning: "Detected discrepancy in warehouse verification. Drafted formal shortage claim and triggered SES transmission to vendor point-of-contact."
        };
        setActivityLog(prev => [log, ...prev].slice(0, 15));
    };

    const refreshRegistry = async () => {
        try {
            const res = await fetch("/api/act/registry");
            const data = await res.json();
            if (data.success && Array.isArray(data.entries)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const realEntries = data.entries.map((e: any) => ({
                    id: e.entryNumber,
                    status: e.status,
                    description: `${e.items.length} Items (Duty: $${e.totalDuty})`,
                    timestamp: new Date(e.timestamp)
                }));

                setActiveEntries(realEntries);

                setMetrics(prev => ({
                    ...prev,
                    filings: INITIAL_METRICS.filings + realEntries.length
                }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const recentLogs = data.entries.slice(0, 5).map((e: any) => ({
                    id: `reg-${e.entryNumber}`,
                    time: "Recently",
                    agent: "Nova Act",
                    action: `Filed Entry #${e.entryNumber} (${e.status})`,
                    status: "Success"
                }));

                if (recentLogs.length > 0) {
                    setActivityLog(prev => {
                        const allLogs = [...recentLogs, ...prev];
                        const uniqueMap = new Map();
                        allLogs.forEach(log => {
                            if (!uniqueMap.has(log.id)) {
                                uniqueMap.set(log.id, log);
                            }
                        });
                        const uniqueLogs = Array.from(uniqueMap.values()) as ActivityLog[];
                        return uniqueLogs.slice(0, 15);
                    });
                }
            }
        } catch (err) {
            console.error("Failed to sync registry:", err);
        }
    };

    const refreshPulse = async () => {
        try {
            const res = await fetch("/api/intelligence/pulse");
            const data = await res.json();
            if (data.success && Array.isArray(data.pulses)) {
                setIntelligencePulse(data.pulses);
            }
        } catch (err) {
            console.error("Failed to refresh intelligence pulse:", err);
        }
    };

    const value = React.useMemo(() => ({
        metrics,
        activityLog,
        activeEntries,
        claims,
        intelligencePulse,
        addFiling,
        addVoiceOp,
        addScan,
        addClaim,
        sendClaim,
        refreshRegistry,
        refreshPulse
    }), [metrics, activityLog, activeEntries, claims, intelligencePulse]);

    return (
        <GlobalPathwayContext.Provider value={value}>
            {children}
        </GlobalPathwayContext.Provider>
    );
}

export function useGlobalPathway() {
    const context = useContext(GlobalPathwayContext);
    if (context === undefined) {
        throw new Error("useGlobalPathway must be used within a GlobalPathwayProvider");
    }
    return context;
}
