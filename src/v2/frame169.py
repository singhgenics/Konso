"""Place a dish cut-out on the clip ground at the exact geometry the page uses (.drop__clip is 252.6% of the dish
width, centred, shifted up 5.6% of its height), so the Veo loop lines up with the cut-out when it takes over.
usage: python3 frame169.py <cut.webp> <out.jpg>"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
W, H = 1920, 1080
old = np.asarray(Image.open('raw/steamer-169.jpg').convert('RGB'), dtype=np.float32)
y, x = np.mgrid[0:H, 0:W]
keep = ~(((x - 960) / 420.0) ** 2 + ((y - 580) / 330.0) ** 2 < 1)          # drop the old dish, fit the ground around it
k = keep.astype(np.float32); s = 160
ground = np.stack([ndimage.gaussian_filter(old[..., c] * k, s) for c in range(3)], -1) / np.maximum(ndimage.gaussian_filter(k, s), 1e-3)[..., None]
ground += np.random.default_rng(1).normal(0, 0.8, ground.shape)            # dither, no banding
bg = Image.fromarray(ground.clip(0, 255).astype(np.uint8)).convert('RGBA')
cut = Image.open(sys.argv[1]).convert('RGBA')
dw = round(W / 2.526); dh = round(cut.height * dw / cut.width)
cut = cut.resize((dw, dh), Image.LANCZOS)
cx, cy = W / 2, H * 0.556
bg.alpha_composite(cut, (round(cx - dw / 2), round(cy - dh / 2)))
bg.convert('RGB').save(sys.argv[2], quality=95)
