import Parser from "rss-parser";
import { novaClient } from "../nova/client";
import { PROMPTS } from "../nova/prompts";

export interface PulseItem {
    id: string;
    headline: string;
    pulse: string;
    risk: "LOW" | "MEDIUM" | "HIGH";
    recommendation: string;
    timestamp: string;
    source: string;
}

export class PulseAgent {
    private parser: Parser;
    private readonly FEED_URL = "https://www.maritime-executive.com/articles.rss";

    constructor() {
        this.parser = new Parser({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
            }
        });
    }

    async fetchAndAnalyze(): Promise<PulseItem[]> {
        try {
            console.log(`[PulseAgent] Fetching live maritime data from ${this.FEED_URL}...`);
            const feed = await this.parser.parseURL(this.FEED_URL);

            console.log(`[PulseAgent] RSS Feed fetched. Items found: ${feed.items?.length || 0}`);
            if (!feed.items || feed.items.length === 0) {
                console.warn("[PulseAgent] RSS Feed returned no items.");
                return [];
            }

            // Take the top 5 most recent and relevant items
            const recentItems = feed.items.slice(0, 5).map(item => ({
                title: item.title,
                content: item.contentSnippet || item.content || item.summary,
                isoDate: item.isoDate
            }));

            const newsContent = JSON.stringify(recentItems, null, 2);

            console.log(`[PulseAgent] Analyzing ${recentItems.length} headlines via Nova Pro...`);
            const prompt = PROMPTS.intelligence_pulse.replace("{{newsContent}}", newsContent);

            // We use Nova Pro for deep reasoning and "no-lie" impact analysis
            try {
                const response = await novaClient.converse([
                    { role: "user", content: [{ text: prompt }] }
                ], {
                    model: "pro",
                    temperature: 0.1 // Lower temperature for factual precision
                });

                // Robust JSON extraction
                const text = response.text.trim();
                console.log(`[PulseAgent] Nova response received (${text.length} chars).`);

                const jsonMatch = text.match(/\[[\s\S]*\]/);

                if (jsonMatch) {
                    try {
                        const pulses: PulseItem[] = JSON.parse(jsonMatch[0]);
                        return pulses.map(p => ({
                            ...p,
                            source: "gCaptain Maritime News"
                        }));
                    } catch (e) {
                        console.error("[PulseAgent] Failed to parse Nova response as JSON", e);
                    }
                }

                console.warn("[PulseAgent] No valid JSON array found in Nova response.");
                return [];
            } catch (novaError: any) {
                console.error("[PulseAgent] Nova Agentic loop failed:", novaError.message || novaError);
                throw novaError;
            }

        } catch (error: any) {
            console.error("[PulseAgent] Critical error in pulse generation:", error.message || error);
            return [];
        }
    }
}

export const pulseAgent = new PulseAgent();
