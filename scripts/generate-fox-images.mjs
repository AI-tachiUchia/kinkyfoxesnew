import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "fox-assets", "Game-Related");

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(ROOT, "vertex-express-key.json");

const MODEL = "gemini-3.1-flash-image-preview";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Read existing fox image as style reference
const refImagePath = path.join(OUT_DIR, "fox_costume_2_police.png");
const refImageData = fs.readFileSync(refImagePath).toString("base64");

const STYLE_PREFIX = `Match the EXACT art style of the reference image — cute cartoon/chibi anthropomorphic fox characters with big expressive eyes, soft shading, warm color palette, semi-realistic fur textures. Two fox characters (one slightly smaller female, one taller male) in the same proportions and quality as the reference. The background MUST be a plain, solid, uniform light beige/tan color with NO objects, patterns, scenery, or gradients — just the two characters on a clean flat background.`;

const SCENARIOS = [
  {
    key: "dice_game",
    filename: "fox_dice_game.png",
    prompt: `${STYLE_PREFIX} The two foxes are sitting across from each other playing a dice game. One fox is rolling colorful dice while the other watches with a mischievous grin. A few dice are scattered between them. Playful and flirty atmosphere.`,
  },
  {
    key: "worship",
    filename: "fox_worship_kneel.png",
    prompt: `${STYLE_PREFIX} One fox is kneeling before the other in a submissive but adoring pose, looking up with devotion. The standing fox looks confident and dominant, gently touching the kneeling fox's chin. Romantic power dynamic, tasteful.`,
  },
  {
    key: "leash",
    filename: "fox_leash_petplay.png",
    prompt: `${STYLE_PREFIX} One fox is wearing a cute collar with a leash, looking playfully submissive with a wagging tail. The other fox holds the leash with a confident smile. Pet play theme, cute and playful, not aggressive.`,
  },
  {
    key: "massage",
    filename: "fox_massage_sensory.png",
    prompt: `${STYLE_PREFIX} One fox is giving the other a shoulder/back massage. The receiving fox has a blissful expression with eyes closed. Warm ambient glow suggesting candles. Sensual and relaxing mood.`,
  },
  {
    key: "interrogation",
    filename: "fox_interrogation.png",
    prompt: `${STYLE_PREFIX} Roleplay interrogation scene — one fox dressed as a detective with a trenchcoat, looking stern but playful. The other fox sits looking coyly nervous. Film noir inspired but cute.`,
  },
  {
    key: "edging",
    filename: "fox_tease_denial.png",
    prompt: `${STYLE_PREFIX} One fox is teasing the other with a feather, running it along their arm. The teased fox is squirming with anticipation, biting their lip. Playful tease theme, sensual but tasteful.`,
  },
  {
    key: "strip_game",
    filename: "fox_card_game.png",
    prompt: `${STYLE_PREFIX} Two foxes playing a card game like poker. One fox looks confident holding cards, the other looks flustered and is loosening a scarf/accessory as if losing a bet. Playing cards visible. Flirty game vibe.`,
  },
  {
    key: "aftercare",
    filename: "fox_aftercare_cuddle.png",
    prompt: `${STYLE_PREFIX} Two foxes cuddling together warmly, wrapped around each other tenderly. One is nuzzling the other's neck. Cozy, intimate aftercare scene. Warm, safe, loving atmosphere. Wrapped in a blanket.`,
  },
  {
    key: "ice_play",
    filename: "fox_ice_temperature.png",
    prompt: `${STYLE_PREFIX} One fox holds an ice cube playfully near the other fox, who reacts with a cute surprised shiver. Temperature play — one fox looks mischievous, the other giggly and reactive. Fun and flirty.`,
  },
  {
    key: "servant",
    filename: "fox_servant_master.png",
    prompt: `${STYLE_PREFIX} One fox is dressed in a cute maid/butler outfit, serving the other on a small tray with a bow. The served fox sits like royalty looking pleased. Master/servant roleplay, cute and playful.`,
  },
];

async function removeBg(buf) {
  const meta = await sharp(buf).metadata();
  const { data } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const bgR = data[0], bgG = data[1], bgB = data[2];
  const channels = meta.channels || 3;
  const rgba = Buffer.alloc(meta.width * meta.height * 4);
  const tolerance = 45;
  for (let i = 0; i < meta.width * meta.height; i++) {
    const si = i * channels;
    const di = i * 4;
    const r = data[si], g = data[si + 1], b = data[si + 2];
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    rgba[di] = r; rgba[di + 1] = g; rgba[di + 2] = b;
    if (dist < tolerance) rgba[di + 3] = 0;
    else if (dist < tolerance + 20) rgba[di + 3] = Math.round(255 * (dist - tolerance) / 20);
    else rgba[di + 3] = 255;
  }
  return sharp(rgba, { raw: { width: meta.width, height: meta.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  console.log(`Generating ${SCENARIOS.length} fox images via ${MODEL}...`);
  console.log(`Output: ${OUT_DIR}\n`);

  const auth = new GoogleAuth({ scopes: "https://www.googleapis.com/auth/generative-language" });
  const client = await auth.getClient();

  let success = 0, failed = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const scenario = SCENARIOS[i];
    console.log(`[${i + 1}/${SCENARIOS.length}] Generating: ${scenario.key}...`);

    try {
      const url = `${API_BASE}/models/${MODEL}:generateContent`;
      const body = {
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/png", data: refImageData } },
            { text: scenario.prompt },
          ],
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
        safetySettings: [
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        ],
      };

      const res = await client.request({
        url,
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/json" },
      });

      const parts = res.data?.candidates?.[0]?.content?.parts || [];
      let found = false;

      for (const part of parts) {
        if (part.inlineData) {
          const raw = Buffer.from(part.inlineData.data, "base64");
          const resized = await sharp(raw)
            .resize(512, null, { withoutEnlargement: true })
            .png({ compressionLevel: 9 })
            .toBuffer();

          const final = await removeBg(resized);
          const outPath = path.join(OUT_DIR, scenario.filename);
          fs.writeFileSync(outPath, final);
          console.log(`  ✓ Saved: ${scenario.filename} (${(final.length / 1024).toFixed(0)}KB)`);
          found = true;
          success++;
          break;
        }
      }

      if (!found) {
        const reason = res.data?.candidates?.[0]?.finishReason;
        console.log(`  ✗ No image returned. Finish reason: ${reason || "unknown"}`);
        if (res.data?.candidates?.[0]?.content?.parts) {
          const textParts = res.data.candidates[0].content.parts.filter(p => p.text);
          if (textParts.length) console.log(`    Text: ${textParts[0].text.slice(0, 200)}`);
        }
        failed++;
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`  ✗ Error: ${String(msg).slice(0, 200)}`);
      failed++;
    }

    if (i < SCENARIOS.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\nDone! ${success} generated, ${failed} failed.`);
}

main();
