"""Install a cut-out into assets/v2/cut: <name>.webp, <name>-<small>.webp and a provenance .json.
usage: python3 install_cut.py <cut.webp> <name> <small-width> <prompt-file>"""
import sys, json, datetime
from PIL import Image
src, name, small, pf = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
d = '/Users/abhisheksingh/Documents/Code/Dream/Website/assets/v2/cut/'
im = Image.open(src); im.save(d + name + '.webp', 'WEBP', quality=86, method=6)
sm = im.resize((small, round(im.height * small / im.width)), Image.LANCZOS); sm.save(f'{d}{name}-{small}.webp', 'WEBP', quality=84, method=6)
json.dump({"prompt": "Cut-out (src/v2/cut.py) of this Google Flow nano-2.1 image, project Konso Website v2, realistic restyle 2026-11-20:\n\n" + open(pf).read(),
           "createdAt": datetime.datetime.utcnow().isoformat() + "Z"}, open(d + name + '.webp.json', 'w'), indent=2)
print(name, im.size, sm.size)
