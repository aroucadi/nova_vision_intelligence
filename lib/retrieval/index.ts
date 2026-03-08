import { kbService, type RetrievalResult } from "@/lib/services/kb-service";
import { SimpleVectorStore } from "@/lib/vector-store";

export interface RetrievalHit {
  id: string;
  score: number;
  source: "kb" | "local";
  metadata: {
    filename: string;
    content: string;
    url?: string;
  };
}

export interface Retriever {
  search(query: string, limit?: number): Promise<RetrievalHit[]>;
}

class BedrockKnowledgeBaseRetriever implements Retriever {
  async search(query: string, limit: number = 2): Promise<RetrievalHit[]> {
    const results = await kbService.retrieve(query, limit);
    return results.map((r: RetrievalResult, i: number) => ({
      id: i.toString(),
      score: r.score,
      source: "kb",
      metadata: {
        filename: r.metadata.filename || "unknown_doc",
        content: r.content,
        url: r.metadata.s3Uri,
      },
    }));
  }
}

class SimpleVectorStoreRetriever implements Retriever {
  constructor(private readonly store: SimpleVectorStore) {}

  async search(query: string, limit: number = 3): Promise<RetrievalHit[]> {
    const results = await this.store.search(query, limit);
    return results.map((r) => ({
      id: r.id,
      score: r.score,
      source: "local",
      metadata: {
        filename: r.metadata?.filename || r.id,
        content: r.text,
        url: r.metadata?.url,
      },
    }));
  }
}

export function getRetriever(): Retriever {
  const local = new SimpleVectorStoreRetriever(SimpleVectorStore.getInstance());
  if (!process.env.KNOWLEDGE_BASE_ID) return local;

  const kb = new BedrockKnowledgeBaseRetriever();
  return {
    async search(query: string, limit: number = 3): Promise<RetrievalHit[]> {
      const [kbHits, localHits] = await Promise.all([
        kb.search(query, Math.min(limit, 2)),
        local.search(query, limit),
      ]);

      const dedup = new Map<string, RetrievalHit>();
      for (const hit of [...kbHits, ...localHits]) {
        const key = `${hit.metadata.url || ""}::${hit.metadata.filename}`;
        if (!dedup.has(key)) dedup.set(key, hit);
      }

      const merged = Array.from(dedup.values());
      return merged.slice(0, limit);
    },
  };
}
