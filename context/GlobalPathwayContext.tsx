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
    addFiling: (entryId: string, description: string) => void;
    addVoiceOp: () => void;
    addScan: () => void;
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

    const value = React.useMemo(() => ({
        metrics,
        activityLog,
        activeEntries,
        addFiling,
        addVoiceOp,
        addScan
    }), [metrics, activityLog, activeEntries]);

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
