"""Konso ground: emerald light pool over deep bottle green, with the brand wallpaper's paper grain.
Colours from the inspiration boards (emerald #0B4632 pools, near-black edges) and the brand (#051C0A).
usage: python3 ground.py   -> assets/v2/img/ground.webp (desktop) and ground-sm.webp (phone)"""
import numpy as np
from PIL import Image, ImageFilter
WALL = '/Users/abhisheksingh/Documents/Code/Dream/Konso/Wallpaper/Konso-iPhone17Pro-wallpaper-tagline.png'
EDGE = np.array([4, 18, 9.0])       # deep bottle green, near black
MID  = np.array([8, 36, 18.0])      # matches the food photos' own backdrop (#0D2819 area)
POOL = np.array([16, 62, 32.0])     # emerald light pool, from the boards (#0B4632 / #284938 family)
def grain(w, h):
    t = Image.open(WALL).convert('L').crop((0, 3000, 2412, 5244))
    t = t.resize((max(w, 2412), int(max(w, 2412) * t.height / t.width)))
    reps = int(np.ceil(h / t.height)) + 1
    tile = Image.new('L', (t.width, t.height * reps))
    for i in range(reps): tile.paste(t if i % 2 == 0 else t.transpose(Image.FLIP_TOP_BOTTOM), (0, i * t.height))
    g = np.asarray(tile.crop((0, 0, w, h)), dtype=np.float32)
    hp = g - np.asarray(Image.fromarray(g.astype(np.uint8)).filter(ImageFilter.GaussianBlur(12)), dtype=np.float32)
    return hp / 255.0
def make(w, h, pools, out):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    x /= w; y /= h
    light = np.zeros((h, w), np.float32)
    for cx, cy, rx, ry, k in pools:
        d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
        light = np.maximum(light, k * np.exp(-d * 1.6))
    vig = np.clip(1 - (((x - .5) / .62) ** 2 + ((y - .5) / .7) ** 2) ** 1.4 * .55, 0, 1)
    base = EDGE[None, None] + (MID - EDGE)[None, None] * vig[..., None]
    col = base + (POOL - base) * light[..., None]
    col = col * (1 + grain(w, h)[..., None] * 1.6)          # brand paper grain
    col += np.random.default_rng(3).normal(0, .9, col.shape)  # dither: no banding
    Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(out, 'WEBP', quality=97, method=6)   # 97: lower settings smooth the dark grain into visible blocks
    print(out, w, h)
make(2560, 1600, [(.5, .30, .55, .55, .85), (.16, .86, .38, .32, .38)], '../../assets/v2/img/ground.webp')
make(1170, 2532, [(.5, .30, .75, .38, .85), (.2, .82, .6, .25, .35)], '../../assets/v2/img/ground-sm.webp')
