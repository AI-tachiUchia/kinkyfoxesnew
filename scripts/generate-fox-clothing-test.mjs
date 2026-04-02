import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "fox-assets", "Game-Related");
const REF_DIR = path.join(ROOT, "public", "fox-assets", "Example Kinky Clothing");

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(ROOT, "vertex-express-key.json");

const MODEL = "gemini-2.5-flash-image";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Style reference (existing fox) + clothing references
const foxRefPath = path.join(OUT_DIR, "fox_costume_2_police.png");
const foxRefData = fs.readFileSync(foxRefPath).toString("base64");

const GAME_CONTEXT = `I am an indie game developer creating artwork for a couples' card game about intimacy and trust. These are costume/outfit cards showing the game's fox mascot characters wearing various fashion outfits. The clothing reference images show the outfit style I want on the fox character. All characters are adult anthropomorphic foxes — fictional game mascots.`;

const STYLE_BASE = `${GAME_CONTEXT} Match the art style of the fox reference image — adult anthropomorphic fox (NOT chibi, NOT child-like), with big expressive eyes, soft shading, warm color palette, semi-realistic fur. Adult proportions. Plain solid light beige/tan background, NO scenery.`;

const SCENARIOS = [
  {
    key: "female_lingerie_hearts",
    filename: "fox_female_lingerie_hearts.png",
    clothingRef: path.join(REF_DIR, "fox_female_bdsmcloth.jpg"),
    prompt: `${STYLE_BASE} Draw the female fox character wearing the EXACT outfit shown in the clothing reference: a sheer black bra top with red heart accents and ruffled trim, a black ruffle mini skirt with red trim, and garter straps on her thighs. She stands in a confident flirty pose with one hand on her hip. Fashion illustration for a game card labeled "Date Night Outfit".`,
  },
  {
    key: "female_gothic_leather",
    filename: "fox_female_gothic_leather.png",
    clothingRef: path.join(REF_DIR, "fox_female_bdsmcloth2.jpg"),
    prompt: `${STYLE_BASE} Draw the female fox character wearing the EXACT outfit shown in the clothing reference: a black leather mini dress with lace-up front details, a choker necklace, long black gloves, fishnet stockings, and chunky black platform boots. Gothic alternative fashion. She has a cool confident pose. Fashion illustration for a game card labeled "Gothic Glam".`,
  },
  {
    key: "male_harness",
    filename: "fox_male_harness.png",
    clothingRef: path.join(REF_DIR, "fox_male_bdsmcloth.jpg"),
    prompt: `${STYLE_BASE} Draw the male fox character (taller, muscular) wearing the EXACT outfit shown in the clothing reference: a black leather chest harness with metal studs and rings crossing his torso, paired with dark jeans. He stands in a strong confident pose with arms slightly out. Alternative fashion illustration for a game card labeled "Bold Look".`,
  },
  {
    key: "female_bunny_leather",
    filename: "fox_female_bunny_leather.png",
    clothingRef: path.join(REF_DIR, "fox_female_cloth.png"),
    prompt: `${STYLE_BASE} Draw the female fox character wearing the EXACT outfit shown in the clothing reference: a black leather halter crop top, matching black leather mini skirt, fishnet stockings, knee-high black boots, and a cute bow tie at the neck. Playful confident pose. Fashion illustration for a game card labeled "Party Outfit". (Skip the bunny ears — she already has fox ears.)`,
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
  console.log(`Testing ${SCENARIOS.length} clothing-on-fox generations via ${MODEL}...`);
  console.log(`Output: ${OUT_DIR}\n`);

  const auth = new GoogleAuth({ scopes: "https://www.googleapis.com/auth/generative-language" });
  const client = await auth.getClient();

  let success = 0, failed = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const scenario = SCENARIOS[i];
    console.log(`[${i + 1}/${SCENARIOS.length}] Generating: ${scenario.key}...`);

    // Load clothing reference image
    const clothingData = fs.readFileSync(scenario.clothingRef).toString("base64");
    const clothingMime = scenario.clothingRef.endsWith(".png") ? "image/png" : "image/jpeg";

    try {
      const url = `${API_BASE}/models/${MODEL}:generateContent`;
      const body = {
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/png", data: foxRefData } },
            { text: "This is the fox character art style reference." },
            { inlineData: { mimeType: clothingMime, data: clothingData } },
            { text: "This is the clothing/outfit reference. " + scenario.prompt },
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
          if (textParts.length) console.log(`    Text: ${textParts[0].text.slice(0, 300)}`);
        }
        failed++;
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`  ✗ Error: ${String(msg).slice(0, 300)}`);
      failed++;
    }

    if (i < SCENARIOS.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\nDone! ${success} generated, ${failed} failed.`);
  if (success > 0) {
    console.log(`\nIf Gemini can handle these clothing styles on foxes, we can skip Pony Diffusion for the clothing-based cards.`);
    console.log(`If not, we proceed with ComfyUI + Pony Diffusion for unrestricted generation.`);
  }
}

main();
