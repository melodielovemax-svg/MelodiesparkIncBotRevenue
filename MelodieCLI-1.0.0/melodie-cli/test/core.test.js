import test from "node:test";
import assert from "node:assert/strict";
import { randomId } from "../src/core.js";

test("randomId returns UUID-like value", () => {
  assert.match(randomId(), /^[0-9a-f-]{36}$/);
});
