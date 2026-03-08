export type AgentStatus = "idle" | "running" | "completed" | "failed";

export interface AgentTask {
    id: string;
    agentId: string;
    name: string;
    description: string;
    status: AgentStatus;
    result?: string;
    error?: string;
    startedAt?: string;
    completedAt?: string;
}

export interface PipelineState {
    pipelineId: string;
    requestId?: string;
    tasks: AgentTask[];
    overallStatus: AgentStatus;
    startTime?: string;
    endTime?: string;
    events?: Array<{
        ts: string;
        agentId: string;
        type: "task_update" | "pipeline_update";
        message: string;
    }>;
}

export interface AgentResponse {
    success: boolean;
    data?: unknown;
    error?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

export const AGENT_IDS = {
    COORDINATOR: "coordinator",
    ANALYZER: "analyzer",
    EXTRACTOR: "extractor",
    COMPLIANCE: "compliance",
    SEARCH: "search",
} as const;

export type AgentId = (typeof AGENT_IDS)[keyof typeof AGENT_IDS];

export const AGENT_METADATA: Record<AgentId, { name: string; color: string; bgColor: string; borderColor: string }> = {
    [AGENT_IDS.ANALYZER]: {
        name: "Nova 2 Lite",
        color: "text-violet-400",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-500/20"
    },
    [AGENT_IDS.EXTRACTOR]: {
        name: "Nova Pro (Reasoning)",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/20"
    },
    [AGENT_IDS.COMPLIANCE]: {
        name: "Nova Pro (Reasoning)",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20"
    },
    [AGENT_IDS.SEARCH]: {
        name: "Nova Titan (Embeddings)",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20"
    },
    [AGENT_IDS.COORDINATOR]: {
        name: "Agent Orchestrator",
        color: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/20"
    }
};
