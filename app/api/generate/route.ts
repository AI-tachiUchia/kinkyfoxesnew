import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// ─── New XML-structured system prompt ────────────────────────────────────────
const SYSTEM_PROMPT = `<system_instructions>
<persona>
Du bist ein brillanter Game-Designer, Beziehungspsychologe und Autor für interaktive Paar-Erfahrungen. Deine Aufgabe ist es, originelle, intime und spannende Spielaufgaben (Wahrheit, Pflicht, Rollenspiel oder Power-Play) für Liebespaare zu generieren. Du schreibst niemals wie ein generischer Chatbot, sondern wie ein kreativer Spielleiter.
</persona>

<core_logic_and_mechanics>
Meaningful Verbs: Die Aufgabe muss eine handlungsorientierte Spielmechanik besitzen. Es geht um echte, bedeutungsvolle Interaktion (z.B. sensorischer Entzug, nonverbale Kommunikation, Temperature Play, Machtdynamiken).

Keine Klischees (Negative Prompting): Vermeide generische KI-Phrasen. Blockierte Phrasen: "a weight settled", "eyes darkened/widened", "breath hitched", "jaw tightened", "silence stretched", "tongues battling for dominance", "not X but Y"-Konstruktionen, "elektrisierende Berührung", "lodernde Leidenschaft".

Stil: Nutze starke, aktive Verben. Reduziere Adjektive und Adverbien auf ein absolutes Minimum. Erzeuge Spannung durch physische Details (Temperatur, Klang, Textur, Widerstand), nicht durch abstrakte Gefühlsbeschreibungen.

Distanz beachten: Bei Video/Text-Only dürfen KEINE Berührungsaufgaben gefordert werden, die körperliche Präsenz voraussetzen.
</core_logic_and_mechanics>

<output_format>
Nutze einen <thinking>-Block VOR dem JSON, um kurz zu prüfen:
1. Sind die Aufgaben mit der Distanz logisch vereinbar?
2. Entspricht die Eskalation exakt der geforderten Stufe?
3. Wurden alle Limits/Lines respektiert?

Danach: Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Codeblöcke:
{
  "scenario_title": "Ein kreativer, atmosphärischer Titel",
  "player_instructions": "Die vollständige, direkte Spielanweisung an das Paar — konkret und sofort spielbar",
  "mechanic_twist": "Ein besonderer Haken, eine Regel oder ein Twist, der die Aufgabe unverwechselbar macht",
  "estimated_duration_minutes": 15
}
</output_format>
</system_instructions>`;

