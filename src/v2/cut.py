"""Cut dishes and ingredients out of their green studio ground.
usage: <venv>/python -I cut.py dish <raw.jpg> <out.webp>   (adds a soft contact shadow)
       <venv>/python -I cut.py ing <raw.jpg> <outdir>      (splits a flat-lay into pieces ing-N.webp)
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage

import os
sess = new_session(os.environ.get('MATTE', 'isnet-general-use'))

def matte(im):
    out = remove(im, session=sess, post_process_mask=True)
    return out

def trim(rgba, pad=0.04):
    a = np.array(rgba)[:, :, 3]
    ys, xs = np.where(a > 8)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w, h = x1 - x0, y1 - y0
    p = int(max(w, h) * pad)
    return rgba.crop((max(0, x0 - p), max(0, y0 - p), min(rgba.width, x1 + p), min(rgba.height, y1 + p)))

def despill(rgba):
    # pull green fringe out of semi-transparent edges
    arr = np.array(rgba).astype(np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    edge = (a > 0) & (a < 250)
    lim = np.maximum(r, b) * 1.05
    g[edge] = np.minimum(g[edge], lim[edge])
    arr[..., 1] = g
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

def shadow(rgba):
    W, H = rgba.size
    canvas = Image.new('RGBA', (W, int(H * 1.08)), (0, 0, 0, 0))
    a = np.array(rgba)[:, :, 3]
    ys = np.where(a.max(axis=1) > 8)[0]
    base = ys.max()
    xs = np.where(a[base - int(H * 0.08):base].max(axis=0) > 8)[0]
    sw = (xs.max() - xs.min()) * 1.05
    sh = H * 0.07
    sh_img = Image.new('L', canvas.size, 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(sh_img)
    cx = (xs.min() + xs.max()) / 2
    d.ellipse((cx - sw / 2, base - sh / 2, cx + sw / 2, base + sh / 2), fill=150)
    sh_img = sh_img.filter(ImageFilter.GaussianBlur(H * 0.03))
    black = Image.new('RGBA', canvas.size, (2, 12, 5, 255))
    black.putalpha(sh_img)
    canvas.alpha_composite(black)
    canvas.alpha_composite(rgba, (0, 0))
    return canvas

def save(im, path, size=1200):
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(path, 'WEBP', quality=86, method=6)
    print(path, im.size)

def plate_aware(im, cut):
    # union the model's mask with "clearly not the green studio ground", so plates and baskets stay
    a = np.asarray(im, dtype=np.float32)
    h, w, _ = a.shape
    k = max(8, w // 40)
    corners = np.concatenate([a[:k, :k].reshape(-1, 3), a[:k, -k:].reshape(-1, 3), a[-k:, :k].reshape(-1, 3), a[-k:, -k:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    col = dist > 70
    col = ndimage.binary_opening(col, iterations=2)
    m = np.asarray(cut)[:, :, 3] > 128
    u = ndimage.binary_fill_holes(m | col)
    lab, n = ndimage.label(u)
    if n > 1:
        sizes = ndimage.sum(u, lab, range(1, n + 1))
        u = lab == (1 + int(np.argmax(sizes)))
    soft = np.asarray(Image.fromarray((u * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32)
    alpha = np.maximum(np.asarray(cut)[:, :, 3].astype(np.float32) * u, soft)
    out = im.convert('RGBA'); out.putalpha(Image.fromarray(alpha.clip(0, 255).astype(np.uint8)))
    return out

if sys.argv[1] == 'dish':
    im = Image.open(sys.argv[2]).convert('RGB')
    cut = despill(trim(plate_aware(im, matte(im))))
    save(shadow(cut), sys.argv[3])
else:
    im = Image.open(sys.argv[2]).convert('RGB')
    cut = despill(matte(im))
    a = np.array(cut)[:, :, 3] > 40
    a = ndimage.binary_closing(a, iterations=4)
    lab, n = ndimage.label(a)
    sizes = ndimage.sum(a, lab, range(1, n + 1))
    k = 0
    for i, sz in enumerate(sizes, 1):
        if sz < a.size * 0.002: continue
        sl = ndimage.find_objects((lab == i).astype(int))[0]
        piece = cut.crop((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
        mask = Image.fromarray(((lab[sl] == i) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
        pa = np.minimum(np.array(piece)[:, :, 3], np.array(mask))
        piece.putalpha(Image.fromarray(pa))
        k += 1
        save(trim(piece, 0.02), f"{sys.argv[3]}/ing-{k}.webp", 420)
