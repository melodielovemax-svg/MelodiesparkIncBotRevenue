import fs from "fs";
import path from "path";

const ROOT = "C:\\melodie";

export const patch = {
    apply: (args) => {
        try {
            const p = args.path || args.file_path || args.filePath || args.file;
            if (!p) return "Error: No path provided.";
            
            const fullPath = path.resolve(ROOT, p);
            let content = fs.readFileSync(fullPath, "utf8");

            // Support both {search, replace} and {patch: {search, replace}}
            const search = args.search || (args.patch && args.patch.search);
            const replace = args.replace || (args.patch && args.patch.replace);

            if (!search || !replace) {
                return `Error: Both 'search' and 'replace' strings are required. Received search: ${search}, replace: ${replace}`;
            }

            if (!content.includes(search)) {
                return `Error: Search block not found in file. Exact match required.\nSearching for: "${search}"`;
            }

            const newContent = content.replace(search, replace);
            fs.writeFileSync(fullPath, newContent, "utf8");
            return "Patch applied successfully.";
        } catch (e) {
            return `Error applying patch: ${e.message}`;
        }
    }
};
