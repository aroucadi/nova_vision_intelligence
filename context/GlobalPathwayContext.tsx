"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export interface ActivityLog {
    id: string;
    time: string;
    agent: "Nova Act" | "Nova Pro" | "Nova Vision" | "Nova Sonic";
    action: string;
    status: "Success" | "Processing" | "Failed";
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

interface GlobalPathwayContextType {
    metrics: Metrics;
    activityLog: ActivityLog[];
    activeEntries: CustomsEntry[];
    claims: Claim[];
    addFiling: (entryId: string, description: string) => void;
    addVoiceOp: () => void;
    addScan: () => void;
    addClaim: (claim: Omit<Claim, "status" | "timestamp">) => void;
    sendClaim: (claimId: string) => Promise<void>;
}

// Initial/Seed Data (So it looks alive initially)
const INITIAL_METRICS: Metrics = {
    processedDocs: 128,
    filings: 43,
    flagged: 12,
    voiceOps: 85,
};

const INITIAL_LOGS: ActivityLog[] = [
    { id: "1", time: "2m ago", agent: "Nova Pro", action: "Classified 'Cotton Knit Shirt' as HS 6109.10", status: "Success" },
    { id: "2", time: "5m ago", agent: "Nova Vision", action: "Extracted 12 line items from Invoice #INV-2024-001", status: "Success" },
    { id: "3", time: "12m ago", agent: "Nova Sonic", action: "Answered warehouse query regarding PO #455", status: "Success" },
];

const GlobalPathwayContext = createContext<GlobalPathwayContextType | undefined>(undefined);

export function GlobalPathwayProvider({ children }: { children: ReactNode }) {
    const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>(INITIAL_LOGS);
    const [activeEntries, setActiveEntries] = useState<CustomsEntry[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);

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
            status: "Success"
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
        // Simulated network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: "SENT" } : c));

        // Update log
        const log: ActivityLog = {
            id: `send-${Date.now()}`,
            time: "Just now",
            agent: "Nova Act",
            action: `Sent Official Claim to vendor`,
            status: "Success"
        };
        setActivityLog(prev => [log, ...prev].slice(0, 15));
    };

    // 4. "100% Real" Registry Sync
    React.useEffect(() => {
        const syncRegistry = async () => {
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

                    // Update metrics based on real data
                    setMetrics(prev => ({
                        ...prev,
                        filings: prev.filings + realEntries.length
                    }));

                    // Prepend to activity log if recent
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const recentLogs = data.entries.slice(0, 5).map((e: any) => ({
                        id: `reg-${e.entryNumber}`,
                        time: "Recently",
                        agent: "Nova Act",
                        action: `Filed Entry #${e.entryNumber} (${e.status})`,
                        status: "Success"
                    }));

                    if (recentLogs.length > 0) {
                        // Merge with initial logs but avoid duplicates if possible (simple prepend here)
                        setActivityLog(prev => {
                            // simplistic dedup by ID check or just prepend
                            return [...recentLogs, ...prev].slice(0, 15);
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to sync registry:", err);
            }
        };

        syncRegistry();
        // Poll every 5 seconds to keep dashboard alive with "Real" state
        const interval = setInterval(syncRegistry, 5000);
        return () => clearInterval(interval);
    }, []);

    const value = React.useMemo(() => ({
        metrics,
        activityLog,
        activeEntries,
        claims,
        addFiling,
        addVoiceOp,
        addScan,
        addClaim,
        sendClaim
    }), [metrics, activityLog, activeEntries, claims]);

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
