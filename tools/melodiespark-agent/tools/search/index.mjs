import fs from "fs";
import path from "path";

const ROOT = "C:\\melodie";

export const search = {
    find: (args) => {
        try {
            // Ensure folder is relative to ROOT and doesn't try to escape
            const requestedFolder = args.folder || "apps/command-center";
            const fullFolderPath = path.resolve(ROOT, requestedFolder);

            if (!fullFolderPath.startsWith(ROOT)) {
                return "Error: Search folder must be within the workspace root.";
            }

            const results = [];
            const walk = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        walk(fullPath);
                    } else if (fullPath.endsWith(".mjs") || fullPath.endsWith(".js") || fullPath.endsWith(".json") || fullPath.endsWith(".txt")) {
                        const content = fs.readFileSync(fullPath, "utf8");
                        if (content.includes(args.query)) {
                            results.push(fullPath);
                        }
                    }
                }
            };

            walk(fullFolderPath);
            return results.length > 0 
                ? `Found matches in: \n${results.join("\n")}` 
                : "No matches found.";
        } catch (e) {
            return `Search error: ${e.message}`;
        }
    }
};
