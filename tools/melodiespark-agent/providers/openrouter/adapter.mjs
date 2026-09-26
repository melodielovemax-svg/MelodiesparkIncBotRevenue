import fs from "fs";
import path from "path";

const ROOT = "C:\\melodie\\tools\\melodiespark-agent";

export class OpenRouterAdapter {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    }

    async request(model, messages, tools = []) {
        if (!this.apiKey) {
            throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
        }

        console.log(`\x1b[36m[Brain]\x1b[0m Requesting response from ${model}...`);

        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "HTTP-Referer": "https://melodiespark.io", 
                "X-Title": "Melodiespark Agent",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                tools: tools,
                tool_choice: "auto",
                max_tokens: 500 // <--- LIMITING TOKENS TO FIT YOUR BALANCE
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message;
    }
}
