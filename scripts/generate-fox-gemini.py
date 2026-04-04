#!/usr/bin/env python3
"""
Generate specific fox scenario images via Gemini image generation API.
Uses the chibi anthro fox style matching existing game cards.

Usage:
  python3 scripts/generate-fox-gemini.py
"""

import os
import sys
from pathlib import Path
from PIL import Image
import io

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "public" / "fox-assets" / "Game-Related"

# Load env.local so GOOGLE_APPLICATION_CREDENTIALS and project are set
env_file = PROJECT_ROOT / ".env.local"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "gen-lang-client-0317713513")
vertexai.init(project=PROJECT_ID, location="us-central1")
model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")

# Chibi anthro fox style — reverse-engineered from existing cards
STYLE_PREFIX = (
    "chibi anthro female fox character, orange fur, white muzzle, white chest fur, "
    "fluffy fox tail, very large round head, small stubby body, head-to-body ratio 1:1, "
    "stubby arms and legs, big expressive eyes, cute chibi proportions, "
    "clean outlines, vibrant warm colors, soft cel shading, "
    "white background, full body view, solo character, "
    "illustrated style, 2D digital art"
)

IMAGES = [
    {
        "filename": "fox_costume_stewardess.jpg",
        "prompt": (
            f"{STYLE_PREFIX}, "
            "wearing a flirty flight attendant costume, short navy pencil skirt, "
            "fitted blazer with gold buttons, little hat tilted on head, "
            "silk scarf around neck, playful confident pose, holding a serving tray, "
            "winking expression, roleplay costume"
        ),
    },
    {
        "filename": "fox_ice_temperature.jpg",
        "prompt": (
            f"{STYLE_PREFIX}, "
            "lying on a bed wearing a black satin camisole and shorts, "
            "holding an ice cube, water drops melting on her fur, "
            "shivering expression, eyes wide, rosy blush cheeks, "
            "bedroom with candles in background, sensory game scene"
        ),
    },
]


def generate_image(prompt: str, filename: str):
    out_path = OUT_DIR / filename
    print(f"\n  Generating: {filename}")
    print(f"  Prompt: {prompt[:120]}...")

    response = model.generate_images(
        prompt=prompt,
        number_of_images=1,
        aspect_ratio="1:1",
        safety_filter_level="block_only_high",
        person_generation="allow_adult",
    )

    if not response.images:
        print(f"  ✗ No image returned (likely blocked by safety filter)")
        return False

    img = response.images[0]._pil_image.convert("RGB")
    img.save(out_path, "JPEG", quality=95)
    print(f"  ✓ Saved {out_path.name} ({img.size[0]}x{img.size[1]})")
    return True


def main():
    print(f"Generating {len(IMAGES)} fox images via Gemini Imagen 3...\n")
    for item in IMAGES:
        ok = generate_image(item["prompt"], item["filename"])
        if not ok:
            print(f"  → Skipped {item['filename']}")

    print("\nDone! Run the rembg script next to remove white backgrounds:")
    print("  python3 scripts/rembg-fox-images.py")


if __name__ == "__main__":
    main()
