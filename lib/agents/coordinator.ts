import { nanoid } from "nanoid";
import {
    type AgentTask,
    type PipelineState,
    AGENT_IDS,
} from "./types";
import { type FileFormat } from "../nova/types";
import {
    AnalyzerAgent,
    ExtractorAgent,
    ComplianceAgent,
    SearchAgent,
    type ExtractionData,
} from "./specialists";

import { InMemoryStateManager, PipelineStateManager, DynamoDBStateManager } from "./state-manager";

export class AgentCoordinator {
    private analyzer = new AnalyzerAgent();
    private extractor = new ExtractorAgent();
    private compliance = new ComplianceAgent();
    private search = new SearchAgent();

    // Configurable State Manager (Dependency Injection ready)
    private stateManager: PipelineStateManager;

    constructor(stateManager?: PipelineStateManager) {
        if (stateManager) {
            this.stateManager = stateManager;
        } else if (process.env.NOVA_GLOBAL_STATE_TABLE) {
            console.log("[Coordinator] Initializing with DynamoDBStateManager (Global State)");
            this.stateManager = new DynamoDBStateManager(process.env.NOVA_GLOBAL_STATE_TABLE);
        } else {
            console.log("[Coordinator] Initializing with InMemoryStateManager (Local)");
            this.stateManager = new InMemoryStateManager();
        }
    }

    /**
     * Orchestrates a multi-agent analysis pipeline using a Collaborative Chain Architecture.
     * 
     * FLOW:
     * 1. Perception (Extractor): Converts unstructured doc -> Structured JSON.
     * 2. Reasoning (Analyzer + Compliance): Ingests the JSON context for high-precision audit.
     * 3. Discovery (Search): Uses extracted entities for semantic retrieval.
     */
    async runPipeline(context: {
        base64: string;
        format: FileFormat;
        filename: string;
    }): Promise<PipelineState> {
        const startTime = new Date().toISOString();

        // Initialize tasks (Optimistic UI state)
        const tasks: AgentTask[] = [
            {
                id: nanoid(),
                agentId: AGENT_IDS.EXTRACTOR,
                name: "Phase 1: Perception (Extractor)",
                description: "Extracting structured entities, line items, and parties from the visual document...",
                status: "running", // Starts immediately
                startedAt: new Date().toISOString(),
            },
            {
                id: nanoid(),
                agentId: AGENT_IDS.ANALYZER,
                name: "Phase 2: Reasoning (Analyst)",
                description: "Generating executive summary based on extracted evidence...",
                status: "idle", // Waits for Phase 1
            },
            {
                id: nanoid(),
                agentId: AGENT_IDS.COMPLIANCE,
                name: "Phase 2: Audit (Compliance)",
                description: "Cross-referencing extracted vendors against sanctions lists...",
                status: "idle", // Waits for Phase 1
            },
            {
                id: nanoid(),
                agentId: AGENT_IDS.SEARCH,
                name: "Phase 3: Discovery (RAG)",
                description: "Searching vector database for related shipments...",
                status: "idle", // Waits for Phase 1
            },
        ];

        const pipeline: PipelineState = {
            tasks,
            overallStatus: "running",
            startTime,
        };

        // Helper to update a task in the pipeline and persist state
        const updateTask = async (index: number, updates: Partial<AgentTask>) => {
            pipeline.tasks[index] = { ...pipeline.tasks[index], ...updates };
            await this.stateManager.saveState(pipeline);
        };

        try {
            // === PHASE 1: PERCEPTION ===
            const extractorTaskIndex = 0;
            console.log(`[Pipeline] Starting Perception Phase...`);

            const extractorResult = await this.extractor.run(context);

            await updateTask(extractorTaskIndex, {
                completedAt: new Date().toISOString(),
                status: extractorResult.success ? "completed" : "failed",
                result: extractorResult.success ? JSON.stringify(extractorResult.data) : undefined,
                error: extractorResult.success ? undefined : extractorResult.error
            });

            // Capture the extracted data for Context Injection
            // If extraction failed, we pass null, and downstream agents fall back to raw analysis
            const extractedContext = extractorResult.success ? (extractorResult.data as ExtractionData) : undefined;


            // === PHASE 2: REASONING (Parallel) ===
            console.log(`[Pipeline] Starting Reasoning Phase (Context Injected: ${!!extractedContext})...`);

            const analyzerTaskIndex = 1;
            const complianceTaskIndex = 2;


            // Set them to running
            await updateTask(analyzerTaskIndex, { status: "running", startedAt: new Date().toISOString() });
            await updateTask(complianceTaskIndex, { status: "running", startedAt: new Date().toISOString() });

            // Run them with the INJECTED context
            const [analyzerRes, complianceRes] = await Promise.all([
                this.analyzer.run({ ...context, extractionData: extractedContext }),
                this.compliance.run({ ...context, extractionData: extractedContext })
            ]);

            await updateTask(analyzerTaskIndex, {
                completedAt: new Date().toISOString(),
                status: analyzerRes.success ? "completed" : "failed",
                result: analyzerRes.success ? analyzerRes.data as string : undefined,
                error: analyzerRes.success ? undefined : analyzerRes.error
            });

            await updateTask(complianceTaskIndex, {
                completedAt: new Date().toISOString(),
                status: complianceRes.success ? "completed" : "failed",
                result: complianceRes.success ? complianceRes.data as string : undefined,
                error: complianceRes.success ? undefined : complianceRes.error
            });


            // === PHASE 3: DISCOVERY ===
            console.log(`[Pipeline] Starting Discovery Phase...`);
            const searchTaskIndex = 3;
            await updateTask(searchTaskIndex, { status: "running", startedAt: new Date().toISOString() });

            // Run search with the INJECTED context (e.g. use extracted Vendor Name for precise RAG)
            const searchRes = await this.search.run({ ...context, extractionData: extractedContext });

            await updateTask(searchTaskIndex, {
                completedAt: new Date().toISOString(),
                status: searchRes.success ? "completed" : "failed",
                result: searchRes.success ? JSON.stringify(searchRes.data) : undefined,
                error: searchRes.success ? undefined : searchRes.error
            });


            // === COMPLETION ===
            pipeline.overallStatus = pipeline.tasks.every(t => t.status === "completed")
                ? "completed"
                : "failed";
            pipeline.endTime = new Date().toISOString();

            return pipeline;

        } catch (error: unknown) {
            console.error("Pipeline Orchestration Error:", error);
            pipeline.overallStatus = "failed";
            pipeline.endTime = new Date().toISOString();
            // Fail any running tasks
            pipeline.tasks.forEach(task => {
                if (task.status === "running") {
                    task.status = "failed";
                    task.error = "Pipeline crashed";
                }
            });
            return pipeline;
        }
    }
}

export const agentCoordinator = new AgentCoordinator();
