#!/usr/bin/env python3
"""
Removes white backgrounds from fox images using edge-connected flood fill.
Only removes white/near-white pixels reachable from the image border —
so white fur, clothing, or enclosed areas inside the fox are never touched.
Only processes images that have a .jpg original in the same folder.
"""

from pathlib import Path
from PIL import Image
import numpy as np
from collections import deque

GAME_RELATED = Path(__file__).parent.parent / "public" / "fox-assets" / "Game-Related"

# How close to white a pixel must be to be considered background (0-255 per channel)
WHITE_THRESHOLD = 15


def flood_fill_alpha(img: Image.Image, threshold: int) -> Image.Image:
    """
    Converts white pixels connected to the image border to transparent.
    Interior white areas (fur, clothing) are left fully opaque.
    """
    rgb = img.convert("RGB")
    arr = np.array(rgb, dtype=np.uint8)
    h, w = arr.shape[:2]

    # Boolean mask: True = near-white pixel
    near_white = (
        (arr[:, :, 0] >= 255 - threshold) &
        (arr[:, :, 1] >= 255 - threshold) &
        (arr[:, :, 2] >= 255 - threshold)
    )

    # BFS flood fill from all border pixels that are near-white
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    for x in range(w):
        if near_white[0, x] and not visited[0, x]:
            visited[0, x] = True
            queue.append((0, x))
        if near_white[h - 1, x] and not visited[h - 1, x]:
            visited[h - 1, x] = True
            queue.append((h - 1, x))
    for y in range(h):
        if near_white[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            queue.append((y, 0))
        if near_white[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            queue.append((y, w - 1))

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and near_white[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

    # Build RGBA: visited pixels become transparent
    rgba = np.array(rgb.convert("RGBA"), dtype=np.uint8)
    rgba[visited, 3] = 0

    return Image.fromarray(rgba, "RGBA")


def process():
    jpg_files = list(GAME_RELATED.glob("*.jpg")) + list(GAME_RELATED.glob("*.JPG"))

    if not jpg_files:
        print("No .jpg originals found.")
        return

    print(f"Found {len(jpg_files)} .jpg originals to process (edge flood-fill, threshold={WHITE_THRESHOLD}):\n")

    for jpg_path in sorted(jpg_files):
        png_path = GAME_RELATED / (jpg_path.stem + ".png")
        print(f"  Processing: {jpg_path.name} → {png_path.name}")

        try:
            img = Image.open(jpg_path)
            result = flood_fill_alpha(img, WHITE_THRESHOLD)
            result.save(png_path, "PNG", optimize=True)
            print(f"    ✓ Saved {png_path.name} ({result.size[0]}x{result.size[1]})")

        except Exception as e:
            print(f"    ✗ Error: {e}")

    print("\nDone!")


if __name__ == "__main__":
    process()
