#!/usr/bin/env python3
"""
Generate the 4 remaining NSFW fox scenes via ComfyUI + Pony Diffusion v6 XL.
These were blocked by Gemini's image safety filter.
Uses illustrated style (not pixel art) to match existing Gemini-generated cards.

Prerequisites:
  1. Start ComfyUI:
     source ~/ComfyUI/venv/bin/activate && cd ~/ComfyUI && python3 main.py --lowvram --listen 0.0.0.0
  2. Run this script (from the project root or scripts/ dir):
     ~/ComfyUI/venv/bin/python scripts/generate-fox-comfyui.py

Output: public/fox-assets/Game-Related/fox_*.png
"""

import websocket
import uuid
import json
import urllib.request
import urllib.parse
import os
import random
import sys
from pathlib import Path
from PIL import Image
import io

SERVER = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())

# Resolve output dir relative to this script
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "public" / "fox-assets" / "Game-Related"

CHECKPOINT = "ponyDiffusionV6XL.safetensors"

# Pony Diffusion quality tags + illustrated style to match existing Gemini cards
QUALITY = "score_9, score_8_up, score_7_up, source_anime"
NEGATIVE = (
    "score_4, score_3, score_2, score_1, worst quality, low quality, blurry, "
    "watermark, text, signature, jpeg artifacts, 3d, photo, realistic, "
    "human, child, young, deformed, pixel art, retro, 8-bit, 16-bit, "
    "chibi, baby, toddler, scenery, landscape, multiple views"
)

STYLE_PREFIX = (
    f"{QUALITY}, "
    "anthro fox girl, female anthropomorphic fox, adult body, "
    "slender curvy feminine figure, big expressive eyes, "
    "soft shading, warm color palette, semi-realistic fur texture, "
    "orange fur, white chest fur, fluffy tail, fox ears, "
    "plain solid light beige background, simple clean background, "
    "full body, single character, digital illustration, anime style"
)

# The 4 scenes that Gemini blocked — now as illustrated style
SCENARIOS = [
    {
        "key": "heavy_bondage",
        "filename": "fox_pixel_heavy_bondage.png",
        "prompt": (
            f"{STYLE_PREFIX}, "
            "elaborate decorative red rope outfit, japanese shibari kinbaku rope art, "
            "decorative knots and patterns across torso and thighs, "
            "kneeling gracefully, arms behind back, "
            "expression of deep trust and surrender, closed eyes, peaceful smile, "
            "flushed cheeks, pink blush, red rope with artistic knot patterns, "
            "intimate tender mood"
        ),
    },
    {
        "key": "suspension",
        "filename": "fox_pixel_suspension.png",
        "prompt": (
            f"{STYLE_PREFIX}, "
            "artistic aerial suspension pose, hanging gracefully from ropes above, "
            "body wrapped in flowing silk ribbons and decorative ropes, "
            "dynamic floating pose with arms extended upward, "
            "serene trusting expression, eyes half-closed, gentle smile, pink blush, "
            "ethereal graceful atmosphere, elegant and artistic"
        ),
    },
    {
        "key": "collar_crawl",
        "filename": "fox_pixel_collar_crawl.png",
        "prompt": (
            f"{STYLE_PREFIX}, "
            "wearing fashionable black leather choker collar with silver bell charm, "
            "matching leather wrist cuffs, "
            "on all fours in a graceful crawling pose, "
            "looking up with devoted adoring eyes, deep blush, "
            "happy eager expression, tongue out playfully, "
            "ribbon leash trailing from collar, cute pet play devotion theme"
        ),
    },
    {
        "key": "wax_play",
        "filename": "fox_pixel_wax_play.png",
        "prompt": (
            f"{STYLE_PREFIX}, "
            "lying back reclining, arms above head, wearing silk camisole, "
            "decorative red and black candle wax drip patterns on chest and stomach, "
            "like artistic body paint, abstract drip art, "
            "eyes shut tight, biting lip, deep blush, intense sensation expression, "
            "scattered lit candles nearby, warm candlelight glow, intimate mood"
        ),
    },
]