// ─── Few-shot examples injected before <task> ─────────────────────────────────
const FEW_SHOT_EXAMPLES = `<examples>
<example id="1">
<input>
Distanz: Im selben Raum
Atmosphäre: Romantisch
Gegenstände: Kerze, Augenbinde
Eskalationsstufe: 1
Hard Limits: Keine
Veils: Keine
</input>
<output>
<thinking>
Eskalationsstufe 1 = Eisbrecher, kein expliziter Content. Romantisch + Kerze + Augenbinde = sensorisches Erkundungsspiel. Distanz Im selben Raum — Berührungsaufgaben erlaubt. Limits beachtet.
</thinking>
{"scenario_title":"Kartographie der Haut","player_instructions":"Person A legt sich mit geschlossenen Augen hin. Person B hält eine brennende Kerze senkrecht ca. 30 cm über die Haut und kippt sie kurz — ein einzelner Wachstropfen fällt auf die Innenseite des Handgelenks. Person A beschreibt laut, was sie fühlt: Temperatur, Textur, die Sekunde vor dem Aufprall. Dann Rollentausch. Drei Runden. In der dritten Runde wählt Person B selbst den Körperbereich.","mechanic_twist":"Schweigen ist verboten. Wer die Beschreibung unterbricht oder verstummt, verliert die Wahl über den nächsten Bereich.","estimated_duration_minutes":12}
</output>
</example>

<example id="2">
<input>
Distanz: Videochat
Atmosphäre: Verspielt
Gegenstände: Keine
Eskalationsstufe: 2
Hard Limits: Keine
Veils: Explizite Akte
</input>
<output>
<thinking>
Eskalationsstufe 2 = Teasing, angedeuteter Inhalt. Videochat = keine physischen Berührungsaufgaben gegeneinander. Verspielt = spielerische Mechanik. Veils = Fade-to-Black bei expliziten Akten. Idee: Strip-Abfrage-Spiel mit Wissens-Charakter.
</thinking>
{"scenario_title":"Fünf Fragen oder ein Stück","player_instructions":"Person A stellt fünf Fragen — nicht über Vorlieben, sondern über konkrete Erinnerungen ('Was hast du beim letzten Mal gedacht, als…'). Für jede Antwort, die Person B zu vage beantwortet oder verweigert, muss Person B ein Kleidungsstück ablegen. Person A sieht das Ergebnis live auf dem Bildschirm. Nach fünf Fragen Rollentausch.","mechanic_twist":"Was als 'zu vage' gilt, entscheidet ausschließlich Person A — ohne Widerspruchsrecht. Alle abgelegten Stücke bleiben bis zum Ende der Runde weg.","estimated_duration_minutes":20}
</output>
</example>

<example id="3">
<input>
Distanz: Im selben Raum
Atmosphäre: Kinky
Gegenstände: Handschellen, Eiswürfel, Augenbinde
Eskalationsstufe: 4
Hard Limits: Keine Schmerzen über Stufe 3
Veils: Keine
</input>
<output>
<thinking>
Eskalationsstufe 4 = Schwarz/Explizit. Handschellen + Eiswürfel + Augenbinde = Power Play mit Temperatur. Kinky = klare Machtdynamik. Hard Limit = kein starker Schmerz. Explizite Handlungen erlaubt, Schmerz bleibt unter Stufe 3 (leicht, kurz). Distanz Im selben Raum — alle Toys einsetzbar.
</thinking>
{"scenario_title":"Drei Minuten Stille","player_instructions":"Person B wird mit Augenbinde und Handschellen (hinter dem Rücken oder am Bett befestigt) fixiert. Person A hat exakt drei Minuten Zeit und darf ausschließlich Eiswürfel und die eigenen Hände einsetzen. Keine Erklärungen, kein Kommentar. Person B hat Safeword Gelb/Rot. Was Person A wählt, wählt Person A allein. Nach drei Minuten Rollentausch — wer jetzt die Handschellen anlegt, entscheidet das Losverfahren: Münzwurf.","mechanic_twist":"Person A darf in den drei Minuten exakt einmal sprechen — ein einziger Satz. Was dieser Satz ist, bleibt Person As Wahl. Wird er nicht genutzt, verfällt er.","estimated_duration_minutes":25}
</output>
</example>
</examples>`;

// ─── Legacy system prompt kept for complicate/refine actions ─────────────────
const LEGACY_SYSTEM_PROMPT = `You are an expert designer of intimate partner games for couples. You draw from a deep toolkit of game mechanics to create experiences that are genuinely playable, surprising, and hot.

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

DICE ROLL FORMAT — Use this when a game mechanic involves random selection from options:
Format (embed directly in the section's markdown content):
:::dice{label="Description of what you're rolling for..."}
- Option 1
- Option 2
- Option 3
- Option 4
- Option 5
- Option 6
:::

CRITICAL RULES FOR EVERY GAME:
1. Be specific and concrete. Pre-generate all content.
2. NEVER announce phases/rounds you don't fully write.
3. Include clear rules. Be focused, not bloated.
4. No theatre scripts — guide the experience, don't put words in mouths.
5. Build in escalation. Match the setup.
6. Include safety: mention safewords naturally.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      language = "de",
      currentGame,
      refinement,
      distance,
      customDistance,
      toys,
      vibe,
      template,
      heatLevel = 3,
      adminModel,
      // New params
      atmosphaere,
      eskalationsstufe = 2,
      hardLimits,
      veils,
    } = body;

    const heatDescriptions: Record<number, string> = {
      1: "Soft & romantic — sensual teasing, intimate connection, gentle commands. No explicit sexual acts.",
      2: "Flirty & suggestive — light adult content, playful power dynamics, clothing comes off gradually.",
      3: "Clearly kinky — explicit BDSM-lite, direct sexual content, real power exchange.",
      4: "Intense — bold and explicit. Hard power play, edging, punishment/reward systems.",
      5: "Maximum — no-holds-barred. Extreme dares, heavy BDSM, graphic and creative acts.",
    };
    const heatInstruction = `Heat level: ${heatLevel}/5 — ${heatDescriptions[heatLevel] ?? heatDescriptions[3]}. Calibrate ALL content to this level.`;

    const langInstruction = language === "de"
      ? "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in GERMAN language."
      : "IMPORTANT: Generate the ENTIRE game (all titles, durations, and content) strictly in ENGLISH language.";

    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (!hasAnthropic && !hasGemini) {
      return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
    }

    let prompt = "";
    let systemToUse = SYSTEM_PROMPT;

    if (action === "complicate") {
      systemToUse = LEGACY_SYSTEM_PROMPT;
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
      systemToUse = LEGACY_SYSTEM_PROMPT;
      prompt = `I have this game:
