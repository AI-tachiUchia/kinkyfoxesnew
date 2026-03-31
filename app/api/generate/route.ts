import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, language = "de", currentGame, refinement, distance, customDistance, toys, vibe, template, heatLevel = 3 } = body;
    const heatDescriptions: Record<number, string> = {
      1: "very soft and romantic — sensual teasing only, nothing explicitly sexual",
      2: "mildly spicy — flirtatious and suggestive, light adult content",
      3: "moderately kinky — clearly adult, some NSFW rules and escalation",
      4: "quite intense — explicit, bold rules, significant power play, edginess or for example extra emberessing depending on scenario",
      5: "maximum heat — no-holds-barred, as filthy and kinky as possible - ewww!",
    };
    const heatInstruction = `Heat level: ${heatLevel}/5 — ${heatDescriptions[heatLevel] ?? heatDescriptions[3]}. Calibrate ALL content and rule intensity to match this exactly.`;

    const langInstruction = language === "de" 
      ? "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in GERMAN language." 
      : "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in ENGLISH language.";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    let prompt = "";

    if (action === "complicate") {
      prompt = `
        You are an expert game creator. I have a base game:
        ${JSON.stringify(currentGame)}
        
        Make this more intense/complicated but it should still be playable. Make this game more complex, adding advanced rules, escalation steps, new toys if applicable, or a twist.
        
        ${langInstruction}
        Output ONLY a JSON object with this exact structure:
        {
          "title": "A catchy title (can be the same or updated)",
          "duration": "Estimated time (might be longer now)",
          "sections": [
            { "title": "Setup", "content": "Markdown string" },
            { "title": "Advanced Rules", "content": "Markdown string" },
            { "title": "Escalation / Twist", "content": "Markdown string" }
          ]
        }
      `;
    } else if (action === "refine") {
      prompt = `
        You are an expert game creator. I have a game:
        ${JSON.stringify(currentGame)}
        
        Refine this. ${refinement ? `Feedback: "${refinement}"` : "Improve the current game a bit, make it more beter playable or/and write it more elegantly."}
        Update the game to incorporate this feedback perfectly.
        
        ${langInstruction}
        Output ONLY a JSON object with this exact structure:
        {
          "title": "Updated title if needed",
          "duration": "Updated duration if needed",
          "sections": [
            { "title": "Section Title (e.g. Setup)", "content": "Markdown string" },
            { "title": "Section Title (e.g. Rules)", "content": "Markdown string" }
          ]
        }
      `;
    } else {
      const distanceText = distance === 'custom' ? customDistance : distance;
      const templateText = template ? `\n        Game Template/Style: ${template} (please adapt the game strongly to this specific style)` : "";
      prompt = `
        You are an expert game creator for couples. Generate a custom NSFW game based on these parameters:
        Distance/Setup: ${distanceText || "Not specified"}
        Available Items/Toys: ${toys || "None"}
        Vibe/Idea: ${vibe || "Surprise me"}${templateText}
        ${heatInstruction}

        Keep the initial game VERY simple, short, and easy to digest. Do not overwhelm with rules initially, but neither ignore them, since it has to be playable and fun.
        
        ${langInstruction}
        Output ONLY a JSON object with this exact structure:
        {
          "title": "A catchy title for the game",
          "duration": "Estimated time (e.g., 10-15 mins)",
          "sections": [
            { "title": "The Core Idea", "content": "Markdown string (1-2 paragraphs max)" },
            { "title": "Basic Rules", "content": "Markdown string (very simple, few bullet points)" }
          ]
        }
      `;
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as any).text;

    // Strip markdown fences, then find the JSON object
    const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
    const jsonStart = stripped.indexOf('{');
    const jsonEnd = stripped.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object found in model response");
    }
    const jsonStr = stripped.substring(jsonStart, jsonEnd + 1);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e1) {
      try {
        // Fix literal newlines/tabs inside JSON string values
        const fixed = jsonStr.replace(/[\x00-\x1f]/g, (ch: string) => {
          if (ch === '\n') return '\\n';
          if (ch === '\r') return '\\r';
          if (ch === '\t') return '\\t';
          return '';
        });
        parsedData = JSON.parse(fixed);
      } catch (e2) {
        // Last resort: extract fields with regex
        const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]*?)"/);
        const durationMatch = jsonStr.match(/"duration"\s*:\s*"([^"]*?)"/);
        // Find all section blocks
        const sections: { title: string; content: string }[] = [];
        const sectionRegex = /\{\s*"title"\s*:\s*"([^"]*?)"\s*,\s*"content"\s*:\s*"([\s\S]*?)"\s*\}/g;
        let match;
        while ((match = sectionRegex.exec(jsonStr)) !== null) {
          sections.push({ title: match[1], content: match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"') });
        }
        if (titleMatch && sections.length > 0) {
          parsedData = {
            title: titleMatch[1],
            duration: durationMatch?.[1] || "~15 mins",
            sections
          };
        } else {
          throw new Error("Could not parse model response as JSON");
        }
      }
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Error generating game:", error);
    return NextResponse.json({ error: "Failed to generate game. " + error.message }, { status: 500 });
  }
}