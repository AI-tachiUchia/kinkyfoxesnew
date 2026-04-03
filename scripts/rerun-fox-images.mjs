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

const refPaths = [
  path.join(OUT_DIR, "ref_style_a.png"),
  path.join(OUT_DIR, "ref_style_b.png"),
  path.join(OUT_DIR, "ref_style_c.png"),
  path.join(OUT_DIR, "ref_style_d.png"),
];
const refImages = refPaths.map((p) => fs.readFileSync(p).toString("base64"));

const STYLE_PREFIX = `Match the EXACT art style shown in the reference images — cute cartoon/chibi anthropomorphic fox characters with big expressive eyes, soft shading, warm orange/brown color palette, semi-realistic fur textures. Two fox characters (one smaller female, one taller male) in the same proportions and quality as the references. The background MUST be a plain, solid, uniform light beige/tan color — just the characters on a clean flat background. CLOTHING STYLE: The female fox always wears revealing, form-fitting outfits — very short mini skirts (barely covering), low-cut tops showing ample cleavage, or lingerie-style clothing. Male fox wears minimal casual clothing or is shirtless.`;

const SCENARIOS = [
  {
    key: "ice_play",
    filename: "fox_ice_temperature.png",
    prompt: `Match the art style of the reference images — cute chibi anthropomorphic fox characters, warm color palette, clean beige background. The female fox lies on her back on a table, wearing a short mini skirt and a small top. The male fox sits beside her, pressing an ice cube carefully against a small sting mark on her side just below her chest. He has no glasses. Her expression shows it is cold and stings a little — brows slightly furrowed, mouth open. He looks focused and gentle. Calm, caring scene.`,
  },
  {
    key: "mirror_selfie",
    filename: "fox_mirror_selfie.png",
    prompt: `Match the art style of the reference images — cute chibi anthropomorphic fox characters, warm color palette. Only one character: the female fox alone in a bathroom. She stands in front of a large mirror, holding her phone up to take a selfie. The mirror is clearly visible behind her, reflecting her from behind. She wears a short mini skirt and a small top. She smiles at the phone. The background shows a bathroom interior with the mirror as the main element.`,
  },
  {
    key: "pillow_fight",
    filename: "fox_pillow_fight.png",
    prompt: `${STYLE_PREFIX} Two foxes having a playful pillow fight on a bed. The female fox swings a pillow, hair flying, wearing a very short sleep shirt as a nightgown — barely covering. The male fox blocks with a pillow, shirtless in boxers, laughing. Feathers floating in the air. Playful and flirty bedroom energy.`,
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
  console.log(`Regenerating ${SCENARIOS.length} fox images with updated outfits via ${MODEL}...`);

  const auth = new GoogleAuth({ scopes: "https://www.googleapis.com/auth/generative-language" });
  const client = await auth.getClient();

  let success = 0, failed = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const scenario = SCENARIOS[i];
    console.log(`[${i + 1}/${SCENARIOS.length}] Generating: ${scenario.key}...`);

    try {
      const url = `${API_BASE}/models/${MODEL}:generateContent`;
      const refParts = refImages.map((data) => ({ inlineData: { mimeType: "image/png", data } }));

      const body = {
        contents: [{ role: "user", parts: [...refParts, { text: scenario.prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        safetySettings: [
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        ],
      };

      const res = await client.request({ url, method: "POST", data: body, headers: { "Content-Type": "application/json" } });
      const parts = res.data?.candidates?.[0]?.content?.parts || [];
      let found = false;

      for (const part of parts) {
        if (part.inlineData) {
          const raw = Buffer.from(part.inlineData.data, "base64");
          const resized = await sharp(raw).resize(512, null, { withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
          const final = await removeBg(resized);
          fs.writeFileSync(path.join(OUT_DIR, scenario.filename), final);
          console.log(`  ✓ Saved: ${scenario.filename} (${(final.length / 1024).toFixed(0)}KB)`);
          found = true;
          success++;
          break;
        }
      }

      if (!found) {
        const reason = res.data?.candidates?.[0]?.finishReason;
        console.log(`  ✗ No image returned. Finish reason: ${reason || "unknown"}`);
        const textParts = res.data?.candidates?.[0]?.content?.parts?.filter(p => p.text) || [];
        if (textParts.length) console.log(`    Text: ${textParts[0].text.slice(0, 300)}`);
        failed++;
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`  ✗ Error: ${String(msg).slice(0, 200)}`);
      failed++;
    }

    if (i < SCENARIOS.length - 1) await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\nDone! ${success} generated, ${failed} failed.`);
}

main();
