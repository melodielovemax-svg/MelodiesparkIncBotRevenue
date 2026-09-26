import fs from "node:fs"; import path from "node:path";
function reject(v){if(v.includes("\0"))throw Error("Null byte rejected");if(path.isAbsolute(v))throw Error("Absolute path rejected");if(v.split(/[\\/]/).includes(".."))throw Error("Path traversal rejected")}
export function safePath(root,v){reject(v);const r=path.resolve(root,v);if(r!==root&&!r.startsWith(root+path.sep))throw Error("Path escape rejected");return r}
function log(file,event,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.appendFileSync(file,JSON.stringify({ts:new Date().toISOString(),event,data})+"\n")}
export const audit=(e,d={})=>log(path.join(process.cwd(),"audit/audit.jsonl"),e,d);
export const evidence=(e,d={})=>log(path.join(process.cwd(),"evidence/evidence.jsonl"),e,d);