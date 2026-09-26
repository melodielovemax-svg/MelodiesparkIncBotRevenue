import { execSync } from "child_process";
import path from "path";

const ROOT = "C:\\melodie";

export const shell = {
    execute: (command, cwd = "apps/command-center") => {
        try {
            console.log(`\x1b[34m[Tool:Shell]\x1b[0m Executing: ${command} in ${cwd}...`);
            const output = execSync(command, { 
                cwd: path.resolve(ROOT, cwd), 
                encoding: "utf8", 
                timeout: 60000 
            });
            return output;
        } catch (e) {
            return `Execution Error: ${e.stdout || e.message}`;
        }
    }
};
