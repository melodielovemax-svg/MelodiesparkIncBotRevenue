import fs from "fs";
import path from "path";

/**
 * StateLogger: Tracks agent attempts, decisions, and outcomes.
 * Prevents infinite loops and helps diagnose failures.
 */
export class StateLogger {
    constructor(rootPath) {
        this.logDir = path.join(rootPath, "logs");
        this.sessionId = new Date().toISOString().replace(/[:.]/g, "-");
        this.sessionFile = path.join(this.logDir, `session-${this.sessionId}.jsonl`);

        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Log a single attempt: tool call, result, or decision.
     */
    log(entry) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            ...entry
        };

        try {
            fs.appendFileSync(
                this.sessionFile,
                JSON.stringify(logEntry) + "\n",
                "utf8"
            );
        } catch (e) {
            console.error(`\x1b[31m[StateLogger Error]\x1b[0m ${e.message}`);
        }
    }

    /**
     * Get the last N attempts from this session.
     * Useful for detecting loops or patterns.
     */
    getRecentAttempts(count = 5) {
        try {
            const lines = fs.readFileSync(this.sessionFile, "utf8").split("\n").filter(l => l);
            const parsed = lines.map(l => JSON.parse(l));
            return parsed.slice(-count);
        } catch (e) {
            return [];
        }
    }

    /**
     * Check if the agent is in a loop: same tool called N times with similar results.
     */
    isInLoop(windowSize = 5, threshold = 4) {
        const recent = this.getRecentAttempts(windowSize);
        if (recent.length < threshold) return false;

        const toolNames = recent.map(r => r.tool).filter(t => t);
        const uniqueTools = new Set(toolNames);

        // If the same tool was called threshold times in a row, it's a loop
        if (uniqueTools.size === 1 && toolNames.length >= threshold) {
            return true;
        }

        return false;
    }

    /**
     * Get summary statistics for this session.
     */
    getSummary() {
        const recent = this.getRecentAttempts(999);
        const toolCounts = {};
        let errorCount = 0;
        let successCount = 0;

        for (const entry of recent) {
            if (entry.tool) {
                toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
            }
            if (entry.type === "error") {
                errorCount++;
            } else if (entry.type === "success") {
                successCount++;
            }
        }

        return {
            totalAttempts: recent.length,
            toolCounts,
            errorCount,
            successCount,
            sessionFile: this.sessionFile
        };
    }
}
