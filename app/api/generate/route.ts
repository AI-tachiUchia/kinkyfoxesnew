import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// On Vercel, write the service account key from env var to /tmp so ADC can find it
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const keyPath = path.join("/tmp", "gcp-key.json");
  fs.writeFileSync(keyPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

const SYSTEM_PROMPT = `You are an expert designer of intimate partner games for couples. You draw from a deep toolkit of game mechanics to create experiences that are genuinely playable, surprising, and hot.

GAME DESIGN TOOLKIT — draw from these mechanics as appropriate:
- **Dares & challenges**: Specific, concrete actions (not vague "do something sexy"). Always pre-generate the actual dares/challenges — never tell players to "come up with their own."
- **Power dynamics**: Dom/sub roles, service tasks, obedience challenges, permission systems, rewards & punishments, role reversals
- **Sensory play**: Blindfolds, temperature play (ice, wax), feathers, different textures, sensory deprivation, guided focus
- **Restraint & bondage**: Rope, cuffs, scarves, movement restrictions, predicament bondage (light), position holding
- **Tease & denial**: Edging rules, timed touch, forbidden zones that unlock, orgasm control, begging mechanics
- **Roleplay scenarios**: Interrogation, servant/master, stranger meetup, teacher/student, capture, worship
- **Escalation systems**: Timer-based intensity increases, clothing removal triggers, "level up" mechanics, point thresholds that unlock new acts
- **Randomization**: Dice rolls, card draws, coin flips, spinner mechanics, numbered lists to choose from — always provide the actual content to choose from
- **Competition & stakes**: Score tracking, winner/loser consequences, bets, forfeits, "best of 3" structures
- **Communication tools**: Traffic light safewords (green/yellow/red), check-in prompts, aftercare reminders
- **Physical challenges**: Position holding under distraction, endurance tasks, balance challenges while being teased
- **Psychological play**: Anticipation building, whispered commands, eye contact challenges, confession/vulnerability prompts, praise/degradation (calibrated to heat level)
- **Props & environment**: Creative use of household items, furniture, ice, food, mirrors, phone/camera (if consented)

CRITICAL RULES FOR EVERY GAME:
1. **Be specific and concrete.** Never say "dare each other to do things" — write out the actual dares. Never say "take turns challenging each other" — write the specific challenges with options.
2. **Pre-generate all content.** If the game has rounds, write what happens in each round. If it has challenges, list them. If it has cards/prompts, provide them — at least 8-12 items. Players should be able to play immediately without inventing anything.
3. **Include clear rules.** How do you win/lose? What triggers escalation? When does a round end? How are turns structured? Write it so two people can pick this up and play with zero ambiguity.
4. **Be focused, not bloated.** Aim for 5–7 tight sections. A great game is dense and playable, not a novel. Each section should contain only what players actually need in that moment. Don't pad with repetition or meta-commentary.
5. **No theatre scripts.** NEVER write exact words for players to say. Describe what needs to happen and the emotional/power intent — players improvise in the moment. Instead of *"Say: 'I want you to...' "* write *"Tell your partner explicitly what you want them to do to you."* The game guides the experience; it does not put words in anyone's mouth.
6. **Build in escalation.** Games should start lighter and build intensity. Early rounds warm up; later rounds push boundaries. The arc matters.
7. **Match the setup.** If players are long-distance, rules must work over video/phone. If restrained, account for limited movement. If toys are listed, integrate them meaningfully — don't just mention them.
8. **Include safety.** Mention safewords naturally (traffic light system). For intense games, include aftercare suggestions.
9. **Be creative, not generic.** Avoid cliché "truth or dare" retreads unless specifically requested. Combine mechanics in unexpected ways. Surprise the players.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, language = "de", currentGame, refinement, distance, customDistance, toys, vibe, template, heatLevel = 3 } = body;
    const heatDescriptions: Record<number, string> = {
      1: "Soft & romantic — sensual teasing, intimate connection, gentle commands. No explicit sexual acts. Focus on anticipation, touch, eye contact, whispered words, slow exploration.",
      2: "Flirty & suggestive — light adult content, playful power dynamics, clothing comes off gradually. Suggestive dares, body worship, mild restraint. Teasing but no graphic acts.",
      3: "Clearly kinky — explicit BDSM-lite, direct sexual content, real power exchange. Oral, manual stimulation, bondage, tease & denial, specific positions and acts. Players will get naked and physical.",
      4: "Intense — bold and explicit. Hard power play, edging, punishment/reward systems, degradation or praise play, predicament scenarios, humiliation elements (consensual). Push boundaries.",
      5: "Maximum — no-holds-barred filthy. Extreme dares, heavy BDSM, graphic and creative acts, elaborate scenarios. Nothing is off the table. Make it genuinely shocking and transgressive.",
    };
    const heatInstruction = `Heat level: ${heatLevel}/5 — ${heatDescriptions[heatLevel] ?? heatDescriptions[3]}. Calibrate ALL content, language intensity, and explicitness to this level exactly. Higher heat = more graphic language, bolder acts, edgier dynamics.`;

    const langInstruction = language === "de"
      ? "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in GERMAN language."
      : "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in ENGLISH language.";

    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      return NextResponse.json({ error: "Missing GOOGLE_CLOUD_PROJECT" }, { status: 500 });
    }

    const ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let prompt = "";

    if (action === "complicate") {
      prompt = `I have this game:
${JSON.stringify(currentGame)}

Escalate it. Make it more intense, complex, and longer. You can:
- Add new rounds or phases with pre-written content
- Introduce twists, role reversals, or surprise mechanics
- Layer in additional toys, props, or power dynamics
- Raise the stakes with bolder forfeits and consequences
- Add a climax phase and a cool-down/aftercare section

Keep everything that already works, but push it further. Every new rule or challenge must be fully written out — no placeholders.

${heatInstruction}
${langInstruction}

Output ONLY a JSON object:
{
  "title": "Game title (same or updated)",
  "duration": "Updated estimated time",
  "sections": [
    { "title": "Section Name", "content": "Full markdown content with all rules, dares, challenges pre-written" }
  ]
}`;
    } else if (action === "refine") {
      prompt = `I have this game:
${JSON.stringify(currentGame)}

${refinement ? `Player feedback: "${refinement}"\nApply this feedback precisely.` : "Polish this game — tighten the rules, improve flow, make challenges more specific, fill in any gaps where players would be left guessing what to do."}

Maintain the same overall structure and heat level, but make it better. If any rules are vague, make them concrete. If any challenges are missing, add them. If the game feels thin, flesh it out.

${heatInstruction}
${langInstruction}

Output ONLY a JSON object:
{
  "title": "Updated title if needed",
  "duration": "Updated duration if needed",
  "sections": [
    { "title": "Section Name", "content": "Full markdown content" }
  ]
}`;
    } else {
      const distanceText = distance === 'custom' ? customDistance : distance;
      const templateText = template ? `\nGame template/style to follow: "${template}" — adapt the game strongly to this style while keeping it original.` : "";
      prompt = `Generate a complete, ready-to-play intimate game for a couple.

Setup: ${distanceText || "Not specified"}
Available toys/items: ${toys || "None specified"}
Vibe/theme: ${vibe || "Surprise me — be creative"}${templateText}
${heatInstruction}

Design a game that two people can pick up and play RIGHT NOW with zero prep beyond what's listed in setup. Include:
- A clear structure (rounds, phases, or turns — whatever fits)
- All challenges, dares, or prompts pre-written (at least 8-12 if applicable)
- Specific rules for how turns work, what triggers escalation, and how the game ends
- Built-in escalation arc from warm-up to peak intensity
- If there are choices or randomization, provide the full list of options

Target 5–7 focused sections. Write the actual game content — no placeholders — but stay tight. Every sentence should add playability, not word count.

${langInstruction}

Output ONLY a JSON object:
{
  "title": "Creative, catchy game title",
  "duration": "Realistic estimated play time",
  "sections": [
    { "title": "Section Name", "content": "Full markdown content — be thorough" }
  ]
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 4096,
        safetySettings,
      },
    });

    const text = response.text ?? "";

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