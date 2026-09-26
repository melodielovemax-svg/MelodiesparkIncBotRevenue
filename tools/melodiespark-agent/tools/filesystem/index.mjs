import fs from "fs";
import path from "path";

const ROOT = "C:\\melodie";

const getPath = (args) => args.path || args.file_path || args.filePath || args.file;

export const filesystem = {
    read: (args) => {
        try {
            const p = getPath(args);
            if (!p) return "Error: No path provided.";
            const fullPath = path.resolve(ROOT, p);
            console.log(`\x1b[34m[Tool:FS]\x1b[0m Reading ${p}...`);
            return fs.readFileSync(fullPath, "utf8");
        } catch (e) {
            return `Error reading file: ${e.message}`;
        }
    },
    write: (args) => {
        try {
            const p = getPath(args);
            if (!p) return "Error: No path provided.";
            const content = args.content || args.text || args.body;
            if (!content) return "Error: No content provided.";
            const fullPath = path.resolve(ROOT, p);
            console.log(`\x1b[34m[Tool:FS]\x1b[0m Writing to ${p}...`);
            fs.writeFileSync(fullPath, content, "utf8");
            return "File written successfully.";
        } catch (e) {
            return `Error writing file: ${e.message}`;
        }
    },
    list: (args) => {
        try {
            const p = args.path || args.dir_path || args.dir || args.folder || ".";
            const fullPath = path.resolve(ROOT, p);
            console.log(`\x1b[34m[Tool:FS]\x1b[0m Listing ${p}...`);
            return fs.readdirSync(fullPath).join("\n");
        } catch (e) {
            return `Error listing directory: ${e.message}`;
        }
    }
};
