import fs from "fs";
import path from "path";

export class AuditLogger {
    constructor(root) {
        this.logPath = path.join(root, "audit/session.log");
    }

    log(entry) {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${JSON.stringify(entry)}\n`;
        fs.appendFileSync(this.logPath, logLine, "utf8");
    }
}
