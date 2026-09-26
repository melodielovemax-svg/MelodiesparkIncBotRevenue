export const Levels = {
    ALLOW: "ALLOW",
    CONFIRM: "CONFIRM",
    DENY: "DENY"
};

export class PermissionManager {
    constructor(pathSecurity, auditLogger) {
        this.pathSecurity = pathSecurity;
        this.auditLogger = auditLogger;
        
        this.toolPolicies = {
            "read_file": Levels.ALLOW,
            "list_dir": Levels.ALLOW,
            "write_file": Levels.CONFIRM,
            "run_command": Levels.CONFIRM
        };
    }

    classifyCommand(command) {
        const cmd = command.toLowerCase().trim();
        if (cmd.includes("rm -rf") || cmd.includes("format") || cmd.includes("diskpart")) return Levels.DENY;
        if (cmd.startsWith("git push") || cmd.startsWith("git commit")) return Levels.CONFIRM;
        if (cmd.startsWith("git status") || cmd.startsWith("npm test") || cmd.startsWith("ls")) return Levels.ALLOW;
        return Levels.CONFIRM; // Default to confirm for unknown
    }

    async authorize(toolName, args) {
        let decision = this.toolPolicies[toolName] || Levels.CONFIRM;
        let reason = "Policy default";

        // Path Security Check for FS tools
        if (args.path || args.file_path) {
            const pathVal = args.path || args.file_path;
            const security = this.pathSecurity.isSafe(pathVal);
            if (!security.safe) {
                decision = Levels.DENY;
                reason = security.reason;
            }
        }

        // Shell Command Check
        if (toolName === "run_command") {
            const cmdDecision = this.classifyCommand(args.command || "");
            if (cmdDecision === Levels.DENY) decision = Levels.DENY;
            else if (cmdDecision === Levels.CONFIRM && decision === Levels.ALLOW) decision = Levels.CONFIRM;
        }

        this.auditLogger.log({ tool: toolName, args, decision, reason });
        return { decision, reason };
    }
}
