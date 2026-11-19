"""Gold foil texture for display type: crinkled-foil noise mapped onto the Konso kit's gold ramp
(shadow #AA7A28, foil #D89D3C, gradient #EBB85B..#D19333, highlight #F0BE62). No tiling, no letter shapes.
-> assets/v2/img/foil.webp"""
import numpy as np, cv2
from PIL import Image
W, H = 2000, 800
rng = np.random.default_rng(11)
def octave(scale, amp):
    n = rng.normal(size=(H // scale + 2, W // scale + 2)).astype(np.float32)
    return cv2.resize(n, (W, H), interpolation=cv2.INTER_CUBIC) * amp
base = octave(160, 1.0) + octave(60, .55) + octave(22, .3) + octave(8, .12)
crinkle = 1 - np.abs(np.tanh(base * 1.4))          # ridges where the foil folds
crinkle = cv2.GaussianBlur(crinkle, (0, 0), 1.1)
sheen = cv2.GaussianBlur(octave(300, 1.0), (0, 0), 40)
v = np.clip(0.62 + 0.30 * (crinkle - .5) * 2 * .5 + 0.14 * sheen, 0.30, 1)
ramp_pos = np.array([0, .3, .55, .78, .92, 1.0])
ramp = np.array([[0xAA, 0x7A, 0x28], [0xD1, 0x93, 0x33], [0xD8, 0x9D, 0x3C], [0xE2, 0xAA, 0x4A], [0xEB, 0xB8, 0x5B], [0xF0, 0xBE, 0x62]], np.float32)
out = np.stack([np.interp(v, ramp_pos, ramp[:, c]) for c in range(3)], -1)
out += rng.normal(0, 2.0, out.shape)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save('../../assets/v2/img/foil.webp', 'WEBP', quality=86)
print('ok')
