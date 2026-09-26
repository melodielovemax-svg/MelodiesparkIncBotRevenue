/**
 * JSONExtractor: Robust extraction of tool calls from LLM responses.
 * Handles: leading chatter, trailing chatter, malformed JSON, multiple objects.
 */

export class JSONExtractor {
    /**
     * Extract the first valid JSON object from a string.
     * Returns { valid: true, json: {...} } or { valid: false, error: "...", raw: "..." }
     */
    static extract(text) {
        if (!text || typeof text !== "string") {
            return { valid: false, error: "Input is not a string", raw: text };
        }

        // Strategy 1: Try to find and parse a complete JSON object
        const jsonMatch = text.match(/\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/);
        
        if (jsonMatch) {
            try {
                const json = JSON.parse(jsonMatch[0]);
                return { valid: true, json, raw: jsonMatch[0] };
            } catch (e) {
                return { valid: false, error: `Invalid JSON: ${e.message}`, raw: jsonMatch[0] };
            }
        }

        // Strategy 2: Look for JSON-like structure even if malformed
        const partialMatch = text.match(/\{[\s\S]*\}/);
        if (partialMatch) {
            return { 
                valid: false, 
                error: "Found JSON-like structure but it's malformed. Check for unescaped quotes or missing commas.", 
                raw: partialMatch[0].substring(0, 200) 
            };
        }

        return { valid: false, error: "No JSON object found in response", raw: text.substring(0, 200) };
    }

    /**
     * Validate that a JSON object has the required tool call structure.
     * Returns { valid: true } or { valid: false, error: "..." }
     */
    static validateToolCall(json) {
        if (!json || typeof json !== "object") {
            return { valid: false, error: "JSON is not an object" };
        }

        if (!json.tool || typeof json.tool !== "string") {
            return { valid: false, error: "Missing or invalid 'tool' field" };
        }

        if (!json.args || typeof json.args !== "object") {
            return { valid: false, error: "Missing or invalid 'args' field" };
        }

        return { valid: true };
    }
}
