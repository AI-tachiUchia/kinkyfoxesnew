import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, currentGame, refinement, distance, customDistance, toys, vibe, template } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
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
        
        Keep the initial game VERY simple, short, and easy to digest. Do not overwhelm with rules initially.
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
