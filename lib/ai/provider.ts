import { AiProviderKey, AI_ENGINES } from "./types";

export interface AIProvider {
  key: AiProviderKey;
  name: string;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
}

// 1. ChatGPT (OpenAI)
export class ChatGPTProvider implements AIProvider {
  key = "chatgpt" as const;
  name = "ChatGPT";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

// 2. Claude (Anthropic)
export class ClaudeProvider implements AIProvider {
  key = "claude" as const;
  name = "Claude";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "claude-3-5-sonnet-20241022") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    };

    if (systemInstruction) {
      body.system = systemInstruction;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic Claude API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new Error("No text response generated from Claude API.");
    }
    return content;
  }
}

// 3. Gemini (Google)
export class GeminiProvider implements AIProvider {
  key = "gemini" as const;
  name = "Gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error("No text response generated from Gemini API.");
    }
    return candidate;
  }
}

// 4. Grok (xAI)
export class GrokProvider implements AIProvider {
  key = "grok" as const;
  name = "Grok";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "grok-2-1212") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI Grok API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

// 5. Kimi (Moonshot AI)
export class KimiProvider implements AIProvider {
  key = "kimi" as const;
  name = "Kimi";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "moonshot-v1-8k") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Moonshot Kimi API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

// 6. DeepSeek (DeepSeek AI)
export class DeepSeekProvider implements AIProvider {
  key = "deepseek" as const;
  name = "DeepSeek";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "deepseek-chat") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}
