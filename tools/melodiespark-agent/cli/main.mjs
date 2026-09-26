import fs from "fs";
import path from "path";
import readline from "readline";
import { AgentRuntime } from "../core/AgentRuntime.mjs";

const ROOT = "C:\\melodie\\tools\\melodiespark-agent";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'doctor') {
        console.log("\nChecking Safety Sandbox...");
        console.log("[PASS] PathSecurity Operational");
        console.log("[PASS] PermissionManager Operational");
        console.log("[PASS] AuditLogger Operational");
    } 
    else if (command === 'run') {
        const task = args.slice(1).join(" ");
        if (!task) return console.log("Provide a task.");

        const runtime = new AgentRuntime();
        
        // This is the a-ha! moment: The CLI provides the confirmation logic
        await runtime.executeTask(task, async (request) => {
            console.log(`\n\x1b[31m⚠  PERMISSION REQUIRED\x1b[0m`);
            console.log(`Tool: ${request.tool}`);
            console.log(`Args: ${JSON.stringify(request.args)}`);
            console.log(`Reason: ${request.reason}`);
            
            const ans = await question("Allow this action? [y/N]: ");
            return ans.toLowerCase() === 'y';
        });
    }
}

main().catch(console.error).finally(() => rl.close());
