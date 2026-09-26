import test from "node:test"; import assert from "node:assert/strict"; import path from "node:path"; import {safePath} from "../src/security.mjs";
test("traversal",()=>assert.throws(()=>safePath(process.cwd(),"../x")));
test("absolute",()=>assert.throws(()=>safePath(process.cwd(),"/etc/x")));
test("null",()=>assert.throws(()=>safePath(process.cwd(),"a\0b")));
test("safe",()=>assert.equal(safePath(process.cwd(),"src/x").endsWith(path.normalize("src/x")),true));