import { OpenRouterAdapter } from "../providers/openrouter/adapter.mjs";
import { filesystem } from "../tools/filesystem/index.mjs";
import { shell } from "../tools/shell/index.mjs";
import { patch } from "../tools/patch/index.mjs";
import { PathSecurity } from "../core/PathSecurity.mjs";
import { AuditLogger } from "../core/AuditLogger.mjs";
import { PermissionManager, Levels } from "../core/PermissionManager.mjs";
import { JSONExtractor } from "../core/JSONExtractor.mjs";
import { StateLogger } from "../core/StateLogger.mjs";
import path from "path";

const ROOT = "C:\\melodie\\tools\\melodiespark-agent";
const WORKSPACE = "C:\\melodie";

export class AgentRuntime {
    constructor() {
        this.adapter = new OpenRouterAdapter();
        this.model = "openai/gpt-3.5-turbo";
        const pathSecurity = new PathSecurity(WORKSPACE);
        const auditLogger = new AuditLogger(ROOT);
        this.permissions = new PermissionManager(pathSecurity, auditLogger);
        this.stateLogger = new StateLogger(ROOT);

        this.tools = {
            "read_file": (args) => filesystem.read(args.path || args.file_path),
            "write_file": (args) => filesystem.write(args.path || args.file_path, args.content),
            "patch_file": (args) => patch.apply(args),
            "list_dir": (args) => filesystem.list(args.path || args.dir_path),
            "run_command": (args) => shell.execute(args.command || args.cmd, args.cwd)
        };
    }

    async executeTask(task, onConfirm = async () => false) {
        console.log(`\x1b[33m[Runtime]\x1b[0m Task: ${task}`);
        console.log(`\x1b[36m[Session]\x1b[0m Log: ${this.stateLogger.sessionFile}`);

        let messages = [
            { 
                role: "system", 
                content: "You are the Melodiespark Senior Engineer. \n\nTOOL CALL FORMAT (STRICT):\nAlways respond with ONLY a JSON object on its own line:\n{ \"tool\": \"tool_name\", \"args\": { \"key\": \"value\" } }\n\nNo chatter before or after. If you have analysis to share, put it AFTER the JSON block, clearly separated.\n\nTOOL SET:\n- read_file(path)\n- write_file(path, content)\n- patch_file(path, search, replace)\n- list_dir(path)\n- run_command(command, cwd)\n\nRULES:\n1. One tool call per message.\n2. Prefer patch_file for edits; use write_file only to recover from corruption.\n3. No FINAL ANSWER until tests pass and you have verified the output." 
            },
            { role: "user", content: task }
        ];

        let iterations = 0;
        const maxIterations = 15;

        while (iterations < maxIterations) {
            iterations++;
            console.log(`\x1b[33m[Iteration ${iterations}/${maxIterations}]\x1b[0m`);

            const response = await this.adapter.request(this.model, messages);
            const content = response.content;

            // Attempt to extract JSON
            const extraction = JSONExtractor.extract(content);

            if (!extraction.valid) {
                console.log(`\x1b[31m[JSON Extraction Failed]\x1b[0m ${extraction.error}`);
                this.stateLogger.log({
                    iteration: iterations,
                    type: "error",
                    reason: "json_extraction",
                    message: extraction.error
                });

                // Check for loop before giving up
                if (this.stateLogger.isInLoop()) {
                    console.log(`\x1b[31m[Loop Detected]\x1b[0m Agent is repeating the same action. Stopping.`);
                    const summary = this.stateLogger.getSummary();
                    console.log(`\x1b[36m[Session Summary]\x1b[0m`, summary);
                    return `LOOP_DETECTED: Agent could not proceed. Summary: ${JSON.stringify(summary)}`;
                }

                messages.push({ 
                    role: "user", 
                    content: `JSON extraction failed: ${extraction.error}\n\nRespond with ONLY a valid JSON tool call, no other text.` 
                });
                continue;
            }

            // Validate tool call structure
            const validation = JSONExtractor.validateToolCall(extraction.json);
            if (!validation.valid) {
                console.log(`\x1b[31m[Invalid Tool Call]\x1b[0m ${validation.error}`);
                this.stateLogger.log({
                    iteration: iterations,
                    type: "error",
                    reason: "invalid_tool_call",
                    message: validation.error
                });

                messages.push({ 
                    role: "user", 
                    content: `Invalid tool call structure: ${validation.error}` 
                });
                continue;
            }

            const { tool: toolName, args } = extraction.json;
            console.log(`\x1b[36m[Tool Call]\x1b[0m ${toolName}`);

            // Check permissions
            const { decision, reason } = await this.permissions.authorize(toolName, args);

            if (decision === "DENY") {
                console.log(`\x1b[31m[Permission Denied]\x1b[0m ${reason}`);
                this.stateLogger.log({
                    iteration: iterations,
                    type: "denied",
                    tool: toolName,
                    reason: reason
                });
                messages.push({ role: "user", content: `DENIED: ${reason}` });
                continue;
            }

            if (decision === "CONFIRM") {
                const allowed = await onConfirm({ tool: toolName, args, reason });
                if (!allowed) {
                    this.stateLogger.log({
                        iteration: iterations,
                        type: "denied",
                        tool: toolName,
                        reason: "user_rejected"
                    });
                    messages.push({ role: "user", content: "Action denied by user." });
                    continue;
                }
            }

            // Execute tool
            if (this.tools[toolName]) {
                const result = this.tools[toolName](args);
                const isError = result.includes("Error") || result.includes("error");
                
                console.log(`\x1b[34m[Tool Result]\x1b[0m ${result.substring(0, 100)}...`);
                this.stateLogger.log({
                    iteration: iterations,
                    type: isError ? "error" : "success",
                    tool: toolName,
                    resultPreview: result.substring(0, 200)
                });

                messages.push({ role: "assistant", content: extraction.raw });
                messages.push({ role: "user", content: `Tool result:\n${result}` });
                continue;
            }

            console.log(`\x1b[31m[Unknown Tool]\x1b[0m ${toolName}`);
            this.stateLogger.log({
                iteration: iterations,
                type: "error",
                reason: "unknown_tool",
                tool: toolName
            });
            messages.push({ role: "user", content: `Unknown tool: ${toolName}` });
        }

        // Max iterations reached
        const summary = this.stateLogger.getSummary();
        console.log(`\x1b[31m[Max Iterations Reached]\x1b[0m`);
        console.log(`\x1b[36m[Session Summary]\x1b[0m`, summary);
        return `MAX_ITERATIONS: Agent did not complete the task within ${maxIterations} iterations.`;
    }
}
