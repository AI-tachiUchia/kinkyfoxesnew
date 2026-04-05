import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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
3. **NEVER announce phases/rounds you don't fully write.** If you say the game has 4 phases, you MUST write out ALL 4 phases completely. If you list a round by name, you MUST fully describe it. NEVER use placeholder text like "(continue similarly for rounds 3 and 4)" or "repeat for remaining phases" or "etc." Every announced element must be fully written. If you cannot fit it, reduce the number of phases/rounds — but always deliver 100% of what you announce.
4. **Include clear rules.** How do you win/lose? What triggers escalation? When does a round end? How are turns structured? Write it so two people can pick this up and play with zero ambiguity.
5. **Add Emojis to Section Titles.** Every section title (e.g., "Intro", "The Dare", "Aftercare") MUST include 1-2 fitting emojis at the beginning or end to make it more playful (e.g., "🔥 Die erste Berührung", "🍷 Das Vorspiel").
6. **Be focused, not bloated.** Aim for 5–7 tight sections. A great game is dense and playable, not a novel. Each section should contain only what players actually need in that moment. Don't pad with repetition or meta-commentary.
7. **No theatre scripts.** NEVER write exact words for players to say. Describe what needs to happen and the emotional/power intent — players improvise in the moment. Instead of *"Say: 'I want you to...' "* write *"Tell your partner explicitly what you want them to do to you."* The game guides the experience; it does not put words in anyone's mouth.
8. **Build in escalation.** Games should start lighter and build intensity. Early rounds warm up; later rounds push boundaries. The arc matters.
9. **Match the setup.** If players are long-distance, rules must work over video/phone. If restrained, account for limited movement. If toys are listed, integrate them meaningfully — don't just mention them.
10. **Include safety.** Mention safewords naturally (traffic light system). For intense games, include aftercare suggestions.
11. **Be creative, not generic.** Avoid cliché "truth or dare" retreads unless specifically requested. Combine mechanics in unexpected ways. Surprise the players.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // adminModel: optional override set by admin panel (requires NEXT_PUBLIC_ADMIN_SECRET in Vercel env vars)
    const { action, language = "de", currentGame, refinement, distance, customDistance, toys, vibe, template, heatLevel = 3, adminModel } = body;
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

    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (!hasAnthropic && !hasGemini) {
      return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
    }

    let prompt = "";

    if (action === "complicate") {
      prompt = `I have this game:
${JSON.stringify(currentGame)}

Available toys/items: ${toys || "None specified"}

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

    let text = "";

    // Determine which model to use (admin override takes priority)
    const isGeminiOverride = adminModel && adminModel.startsWith("gemini");
    const isClaudeOverride = adminModel && adminModel.startsWith("claude");

    if (isGeminiOverride && hasGemini) {
      // Admin forced Gemini model
      try {
        console.log("Admin Override: Using Gemini with model:", adminModel);
        const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await gemini.models.generateContent({
          model: adminModel,
          contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n---\n\n${prompt}` }] }],
          config: { maxOutputTokens: 8192 },
        });
        text = response.text ?? "";
        console.log("Gemini Success!");
      } catch (err: any) {
        console.error("Gemini override failed:", err.message);
        // If it was a model not found error, we might want to try a safer name
        if (err.message.includes("not found") || err.message.includes("404")) {
           console.warn("Model not found, trying legacy names...");
        }
        
        // Fallback to Pro if Flash failed
        if (adminModel !== "gemini-3.1-pro-preview") {
          console.log("Falling back from Flash to Pro...");
          const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await gemini.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n---\n\n${prompt}` }] }],
            config: { maxOutputTokens: 8192 },
          });
          text = response.text ?? "";
        } else {
          throw err;
        }
      }
    } else if (hasAnthropic && (!adminModel || isClaudeOverride)) {
      const modelToUse = isClaudeOverride ? adminModel : "claude-sonnet-4-6";
      try {
        console.log("Attempting Anthropic with model:", modelToUse);
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: modelToUse,
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        });
        text = response.content[0].type === "text" ? response.content[0].text : "";
        console.log("Anthropic Success!");
      } catch (err: any) {
        console.warn(`Anthropic (${modelToUse}) failed:`, err.message);
        const isAuthError = err?.status === 401;
        const isCredits = err?.status === 529 || err?.status === 402 || err?.message?.includes("credit") || err?.message?.includes("overload");
        
        if ((isCredits || isAuthError) && hasGemini) {
          console.warn("Falling back to Gemini Pro due to Anthropic error (Auth/Credits).");
        } else {
          // If it's a model error (404), maybe the name is wrong
          if (err?.status === 404) {
             console.warn("Claude model not found, check model name.");
          }
          throw err;
        }
      }
    }

    if (!text && hasGemini) {
      const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await gemini.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n---\n\n${prompt}` }] }],
        config: { maxOutputTokens: 8192 },
      });
      text = response.text ?? "";
    }

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