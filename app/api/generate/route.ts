import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, language = "de", currentGame, refinement, distance, customDistance, toys, vibe, template, heatLevel = 3 } = body;
    const heatDescriptions: Record<number, string> = {
      1: "very soft and romantic — sensual teasing only, nothing explicitly sexual",
      2: "mildly spicy — flirtatious and suggestive, light adult content",
      3: "moderately kinky — clearly adult, some NSFW rules and escalation",
      4: "quite intense — explicit, bold rules, significant power play or edginess",
      5: "maximum heat — no-holds-barred, as filthy and kinky as possible",
    };
    const heatInstruction = `Heat level: ${heatLevel}/5 — ${heatDescriptions[heatLevel] ?? heatDescriptions[3]}. Calibrate ALL content and rule intensity to match this exactly.`;

    const langInstruction = language === "de" 
      ? "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in GERMAN language." 
      : "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in ENGLISH language.";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-pro-preview",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ]
    });

    let prompt = "";

    if (action === "complicate") {
      prompt = `
        You are an expert game creator. I have a base game:
        ${JSON.stringify(currentGame)}
        
        Make this more intense/complicated. Make this game more complex, adding advanced rules, escalation steps, new toys if applicable, or a twist.
        
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
        
        Refine this. ${refinement ? `Feedback: "${refinement}"` : "Improve or soften the current game a bit, or write it more elegantly."}
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

        Keep the initial game VERY simple, short, and easy to digest. Do not overwhelm with rules initially.
        
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response (removing any markdown formatting if present)
    const cleanJsonText = text.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    const parsedData = JSON.parse(cleanJsonText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Error generating game:", error);
    return NextResponse.json({ error: "Failed to generate game. " + error.message }, { status: 500 });
  }
}
