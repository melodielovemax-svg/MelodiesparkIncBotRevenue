import path from "path";
import fs from "fs";

export class PathSecurity {
    constructor(workspaceRoot) {
        this.root = path.resolve(workspaceRoot);
        this.protectedPaths = [
            "C:\\Windows",
            "C:\\Program Files",
            "C:\\Program Files (x86)",
            process.env.USERPROFILE + "\\.ssh",
            process.env.USERPROFILE + "\\.aws"
        ];
    }

    canonicalize(inputPath) {
        // Resolve absolute path and remove ".." or "." segments
        const resolved = path.resolve(this.root, inputPath);
        return resolved;
    }

    isSafe(inputPath) {
        const resolved = this.canonicalize(inputPath);
        
        // 1. Workspace Boundary Check
        if (!resolved.startsWith(this.root)) {
            return { safe: false, reason: "Path escapes workspace root" };
        }

        // 2. Protected Paths Check
        for (const protectedPath of this.protectedPaths) {
            if (resolved.toLowerCase().startsWith(protectedPath.toLowerCase())) {
                return { safe: false, reason: "Path is in a protected system directory" };
            }
        }

        return { safe: true, path: resolved };
    }
}