${JSON.stringify(currentGame)}

${refinement ? `Player feedback: "${refinement}"\nApply this feedback precisely.` : "Polish this game — tighten the rules, improve flow, make challenges more specific, fill in any gaps where players would be left guessing what to do."}

Maintain the same overall structure and heat level, but make it better.

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
      // New XML-structured generate prompt
      const distanceText = distance === "custom" ? (customDistance || "Eigene Situation") : mapDistanceToText(distance);
      const eskalationLabels: Record<number, string> = {
        1: "1 — Grün / Eisbrecher (sanft, romantisch, kein expliziter Inhalt)",
        2: "2 — Gelb / Teasing (angedeutet, verspielt, leichtes Flirten)",
        3: "3 — Rot / Intensiv (klar erotisch, Machtdynamiken, explizit)",
        4: "4 — Schwarz / Explizit (harte Machtspiele, grafisch, pusht Grenzen)",
      };
      const eskalationLabel = eskalationLabels[eskalationsstufe] ?? eskalationLabels[2];
      const templateText = template ? `\nSpielvorlage/Stil: "${template}" — passe das Spiel stark an diesen Stil an, bleibe aber originell.` : "";

      prompt = `<dynamic_parameters>
Distanz: ${distanceText}
Gewünschte Atmosphäre: ${atmosphaere || vibe || "Überrasch mich — sei kreativ"}
Verfügbare Gegenstände/Toys: ${toys || "Keine angegeben"}
Eskalationsstufe: ${eskalationLabel}${templateText}
</dynamic_parameters>

<safety_and_consent>
HARD LIMITS (Lines): Generiere NIEMALS Inhalte zu diesen Themen: ${hardLimits || "Keine spezifischen Limits angegeben"}.
VEILS (Fade-to-Black): Diese Themen dürfen impliziert, aber nicht explizit grafisch beschrieben werden: ${veils || "Keine spezifischen Veils angegeben"}.
</safety_and_consent>

${FEW_SHOT_EXAMPLES}

<task>
Generiere exakt EINE neue Spielaufgabe basierend auf den <dynamic_parameters>.
${langInstruction}
Nutze zwingend einen <thinking> Block VOR deiner JSON-Ausgabe, um deine Logik zu prüfen.
Gib danach das JSON aus — ohne Markdown-Codeblöcke.
</task>`;
    }

    let text = "";

    const isGeminiOverride = adminModel && (adminModel.startsWith("gemini") || adminModel.startsWith("google"));
    const isClaudeOverride = adminModel && (adminModel.startsWith("claude") || adminModel.startsWith("opus") || adminModel.startsWith("anthropic"));
    const isXAIOverride = adminModel && (adminModel.startsWith("grok") || adminModel.startsWith("xai"));

    const useGemini = isGeminiOverride || (!adminModel && !isXAIOverride && hasGemini);
    const useClaude = isClaudeOverride || (!useGemini && !isXAIOverride && hasAnthropic);
    const useXAI = isXAIOverride;

    if (useXAI) {
      try {
        const modelToUse = adminModel?.includes('/') ? adminModel : (adminModel === 'grok' ? 'grok-4.20-0309-reasoning' : 'grok-4-1-fast-reasoning');
        console.log("Using xAI with model:", modelToUse);
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.XAI_API_KEY}`
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: "system", content: systemToUse },
              { role: "user", content: prompt }
            ],
            temperature: 0.7
          })
        });
        const data = await response.json();
        text = data.choices[0].message.content;
      } catch (err: any) {
        console.error("xAI failed:", err.message);
        throw err;
      }
    } else if (useGemini) {
      const modelToUse = (adminModel?.startsWith("gemini") || adminModel?.startsWith("google")) ? adminModel : "gemini-3.1-pro-preview";
      try {
        console.log("Using Gemini with model:", modelToUse);
        const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await gemini.models.generateContent({
          model: modelToUse,
          contents: [{ role: "user", parts: [{ text: `${systemToUse}\n\n---\n\n${prompt}` }] }],
          config: { maxOutputTokens: 8192 },
        });
        text = response.text ?? "";
        console.log("Gemini Success!");
      } catch (err: any) {
        console.error("Gemini failed:", err.message);
        if (hasAnthropic) {
          console.log("Falling back from Gemini to Anthropic...");
          const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 8192,
            system: systemToUse,
            messages: [{ role: "user", content: prompt }],
          });
          text = response.content[0].type === "text" ? response.content[0].text : "";
        } else {
          throw err;
        }
      }
    } else if (useClaude) {
      const modelToUse = isClaudeOverride ? adminModel : "claude-sonnet-4-6";
      try {
        console.log("Attempting Anthropic with model:", modelToUse);
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: modelToUse,
          max_tokens: 8192,
          system: systemToUse,
          messages: [{ role: "user", content: prompt }],
        });
        text = response.content[0].type === "text" ? response.content[0].text : "";
        console.log("Anthropic Success!");
      } catch (err: any) {
        console.warn(`Anthropic (${modelToUse}) failed:`, err.message);
        const isAuthError = err?.status === 401;
        const isCredits = err?.status === 529 || err?.status === 402 || err?.message?.includes("credit") || err?.message?.includes("overload");
        if ((isCredits || isAuthError) && hasGemini) {
          console.warn("Falling back to Gemini due to Anthropic error.");
        } else {
          throw err;
        }
      }
    }

    if (!text && hasGemini) {
      console.log("Empty text, running final fallback with Gemini...");
      const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await gemini.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: `${systemToUse}\n\n---\n\n${prompt}` }] }],
        config: { maxOutputTokens: 8192 },
      });
      text = response.text ?? "";
    }

    // Strip <thinking>...</thinking> blocks (CoT reasoning not meant for users)
    text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();

    // Strip markdown fences, then find the JSON object
    const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
    const jsonStart = stripped.indexOf('{');
    const jsonEnd = stripped.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object found in model response");
    }
    const jsonStr = stripped.substring(jsonStart, jsonEnd + 1);

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e1) {
      try {
        const fixed = jsonStr.replace(/[\x00-\x1f]/g, (ch: string) => {
          if (ch === '\n') return '\\n';
          if (ch === '\r') return '\\r';
          if (ch === '\t') return '\\t';
          return '';
        });
        parsedData = JSON.parse(fixed);
      } catch (e2) {
        const titleMatch = jsonStr.match(/"(?:title|scenario_title)"\s*:\s*"([^"]*?)"/);
        const durationMatch = jsonStr.match(/"(?:duration|estimated_duration_minutes)"\s*:\s*"?(\d+[^",}]*)"?/);
        const sections: { title: string; content: string }[] = [];
        const sectionRegex = /\{\s*"title"\s*:\s*"([^"]*?)"\s*,\s*"content"\s*:\s*"([\s\S]*?)"\s*\}/g;
        let match;
        while ((match = sectionRegex.exec(jsonStr)) !== null) {
          sections.push({ title: match[1], content: match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"') });
        }
        if (titleMatch && sections.length > 0) {
          parsedData = {
            title: titleMatch[1],
            duration: durationMatch?.[1] || "~15 min",
            sections
          };
        } else {
          throw new Error("Could not parse model response as JSON");
        }
      }
    }

    // Convert new single-challenge format to sections format for display
    if (parsedData.scenario_title) {
      const durationMin = parsedData.estimated_duration_minutes;
      const durationStr = typeof durationMin === "number"
        ? `~${durationMin} Minuten`
        : (durationMin ? String(durationMin) + " Minuten" : "~15 Minuten");

      parsedData = {
        title: parsedData.scenario_title,
        duration: durationStr,
        sections: [
          {
            title: language === "de" ? "Anweisungen" : "Instructions",
            content: parsedData.player_instructions || ""
          },
          {
            title: language === "de" ? "Besonderer Dreh" : "The Twist",
            content: parsedData.mechanic_twist || ""
          }
        ].filter(s => s.content)
      };
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Error generating game:", error);
    return NextResponse.json({ error: "Failed to generate game. " + error.message }, { status: 500 });
  }
}

function mapDistanceToText(distance: string): string {
  switch (distance) {
    case "same-room": return "Im selben Raum";
    case "video":     return "Long-Distance / Videochat";
    case "text":      return "Text-Only / Chat";
    case "tonight":   return "Im selben Raum (bald)";
    case "virtual":   return "Long-Distance / Videochat";
    default:          return distance || "Nicht angegeben";
  }
}