def build_workflow(positive_prompt, negative_prompt, seed, filename_prefix):
    """Build a ComfyUI API workflow for SDXL (Pony Diffusion)."""
    return {
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": CHECKPOINT,
            },
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                    # SDXL native res — 832x1216 portrait for single character
                "batch_size": 1,
                "height": 1216,
                "width": 832,
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["4", 1],
                "text": positive_prompt,
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["4", 1],
                "text": negative_prompt,
            },
        },
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
                "seed": seed,
                "steps": 30,
                "cfg": 7,
                "sampler_name": "dpmpp_2m_sde",
                "scheduler": "karras",
                "denoise": 1,
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["3", 0],
                "vae": ["4", 2],
            },
        },
        "save_image_websocket_node": {
            "class_type": "SaveImageWebsocket",
            "inputs": {
                "images": ["8", 0],
            },
        },
    }


def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": CLIENT_ID}
    data = json.dumps(p).encode("utf-8")
    req = urllib.request.Request(f"http://{SERVER}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())


def get_images(ws, prompt):
    prompt_id = queue_prompt(prompt)["prompt_id"]
    output_images = {}
    current_node = ""
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message["type"] == "executing":
                data = message["data"]
                if data["prompt_id"] == prompt_id:
                    if data["node"] is None:
                        break
                    else:
                        current_node = data["node"]
            elif message["type"] == "progress":
                data = message["data"]
                if data.get("prompt_id") == prompt_id:
                    step = data.get("value", 0)
                    total = data.get("max", 0)
                    print(f"\r  Step {step}/{total}", end="", flush=True)
        else:
            if current_node == "save_image_websocket_node":
                images_output = output_images.get(current_node, [])
                images_output.append(out[8:])
                output_images[current_node] = images_output
    return output_images


def remove_bg_simple(img):
    """Flood-fill transparency from corners (matches v3 script approach)."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Sample background color from top-left corner
    bg_r, bg_g, bg_b, _ = pixels[0, 0]
    tolerance = 45
    fade = 20

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dist = ((r - bg_r) ** 2 + (g - bg_g) ** 2 + (b - bg_b) ** 2) ** 0.5
            if dist < tolerance:
                pixels[x, y] = (r, g, b, 0)
            elif dist < tolerance + fade:
                alpha = int(255 * (dist - tolerance) / fade)
                pixels[x, y] = (r, g, b, alpha)
    return img


def main():
    # Check server is running
    try:
        urllib.request.urlopen(f"http://{SERVER}/system_stats", timeout=5)
    except Exception:
        print("ERROR: ComfyUI is not running!")
        print("Start it first:")
        print("  source ~/ComfyUI/venv/bin/activate && cd ~/ComfyUI && python3 main.py --lowvram --listen 0.0.0.0")
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)

    print(f"Generating {len(SCENARIOS)} pixel art fox scenes via ComfyUI + Pony Diffusion")
    print(f"Output: {OUT_DIR}\n")

    ws = websocket.WebSocket()
    ws.connect(f"ws://{SERVER}/ws?clientId={CLIENT_ID}")

    success = 0
    failed = 0

    for i, scenario in enumerate(SCENARIOS):
        seed = random.randint(1, 2**32 - 1)
        print(f"[{i+1}/{len(SCENARIOS)}] Generating: {scenario['key']} (seed={seed})")

        workflow = build_workflow(
            positive_prompt=scenario["prompt"],
            negative_prompt=NEGATIVE,
            seed=seed,
            filename_prefix=scenario["key"],
        )

        try:
            images = get_images(ws, workflow)
            print()  # newline after progress

            if not images or not images.get("save_image_websocket_node"):
                print(f"  X No image returned for {scenario['key']}")
                failed += 1
                continue

            image_data = images["save_image_websocket_node"][0]
            img = Image.open(io.BytesIO(image_data))

            # Resize to 512px wide (match existing assets)
            img = img.resize((512, int(512 * img.height / img.width)), Image.LANCZOS)

            # Remove background
            img = remove_bg_simple(img)

            out_path = OUT_DIR / scenario["filename"]
            img.save(str(out_path), "PNG", optimize=True)
            size_kb = out_path.stat().st_size / 1024
            print(f"  OK Saved: {scenario['filename']} ({size_kb:.0f}KB)")
            success += 1

        except Exception as e:
            print(f"\n  X Error generating {scenario['key']}: {e}")
            failed += 1

    ws.close()
    print(f"\nDone! {success} generated, {failed} failed.")


if __name__ == "__main__":
    main()
